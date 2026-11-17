import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createWorkResponseApi,
  deleteWorkApi,
  getAllTopicsApi,
  getLatestWorksByAuthorApi,
  getPopularWorksApi,
  getWorkResponsesApi,
  getWorksByTopicApi,
  getWorksOfFollowedApi,
  likeWorkApi,
  searchWorksApi,
  TopicItem,
  WorkItem,
  WorkResponseItem,
} from "../api/client";
import { useAppSelector } from "../store/store";

type FeedMode = "all" | "followed" | "mine";

export function PostsList() {
  const { user } = useAppSelector((state) => state.auth);
  const [posts, setPosts] = useState<WorkItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [feedMode, setFeedMode] = useState<FeedMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Expanded post states (full content & comments)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [responsesByWork, setResponsesByWork] = useState<
    Record<string, WorkResponseItem[]>
  >({});
  const [newCommentByWork, setNewCommentByWork] = useState<
    Record<string, string>
  >({});
  const [commentSubmitting, setCommentSubmitting] = useState<string | null>(
    null
  );

  useEffect(() => {
    getAllTopicsApi()
      .then((data) => setTopics(data || []))
      .catch((err) => console.error("Failed to fetch topics:", err));
  }, []);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      let data: WorkItem[] = [];
      if (searchQuery.trim().length >= 2) {
        data = await searchWorksApi(searchQuery.trim());
      } else if (selectedTopicId) {
        data = await getWorksByTopicApi(selectedTopicId);
      } else if (feedMode === "followed" && user) {
        data = await getWorksOfFollowedApi(user.id);
      } else if (feedMode === "mine" && user) {
        data = await getLatestWorksByAuthorApi(user.id);
      } else {
        data = await getPopularWorksApi();
      }
      setPosts(data || []);
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || "Failed to load posts",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedTopicId, feedMode, user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ==========================================================================
  // Optimistic Post Deletion (Chapter 12)
  // ==========================================================================
  const handleOptimisticDelete = async (postToDelete: WorkItem) => {
    const previousPosts = [...posts];
    // 1. Optimistically remove from UI immediately
    setPosts((current) => current.filter((p) => p.id !== postToDelete.id));
    setFeedbackMsg({
      type: "success",
      text: `Post "${postToDelete.title}" removed (optimistic update).`,
    });

    try {
      await deleteWorkApi(postToDelete.id);
    } catch (err: any) {
      // 2. Rollback on failure
      setPosts(previousPosts);
      setFeedbackMsg({
        type: "error",
        text: `Failed to delete "${postToDelete.title}". Post restored. (${
          err?.message || "Server error"
        })`,
      });
    }
  };

  // ==========================================================================
  // Optimistic Like (Chapter 12)
  // ==========================================================================
  const handleLikePost = async (workId: string) => {
    if (!user) return;
    const previousPosts = [...posts];

    setPosts((current) =>
      current.map((p) =>
        p.id === workId
          ? {
              ...p,
              workLikes: [
                ...(p.workLikes || []),
                { id: `temp-${Date.now()}` },
              ],
            }
          : p
      )
    );

    try {
      await likeWorkApi(workId, user.id);
    } catch {
      setPosts(previousPosts);
    }
  };

  // ==========================================================================
  // Responses / Comments
  // ==========================================================================
  const toggleExpandPost = async (workId: string) => {
    if (expandedPostId === workId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(workId);
    try {
      const resps = await getWorkResponsesApi(workId);
      setResponsesByWork((prev) => ({ ...prev, [workId]: resps || [] }));
    } catch (err) {
      console.error("Failed to load responses:", err);
    }
  };

  const handleAddComment = async (e: FormEvent, workId: string) => {
    e.preventDefault();
    if (!user) return;
    const text = (newCommentByWork[workId] || "").trim();
    if (text.length < 3) {
      setFeedbackMsg({
        type: "error",
        text: "Response must be at least 3 characters.",
      });
      return;
    }

    setCommentSubmitting(workId);
    try {
      await createWorkResponseApi(workId, user.id, text);
      setNewCommentByWork((prev) => ({ ...prev, [workId]: "" }));
      const updated = await getWorkResponsesApi(workId);
      setResponsesByWork((prev) => ({ ...prev, [workId]: updated || [] }));
      setFeedbackMsg({
        type: "success",
        text: "Response added successfully!",
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || "Failed to add response",
      });
    } finally {
      setCommentSubmitting(null);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSelectedTopicId("");
    loadPosts();
  };

  return (
    <div className="page-container">
      {/* Top Action Header */}
      <div className="feed-header-banner">
        <div>
          <h1>Posts &amp; Articles</h1>
          <p className="feed-subtitle">
            Welcome back, <strong>{user?.fullName}</strong>! Explore articles,
            filter by topic, or publish a new post.
          </p>
        </div>
        <Link to="/create" className="btn btn-primary">
          + Write New Post
        </Link>
      </div>

      {feedbackMsg && (
        <div
          className={`alert ${
            feedbackMsg.type === "error" ? "alert-error" : "alert-success"
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setFeedbackMsg(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Search & Feed Tabs Bar */}
      <div className="controls-bar">
        <div className="feed-tabs">
          <button
            type="button"
            className={`feed-tab ${
              feedMode === "all" && !selectedTopicId ? "active" : ""
            }`}
            onClick={() => {
              setFeedMode("all");
              setSelectedTopicId("");
              setSearchQuery("");
            }}
          >
            All / Popular Posts
          </button>
          <button
            type="button"
            className={`feed-tab ${
              feedMode === "followed" && !selectedTopicId ? "active" : ""
            }`}
            onClick={() => {
              setFeedMode("followed");
              setSelectedTopicId("");
              setSearchQuery("");
            }}
          >
            Followed Authors
          </button>
          <button
            type="button"
            className={`feed-tab ${
              feedMode === "mine" && !selectedTopicId ? "active" : ""
            }`}
            onClick={() => {
              setFeedMode("mine");
              setSelectedTopicId("");
              setSearchQuery("");
            }}
          >
            My Posts
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="search-bar-form">
          <input
            type="search"
            className="form-input search-input"
            placeholder="Search posts by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Topic Filter Pills */}
      <div className="topics-bar">
        <button
          type="button"
          className={`topic-pill ${selectedTopicId === "" ? "active" : ""}`}
          onClick={() => setSelectedTopicId("")}
        >
          All Topics
        </button>
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className={`topic-pill ${
              selectedTopicId === topic.id ? "active" : ""
            }`}
            onClick={() => {
              setSelectedTopicId(topic.id);
              setSearchQuery("");
            }}
          >
            {topic.name}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="loading-screen">
          <div className="spinner-circle" />
          <p>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state-card">
          <h3>No posts found</h3>
          <p>
            There are no posts matching your current filter. Try selecting
            another topic or create a new post!
          </p>
          <Link to="/create" className="btn btn-primary">
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            const isOwnerOrAdmin =
              user?.id === post.authorId || user?.role === "admin";
            const likeCount = post.workLikes?.length || 0;
            const responses = responsesByWork[post.id] || [];

            return (
              <article key={post.id} className="post-card">
                <div className="post-card-top">
                  <div className="post-author-row">
                    <span className="author-avatar-sm">
                      {(post.fullName || post.userName || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <div>
                      <span className="post-author-name">{post.fullName}</span>{" "}
                      <span className="post-author-handle">
                        @{post.userName}
                      </span>
                    </div>
                    <span className="post-date">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {post.workTopics && post.workTopics.length > 0 && (
                    <div className="post-topics-row">
                      {post.workTopics.map((wt: any, idx: number) => {
                        const topicName = wt.name || wt.topic?.name;
                        const topicId = wt.id || wt.topic?.id || idx;
                        return topicName ? (
                          <span key={topicId} className="topic-badge">
                            {topicName}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <h2
                  className="post-card-title"
                  onClick={() => toggleExpandPost(post.id)}
                >
                  {post.title}
                </h2>
                <p className="post-card-desc">{post.description}</p>

                {isExpanded ? (
                  <div className="post-full-content">
                    <pre className="post-markdown-text">{post.content}</pre>
                  </div>
                ) : (
                  <p className="post-preview-text">
                    {post.content.length > 220
                      ? `${post.content.slice(0, 220)}...`
                      : post.content}
                  </p>
                )}

                <div className="post-card-actions">
                  <div className="post-actions-left">
                    <button
                      type="button"
                      className="btn btn-action"
                      onClick={() => handleLikePost(post.id)}
                    >
                      ♥ Like ({likeCount})
                    </button>
                    <button
                      type="button"
                      className="btn btn-action"
                      onClick={() => toggleExpandPost(post.id)}
                    >
                      {isExpanded
                        ? "Hide Details & Comments"
                        : "Read Full Post & Comments"}
                    </button>
                  </div>

                  <div className="post-actions-right">
                    {user?.id === post.authorId && (
                      <Link
                        to={`/edit/${post.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        Edit
                      </Link>
                    )}
                    {isOwnerOrAdmin && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleOptimisticDelete(post)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Responses / Comments Section */}
                {isExpanded && (
                  <div className="comments-section">
                    <h4>Responses ({responses.length})</h4>
                    {responses.length === 0 ? (
                      <p className="no-comments">
                        No responses yet. Be the first to share your thoughts!
                      </p>
                    ) : (
                      <ul className="comments-list">
                        {responses.map((r) => (
                          <li key={r.id} className="comment-item">
                            <div className="comment-meta">
                              <strong>{r.responder.fullName}</strong>{" "}
                              <span>@{r.responder.userName}</span> •{" "}
                              <span>
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="comment-body">{r.response}</p>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form
                      onSubmit={(e) => handleAddComment(e, post.id)}
                      className="comment-form"
                    >
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Write a response..."
                        value={newCommentByWork[post.id] || ""}
                        onChange={(e) =>
                          setNewCommentByWork((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={commentSubmitting === post.id}
                      >
                        {commentSubmitting === post.id ? "Sending..." : "Reply"}
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
