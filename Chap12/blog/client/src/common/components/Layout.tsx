import { ReactNode } from "react";
import profileIcon from "../../theme/assets/profiles/mrglasses.jpg"; // todo: replace with user avatar when ready
import { NavAnchor } from "./NavAnchor";
import { ConnectCreateProfile } from "./ConnectCreateProfile";
import { useNotification } from "../redux/notification/NotificationHooks";
import { Link } from "react-router-dom";
import { useUserProfile } from "../redux/profile/ProfileHooks";

export interface LayoutProps {
  children: ReactNode;
}

/** todo: add button for editable modal **/
export function Layout({ children }: LayoutProps) {
  const [profile] = useUserProfile();
  const [notificationIsOpen, setNotificationIsOpen] = useNotification();

  const toggleNotificationState = () => {
    setNotificationIsOpen(!notificationIsOpen);
  };

  return (
    <div className="layout-container">
      <nav className="layout-nav">
        <a href="/" className="layout-title">
          My Blog
        </a>
        <span className="layout-links">
          <NavAnchor path="/write/new" label="WRITE" />
          <NavAnchor path="/read/followed" label="READ" />
          <NavAnchor path="/explorer" label="EXPLORE" />
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.75em" }}>
          {profile ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
              <Link to={`/profile/${profile.id}`} title={`Logged in as @${profile.userName}`}>
                <img src={profileIcon} className="profile-avatar" alt="Profile avatar" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  fetch("http://localhost:4001/profile/logout", {
                    method: "POST",
                    credentials: "include",
                  }).finally(() => {
                    localStorage.removeItem("profile");
                    window.location.href = "/";
                  });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--tertiary-cl)",
                  fontSize: "0.75em",
                  cursor: "pointer",
                  padding: "0.2em 0.5em",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="action-btn"
                onClick={toggleNotificationState}
                style={{
                  cursor: "pointer",
                  padding: "0.4em 1.1em",
                  borderRadius: "20px",
                  border: "1px solid var(--primary-cl)",
                  background: "transparent",
                  color: "var(--primary-cl)",
                  fontWeight: 600,
                  fontSize: "0.85em",
                }}
              >
                Sign In
              </button>
              <ConnectCreateProfile
                notificationState={notificationIsOpen}
                toggleNotificationState={toggleNotificationState}
              />
            </>
          )}
        </span>
      </nav>
      {children}
    </div>
  );
}
