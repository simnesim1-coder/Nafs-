-- NAFS 006: privacy-limited Telegram visitor analytics, no journal/task/SOS data.
-- Apply after 001-005. Existing identities and sessions are preserved.
begin;
alter table public.telegram_identities
 add column if not exists username text,
 add column if not exists language_code text,
 add column if not exists last_seen_at timestamptz,
 add column if not exists login_count bigint not null default 0;
do $$ begin
 if not exists(select 1 from pg_constraint where conrelid='public.telegram_identities'::regclass and conname='telegram_identities_username_length') then
  alter table public.telegram_identities add constraint telegram_identities_username_length check(username is null or length(username)<=64);
 end if;
 if not exists(select 1 from pg_constraint where conrelid='public.telegram_identities'::regclass and conname='telegram_identities_language_length') then
  alter table public.telegram_identities add constraint telegram_identities_language_length check(language_code is null or length(language_code)<=16);
 end if;
end $$;
create index if not exists telegram_identities_last_seen_idx on public.telegram_identities(last_seen_at desc);
-- Only the service role may use analytics (existing RLS + revoked privileges remain).
create or replace function public.record_telegram_visit(
 p_user uuid,p_telegram_id bigint,p_name text,p_username text,p_language text,p_new_login boolean default false
) returns boolean language plpgsql security definer set search_path=public as $$
begin
 update telegram_identities
 set display_name=left(p_name,260),username=left(nullif(p_username,''),64),
 language_code=left(nullif(p_language,''),16),last_seen_at=now(),
 login_count=login_count+case when p_new_login then 1 else 0 end
 where user_id=p_user and telegram_id=p_telegram_id;
 return found;
end $$;
revoke all on function public.record_telegram_visit(uuid,bigint,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.record_telegram_visit(uuid,bigint,text,text,text,boolean) to service_role;
commit;
