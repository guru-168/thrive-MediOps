import { useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { Outlet, useLocation } from "react-router-dom";
import { SideNav } from "./SideNav";
import { TopAppBar } from "./TopAppBar";
import { routeMeta } from "../../router/routes";
import { mockNotifications } from "../../data/mockNotifications";
import type { ClinicalAlert } from "../../types/notification";

export type Theme = "light" | "dark";

/** Shape handed to routed pages via `useOutletContext<DashboardOutletContext>()`. */
export interface DashboardOutletContext {
  searchQuery: string;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

/**
 * Page frame shared by every route: fixed 240px sidebar, sticky top bar,
 * and a content column capped at 1200px - matching the offset/max-width
 * structure in code.html's <body>.
 *
 * Rendered once as a react-router layout route (see App.tsx) rather than
 * per-route, so sidebar/top-bar state - the search query, notification
 * read state - persists across navigation instead of resetting on every
 * page change.
 */
export function AppShell() {
  const location = useLocation();
  const title = routeMeta.find((r) => r.path === location.pathname)?.title ?? "MediOps Premium";

  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<ClinicalAlert[]>(mockNotifications);
  // Lifted here (rather than local to SettingsPage) because it must keep
  // applying while navigating to other routes - SettingsPage unmounts on
  // navigation like any routed page, but this wrapper div (the ancestor
  // every dark: Tailwind variant in the app resolves against) does not.
  const [theme, setTheme] = useState<Theme>("light");

  function markNotificationRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllNotificationsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div
      className={clsx(
        "bg-background text-on-background font-body-md antialiased min-h-screen flex",
        theme === "dark" && "dark",
      )}
    >
      <SideNav />
      {/*
        min-w-0: without it, this flex item's automatic minimum width equals its
        content's min-content size. That size bubbles up from the top app bar's
        search input (browsers give <input> an intrinsic ~170px floor), which was
        forcing this whole column - and the page - wider than the viewport below
        ~640px instead of letting the search field itself shrink. See matching
        min-w-0 on the nested flex wrappers in TopAppBar/SearchInput.
      */}
      <div className="ml-[240px] flex-1 flex flex-col min-h-screen min-w-0 max-w-[1200px] mx-auto">
        <TopAppBar
          title={title}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          notifications={notifications}
          onMarkNotificationRead={markNotificationRead}
          onMarkAllNotificationsRead={markAllNotificationsRead}
        />
        <main className="flex-1 p-container-margin flex flex-col gap-stack-lg">
          <RouteFade>
            <Outlet
              context={{ searchQuery, theme, onThemeChange: setTheme } satisfies DashboardOutletContext}
            />
          </RouteFade>
        </main>
      </div>
    </div>
  );
}

/**
 * Subtle, dependency-free fade + slide-up on route content change - a
 * functional cue that navigation happened, not a decorative flourish.
 * Keying on pathname forces the wrapper (and everything below it) to
 * remount per route; the CSS animation plays automatically on mount, so
 * there's no React state/effect timing to get wrong.
 */
function RouteFade({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="flex flex-col gap-stack-lg animate-fade-in-up">
      {children}
    </div>
  );
}
