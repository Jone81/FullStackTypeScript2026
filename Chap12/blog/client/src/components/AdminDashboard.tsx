import { useEffect, useState } from "react";
import {
  deleteWorkApi,
  getAllTopicsApi,
  getPopularAuthorsApi,
  getPopularWorksApi,
  TopicItem,
  UserProfile,
  WorkItem,
} from "../api/client";

export function AdminDashboard() {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [authors, setAuthors] = useState<UserProfile[]>([]);

  useEffect(() => {
    Promise.all([
      getPopularWorksApi(),
      getAllTopicsApi(),
      getPopularAuthorsApi(),
    ])
      .then(([w, t, a]) => {
        setWorks(w || []);
        setTopics(t || []);
        setAuthors(a || []);
      })
      .catch(console.error);
  }, []);

  const handleAdminDeleteWork = async (id: string) => {
    setWorks((prev) => prev.filter((w) => w.id !== id));
    try {
      await deleteWorkApi(id);
    } catch (err) {
      console.error("Failed to delete work:", err);
    }
  };

  return (
    <div className="page-container">
      <div className="feed-header-banner">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="feed-subtitle">
            Protected by <code>AdminRoute</code>. Manage all posts, topics, and
            users across the platform.
          </p>
        </div>
      </div>

      <div className="stats-cards-row">
        <div className="stat-card">
          <span className="stat-value">{works.length}</span>
          <span className="stat-label">Total Posts</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{topics.length}</span>
          <span className="stat-label">Active Topics</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{authors.length}</span>
          <span className="stat-label">Registered Authors</span>
        </div>
      </div>

      <section className="form-card" style={{ marginTop: "1.5rem" }}>
        <h2>All Platform Posts (Moderation)</h2>
        <div className="authors-list">
          {works.map((w) => (
            <div key={w.id} className="author-list-card">
              <div>
                <strong>{w.title}</strong>
                <div className="post-author-handle">
                  by {w.fullName} (@{w.userName}) •{" "}
                  {new Date(w.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleAdminDeleteWork(w.id)}
              >
                Delete Post
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
