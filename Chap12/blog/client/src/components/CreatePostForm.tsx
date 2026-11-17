import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createTopicApi,
  createWorkApi,
  getAllTopicsApi,
  getWorkApi,
  TopicItem,
  updateWorkApi,
} from "../api/client";
import { useAppSelector } from "../store/store";

export function CreatePostForm() {
  const { workId } = useParams<{ workId?: string }>();
  const isEditMode = Boolean(workId);

  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [newTopicName, setNewTopicName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getAllTopicsApi()
      .then((list) => setTopics(list || []))
      .catch((err) => console.error("Failed to load topics:", err));
  }, []);

  useEffect(() => {
    if (workId) {
      getWorkApi(workId)
        .then((work: any) => {
          if (!work) return;
          setTitle(work.title || "");
          setDescription(work.description || "");
          setContent(work.content || "");
          if (work.workTopics && Array.isArray(work.workTopics)) {
            const ids = work.workTopics
              .map((wt: any) => String(wt.topic?.id || wt.id || ""))
              .filter(Boolean);
            setSelectedTopicIds(ids);
          }
        })
        .catch((err) => setErrorMsg(err?.message || "Failed to load post"));
    }
  }, [workId]);

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      const createdId = await createTopicApi(newTopicName.trim());
      const updated = await getAllTopicsApi();
      setTopics(updated || []);
      setSelectedTopicIds((prev) => [...prev, String(createdId)]);
      setNewTopicName("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create topic");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      setErrorMsg("You must be signed in to publish a post.");
      return;
    }
    if (!title.trim() || title.trim().length > 100) {
      setErrorMsg("Title is required and must be under 100 characters.");
      return;
    }
    if (!description.trim() || description.trim().length > 400) {
      setErrorMsg("Description is required and must be under 400 characters.");
      return;
    }
    if (content.trim().length < 10) {
      setErrorMsg("Content must be at least 10 characters.");
      return;
    }
    if (selectedTopicIds.length === 0) {
      setErrorMsg("Please select at least one topic.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && workId) {
        await updateWorkApi({
          workId,
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          topicIds: selectedTopicIds,
        });
      } else {
        await createWorkApi({
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          authorId: user.id,
          topicIds: selectedTopicIds,
        });
      }
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <div className="form-card-header">
          <h1>{isEditMode ? "Edit Post" : "Create New Post"}</h1>
          <Link to="/" className="btn btn-outline btn-sm">
            ← Back to Posts
          </Link>
        </div>

        {errorMsg && (
          <div className="alert alert-error" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="post-editor-form">
          <div className="form-group">
            <label htmlFor="post-title">Post Title *</label>
            <input
              id="post-title"
              type="text"
              className="form-input"
              placeholder="Enter a descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-desc">Short Summary / Description *</label>
            <input
              id="post-desc"
              type="text"
              className="form-input"
              placeholder="Brief summary of your post (shown in the feed)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Select Topics *</label>
            <div className="topic-selector-grid">
              {topics.map((topic) => {
                const isSelected = selectedTopicIds.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    className={`topic-pill ${isSelected ? "active" : ""}`}
                    onClick={() => toggleTopicSelection(topic.id)}
                  >
                    {isSelected ? "✓ " : ""}
                    {topic.name}
                  </button>
                );
              })}
            </div>

            <div className="new-topic-inline">
              <input
                type="text"
                className="form-input form-input-sm"
                placeholder="Or add a new topic..."
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAddTopic}
              >
                + Add Topic
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="post-content">
              Post Content (Markdown supported) *
            </label>
            <textarea
              id="post-content"
              className="form-textarea"
              rows={12}
              placeholder="Write your full article content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions-bar">
            <Link to="/" className="btn btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Update Post"
                : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
