import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { Avatar } from "./Avatar";
import { useAuth } from "../../context/AuthContext";
import { displayNameFor } from "../../types/profile";

export interface ProfileMenuProps {
  onClose: () => void;
}

/**
 * Popover anchored under the top-bar avatar. Shows the real
 * Supabase-authenticated account - read from `useAuth().profile`, the same
 * source the profile page and the top-bar avatar use, so the three can
 * never show different people - and routes to My Profile, the existing
 * Settings page, and sign-out.
 */
export function ProfileMenu({ onClose }: ProfileMenuProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  // The menu only mounts from inside the protected shell, so there is
  // always a signed-in account here; bail rather than render an empty
  // header if the session disappears mid-interaction.
  if (!profile) return null;

  const displayName = displayNameFor(profile);
  // Avoid printing the email twice when no name is set and it is already
  // the primary line.
  const secondaryLabel = profile.fullName ? profile.email : "Signed in";

  function go(path: string) {
    onClose();
    navigate(path);
  }

  async function handleSignOut() {
    await signOut();
    onClose();
    navigate("/login", { replace: true });
  }

  return (
    <div
      role="menu"
      aria-label="Account menu"
      className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded shadow-lg z-50 overflow-hidden animate-panel-in"
    >
      <div className="flex items-center gap-stack-sm px-stack-md py-stack-sm border-b border-outline-variant">
        <Avatar profile={profile} size="sm" />
        <div className="flex flex-col overflow-hidden">
          <span className="font-label-md text-label-md text-on-surface truncate">{displayName}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
            {secondaryLabel}
          </span>
        </div>
      </div>

      <div className="py-1">
        <MenuItem icon="person" label="My Profile" onSelect={() => go("/profile")} />
        <MenuItem icon="settings" label="Account Settings" onSelect={() => go("/settings")} />
      </div>

      <div className="py-1 border-t border-outline-variant">
        <MenuItem icon="logout" label="Sign Out" tone="critical" onSelect={handleSignOut} />
      </div>
    </div>
  );
}

/**
 * A single row of the menu. A real <button>, so it is focusable, reachable
 * by Tab, and activated by both Enter and Space with no extra key handling.
 */
function MenuItem({
  icon,
  label,
  tone = "default",
  onSelect,
}: {
  icon: string;
  label: string;
  tone?: "default" | "critical";
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={clsx(
        "w-full flex items-center gap-stack-sm px-stack-md py-2 font-body-sm text-body-sm text-left",
        "cursor-pointer transition-colors focus-visible:outline-none",
        tone === "critical"
          ? "text-error hover:bg-error-container/40 focus-visible:bg-error-container/40"
          : "text-on-surface hover:bg-surface-container-low focus-visible:bg-surface-container-low",
      )}
    >
      <MaterialSymbol
        name={icon}
        className={clsx("text-base", tone === "default" && "text-on-surface-variant")}
      />
      {label}
    </button>
  );
}
