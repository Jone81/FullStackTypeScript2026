import { useState, use } from "react";
import { NotificationType } from "./modals/Notification";
import { ProfileForm } from "./ProfileForm";
import Notification from "./modals/Notification";
import { useUserProfile } from "../redux/profile/ProfileHooks";
import { UiApiContext } from "../context/ui-api/UiApiContext";
import { PrimaryButton } from "./Buttons";

export const SMALL_NOTIFICATION_HEIGHT = "320px";
export const LARGE_NOTIFICATION_HEIGHT = "640px";

interface ConnectCreateProfileProps {
  notificationState: boolean;
  toggleNotificationState: () => void;
}

export function ConnectCreateProfile({
  notificationState,
  toggleNotificationState,
}: ConnectCreateProfileProps) {
  const [, setProfile] = useUserProfile();
  const [authMode, setAuthMode] = useState<"signin" | "create">("signin");
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const api = use(UiApiContext);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInUsername || !signInPassword) {
      setSignInError("Please enter both username and password");
      return;
    }

    setSignInError("");
    setIsSigningIn(true);
    try {
      const res = await fetch("http://localhost:4001/profile/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userName: signInUsername,
          password: signInPassword,
        }),
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();
      const userProfile = await api?.uiApi.getProfile(data.userId);
      if (userProfile) {
        setProfile({
          id: userProfile.id,
          updatedAt: userProfile.updatedAt,
          userName: userProfile.userName,
          fullName: userProfile.fullName,
          description: userProfile.description,
          socialLinkPrimary: userProfile.socialLinkPrimary || "",
          socialLinkSecond: userProfile.socialLinkSecond || "",
        });
        toggleNotificationState();
      } else {
        throw new Error("Could not load user profile");
      }
    } catch (err: any) {
      setSignInError(err.message || "Failed to sign in");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Notification
      title={authMode === "signin" ? "Sign In" : "Create Profile"}
      notiType={NotificationType.Info}
      isOpen={notificationState}
      toggleIsOpen={toggleNotificationState}
      width="30%"
      height={authMode === "signin" ? SMALL_NOTIFICATION_HEIGHT : LARGE_NOTIFICATION_HEIGHT}
    >
      <div className="push-away" style={{ padding: "0.5em 1em" }}>
        {authMode === "signin" ? (
          <form onSubmit={handleSignIn} className="profile-form-container">
            <section className="profile-form-section">
              <label htmlFor="signin-username">Username</label>
              <input
                id="signin-username"
                type="text"
                className="profile-form-item"
                value={signInUsername}
                onChange={(e) => setSignInUsername(e.target.value)}
                placeholder="e.g. jouni123"
              />
            </section>
            <section className="profile-form-section">
              <label htmlFor="signin-password">Password</label>
              <input
                id="signin-password"
                type="password"
                className="profile-form-item"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                placeholder="Your password"
              />
            </section>

            {signInError ? (
              <div style={{ color: "var(--warning-cl)", margin: "0.5em 0", fontSize: "0.9em" }}>
                {signInError}
              </div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1em" }}>
              <PrimaryButton
                label={isSigningIn ? "Signing in..." : "Sign In"}
                isDisabled={isSigningIn}
              />
              <button
                type="button"
                onClick={() => setAuthMode("create")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--primary-cl)",
                  cursor: "pointer",
                  fontSize: "0.85em",
                  textDecoration: "underline",
                }}
              >
                Create new profile
              </button>
            </div>
          </form>
        ) : (
          <div>
            <ProfileForm profileCreatedCallback={toggleNotificationState} />
            <div style={{ textAlign: "center", marginTop: "0.5em" }}>
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--primary-cl)",
                  cursor: "pointer",
                  fontSize: "0.85em",
                  textDecoration: "underline",
                }}
              >
                Already have a profile? Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </Notification>
  );
}
