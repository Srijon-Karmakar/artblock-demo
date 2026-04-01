import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { addComment, renderFormattedText, togglePostLike, togglePostSave, voteOnPoll } from "../../lib/profile";
import type { FeedPost } from "../../types/auth";

type FeedCardProps = {
  post: FeedPost;
  viewerId: string;
  onRefresh: () => Promise<void>;
  extraActions?: ReactNode;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));

export const FeedCard = ({ post, viewerId, onRefresh, extraActions }: FeedCardProps) => {
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [isMutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = post.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalVotes = post.poll_options.reduce((sum, option) => sum + option.vote_count, 0);
  const canRevealPollResults = Boolean(post.voted_option_id) || totalVotes > 0;

  const handleLike = async () => {
    setMutating(true);
    setError(null);
    const result = await togglePostLike(post.id, viewerId, post.liked_by_viewer);
    setMutating(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    await onRefresh();
  };

  const handleVote = async (optionId: string) => {
    setMutating(true);
    setError(null);
    const result = await voteOnPoll(post.id, optionId, viewerId);
    setMutating(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    await onRefresh();
  };

  const handleSave = async () => {
    setMutating(true);
    setError(null);
    const result = await togglePostSave(post.id, viewerId, post.saved_by_viewer);
    setMutating(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    await onRefresh();
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = commentDraft.trim();

    if (!trimmed) {
      setError("Comment cannot be empty.");
      return;
    }

    setMutating(true);
    setError(null);
    const result = await addComment(post.id, viewerId, trimmed);
    setMutating(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setCommentDraft("");
    await onRefresh();
  };

  return (
    <article className="feed-card">
      <header className="feed-card__header">
        <Link className="feed-card__identity feed-card__identity--link" to={`/profiles/${post.author_id}`}>
          {post.avatar_url ? (
            <img alt={post.full_name} className="feed-card__avatar" src={post.avatar_url} />
          ) : (
            <div className="feed-card__avatar feed-card__avatar--fallback">{initials}</div>
          )}

          <div>
            <strong>{post.full_name}</strong>
            <p>{post.username ? `@${post.username}` : "creator"} | {formatDate(post.created_at)}</p>
          </div>
        </Link>

        <Link className="ghost-button" to={`/profiles/${post.author_id}`}>
          Profile
        </Link>
      </header>

      <div className="feed-card__content">
        {post.post_type === "image" && post.media_url ? (
          <img alt={post.body ?? `${post.full_name} post`} className="feed-card__media" src={post.media_url} />
        ) : null}

        {post.post_type === "video" && post.media_url ? (
          <video className="feed-card__media" controls src={post.media_url} />
        ) : null}

        {post.post_type === "text" ? (
          <div className="feed-text-card">
            {post.title ? <h3>{post.title}</h3> : null}
            <div dangerouslySetInnerHTML={{ __html: renderFormattedText(post.body ?? "") }} />
          </div>
        ) : null}

        {post.post_type === "poll" ? (
          <div className="feed-poll-card">
            <h3>{post.title ?? "Poll"}</h3>
            {post.body ? <p>{post.body}</p> : null}
            <div className="feed-poll-card__options">
              {post.poll_options.map((option) => {
                const voteShare = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
                const isVoted = post.voted_option_id === option.option_id;

                return (
                  <button
                    className={`poll-option-button ${isVoted ? "poll-option-button--active" : ""}`}
                    disabled={isMutating}
                    key={option.option_id}
                    onClick={() => void handleVote(option.option_id)}
                    type="button"
                  >
                    <span>{option.label}</span>
                    {canRevealPollResults ? (
                      <strong>{option.vote_count} votes | {voteShare}%</strong>
                    ) : (
                      <strong>Tap to vote</strong>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="feed-card__body">
        <div className="feed-card__meta-row">
          {post.headline ? <span className="section-heading__eyebrow">{post.headline}</span> : null}
          {post.is_pinned ? <span className="feed-card__pin-badge">Pinned</span> : null}
        </div>
        {(post.post_type === "image" || post.post_type === "video") && post.body ? <p>{post.body}</p> : null}
        {error ? <div className="auth-message auth-message--error">{error}</div> : null}
      </div>

      <div className="feed-card__actions">
        <button className="ghost-button" disabled={isMutating} onClick={() => void handleLike()} type="button">
          {post.liked_by_viewer ? "Unlike" : "Like"} | {post.like_count}
        </button>
        <button className="ghost-button" disabled={isMutating} onClick={() => void handleSave()} type="button">
          {post.saved_by_viewer ? "Saved" : "Save"}
        </button>
        <button className="ghost-button" onClick={() => setCommentsOpen((current) => !current)} type="button">
          Comments | {post.comment_count}
        </button>
        {extraActions}
      </div>

      {isCommentsOpen ? (
        <div className="feed-comments">
          <form className="feed-comments__composer" onSubmit={handleCommentSubmit}>
            <textarea
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Write a comment"
              rows={3}
              value={commentDraft}
            />
            <button className="solid-button" disabled={isMutating} type="submit">
              Comment
            </button>
          </form>

          <div className="feed-comments__list">
            {post.comments.length === 0 ? <p>No comments yet.</p> : null}
            {post.comments.map((comment) => (
              <article className="feed-comment" key={comment.id}>
                <strong>
                  <Link to={`/profiles/${comment.author_id}`}>
                    {comment.username ? `@${comment.username}` : comment.full_name}
                  </Link>
                </strong>
                <p>{comment.body}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
};
