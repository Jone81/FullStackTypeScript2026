import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/store";

interface AdminRouteProps {
  children?: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.auth
  );
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-circle" />
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    return (
      <div className="error-card">
        <h2>403 – Access Denied</h2>
        <p>
          You must have administrator privileges to view this section. Current
          role: <strong>{user?.role || "user"}</strong>.
        </p>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
