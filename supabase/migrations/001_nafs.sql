-- Apply as database owner in a fresh Supabase project. All private writes go through the server.
create extension if not exists pgcrypto;
create table public.profiles(user_id uuid primary key references auth.users on delete cascade, created_at timestamptz not null default now());
create table public.user_preferences(user_id uuid primary key references auth.users on delete cascade,state jsonb not null default '{}'::jsonb,revision bigint not null default 0);
create table public.daily_tasks(id text not null,user_id uuid not null references auth.users on delete cascade,title text not null,task_date date not null,completed boolean not null default false,content jsonb not null,primary key(user_id,id));
create index tasks_date_idx on public.daily_tasks(user_id,task_date);
create table public.task_completion_events(user_id uuid not null,task_id text not null,completed_at timestamptz default now(),primary key(user_id,task_id),foreign key(user_id,task_id) references public.daily_tasks(user_id,id) on delete cascade);
create table public.habits(id text not null,user_id uuid not null references auth.users on delete cascade,title text not null,content jsonb not null,primary key(user_id,id));
create table public.habit_checkins(user_id uuid not null,habit_id text not null,checkin_date date not null,count int not null check(count between 0 and 100),primary key(user_id,habit_id,checkin_date),foreign key(user_id,habit_id) references public.habits(user_id,id) on delete cascade);
create table public.challenges(id text primary key,owner_id uuid references auth.users on delete cascade,title text not null,is_free boolean not null default false,content jsonb not null,check(jsonb_array_length(content->'days')=21));
create table public.challenge_days(challenge_id text not null references public.challenges on delete cascade,day int not null check(day between 1 and 21),activity text not null,primary key(challenge_id,day));
create table public.user_challenges(id text not null,user_id uuid not null references auth.users on delete cascade,challenge_id text not null references public.challenges on delete cascade,started date not null,maintenance boolean not null default false,primary key(user_id,id));
create table public.challenge_progress(user_id uuid not null,enrollment_id text not null,day int not null check(day between 1 and 21),primary key(user_id,enrollment_id,day),foreign key(user_id,enrollment_id) references public.user_challenges(user_id,id) on delete cascade);
create table public.xp_events(user_id uuid not null references auth.users on delete cascade,event_key text not null,amount int not null check(amount between 1 and 100),event_date date not null,primary key(user_id,event_key));
create index xp_date_idx on public.xp_events(user_id,event_date);
create table public.achievements(id text primary key,title text not null,threshold int not null);
insert into public.achievements values('first100','First 100 XP',100),('steady1000','Steady growth',1000);
create table public.user_achievements(user_id uuid not null references auth.users on delete cascade,achievement_id text not null references public.achievements,earned_at timestamptz default now(),primary key(user_id,achievement_id));
create table public.subscriptions(user_id uuid primary key references auth.users on delete cascade,customer_id text unique,subscription_id text unique,status text not null,current_period_end timestamptz not null,updated_at timestamptz default now());
create table public.ai_credit_balances(user_id uuid primary key references auth.users on delete cascade,balance int not null default 0 check(balance>=0));
create table public.ai_credit_transactions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,reference text not null unique,amount int not null,kind text not null check(kind in ('purchase','reserve','refund')),created_at timestamptz default now());
create table public.ai_usage_records(request_id uuid primary key,user_id uuid not null references auth.users on delete cascade,cost int not null check(cost between 1 and 100),status text not null check(status in ('pending','complete','refunded')),answer text,created_at timestamptz default now());
create table public.ai_memory(id text not null,user_id uuid not null references auth.users on delete cascade,content text not null,primary key(user_id,id));
create table public.support_requests(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,message text not null check(length(message)<=2000),created_at timestamptz default now());
create table public.private_journal(id text not null,user_id uuid not null references auth.users on delete cascade,content jsonb not null,primary key(user_id,id));
create table public.billing_events(event_id text primary key,created_at timestamptz default now());
create table public.rate_limits(key text primary key,window_start timestamptz not null default now(),requests int not null default 1);
-- Read isolation. No client INSERT, UPDATE, DELETE policies exist, including for money and XP.
do $$ declare tbl text; begin
 foreach tbl in array array['profiles','user_preferences','daily_tasks','task_completion_events','habits','habit_checkins','user_challenges','challenge_progress','xp_events','user_achievements','subscriptions','ai_credit_balances','ai_credit_transactions','ai_usage_records','ai_memory','support_requests','private_journal'] loop
 execute format('alter table public.%I enable row level security',tbl);
 execute format('create policy own_read on public.%I for select to authenticated using (user_id = auth.uid())',tbl);
 end loop;
