
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthContext";
import type { Role } from "../api/types";

export function RequireAuth({ role }: { role?: Role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  const hasRequiredRole =
    !role ||
    user.role === role ||
    user.roles?.includes(role) === true;

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
