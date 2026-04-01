alter table public.direct_thread_members
  add column if not exists last_read_at timestamptz not null default timezone('utc', now()),
  add column if not exists last_message_at timestamptz not null default timezone('utc', now()),
  add column if not exists unread_count integer not null default 0;

update public.direct_thread_members members
set
  last_message_at = coalesce(
    (
      select max(dm.created_at)
      from public.direct_messages dm
      where dm.thread_id = members.thread_id
    ),
    members.created_at
  ),
  last_read_at = coalesce(
    (
      select max(dm.created_at)
      from public.direct_messages dm
      where dm.thread_id = members.thread_id
        and dm.sender_id = members.user_id
    ),
    members.last_read_at
  ),
  unread_count = 0;

drop policy if exists "Thread members can update their own membership state" on public.direct_thread_members;

create policy "Thread members can update their own membership state"
on public.direct_thread_members
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.sync_thread_member_message_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.direct_thread_members members
  set
    last_message_at = new.created_at,
    unread_count = case
      when members.user_id = new.sender_id then 0
      else members.unread_count + 1
    end,
    last_read_at = case
      when members.user_id = new.sender_id then new.created_at
      else members.last_read_at
    end
  where members.thread_id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists direct_messages_sync_member_state on public.direct_messages;

create trigger direct_messages_sync_member_state
after insert on public.direct_messages
for each row
execute procedure public.sync_thread_member_message_state();

create or replace function public.mark_thread_read(target_thread_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.direct_thread_members
  set
    unread_count = 0,
    last_read_at = timezone('utc', now())
  where thread_id = target_thread_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.mark_thread_read(uuid) to authenticated;

drop view if exists public.direct_thread_previews;

create view public.direct_thread_previews as
select
  t.id as thread_id,
  peer.id as peer_id,
  peer.full_name as peer_full_name,
  peer.username as peer_username,
  peer.avatar_url as peer_avatar_url,
  peer.role as peer_role,
  last_message.body as last_message_body,
  last_message.created_at as last_message_created_at,
  self_member.unread_count,
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

grant select on public.direct_thread_previews to authenticated;
