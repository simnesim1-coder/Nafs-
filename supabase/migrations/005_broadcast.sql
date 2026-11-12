-- Additive admin broadcasting. Consent is OFF by absence; private service-only tables.
begin;
create table public.broadcast_recipients(
 user_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default false,
 consent_version text not null default 'nafs-updates-v1',
 updated_at timestamptz not null default now()
);
create table public.broadcast_campaigns(
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references auth.users(id) on delete cascade,
 request_key uuid not null,
 body text not null check(length(body) between 1 and 3500),
 status text not null default 'draft' check(status in ('draft','queued','cancelled','completed')),
 created_at timestamptz not null default now(),
 confirmed_at timestamptz,
 unique(author_id,request_key)
);
create table public.broadcast_deliveries(
 campaign_id uuid references public.broadcast_campaigns(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','sending','sent','failed','uncertain','skipped')),
 available_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key(campaign_id,user_id)
);
create index broadcast_claim_idx on public.broadcast_deliveries(campaign_id,status,available_at);
alter table public.broadcast_recipients enable row level security;
alter table public.broadcast_campaigns enable row level security;
alter table public.broadcast_deliveries enable row level security;
revoke all on public.broadcast_recipients,public.broadcast_campaigns,public.broadcast_deliveries from anon,authenticated;
grant all on public.broadcast_recipients,public.broadcast_campaigns,public.broadcast_deliveries to service_role;

create function public.prepare_broadcast(p_author uuid,p_key uuid,p_body text) returns uuid language plpgsql security definer set search_path=public as $$
declare campaign uuid;
begin
 insert into broadcast_campaigns(author_id,request_key,body) values(p_author,p_key,p_body)
 on conflict(author_id,request_key) do nothing returning id into campaign;
 if campaign is null then
  select id into campaign from broadcast_campaigns where author_id=p_author and request_key=p_key and body=p_body;
  if campaign is null then raise exception 'Request key already used for different content';end if;
  return campaign;
 end if;
 insert into broadcast_deliveries(campaign_id,user_id)
 select campaign,r.user_id from broadcast_recipients r join telegram_identities t on t.user_id=r.user_id where r.enabled;
 return campaign;
end $$;

create function public.claim_broadcast_delivery(p_campaign uuid)
 returns table(user_id uuid,telegram_id bigint,body text) language plpgsql security definer set search_path=public as $$
declare recipient uuid; message text;
begin
 -- Lock the campaign too, so cancellation prevents subsequent claims.
 select c.body into message from broadcast_campaigns c where c.id=p_campaign and c.status='queued' for update;
 if message is null then return;end if;
 update broadcast_deliveries d set status='skipped',updated_at=now()
 where d.campaign_id=p_campaign and d.status='pending' and not exists(select 1 from broadcast_recipients r where r.user_id=d.user_id and r.enabled);
 select d.user_id into recipient from broadcast_deliveries d
 where d.campaign_id=p_campaign and d.status='pending' and d.available_at<=now()
 order by d.user_id for update skip locked limit 1;
 if recipient is null then return;end if;
 update broadcast_deliveries d set status='sending',updated_at=now() where d.campaign_id=p_campaign and d.user_id=recipient;
 return query select recipient,t.telegram_id,message from telegram_identities t where t.user_id=recipient;
end $$;
revoke all on function public.prepare_broadcast(uuid,uuid,text),public.claim_broadcast_delivery(uuid) from public,anon,authenticated;
grant execute on function public.prepare_broadcast(uuid,uuid,text),public.claim_broadcast_delivery(uuid) to service_role;
-- Aggregate on the server so PostgREST's default row limit never understates audience size.
create function public.broadcast_counts(p_campaigns uuid[])
 returns table(campaign_id uuid,status text,total bigint) language sql security definer set search_path=public as $$
 select d.campaign_id,d.status,count(*) from broadcast_deliveries d
 where d.campaign_id=any(p_campaigns) group by d.campaign_id,d.status
$$;
revoke all on function public.broadcast_counts(uuid[]) from public,anon,authenticated;
grant execute on function public.broadcast_counts(uuid[]) to service_role;
commit;
