import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearError, loginUser } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setUserProfileSlice } from "../common/redux/profile/ProfileSlice";

export function LoginForm() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [localValidationMsg, setLocalValidationMsg] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalValidationMsg("");

    if (!userName.trim()) {
      setLocalValidationMsg("Username is required");
      return;
    }
    if (!password) {
      setLocalValidationMsg("Password is required");
      return;
    }

    const resultAction = await dispatch(
      loginUser({ userName: userName.trim(), password })
    );
    if (loginUser.fulfilled.match(resultAction)) {
      const u = resultAction.payload.user;
      dispatch(
        setUserProfileSlice({
          id: u.id,
          updatedAt: u.updatedAt,
          userName: u.userName,
          fullName: u.fullName,
          description: u.description || "",
          socialLinkPrimary: u.socialLinkPrimary || "",
          socialLinkSecond: u.socialLinkSecondary || "",
        })
      );
      navigate(from, { replace: true });
    }
  };

  const handleQuickFill = (demoUser: string, demoPass: string) => {
    setUserName(demoUser);
    setPassword(demoPass);
    setLocalValidationMsg("");
    dispatch(clearError());
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-logo-circle">FS</div>
          <h1>Sign In to Full-Stack Blog</h1>
          <p className="auth-subtitle">
            Enter your credentials to access posts, create content, and manage
            your profile.
          </p>
        </div>

        {(localValidationMsg || error) && (
          <div className="alert alert-error" role="alert">
            {localValidationMsg || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="Enter your username (e.g. jouni123)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="demo-accounts-box">
          <span className="demo-accounts-title">
            Quick Fill Demo Accounts (Password: <code>salasana1234</code>):
          </span>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="btn btn-demo"
              onClick={() => handleQuickFill("jouni123", "salasana1234")}
            >
              jouni123 (Admin)
            </button>
            <button
              type="button"
              className="btn btn-demo"
              onClick={() => handleQuickFill("matti123", "salasana1234")}
            >
              matti123 (User)
            </button>
            <button
              type="button"
              className="btn btn-demo"
              onClick={() => handleQuickFill("anna_dev", "salasana1234")}
            >
              anna_dev (User)
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <span>Don&apos;t have an account yet?</span>{" "}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
