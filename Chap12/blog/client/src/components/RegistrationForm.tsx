import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearError, registerUser } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setUserProfileSlice } from "../common/redux/profile/ProfileSlice";

export function RegistrationForm() {
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [socialLinkPrimary, setSocialLinkPrimary] = useState("");
  const [socialLinkSecondary, setSocialLinkSecondary] = useState("");
  const [localValidationMsg, setLocalValidationMsg] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateFields = (): boolean => {
    if (userName.trim().length < 2 || userName.trim().length > 50) {
      setLocalValidationMsg("Username must be between 2 and 50 characters");
      return false;
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      setLocalValidationMsg("Full name must be between 2 and 100 characters");
      return false;
    }
    if (password.length < 10 || password.length > 50) {
      setLocalValidationMsg("Password must be between 10 and 50 characters");
      return false;
    }
    if (description.length > 100) {
      setLocalValidationMsg("Description must be 100 characters or fewer");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalValidationMsg("");

    if (!validateFields()) return;

    const resultAction = await dispatch(
      registerUser({
        userName: userName.trim(),
        fullName: fullName.trim(),
        password,
        description: description.trim(),
        socialLinkPrimary: socialLinkPrimary.trim() || undefined,
        socialLinkSecondary: socialLinkSecondary.trim() || undefined,
      })
    );

    if (registerUser.fulfilled.match(resultAction)) {
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
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card auth-card-wide">
        <div className="auth-card-header">
          <div className="auth-logo-circle">FS</div>
          <h1>Create Your Account</h1>
          <p className="auth-subtitle">
            Register a new profile to publish posts, follow authors, and join
            discussions.
          </p>
        </div>

        {(localValidationMsg || error) && (
          <div className="alert alert-error" role="alert">
            {localValidationMsg || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reg-username">Username *</label>
              <input
                id="reg-username"
                type="text"
                className="form-input"
                placeholder="e.g. mikko_dev"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-fullname">Full Name *</label>
              <input
                id="reg-fullname"
                type="text"
                className="form-input"
                placeholder="e.g. Mikko Mallikas"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">
              Password * (minimum 10 characters)
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="At least 10 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-description">Bio / Description</label>
            <input
              id="reg-description"
              type="text"
              className="form-input"
              placeholder="Short bio (max 100 chars)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reg-social-1">Primary Social Link</label>
              <input
                id="reg-social-1"
                type="url"
                className="form-input"
                placeholder="https://github.com/..."
                value={socialLinkPrimary}
                onChange={(e) => setSocialLinkPrimary(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-social-2">Secondary Social Link</label>
              <input
                id="reg-social-2"
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/..."
                value={socialLinkSecondary}
                onChange={(e) => setSocialLinkSecondary(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? "Creating Profile..." : "Register & Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>{" "}
          <Link to="/login" className="auth-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
