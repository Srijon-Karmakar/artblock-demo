import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PostComposer } from "../components/dashboard/PostComposer";
import { FeedCard } from "../components/feed/FeedCard";
import { fetchFeedPosts, type FeedScope } from "../lib/profile";
import { useAuth } from "../providers/AuthProvider";
import type { FeedPost } from "../types/auth";

const creatorShortcuts = [
  "Post image or video updates directly from the feed",
  "Drop polls between media posts to increase engagement",
  "Keep long-form thoughts in formatted text posts"
];

const visitorShortcuts = [
  "Discover creator content from one scrolling feed",
  "Like, comment, and vote without leaving the stream",
  "Move into creator profiles when something stands out"
];

const feedTabs: { label: string; value: FeedScope }[] = [
  { label: "For You", value: "for-you" },
  { label: "Following", value: "following" },
  { label: "Subscribed", value: "subscribed" },
  { label: "Saved", value: "saved" }
];

const FEED_PAGE_SIZE = 6;

export const FeedPage = () => {
  const { profile, user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedScope, setFeedScope] = useState<FeedScope>("for-you");
  const [isLoading, setLoading] = useState(true);
  const [isLoadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadFeed = async ({
    scope = feedScope,
    page: nextPage = 0,
    append = false
  }: {
    scope?: FeedScope;
    page?: number;
    append?: boolean;
  } = {}) => {
    if (!user) {
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    if (!append) {
      setError(null);
    }

    const result = await fetchFeedPosts(user.id, scope, {
      page: nextPage,
      pageSize: FEED_PAGE_SIZE
    });

    if (append) {
      setLoadingMore(false);
    } else {
      setLoading(false);
    }

    if (result.error) {
      setError(result.error);
      return;
    }

    setHasMore(result.hasMore);
    setPage(nextPage);
    setPosts((current) => {
      if (!append) {
        return result.data;
      }

      const seenIds = new Set(current.map((post) => post.id));
      const nextPosts = result.data.filter((post) => !seenIds.has(post.id));
      return [...current, ...nextPosts];
    });
  };

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(false);
    void loadFeed({ scope: feedScope, page: 0, append: false });
  }, [user?.id, feedScope]);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          void loadFeed({ scope: feedScope, page: page + 1, append: true });
        }
      },
      {
        rootMargin: "240px 0px"
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [feedScope, hasMore, isLoading, isLoadingMore, page, user?.id]);

  const activeCreators = new Set(posts.map((post) => post.author_id)).size;
  const interactionLabel =
    profile?.role === "creator" ? "Audience-ready creator feed" : "Community feed for visitors";
  const emptyFeedCopy =
    feedScope === "following"
      ? "Follow a few profiles to build a relationship-based feed."
      : feedScope === "subscribed"
        ? "Subscribe to creators to unlock a dedicated subscription stream."
        : feedScope === "saved"
          ? "Save posts from the feed to build a private reading list."
        : profile?.role === "creator"
          ? "Create the first post right from the feed or publish from your profile studio."
          : "Once creators publish content, it will appear here.";

  return (
    <section className="feed-page">
      <div className="feed-shell">
        <aside className="feed-sidebar feed-sidebar--left">
          <div className="feed-rail-card">
            <span className="section-heading__eyebrow">Profile</span>
            <h2>{profile?.full_name ?? "Account"}</h2>
            <p>{profile?.bio ?? "Set your profile details to improve how you appear across the platform."}</p>
            <div className="feed-rail-meta">
              <span>{profile?.role === "creator" ? "Creator" : "Visitor"}</span>
              <span>{profile?.username ? `@${profile.username}` : "No username yet"}</span>
            </div>
            <div className="feed-rail-actions">
              <Link className="ghost-button" to={`/profiles/${user?.id ?? ""}`}>
                View Profile
              </Link>
              <Link className="ghost-button" to="/dashboard">
                {profile?.role === "creator" ? "Open Studio" : "Open Account"}
              </Link>
            </div>
          </div>

          <div className="feed-rail-card">
            <span className="section-heading__eyebrow">Flow</span>
            <h2>{profile?.role === "creator" ? "Creator rhythm" : "Visitor rhythm"}</h2>
            <ul className="feed-rail-list">
              {(profile?.role === "creator" ? creatorShortcuts : visitorShortcuts).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="feed-main">
          <header className="feed-hero">
            <div>
              <span className="section-heading__eyebrow">Discover Feed</span>
              <h1>Post and browse from one social surface.</h1>
              <p>
                Mobile drives the experience first. On larger screens, sidebars keep navigation and
                context nearby without breaking the feed flow.
              </p>
            </div>

            <div className="feed-chip-row">
              {feedTabs.map((tab) => (
                <button
                  className={`feed-chip ${feedScope === tab.value ? "feed-chip--active" : ""}`}
                  key={tab.value}
                  onClick={() => setFeedScope(tab.value)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
              <span className="feed-chip">{interactionLabel}</span>
            </div>
          </header>

          {profile?.role === "creator" && user ? (
            <PostComposer
              onPublished={() => loadFeed({ scope: feedScope, page: 0, append: false })}
              userId={user.id}
              variant="feed"
            />
          ) : null}

          {error ? <div className="auth-message auth-message--error">{error}</div> : null}

          {isLoading ? (
            <div className="dashboard-card">
              <p>Loading feed...</p>
            </div>
          ) : null}

          {!isLoading && posts.length === 0 ? (
            <div className="empty-feed">
              <span className="section-heading__eyebrow">No Posts Yet</span>
              <h2>The feed is empty right now.</h2>
              <p>{emptyFeedCopy}</p>
              <Link className="solid-button" to="/dashboard">
                {profile?.role === "creator" ? "Open Profile Studio" : "Open Account"}
              </Link>
            </div>
          ) : null}

          <div className="feed-grid">
            {posts.map((post) => (
              <FeedCard
                key={post.id}
                onRefresh={() => loadFeed({ scope: feedScope, page: 0, append: false })}
                post={post}
                viewerId={user?.id ?? ""}
              />
            ))}
          </div>

          {!isLoading && posts.length > 0 ? <div className="feed-sentinel" ref={sentinelRef} /> : null}

          {isLoadingMore ? (
            <div className="feed-load-state">
              <p>Loading more posts...</p>
            </div>
          ) : null}

          {!isLoading && hasMore ? (
            <div className="feed-load-state">
              <button
                className="ghost-button"
                disabled={isLoadingMore}
                onClick={() => void loadFeed({ scope: feedScope, page: page + 1, append: true })}
                type="button"
              >
                Load more
              </button>
            </div>
          ) : null}

          {!isLoading && !hasMore && posts.length > 0 ? (
            <div className="feed-end-cap">
              <span className="section-heading__eyebrow">End of feed</span>
              <p>You are caught up for this feed tab.</p>
            </div>
          ) : null}
        </div>

        <aside className="feed-sidebar feed-sidebar--right">
          <div className="feed-rail-card">
            <span className="section-heading__eyebrow">Live Summary</span>
            <h2>Feed pulse</h2>
            <div className="feed-rail-stats">
              <article>
                <span>Posts</span>
                <strong>{posts.length}</strong>
              </article>
              <article>
                <span>Creators</span>
                <strong>{activeCreators}</strong>
              </article>
            </div>
            <p>
              {feedScope === "for-you"
                ? "Broad discovery stream."
                : feedScope === "following"
                  ? "Only people you follow."
                  : feedScope === "subscribed"
                    ? "Only creators you subscribed to."
                    : "Your private collection of saved posts."}
            </p>
          </div>

          <div className="feed-rail-card">
            <span className="section-heading__eyebrow">Actions</span>
            <h2>{profile?.role === "creator" ? "Publish from profile too" : "Jump out of feed"}</h2>
            <p>
              {profile?.role === "creator"
                ? "Your profile studio still has the same publishing tools, so you can post from both feed and profile surfaces."
                : "Use account and creator profile pages when you want more context than the feed card."}
            </p>
            <div className="feed-rail-actions">
              <Link className="ghost-button" to="/messages">
                Messages
              </Link>
              <Link className="ghost-button" to="/dashboard">
                {profile?.role === "creator" ? "Profile Studio" : "Account"}
              </Link>
              {profile?.role === "creator" ? (
                <Link className="solid-button" to="/dashboard">
                  Manage Creator Page
                </Link>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};
