import { FormEvent, useEffect, useState } from "react";
import {
  FollowUserItem,
  getFollowedApi,
  getFollowersApi,
  getProfileApi,
  updateProfileApi,
} from "../api/client";
import { updateUserState } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/store";

export function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [description, setDescription] = useState(user?.description || "");
  const [socialLinkPrimary, setSocialLinkPrimary] = useState(
    user?.socialLinkPrimary || ""
  );
  const [socialLinkSecondary, setSocialLinkSecondary] = useState(
    user?.socialLinkSecondary || ""
  );
  const [password, setPassword] = useState("");
  const [followers, setFollowers] = useState<FollowUserItem[]>([]);
  const [following, setFollowing] = useState<FollowUserItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setDescription(user.description || "");
    setSocialLinkPrimary(user.socialLinkPrimary || "");
    setSocialLinkSecondary(user.socialLinkSecondary || "");

    Promise.all([getFollowersApi(user.id), getFollowedApi(user.id)])
      .then(([flwrs, flwng]) => {
        setFollowers(flwrs || []);
        setFollowing(flwng || []);
      })
      .catch((err) => console.error("Failed to load follow stats:", err));
  }, [user]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!password || password.length < 10) {
      setStatusMsg({
        type: "error",
        text: "Please enter your password (min 10 characters) to confirm profile update.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);
    try {
      await updateProfileApi({
        profileId: user.id,
        fullName: fullName.trim(),
        password,
        description: description.trim(),
        socialLinkPrimary: socialLinkPrimary.trim() || undefined,
        socialLinkSecondary: socialLinkSecondary.trim() || undefined,
      });

      const refreshed = await getProfileApi(user.id);
      dispatch(updateUserState(refreshed));
      setPassword("");
      setStatusMsg({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err?.message || "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-container">
      <div className="feed-header-banner">
        <div>
          <h1>My Profile</h1>
          <p className="feed-subtitle">
            Manage your account settings, bio, and social connections.
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
        <section className="form-card">
          <h2>Edit Profile (@{user.userName})</h2>
          <form onSubmit={handleUpdateProfile} className="auth-form">
            <div className="form-group">
              <label htmlFor="prof-fullname">Full Name</label>
              <input
                id="prof-fullname"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prof-desc">Bio / Description</label>
              <input
                id="prof-desc"
                type="text"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prof-soc1">Primary Social Link</label>
              <input
                id="prof-soc1"
                type="url"
                className="form-input"
                value={socialLinkPrimary}
                onChange={(e) => setSocialLinkPrimary(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prof-soc2">Secondary Social Link</label>
              <input
                id="prof-soc2"
                type="url"
                className="form-input"
                value={socialLinkSecondary}
                onChange={(e) => setSocialLinkSecondary(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prof-pass">
                Confirm / New Password * (min 10 chars)
              </label>
              <input
                id="prof-pass"
                type="password"
                className="form-input"
                placeholder="Enter password (e.g. salasana1234)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Profile Changes"}
            </button>
          </form>
        </section>

        <section className="form-card">
          <h2>Network Connections</h2>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3>Following ({following.length})</h3>
            {following.length === 0 ? (
              <p className="no-comments">Not following anyone yet.</p>
            ) : (
              <ul className="comments-list">
                {following.map((f) => (
                  <li key={f.followId} className="comment-item">
                    <strong>{f.fullName}</strong> <span>@{f.userName}</span>
                    {f.description && (
                      <p className="comment-body">{f.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>Followers ({followers.length})</h3>
            {followers.length === 0 ? (
              <p className="no-comments">No followers yet.</p>
            ) : (
              <ul className="comments-list">
                {followers.map((f) => (
                  <li key={f.followId} className="comment-item">
                    <strong>{f.fullName}</strong> <span>@{f.userName}</span>
                    {f.description && (
                      <p className="comment-body">{f.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
