import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { SearchInput } from "../ui/SearchInput";
import { NotificationPanel } from "../notifications/NotificationPanel";
import { ProfileMenu } from "../profile/ProfileMenu";
import { useDismiss } from "../../hooks/useDismiss";
import type { ClinicalAlert } from "../../types/notification";

export interface TopAppBarProps {
  title: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  notifications: ClinicalAlert[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

/** Sticky top bar: page title, patient search, notifications, and account. */
export function TopAppBar({
  title,
  searchQuery,
  onSearchQueryChange,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}: TopAppBarProps) {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useDismiss(notificationsOpen, () => setNotificationsOpen(false), notificationsRef);
  useDismiss(profileOpen, () => setProfileOpen(false), profileRef);

  return (
    <header className="bg-surface h-16 w-full sticky top-0 z-40 border-b border-outline-variant flex items-center justify-between gap-stack-md px-container-margin">
      <div className="flex items-center gap-stack-md shrink-0">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-stack-md flex-1 min-w-0 justify-end max-w-md ml-auto">
        <SearchInput
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />

        <div className="flex items-center gap-stack-sm shrink-0">
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              aria-haspopup="menu"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline focus-visible:ring-offset-1 flex items-center justify-center relative"
            >
              <MaterialSymbol name="notifications" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error text-[10px] leading-4 font-bold text-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <NotificationPanel
                notifications={notifications}
                onMarkRead={onMarkNotificationRead}
                onMarkAllRead={onMarkAllNotificationsRead}
              />
            )}
          </div>
          <div ref={profileRef} className="relative">
            <button
              type="button"
              aria-label="Account menu"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              onClick={() => setProfileOpen((open) => !open)}
              className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline focus-visible:ring-offset-1 flex items-center justify-center"
            >
              <MaterialSymbol name="account_circle" />
            </button>
            {profileOpen && (
              <ProfileMenu
                onNavigateToSettings={() => navigate("/settings")}
                onClose={() => setProfileOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
