# ArtBlock

Production-oriented starter for a mobile-first creator platform using React, TypeScript, Supabase, and PostgreSQL.

## Included

- Responsive landing page with header, hero, about, CTA, and footer
- Login and signup flows wired to Supabase email/password auth
- Two roles: `visitor` and `creator`
- Protected feed and dashboard routes for authenticated users
- PostgreSQL schema and Supabase RLS policies for the `profiles` table
- Editable account profile fields, avatar uploads, and creator publishing flow
- Mixed creator feed with image, video, poll, and formatted text posts
- Visitor interactions with likes, comments, and poll voting
- Public creator pages at `/creators/:slug`

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set:

   ```bash
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

3. Apply these SQL files in order inside your Supabase SQL editor or migration workflow:

   - [supabase/migrations/20260331_init_profiles.sql](/e:/s15/Projects/artblock-final/code/supabase/migrations/20260331_init_profiles.sql)
   - [supabase/migrations/20260331_creator_profiles_and_storage.sql](/e:/s15/Projects/artblock-final/code/supabase/migrations/20260331_creator_profiles_and_storage.sql)
   - [supabase/migrations/20260331_feed_posts.sql](/e:/s15/Projects/artblock-final/code/supabase/migrations/20260331_feed_posts.sql)
   - [supabase/migrations/20260331_rich_feed_engagement.sql](/e:/s15/Projects/artblock-final/code/supabase/migrations/20260331_rich_feed_engagement.sql)

4. Start the app:

   ```bash
   npm run dev
   ```

## Recommended next modules

- Storage bucket policies
- Admin moderation workflows
- Payments and event processing
- Follows, creator discovery, and notifications