end $$;
alter table public.challenges enable row level security;
create policy catalog_read on public.challenges for select using(owner_id is null or owner_id=auth.uid());
alter table public.challenge_days enable row level security;
create policy days_read on public.challenge_days for select using(exists(select 1 from public.challenges c where c.id=challenge_id and (c.owner_id is null or c.owner_id=auth.uid())));
alter table public.achievements enable row level security;
create policy achievement_read on public.achievements for select using(true);
alter table public.billing_events enable row level security;
alter table public.rate_limits enable row level security;

-- Revisioned snapshot and normalized projections are committed in one transaction.
create function public.save_workspace(p_user uuid,p_state jsonb,p_revision bigint) returns void language plpgsql security definer set search_path=public as $$
declare v_revision bigint; item jsonb; pair record; enrollment jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 insert into profiles(user_id) values(p_user) on conflict do nothing;
 insert into user_preferences(user_id) values(p_user) on conflict do nothing;
 select revision into v_revision from user_preferences where user_id=p_user for update;
 if v_revision<>p_revision then raise exception 'revision conflict'; end if;
 update user_preferences set state=p_state,revision=revision+1 where user_id=p_user;
 delete from daily_tasks where user_id=p_user;
 for item in select * from jsonb_array_elements(p_state->'tasks') loop
 insert into daily_tasks values(item->>'id',p_user,item->>'title',(item->>'date')::date,(item->>'completed')::boolean,item);
 if (item->>'completed')::boolean then insert into task_completion_events(user_id,task_id) values(p_user,item->>'id');end if;
 end loop;
 delete from habits where user_id=p_user;
 for item in select * from jsonb_array_elements(p_state->'habits') loop
 insert into habits values(item->>'id',p_user,item->>'title',item);
 for pair in select * from jsonb_each_text(item->'checks') loop insert into habit_checkins values(p_user,item->>'id',pair.key::date,pair.value::int);end loop;
 end loop;
 delete from user_challenges where user_id=p_user;
 for enrollment in select * from jsonb_array_elements(p_state->'enrollments') loop
 insert into user_challenges values(enrollment->>'id',p_user,enrollment->>'challenge_id',(enrollment->>'started')::date,(enrollment->>'maintenance')::boolean);
 for item in select * from jsonb_array_elements(enrollment->'days') loop insert into challenge_progress values(p_user,enrollment->>'id',item::text::int);end loop;
 end loop;
 for pair in select * from jsonb_each(p_state->'xp') loop
 insert into xp_events values(p_user,pair.key,(pair.value->>'amount')::int,(pair.value->>'date')::date) on conflict do nothing;
 end loop;
 insert into user_achievements(user_id,achievement_id) select p_user,id from achievements where threshold <= (select coalesce(sum(amount),0) from xp_events where user_id=p_user) on conflict do nothing;
 delete from ai_memory where user_id=p_user;
 for item in select * from jsonb_array_elements(p_state->'memory') loop insert into ai_memory values(item->>'id',p_user,item->>'text');end loop;
 delete from private_journal where user_id=p_user;
 for item in select * from jsonb_array_elements(p_state->'journals') loop insert into private_journal values(item->>'id',p_user,item);end loop;
end $$;

create function public.consume_rate_limit(p_key text,p_limit int) returns boolean language plpgsql security definer set search_path=public as $$
declare n int;begin
 insert into rate_limits(key) values(p_key) on conflict(key) do update set requests=case when rate_limits.window_start<now()-interval '1 minute' then 1 else rate_limits.requests+1 end,window_start=case when rate_limits.window_start<now()-interval '1 minute' then now() else rate_limits.window_start end returning requests into n;
 return n<=p_limit;
end $$;

