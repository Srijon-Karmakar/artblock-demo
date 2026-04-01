import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import type { FeedPostType } from "../../lib/supabase.types";
import { createFeedPost, renderFormattedText, uploadPostMedia } from "../../lib/profile";

const postOptions: { label: string; value: FeedPostType }[] = [
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Poll", value: "poll" },
  { label: "Text", value: "text" }
];

const baseSchema = z.object({
  title: z.string().max(120, "Title or question must stay under 120 characters."),
  body: z.string().max(2000, "Post body must stay under 2000 characters.")
});

type PostComposerProps = {
  userId: string;
  onPublished: () => Promise<void>;
  variant?: "dashboard" | "feed";
};

const emptyPollOptions = ["", ""];

export const PostComposer = ({
  userId,
  onPublished,
  variant = "dashboard"
}: PostComposerProps) => {
  const [postType, setPostType] = useState<FeedPostType>("image");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(emptyPollOptions);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isExpanded, setExpanded] = useState(variant === "dashboard");

  const mediaAccept =
    postType === "video" ? "video/mp4,video/webm,video/quicktime" : "image/png,image/jpeg,image/webp";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetComposer = () => {
    setTitle("");
    setBody("");
    setPollOptions(emptyPollOptions);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (variant === "feed") {
      setExpanded(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const maxSizeInBytes = postType === "video" ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(postType === "video" ? "Video must be 25 MB or smaller." : "Image must be 5 MB or smaller.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const parsed = baseSchema.safeParse({ title, body });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter valid post details.");
      return;
    }

    const trimmedTitle = parsed.data.title.trim();
    const trimmedBody = parsed.data.body.trim();
    const validPollOptions = pollOptions.map((option) => option.trim()).filter(Boolean);

    if ((postType === "image" || postType === "video") && !selectedFile) {
      setError(`Choose a ${postType} file before publishing.`);
      return;
    }

    if (postType === "poll") {
      if (!trimmedTitle) {
        setError("Poll posts require a question.");
        return;
      }

      if (validPollOptions.length < 2) {
        setError("Poll posts require at least two options.");
        return;
      }
    }

    if (postType === "text" && !trimmedBody) {
      setError("Text posts require content.");
      return;
    }

    setSubmitting(true);
    let mediaUrl: string | null = null;

    if (selectedFile) {
      const uploadResult = await uploadPostMedia(userId, selectedFile);
      if (uploadResult.error || !uploadResult.data) {
        setSubmitting(false);
        setError(uploadResult.error ?? "Media upload failed.");
        return;
      }

      mediaUrl = uploadResult.data;
    }

    const result = await createFeedPost(userId, {
      postType,
      title: trimmedTitle || null,
      body: trimmedBody || null,
      mediaUrl,
      isPublished: true,
      pollOptions: postType === "poll" ? validPollOptions : []
    });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    resetComposer();
    setMessage("Post published to the feed.");
    await onPublished();
  };

  return (
    <section className={`editor-panel ${variant === "feed" ? "editor-panel--feed" : ""}`}>
      <div className="editor-panel__header">
        <div>
          <span className="section-heading__eyebrow">
            {variant === "feed" ? "Create Post" : "Publish Content"}
          </span>
          <h2>{variant === "feed" ? "Post from your feed" : "Create for the feed"}</h2>
          <p>
            {variant === "feed"
              ? "Use the same surface your audience sees, similar to Facebook and Instagram creator flows."
              : "Publish images, videos, polls, or formatted text from the same creator workflow."}
          </p>
        </div>
        {variant === "feed" ? (
          <button
            className="solid-button"
            onClick={() => setExpanded((current) => !current)}
            type="button"
          >
            {isExpanded ? "Close" : "Start Post"}
          </button>
        ) : null}
      </div>

      {variant === "feed" && !isExpanded ? (
        <div className="feed-composer-trigger">
          <button
            className="feed-composer-trigger__button"
            onClick={() => setExpanded(true)}
            type="button"
          >
            Share an update, upload media, or ask your audience something.
          </button>
          <div className="feed-composer-trigger__actions">
            {postOptions.map((option) => (
              <button
                className="ghost-button"
                key={option.value}
                onClick={() => {
                  setPostType(option.value);
                  setExpanded(true);
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {variant === "feed" && !isExpanded ? null : (
      <form className="dashboard-form" onSubmit={handleSubmit}>
        {error ? <div className="auth-message auth-message--error">{error}</div> : null}
        {message ? <div className="auth-message auth-message--info">{message}</div> : null}

        <div className="composer-type-grid">
          {postOptions.map((option) => (
            <button
              className={`composer-type ${postType === option.value ? "composer-type--active" : ""}`}
              key={option.value}
              onClick={() => {
                setPostType(option.value);
                setError(null);
                setMessage(null);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        {postType === "poll" ? (
          <label className="dashboard-form__full">
            Poll Question
            <input
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What do you want your audience to choose?"
              type="text"
              value={title}
            />
          </label>
        ) : null}

        {postType === "image" || postType === "video" ? (
          <label className="dashboard-form__full">
            {postType === "video" ? "Video" : "Image"}
            <div className="media-uploader">
              {previewUrl ? (
                postType === "video" ? (
                  <video className="media-uploader__preview" controls src={previewUrl} />
                ) : (
                  <img alt="Selected post preview" className="media-uploader__preview" src={previewUrl} />
                )
              ) : (
                <div className="media-uploader__empty">
                  Select a {postType === "video" ? "video" : "image"} to publish
                </div>
              )}
              <label className="ghost-button avatar-panel__action">
                Choose {postType === "video" ? "Video" : "Image"}
                <input accept={mediaAccept} onChange={handleFileChange} type="file" />
              </label>
            </div>
          </label>
        ) : null}

        {postType === "poll" ? (
          <div className="dashboard-form__full poll-editor">
            <span>Poll Options</span>
            {pollOptions.map((option, index) => (
              <input
                key={`${index}-${postType}`}
                onChange={(event) =>
                  setPollOptions((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? event.target.value : entry
                    )
                  )
                }
                placeholder={`Option ${index + 1}`}
                type="text"
                value={option}
              />
            ))}
            {pollOptions.length < 4 ? (
              <button
                className="ghost-button"
                onClick={() => setPollOptions((current) => [...current, ""])}
                type="button"
              >
                Add Option
              </button>
            ) : null}
          </div>
        ) : null}

        {postType === "text" || postType === "poll" ? (
          <label className="dashboard-form__full">
            {postType === "text" ? "Formatted Text" : "Context / Description"}
            <textarea
              onChange={(event) => setBody(event.target.value)}
              placeholder={
                postType === "text"
                  ? "Use **bold**, *italic*, `code`, and - list items."
                  : "Add optional context for the poll."
              }
              rows={postType === "text" ? 8 : 4}
              value={body}
            />
          </label>
        ) : null}

        {postType === "image" || postType === "video" ? (
          <label className="dashboard-form__full">
            Caption
            <textarea
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write a caption for the media post."
              rows={4}
              value={body}
            />
          </label>
        ) : null}

        {postType === "text" && body.trim().length > 0 ? (
          <div className="dashboard-form__full text-preview">
            <span>Preview</span>
            <div dangerouslySetInnerHTML={{ __html: renderFormattedText(body) }} />
          </div>
        ) : null}

        <button className="solid-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Publishing..." : "Publish Post"}
        </button>
      </form>
      )}
    </section>
  );
};
