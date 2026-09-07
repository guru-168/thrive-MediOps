import clsx from "clsx";
import type { UserProfile } from "../../types/profile";
import { displayNameFor, initialsFor } from "../../types/profile";

const sizeClasses = {
  sm: "w-9 h-9 text-label-md font-label-md",
  md: "w-10 h-10 text-label-md font-label-md",
  lg: "w-20 h-20 text-headline-sm font-headline-sm",
} as const;

export interface AvatarProps {
  profile: UserProfile;
  size?: keyof typeof sizeClasses;
  className?: string;
}

/**
 * The account's avatar, shown everywhere the signed-in user appears (top
 * bar, account menu, profile page). Renders the stored avatar image when
 * one exists and falls back to the user's initials - never a stock
 * silhouette or placeholder person. Decorative by default: the accessible
 * name for the control it sits in is provided by that control.
 */
export function Avatar({ profile, size = "sm", className }: AvatarProps) {
  const base = clsx(
    "rounded-full border border-outline-variant shrink-0 overflow-hidden",
    "flex items-center justify-center bg-surface-container-high text-on-surface",
    sizeClasses[size],
    className,
  );

  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={`${displayNameFor(profile)} profile photo`}
        className={clsx(base, "object-cover")}
      />
    );
  }

  return (
    <span className={base} aria-hidden="true">
      {initialsFor(profile)}
    </span>
  );
}