create function public.apply_billing_event(p_event text,p_user uuid,p_kind text,p_payload jsonb) returns void language plpgsql security definer set search_path=public as $$
begin
 insert into billing_events values(p_event,now()) on conflict do nothing;if not found then return;end if;
 if p_kind='subscription' then
 insert into subscriptions(user_id,customer_id,subscription_id,status,current_period_end) values(p_user,p_payload->>'customer_id',p_payload->>'subscription_id',p_payload->>'status',(p_payload->>'current_period_end')::timestamptz) on conflict(user_id) do update set customer_id=excluded.customer_id,subscription_id=excluded.subscription_id,status=excluded.status,current_period_end=excluded.current_period_end,updated_at=now();
 elsif p_kind='credits' then
 insert into ai_credit_transactions(user_id,reference,amount,kind) values(p_user,'purchase:'||(p_payload->>'session_id'),(p_payload->>'credits')::int,'purchase') on conflict do nothing;
 if found then insert into ai_credit_balances values(p_user,(p_payload->>'credits')::int) on conflict(user_id) do update set balance=ai_credit_balances.balance+excluded.balance;end if;
 else raise exception 'unknown event';end if;
end $$;

create function public.reserve_ai_credits(p_user uuid,p_request uuid,p_cost int) returns jsonb language plpgsql security definer set search_path=public as $$
declare usage ai_usage_records; b int;begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,1));
 select * into usage from ai_usage_records where request_id=p_request;
 if found then
 if usage.user_id<>p_user then raise exception 'invalid request';end if;
 if usage.status='complete' then select balance into b from ai_credit_balances where user_id=p_user;return jsonb_build_object('answer',usage.answer,'balance',b);end if;
 raise exception 'request already processed';end if;
 if p_cost<1 or p_cost>100 then raise exception 'invalid cost';end if;
 update ai_credit_balances set balance=balance-p_cost where user_id=p_user and balance>=p_cost returning balance into b;
 if not found then raise exception 'insufficient credits';end if;
 insert into ai_usage_records values(p_request,p_user,p_cost,'pending',null,now());
 insert into ai_credit_transactions(user_id,reference,amount,kind) values(p_user,'reserve:'||p_request,-p_cost,'reserve');
 return jsonb_build_object('balance',b);
end $$;
create function public.finish_ai_request(p_user uuid,p_request uuid,p_answer text,p_success boolean) returns int language plpgsql security definer set search_path=public as $$
declare usage ai_usage_records;b int;begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,1));
 select * into usage from ai_usage_records where request_id=p_request and user_id=p_user for update;
 if not found then raise exception 'unknown request';end if;
 if usage.status='pending' then
 if p_success then update ai_usage_records set status='complete',answer=p_answer where request_id=p_request;
 else update ai_usage_records set status='refunded' where request_id=p_request;
 insert into ai_credit_transactions(user_id,reference,amount,kind) values(p_user,'refund:'||p_request,usage.cost,'refund') on conflict do nothing;
 if found then update ai_credit_balances set balance=balance+usage.cost where user_id=p_user;end if;
 end if;end if;
 select balance into b from ai_credit_balances where user_id=p_user;return b;
end $$;
-- Recover reservations after server termination. Schedule every ten minutes with pg_cron.
create function public.refund_stale_ai_requests() returns void language plpgsql security definer set search_path=public as $$
declare item record;begin for item in select user_id,request_id from ai_usage_records where status='pending' and created_at<now()-interval '10 minutes' loop perform finish_ai_request(item.user_id,item.request_id,'',false);end loop;end $$;
-- Security definer functions are callable only by the trusted backend, never anon/authenticated.
revoke all on function public.save_workspace(uuid,jsonb,bigint),public.consume_rate_limit(text,int),public.apply_billing_event(text,uuid,text,jsonb),public.reserve_ai_credits(uuid,uuid,int),public.finish_ai_request(uuid,uuid,text,boolean),public.refund_stale_ai_requests() from public,anon,authenticated;
grant execute on function public.save_workspace(uuid,jsonb,bigint),public.consume_rate_limit(text,int),public.apply_billing_event(text,uuid,text,jsonb),public.reserve_ai_credits(uuid,uuid,int),public.finish_ai_request(uuid,uuid,text,boolean),public.refund_stale_ai_requests() to service_role;
