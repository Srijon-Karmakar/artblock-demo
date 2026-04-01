create table if not exists public.post_bookmarks (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, user_id)
);

create index if not exists post_bookmarks_user_idx
on public.post_bookmarks (user_id, created_at desc);

alter table public.post_bookmarks enable row level security;

drop policy if exists "Users can view their own bookmarks" on public.post_bookmarks;
drop policy if exists "Users can save posts for themselves" on public.post_bookmarks;
drop policy if exists "Users can remove their own bookmarks" on public.post_bookmarks;

create policy "Users can view their own bookmarks"
on public.post_bookmarks
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can save posts for themselves"
on public.post_bookmarks
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can remove their own bookmarks"
on public.post_bookmarks
for delete
to authenticated
using (auth.uid() = user_id);
