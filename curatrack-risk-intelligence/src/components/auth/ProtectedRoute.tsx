import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Gate for the existing dashboard routes (wraps the AppShell route in
 * App.tsx). Unauthenticated visitors are redirected to /login, preserving
 * where they were headed so a future "redirect back after login" could use
 * it. While the initial session lookup is still in flight, renders nothing
 * rather than redirecting - this is what makes auth persist correctly
 * across a page refresh instead of bouncing straight to /login before
 * Supabase has had a chance to restore the session.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
