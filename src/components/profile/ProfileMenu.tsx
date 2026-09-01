import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";

export interface ProfileMenuProps {
  /** Navigates to the existing Settings route and closes the menu. */
  onNavigateToSettings: () => void;
  onClose: () => void;
}

// Mirrors the signed-in clinician identity shown in the sidebar footer
// (SideNav.tsx), so the account menu reads as the same mock user rather
// than introducing a second, inconsistent one.
const AVATAR_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAXAHL2nqjMlwdEnuE95fnHUvtM6eICW6LGcw0xkBAVB6ZIIIkWrBS4JuPDv_ENe0ro89GHElBWvSc53MitiO0QsbaiBvzVYgcZaAbROFtDPibe4COSGH_jYbVBITt7wKBN8BCwFpQODqvEyNqCFpjVCm-wcYCmtP9wW-_mNK_DDe31xQLhcw0csNxSvFxeV-Q6Sz4ftBG4tWwxgfB-qaTF943YEeCdsYvycQjJLQcp9Kqoi39t2Zec";

/**
 * Popover anchored under the top-bar profile icon. No backend/auth exists
 * in this app, so every item is a frontend-only mock action: "Account
 * Settings" routes to the real (already-built) Settings placeholder page
 * since that's a genuine destination; "My Profile" and "Sign Out" simply
 * close the menu, exactly as they would while awaiting a real account
 * system to wire up to.
 */
export function ProfileMenu({ onNavigateToSettings, onClose }: ProfileMenuProps) {
  return (
    <div
      role="menu"
      aria-label="Account menu"
      className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded shadow-lg z-50 overflow-hidden animate-panel-in"
    >
      <div className="flex items-center gap-stack-sm px-stack-md py-stack-sm border-b border-outline-variant">
        <img
          src={AVATAR_SRC}
          alt=""
          className="w-9 h-9 rounded-full object-cover border border-outline-variant shrink-0"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="font-label-md text-label-md text-on-surface truncate">Dr. A. Smith</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Chief of Risk</span>
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
          onClick={onClose}
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
