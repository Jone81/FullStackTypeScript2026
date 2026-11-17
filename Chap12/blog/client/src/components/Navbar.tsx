import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setUserProfileSlice } from "../common/redux/profile/ProfileSlice";

export function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(setUserProfileSlice(null));
    navigate("/login");
  };

  return (
    <header className="ch12-navbar">
      <div className="ch12-navbar-inner">
        <Link to={isAuthenticated ? "/" : "/login"} className="ch12-brand">
          <span className="ch12-brand-badge">FS</span>
          <span>Full-Stack Blog</span>
        </Link>

        {isAuthenticated && user ? (
          <>
            <nav className="ch12-nav-links">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `ch12-nav-link ${isActive ? "active" : ""}`
                }
              >
                Posts
              </NavLink>
              <NavLink
                to="/create"
                className={({ isActive }) =>
                  `ch12-nav-link ${isActive ? "active" : ""}`
                }
              >
                + Create Post
              </NavLink>
              <NavLink
                to="/authors"
                className={({ isActive }) =>
                  `ch12-nav-link ${isActive ? "active" : ""}`
                }
              >
                Authors & Topics
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `ch12-nav-link ${isActive ? "active" : ""}`
                }
              >
                My Profile
              </NavLink>
              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `ch12-nav-link ch12-admin-link ${isActive ? "active" : ""}`
                  }
                >
                  Admin
                </NavLink>
              )}
            </nav>

            <div className="ch12-user-area">
              <div className="ch12-user-pill">
                <span className="ch12-user-avatar">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                <div className="ch12-user-meta">
                  <span className="ch12-user-name">{user.fullName}</span>
                  <span className="ch12-user-handle">
                    @{user.userName} ({user.role || "user"})
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <nav className="ch12-nav-links">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `ch12-nav-link ${isActive ? "active" : ""}`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `ch12-nav-link ${isActive ? "active" : ""}`
              }
            >
              Register
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
