alter table public.posts
  add column if not exists is_pinned boolean not null default false;

create index if not exists posts_author_pinned_idx
on public.posts (author_id, is_pinned, created_at desc);

drop view if exists public.feed_posts;

create view public.feed_posts as
select
  p.id,
  p.author_id,
  p.post_type,
  p.title,
  coalesce(p.body, p.caption) as body,
  p.media_url,
  p.is_published,
  p.is_pinned,
  p.created_at,
  pr.full_name,
  pr.username,
  pr.avatar_url,
  cp.slug as creator_slug,
  cp.headline
from public.posts p
join public.profiles pr on pr.id = p.author_id
left join public.creator_profiles cp on cp.id = p.author_id
where p.is_published = true
order by p.created_at desc;

grant select on public.feed_posts to authenticated;
