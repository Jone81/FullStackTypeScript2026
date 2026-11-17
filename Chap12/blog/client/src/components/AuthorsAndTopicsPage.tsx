import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  createFollowApi,
  createTopicApi,
  FollowUserItem,
  getAllTopicsApi,
  getFollowedApi,
  getFollowersCountApi,
  getPopularAuthorsApi,
  TopicItem,
  UserProfile,
} from "../api/client";
import { useAppSelector } from "../store/store";

export function AuthorsAndTopicsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [authors, setAuthors] = useState<UserProfile[]>([]);
  const [followedList, setFollowedList] = useState<FollowUserItem[]>([]);
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>(
    {}
  );
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [newTopicName, setNewTopicName] = useState("");
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [popAuthors, allTopics] = await Promise.all([
        getPopularAuthorsApi(),
        getAllTopicsApi(),
      ]);
      setAuthors(popAuthors || []);
      setTopics(allTopics || []);

      if (user) {
        const myFollowed = await getFollowedApi(user.id);
        setFollowedList(myFollowed || []);
      }

      const counts: Record<string, number> = {};
      for (const a of popAuthors || []) {
        try {
          counts[a.id] = await getFollowersCountApi(a.id);
        } catch {
          counts[a.id] = 0;
        }
      }
      setFollowerCounts(counts);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err?.message || "Failed to load authors and topics",
      });
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFollow = async (authorId: string, authorName: string) => {
    if (!user) return;
    try {
      await createFollowApi(authorId, user.id);
      setStatusMsg({
        type: "success",
        text: `You are now following ${authorName}!`,
      });
      await loadData();
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err?.message || "Failed to follow author",
      });
    }
  };

  const handleCreateTopic = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    try {
      await createTopicApi(newTopicName.trim());
      setStatusMsg({
        type: "success",
        text: `Topic "${newTopicName.trim()}" created!`,
      });
      setNewTopicName("");
      await loadData();
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err?.message || "Failed to create topic",
      });
    }
  };

  const isFollowing = (authorId: string) =>
    followedList.some((f) => String(f.id) === String(authorId));

  return (
    <div className="page-container">
      <div className="feed-header-banner">
        <div>
          <h1>Authors &amp; Topics</h1>
          <p className="feed-subtitle">
            Discover popular authors to follow and manage discussion topics.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`alert ${
            statusMsg.type === "error" ? "alert-error" : "alert-success"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setStatusMsg(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="two-col-grid">
        {/* Popular Authors Card */}
        <section className="form-card">
          <h2>Popular Authors</h2>
          <div className="authors-list">
            {authors.map((author) => {
              const isMe = user?.id === String(author.id);
              const alreadyFollowing = isFollowing(String(author.id));
              return (
                <div key={author.id} className="author-list-card">
                  <div className="post-author-row">
                    <span className="author-avatar-sm">
                      {author.fullName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="post-author-name">
                        {author.fullName}{" "}
                        {isMe && <span className="topic-badge">You</span>}
                      </div>
                      <div className="post-author-handle">
                        @{author.userName} •{" "}
                        {followerCounts[author.id] ?? 0} followers
                      </div>
                      {author.description && (
                        <p className="author-bio">{author.description}</p>
                      )}
                    </div>
                  </div>
                  {!isMe && (
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        alreadyFollowing ? "btn-outline" : "btn-primary"
                      }`}
                      disabled={alreadyFollowing}
                      onClick={() =>
                        handleFollow(String(author.id), author.fullName)
                      }
                    >
                      {alreadyFollowing ? "Following ✓" : "+ Follow"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Topics Card */}
        <section className="form-card">
          <h2>Topics ({topics.length})</h2>
          <form onSubmit={handleCreateTopic} className="comment-form">
            <input
              type="text"
              className="form-input"
              placeholder="New topic name..."
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              + Create Topic
            </button>
          </form>

          <div className="topic-selector-grid" style={{ marginTop: "1.25rem" }}>
            {topics.map((t) => (
              <span key={t.id} className="topic-pill active">
                #{t.name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
