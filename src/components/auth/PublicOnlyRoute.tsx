import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Gate for /login and /signup: an already-authenticated user visiting
 * either is sent straight to the dashboard instead of seeing the auth
 * forms again. Renders nothing while the initial session lookup is in
 * flight, matching ProtectedRoute so refresh never flashes the wrong page.
 */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
