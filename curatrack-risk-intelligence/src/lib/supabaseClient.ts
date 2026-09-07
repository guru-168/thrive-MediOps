import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Read from Vite env vars only - never hardcode credentials here. These
// come from the project's .env (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY),
// which is gitignored and never committed. Only the public anon/publishable
// key belongs here; the secret/service_role key must never be used in
// frontend code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Set when either env var is missing (or misnamed), so AuthContext and the
 * auth pages can show a clear, visible message instead of the whole app
 * silently failing to render. Deliberately NOT a thrown error at module
 * scope: this file is imported transitively from main.tsx before React
 * ever mounts, so throwing here blanks the entire app to a white screen
 * with nothing but a console stack trace - the worst possible place for a
 * configuration problem to surface.
 */
export const supabaseConfigError: string | null =
  !supabaseUrl || !supabaseKey
    ? "Supabase isn't configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY " +
      "in your .env file (see .env.example), then restart the dev server."
    : null;

/** Shared Supabase client, used for authentication (email/password) throughout the app. Null when misconfigured - see supabaseConfigError. */
export const supabase: SupabaseClient | null = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseKey);
