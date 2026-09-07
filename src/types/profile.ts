import type { User } from "@supabase/supabase-js";

/**
 * The app's normalized view of the signed-in account, derived entirely
 * from the Supabase auth user - there is no separate profiles table (see
 * AuthContext for why). Every screen that shows "who am I" reads this
 * shape via `useAuth().profile` rather than reaching into
 * `user.user_metadata` itself, so the top bar, the account menu and the
 * profile page can never disagree about the current user.
 */
export interface UserProfile {
  id: string;
  /** Always present for email/password accounts; the authentication identity. */
  email: string;
  /** null until the user sets one (at sign-up or on the profile page). */
  fullName: string | null;
  role: string | null;
  department: string | null;
  avatarUrl: string | null;
  /** auth.users.created_at, shown as "Member since". */
  createdAt: string | null;
}

/** Editable subset of the profile, as submitted by the profile form. */
export interface ProfileUpdate {
  fullName: string;
  role: string;
  department: string;
}

/** Metadata values arrive as unknown JSON: keep only non-blank strings, trimmed. */
function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

/**
 * Maps a Supabase auth user onto UserProfile. `full_name` is the field
 * this app writes; `name` is also read because that's the key some
 * Supabase OAuth providers populate, so an account created another way
 * still shows a real name instead of falling back to its email.
 */
export function profileFromUser(user: User): UserProfile {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: optionalString(meta.full_name) ?? optionalString(meta.name),
    role: optionalString(meta.role),
    department: optionalString(meta.department),
    avatarUrl: optionalString(meta.avatar_url),
    createdAt: user.created_at ?? null,
  };
}

/** Name to show in the UI - the real name when set, otherwise the account's email. Never a placeholder person. */
export function displayNameFor(profile: UserProfile): string {
  return profile.fullName ?? profile.email;
}

/**
 * Up to two initials for the avatar: first letters of the first and last
 * name when a name is set, otherwise the first character of the email.
 */
export function initialsFor(profile: UserProfile): string {
  if (profile.fullName) {
    const parts = profile.fullName.split(/\s+/).filter(Boolean);
    const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
    return letters.map((part) => part.charAt(0).toUpperCase()).join("");
  }
  return (profile.email.charAt(0) || "?").toUpperCase();
}
