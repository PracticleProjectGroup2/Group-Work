import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthContext";
import type { Role } from "../api/types";

// Wraps routes that need a logged-in user, optionally with a specific role.
// This only hides pages; the API must still check roles on every request.
export function RequireAuth({ role }: { role?: Role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
