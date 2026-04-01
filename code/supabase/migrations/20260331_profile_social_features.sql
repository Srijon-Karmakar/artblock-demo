create table if not exists public.profile_follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create table if not exists public.creator_subscriptions (
  subscriber_id uuid not null references public.profiles (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (subscriber_id, creator_id),
  check (subscriber_id <> creator_id)
);

create table if not exists public.direct_threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.direct_thread_members (
  thread_id uuid not null references public.direct_threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (thread_id, user_id)
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.direct_threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  check (length(trim(body)) > 0)
);

create index if not exists profile_follows_followed_idx
on public.profile_follows (followed_id, created_at desc);

create index if not exists creator_subscriptions_creator_idx
on public.creator_subscriptions (creator_id, created_at desc);

create index if not exists direct_thread_members_user_idx
on public.direct_thread_members (user_id, created_at desc);

create index if not exists direct_messages_thread_idx
on public.direct_messages (thread_id, created_at desc);

alter table public.profile_follows enable row level security;
alter table public.creator_subscriptions enable row level security;
alter table public.direct_threads enable row level security;
alter table public.direct_thread_members enable row level security;
alter table public.direct_messages enable row level security;

create or replace function public.user_is_thread_member(target_thread_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.direct_thread_members members
    where members.thread_id = target_thread_id
      and members.user_id = auth.uid()
  );
$$;

grant execute on function public.user_is_thread_member(uuid) to authenticated;

drop policy if exists "Profile follows are viewable by authenticated users" on public.profile_follows;
drop policy if exists "Users can follow from their own account" on public.profile_follows;
drop policy if exists "Users can unfollow from their own account" on public.profile_follows;

create policy "Profile follows are viewable by authenticated users"
on public.profile_follows
for select
to authenticated
using (true);

create policy "Users can follow from their own account"
on public.profile_follows
for insert
to authenticated
with check (auth.uid() = follower_id);

create policy "Users can unfollow from their own account"
on public.profile_follows
for delete
to authenticated
using (auth.uid() = follower_id);

drop policy if exists "Creator subscriptions are viewable by authenticated users" on public.creator_subscriptions;
drop policy if exists "Users can subscribe from their own account" on public.creator_subscriptions;
drop policy if exists "Users can unsubscribe from their own account" on public.creator_subscriptions;

create policy "Creator subscriptions are viewable by authenticated users"
on public.creator_subscriptions
for select
to authenticated
using (true);

create policy "Users can subscribe from their own account"
on public.creator_subscriptions
for insert
to authenticated
with check (
  auth.uid() = subscriber_id
  and exists (
    select 1
    from public.profiles p
    where p.id = creator_id
      and p.role = 'creator'
  )
);

create policy "Users can unsubscribe from their own account"
on public.creator_subscriptions
for delete
to authenticated
using (auth.uid() = subscriber_id);

drop policy if exists "Thread members can view their direct threads" on public.direct_threads;

create policy "Thread members can view their direct threads"
on public.direct_threads
for select
to authenticated
using (public.user_is_thread_member(id));

drop policy if exists "Thread members can view membership" on public.direct_thread_members;

create policy "Thread members can view membership"
on public.direct_thread_members
for select
to authenticated
using (public.user_is_thread_member(thread_id));

drop policy if exists "Thread members can view direct messages" on public.direct_messages;
drop policy if exists "Thread members can send direct messages" on public.direct_messages;

create policy "Thread members can view direct messages"
on public.direct_messages
for select
to authenticated
using (public.user_is_thread_member(thread_id));

create policy "Thread members can send direct messages"
on public.direct_messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and public.user_is_thread_member(thread_id)
);

create or replace function public.open_direct_thread(peer_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_thread_id uuid;
  new_thread_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if peer_id is null or peer_id = current_user_id then
    raise exception 'A valid peer profile is required';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = peer_id
  ) then
    raise exception 'Peer profile not found';
  end if;

  select thread_id
  into existing_thread_id
  from (
    select m_self.thread_id
    from public.direct_thread_members m_self
    join public.direct_thread_members m_peer
      on m_peer.thread_id = m_self.thread_id
    where m_self.user_id = current_user_id
      and m_peer.user_id = peer_id
      and (
        select count(*)
        from public.direct_thread_members members
        where members.thread_id = m_self.thread_id
      ) = 2
    limit 1
  ) matched_thread;

  if existing_thread_id is not null then
    return existing_thread_id;
  end if;

  insert into public.direct_threads default values
  returning id into new_thread_id;

  insert into public.direct_thread_members (thread_id, user_id)
  values
    (new_thread_id, current_user_id),
    (new_thread_id, peer_id);

  return new_thread_id;
end;
$$;

grant execute on function public.open_direct_thread(uuid) to authenticated;

create or replace view public.public_member_profiles as
select
  p.id,
  p.full_name,
  p.username,
  p.avatar_url,
  p.bio,
  p.website,
  p.location,
  p.role,
  cp.slug as creator_slug,
  cp.headline,
  cp.about,
  cp.featured_quote,
  coalesce((
    select count(*)
    from public.profile_follows f
    where f.followed_id = p.id
  ), 0)::integer as follower_count,
  coalesce((
    select count(*)
    from public.profile_follows f
    where f.follower_id = p.id
  ), 0)::integer as following_count,
  coalesce((
    select count(*)
    from public.creator_subscriptions s
    where s.creator_id = p.id
  ), 0)::integer as subscriber_count,
  coalesce((
    select count(*)
    from public.posts posts
    where posts.author_id = p.id
      and posts.is_published = true
  ), 0)::integer as post_count
from public.profiles p
left join public.creator_profiles cp
  on cp.id = p.id
  and cp.is_published = true;

create or replace view public.direct_thread_previews as
select
  t.id as thread_id,
  peer.id as peer_id,
  peer.full_name as peer_full_name,
  peer.username as peer_username,
  peer.avatar_url as peer_avatar_url,
  peer.role as peer_role,
  last_message.body as last_message_body,
  last_message.created_at as last_message_created_at,
  coalesce(message_count.message_count, 0)::integer as message_count
from public.direct_threads t
join public.direct_thread_members self_member
  on self_member.thread_id = t.id
  and self_member.user_id = auth.uid()
join public.direct_thread_members peer_member
  on peer_member.thread_id = t.id
  and peer_member.user_id <> auth.uid()
join public.profiles peer
  on peer.id = peer_member.user_id
left join lateral (
  select dm.body, dm.created_at
  from public.direct_messages dm
  where dm.thread_id = t.id
  order by dm.created_at desc
  limit 1
) last_message on true
left join lateral (
  select count(*) as message_count
  from public.direct_messages dm
  where dm.thread_id = t.id
) message_count on true
where (
  select count(*)
  from public.direct_thread_members members
  where members.thread_id = t.id
) = 2;

create or replace view public.direct_message_entries as
select
  dm.id,
  dm.thread_id,
  dm.sender_id,
  dm.body,
  dm.created_at,
  p.full_name,
  p.username,
  p.avatar_url
from public.direct_messages dm
join public.profiles p on p.id = dm.sender_id
where exists (
  select 1
  from public.direct_thread_members members
  where members.thread_id = dm.thread_id
    and members.user_id = auth.uid()
);

grant select on public.public_member_profiles to anon, authenticated;
grant select on public.direct_thread_previews to authenticated;
grant select on public.direct_message_entries to authenticated;
