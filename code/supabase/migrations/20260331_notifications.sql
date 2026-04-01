do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'notification_type' and n.nspname = 'public'
  ) then
    create type public.notification_type as enum (
      'new_follower',
      'new_subscriber',
      'new_message',
      'post_like',
      'post_comment'
    );
  end if;
end
$$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists notifications_recipient_created_idx
on public.notifications (recipient_id, created_at desc);

create index if not exists notifications_recipient_unread_idx
on public.notifications (recipient_id, is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Users can update their own notifications" on public.notifications;

create policy "Users can view their own notifications"
on public.notifications
for select
to authenticated
using (auth.uid() = recipient_id);

create policy "Users can update their own notifications"
on public.notifications
for update
to authenticated
using (auth.uid() = recipient_id)
with check (auth.uid() = recipient_id);

create or replace function public.create_follow_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
begin
  select full_name into actor_name
  from public.profiles
  where id = new.follower_id;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    link
  )
  values (
    new.followed_id,
    new.follower_id,
    'new_follower',
    'New follower',
    coalesce(actor_name, 'Someone') || ' followed your profile.',
    '/profiles/' || new.follower_id::text
  );

  return new;
end;
$$;

create or replace function public.create_subscription_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
begin
  select full_name into actor_name
  from public.profiles
  where id = new.subscriber_id;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    link
  )
  values (
    new.creator_id,
    new.subscriber_id,
    'new_subscriber',
    'New subscriber',
    coalesce(actor_name, 'Someone') || ' subscribed to your creator profile.',
    '/profiles/' || new.subscriber_id::text
  );

  return new;
end;
$$;

create or replace function public.create_message_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
begin
  select full_name into actor_name
  from public.profiles
  where id = new.sender_id;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    link
  )
  select
    members.user_id,
    new.sender_id,
    'new_message',
    'New message',
    coalesce(actor_name, 'Someone') || ': ' || left(new.body, 120),
    '/messages?thread=' || new.thread_id::text
  from public.direct_thread_members members
  where members.thread_id = new.thread_id
    and members.user_id <> new.sender_id;

  return new;
end;
$$;

create or replace function public.create_post_like_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  post_author_id uuid;
begin
  select full_name into actor_name
  from public.profiles
  where id = new.user_id;

  select author_id into post_author_id
  from public.posts
  where id = new.post_id;

  if post_author_id is null or post_author_id = new.user_id then
    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    link
  )
  values (
    post_author_id,
    new.user_id,
    'post_like',
    'New like',
    coalesce(actor_name, 'Someone') || ' liked your post.',
    '/feed'
  );

  return new;
end;
$$;

create or replace function public.create_post_comment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  post_author_id uuid;
begin
  select full_name into actor_name
  from public.profiles
  where id = new.author_id;

  select author_id into post_author_id
  from public.posts
  where id = new.post_id;

  if post_author_id is null or post_author_id = new.author_id then
    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    link
  )
  values (
    post_author_id,
    new.author_id,
    'post_comment',
    'New comment',
    coalesce(actor_name, 'Someone') || ' commented: ' || left(new.body, 120),
    '/feed'
  );

  return new;
end;
$$;

drop trigger if exists profile_follows_create_notification on public.profile_follows;
create trigger profile_follows_create_notification
after insert on public.profile_follows
for each row
execute procedure public.create_follow_notification();

drop trigger if exists creator_subscriptions_create_notification on public.creator_subscriptions;
create trigger creator_subscriptions_create_notification
after insert on public.creator_subscriptions
for each row
execute procedure public.create_subscription_notification();

drop trigger if exists direct_messages_create_notification on public.direct_messages;
create trigger direct_messages_create_notification
after insert on public.direct_messages
for each row
execute procedure public.create_message_notification();

drop trigger if exists post_reactions_create_notification on public.post_reactions;
create trigger post_reactions_create_notification
after insert on public.post_reactions
for each row
execute procedure public.create_post_like_notification();

drop trigger if exists post_comments_create_notification on public.post_comments;
create trigger post_comments_create_notification
after insert on public.post_comments
for each row
execute procedure public.create_post_comment_notification();

create or replace function public.mark_notification_read(target_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.notifications
  set is_read = true
  where id = target_notification_id
    and recipient_id = auth.uid();
end;
$$;

create or replace function public.mark_all_notifications_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.notifications
  set is_read = true
  where recipient_id = auth.uid()
    and is_read = false;
end;
$$;

grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;

create or replace view public.notification_items as
select
  n.id,
  n.recipient_id,
  n.actor_id,
  n.type,
  n.title,
  n.body,
  n.link,
  n.is_read,
  n.created_at,
  p.full_name as actor_full_name,
  p.username as actor_username,
  p.avatar_url as actor_avatar_url
from public.notifications n
left join public.profiles p on p.id = n.actor_id
where n.recipient_id = auth.uid();

grant select on public.notification_items to authenticated;
