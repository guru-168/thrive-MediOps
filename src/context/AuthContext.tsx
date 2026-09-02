import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigError } from "../lib/supabaseClient";

/** Turns any thrown value (network/CORS failure, unexpected SDK exception) into a displayable message. */
function toMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong. Check your connection and try again.";
}

export interface AuthContextValue {
  /** The signed-in user, or null if signed out. */
  user: User | null;
  session: Session | null;
  /** True until the initial session lookup (on app startup) resolves. */
  loading: boolean;
  /** Message from the most recent failed signIn/signUp/signOut call, if any. */
  error: string | null;
  /** Set when Supabase env vars are missing/misnamed - auth calls are disabled until this is fixed. */
  configError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  /** Clears a previously set error, e.g. when the user edits the form again. */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Supabase email/password auth state, shared app-wide. Loads the existing
 * session once on startup, then stays in sync via Supabase's own
 * onAuthStateChange listener (which also fires after signIn/signUp/signOut),
 * so `user`/`session` are always the single source of truth for whether
 * someone is authenticated - components never call supabase.auth directly.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Misconfigured (missing/misnamed env vars): there's no client to call,
    // so stop "loading" immediately instead of hanging forever, and never
    // call methods on a null `supabase`.
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      error,
      configError: supabaseConfigError,
      clearError: () => setError(null),
      async signIn(email, password) {
        setError(null);
        if (!supabase) return { error: supabaseConfigError };
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          const message = signInError?.message ?? null;
          if (message) setError(message);
          return { error: message };
        } catch (err) {
          const message = toMessage(err);
          setError(message);
          return { error: message };
        }
      },
      async signUp(email, password) {
        setError(null);
        if (!supabase) return { error: supabaseConfigError };
        try {
          const { error: signUpError } = await supabase.auth.signUp({ email, password });
          const message = signUpError?.message ?? null;
          if (message) setError(message);
          return { error: message };
        } catch (err) {
          const message = toMessage(err);
          setError(message);
          return { error: message };
        }
      },
      async signOut() {
        setError(null);
        if (!supabase) return { error: supabaseConfigError };
        try {
          const { error: signOutError } = await supabase.auth.signOut();
          const message = signOutError?.message ?? null;
          if (message) setError(message);
          return { error: message };
        } catch (err) {
          const message = toMessage(err);
          setError(message);
          return { error: message };
        }
      },
    }),
    [session, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
