import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { useAuth } from "../../context/AuthContext";

export interface ProfileMenuProps {
  /** Navigates to the existing Settings route and closes the menu. */
  onNavigateToSettings: () => void;
  onClose: () => void;
}

/**
 * Popover anchored under the top-bar profile icon, showing the real
 * Supabase-authenticated user and a working Sign Out. "Account Settings"
 * routes to the existing Settings page; "My Profile" has no destination
 * yet (there's no profile-detail screen in this app) so it just closes
 * the menu, same as before.
 */
export function ProfileMenu({ onNavigateToSettings, onClose }: ProfileMenuProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.user_metadata?.full_name || user?.email || "Signed in user";
  const secondaryLabel = user?.email && displayName !== user.email ? user.email : "Signed in";
  const initial = (displayName || "?").trim().charAt(0).toUpperCase();

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
        <div className="w-9 h-9 rounded-full border border-outline-variant shrink-0 bg-surface-container-high flex items-center justify-center">
          <span className="font-label-md text-label-md text-on-surface">{initial}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-label-md text-label-md text-on-surface truncate">{displayName}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{secondaryLabel}</span>
        </div>
      </div>

      <div className="py-1">
        <button
          type="button"
          role="menuitem"
          onClick={onClose}
          className="w-full flex items-center gap-stack-sm px-stack-md py-2 font-body-sm text-body-sm text-left text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:bg-surface-container-low"
        >
          <MaterialSymbol name="person" className="text-base text-on-surface-variant" />
          My Profile
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onNavigateToSettings();
            onClose();
          }}
          className="w-full flex items-center gap-stack-sm px-stack-md py-2 font-body-sm text-body-sm text-left text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:bg-surface-container-low"
        >
          <MaterialSymbol name="settings" className="text-base text-on-surface-variant" />
          Account Settings
        </button>
      </div>

      <div className="py-1 border-t border-outline-variant">
        <button
          type="button"
          role="menuitem"
          onClick={handleSignOut}
          className={clsx(
            "w-full flex items-center gap-stack-sm px-stack-md py-2 font-body-sm text-body-sm text-left transition-colors",
            "text-error hover:bg-error-container/40 focus-visible:outline-none focus-visible:bg-error-container/40",
          )}
        >
          <MaterialSymbol name="logout" className="text-base" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
