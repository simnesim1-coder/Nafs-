-- Additive. Apply after 006; safe to run again. Never resets accounts/history.
begin;
alter table public.telegram_identities add column if not exists first_login_at timestamptz;
create index if not exists telegram_identity_created_idx on public.telegram_identities(created_at desc);
alter table public.telegram_identities enable row level security;
revoke all on public.telegram_identities from anon,authenticated;
create or replace function public.complete_telegram_login(
 p_hash text,p_token_hash text,p_user uuid,p_telegram_id bigint,p_name text,p_username text,p_language text
) returns boolean language plpgsql security definer set search_path=public as $$
begin
 if p_hash !~ '^[a-f0-9]{64}$' or p_token_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid authentication digest';end if;
 if not exists(select 1 from telegram_identities where user_id=p_user and telegram_id=p_telegram_id) then raise exception 'Identity mismatch';end if;
 delete from telegram_auth_replays where expires_at<now();
 delete from telegram_sessions where expires_at<now();
 insert into telegram_auth_replays values(p_hash,now()+interval '11 minutes') on conflict do nothing;
 if not found then return false;end if;
 insert into telegram_sessions(token_hash,user_id,expires_at) values(p_token_hash,p_user,now()+interval '7 days');
 update telegram_identities set first_login_at=coalesce(first_login_at,now()) where user_id=p_user;
 perform record_telegram_visit(p_user,p_telegram_id,p_name,p_username,p_language,true);
 return true;
end $$;
revoke all on function public.complete_telegram_login(text,text,uuid,bigint,text,text,text) from public,anon,authenticated;
grant execute on function public.complete_telegram_login(text,text,uuid,bigint,text,text,text) to service_role;
-- Restores exact least-privilege RPC grant, including after an interrupted manual setup.
grant execute on function public.consume_rate_limit(text,integer) to service_role;
create or replace function public.owner_visitor_report(p_search text default '',p_page integer default 1,p_size integer default 20)
 returns jsonb language plpgsql security definer set search_path=public as $$
declare payload jsonb;
begin
 if p_page<1 or p_page>100000 or p_size<1 or p_size>100 or length(p_search)>80 then raise exception 'Invalid pagination';end if;
 select jsonb_build_object(
  'total',count(*),
  'new24h',count(*) filter(where created_at>=now()-interval '1 day'),
  'new7d',count(*) filter(where created_at>=now()-interval '7 days'),
  'new30d',count(*) filter(where created_at>=now()-interval '30 days'),
  'active24h',count(*) filter(where last_seen_at>=now()-interval '1 day'),
  'active7d',count(*) filter(where last_seen_at>=now()-interval '7 days'),
  'active30d',count(*) filter(where last_seen_at>=now()-interval '30 days'),
  'successfulLogins',coalesce(sum(login_count),0)) into payload from telegram_identities;
 return payload||jsonb_build_object('page',p_page,'pageSize',p_size,
  'matching',(select count(*) from telegram_identities where position(lower(p_search) in lower(display_name||' '||coalesce(username,'')||' '||telegram_id::text))>0),
  'users',coalesce((select jsonb_agg(row_to_json(x)) from (
   select telegram_id,display_name,username,created_at,first_login_at,last_seen_at,login_count from telegram_identities
   where position(lower(p_search) in lower(display_name||' '||coalesce(username,'')||' '||telegram_id::text))>0
   order by created_at desc,telegram_id desc limit p_size offset (p_page-1)*p_size
  )x),'[]'::jsonb));
end $$;
revoke all on function public.owner_visitor_report(text,integer,integer) from public,anon,authenticated;
grant execute on function public.owner_visitor_report(text,integer,integer) to service_role;
notify pgrst, 'reload schema';
commit;
