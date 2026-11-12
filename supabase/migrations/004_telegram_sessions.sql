-- Additive. Telegram identities map to existing auth.users; no client write access.
begin;
create table public.telegram_identities(telegram_id bigint primary key check(telegram_id>0),user_id uuid not null unique references auth.users(id) on delete cascade,display_name text not null check(length(display_name)<=260),created_at timestamptz not null default now());
create table public.telegram_sessions(token_hash text primary key check(length(token_hash)=64),user_id uuid not null references auth.users(id) on delete cascade,expires_at timestamptz not null,created_at timestamptz not null default now());
create index telegram_session_expiry on public.telegram_sessions(expires_at);
create index telegram_session_user on public.telegram_sessions(user_id);
create table public.telegram_auth_replays(signature_hash text primary key,expires_at timestamptz not null);
alter table public.telegram_identities enable row level security;
alter table public.telegram_sessions enable row level security;
alter table public.telegram_auth_replays enable row level security;
revoke all on public.telegram_identities,public.telegram_sessions,public.telegram_auth_replays from anon,authenticated;
grant all on public.telegram_identities,public.telegram_sessions,public.telegram_auth_replays to service_role;
-- Service role only; atomically consume an initData signature and prune expired material.
create function public.consume_telegram_auth(p_hash text) returns boolean language plpgsql security definer set search_path=public as $$
begin
 delete from telegram_auth_replays where expires_at<now();
 delete from rate_limits where window_start<now()-interval '1 hour';
 delete from telegram_sessions where expires_at<now();
 insert into telegram_auth_replays values(p_hash,now()+interval '11 minutes') on conflict do nothing;
 return found;
end $$;
revoke all on function public.consume_telegram_auth(text) from public,anon,authenticated;
grant execute on function public.consume_telegram_auth(text) to service_role;
-- Transient rate-limit metadata is bounded, not a permanent user activity log.
create index if not exists rate_limit_window_idx on public.rate_limits(window_start);
create or replace function public.consume_rate_limit(p_key text,p_limit int) returns boolean language plpgsql security definer set search_path=public as $$
declare n int;
begin
 delete from rate_limits where window_start<now()-interval '1 hour';
 insert into rate_limits(key) values(p_key) on conflict(key) do update set requests=case when rate_limits.window_start<now()-interval '1 minute' then 1 else rate_limits.requests+1 end,window_start=case when rate_limits.window_start<now()-interval '1 minute' then now() else rate_limits.window_start end returning requests into n;
 return n<=p_limit;
end $$;
revoke all on function public.consume_rate_limit(text,int) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,int) to service_role;
commit;
