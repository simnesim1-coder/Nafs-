-- Additive migration. No historical financial, memory, journal or progress rows are dropped.
-- Original tables and functions are retained for rollback/export, with obsolete RPCs disabled.
begin;
create table public.scheduled_blocks(id text not null,user_id uuid not null references auth.users on delete cascade,block_date date not null,starts_at time not null,ends_at time not null,content jsonb not null,primary key(user_id,id),check(ends_at>starts_at));
create index schedule_date_idx on public.scheduled_blocks(user_id,block_date);
alter table public.scheduled_blocks enable row level security;
create policy own_read on public.scheduled_blocks for select to authenticated using(user_id=auth.uid());
alter table public.user_challenges add column paused_on date,add column paused_days integer not null default 0 check(paused_days>=0),add column completion_dates jsonb not null default '{}'::jsonb;
-- A JSON overlay adds new fields without altering any old preferences, history or unknown keys.
update public.user_preferences set state=jsonb_set(jsonb_set(state,'{schedule}',coalesce(state->'schedule','[]'::jsonb)),'{customChallenges}',coalesce(state->'customChallenges','[]'::jsonb));
update public.challenges set is_free=true,content=content-'free';
-- Copy the original implementation through a restricted wrapper rather than rewriting/dropping history.
alter function public.save_workspace(uuid,jsonb,bigint) rename to save_workspace_legacy;
revoke all on function public.save_workspace_legacy(uuid,jsonb,bigint) from public,anon,authenticated,service_role;
create function public.save_workspace(p_user uuid,p_state jsonb,p_revision bigint) returns void language plpgsql security definer set search_path=public as $$
declare item jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 -- Local/custom marathons share the same trusted transaction and owner isolation.
 for item in select * from jsonb_array_elements(coalesce(p_state->'customChallenges','[]'::jsonb)) loop
 insert into challenges(id,owner_id,title,is_free,content) values(item->>'id',p_user,item->>'title',true,item)
 on conflict(id) do update set title=excluded.title,content=excluded.content,is_free=true where challenges.owner_id=p_user;
 if not found then raise exception 'marathon owner conflict';end if;
 end loop;
 perform save_workspace_legacy(p_user,p_state,p_revision);
 delete from scheduled_blocks where user_id=p_user;
 for item in select * from jsonb_array_elements(coalesce(p_state->'schedule','[]'::jsonb)) loop
 insert into scheduled_blocks values(item->>'id',p_user,(item->>'date')::date,(item->>'start')::time,(item->>'end')::time,item);
 end loop;
 for item in select * from jsonb_array_elements(p_state->'enrollments') loop
 update user_challenges set paused_on=(item->>'pausedOn')::date,paused_days=coalesce((item->>'pausedDays')::int,0),completion_dates=coalesce(item->'completedDates','{}'::jsonb) where user_id=p_user and id=item->>'id';
 end loop;
end $$;
revoke all on function public.save_workspace(uuid,jsonb,bigint) from public,anon,authenticated;
grant execute on function public.save_workspace(uuid,jsonb,bigint) to service_role;
revoke all on function public.apply_billing_event(text,uuid,text,jsonb),public.reserve_ai_credits(uuid,uuid,int),public.finish_ai_request(uuid,uuid,text,boolean),public.refund_stale_ai_requests() from public,anon,authenticated,service_role;
commit;
