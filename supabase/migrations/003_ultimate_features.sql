-- Additive only. Focus, SOS reflections and earned badges are private owner records.
begin;
create table public.focus_sessions(id text not null,user_id uuid not null references auth.users on delete cascade,session_date date not null,started_at bigint not null,ended_at bigint not null,duration_seconds int not null check(duration_seconds between 60 and 10800),task_id text not null default '',primary key(user_id,id),check(ended_at>=started_at));
create index focus_date_idx on public.focus_sessions(user_id,session_date);
create table public.sos_reflections(id text not null,user_id uuid not null references auth.users on delete cascade,reflection_date date not null,content jsonb not null,primary key(user_id,id));
create table public.achievement_records(user_id uuid not null references auth.users on delete cascade,achievement_id text not null,recorded_date date not null,primary key(user_id,achievement_id));
do $$declare tbl text;begin foreach tbl in array array['focus_sessions','sos_reflections','achievement_records'] loop execute format('alter table public.%I enable row level security',tbl);execute format('create policy own_read on public.%I for select to authenticated using(user_id=auth.uid())',tbl);end loop;end $$;
alter table public.user_challenges add column archived boolean not null default false;
alter function public.save_workspace(uuid,jsonb,bigint) rename to save_workspace_v2;
revoke all on function public.save_workspace_v2(uuid,jsonb,bigint) from public,anon,authenticated,service_role;
create function public.save_workspace(p_user uuid,p_state jsonb,p_revision bigint) returns void language plpgsql security definer set search_path=public as $$
declare item jsonb;pair record;
begin
 perform save_workspace_v2(p_user,p_state,p_revision);
 for item in select * from jsonb_array_elements(coalesce(p_state->'focusSessions','[]'::jsonb)) loop
 insert into focus_sessions values(item->>'id',p_user,(item->>'date')::date,(item->>'startedAt')::bigint,(item->>'endedAt')::bigint,(item->>'durationSeconds')::int,coalesce(item->>'taskId','')) on conflict do nothing;
 end loop;
 for item in select * from jsonb_array_elements(coalesce(p_state->'sosReflections','[]'::jsonb)) loop
 insert into sos_reflections values(item->>'id',p_user,(item->>'date')::date,item) on conflict do nothing;
 end loop;
 for pair in select * from jsonb_each(coalesce(p_state->'earnedAchievements','{}'::jsonb)) loop
 insert into achievement_records values(p_user,pair.key,(pair.value->>'date')::date) on conflict do nothing;
 end loop;
 for item in select * from jsonb_array_elements(p_state->'enrollments') loop
 update user_challenges set archived=coalesce((item->>'archived')::boolean,false) where user_id=p_user and id=item->>'id';
 end loop;
end $$;
revoke all on function public.save_workspace(uuid,jsonb,bigint) from public,anon,authenticated;
grant execute on function public.save_workspace(uuid,jsonb,bigint) to service_role;
commit;
