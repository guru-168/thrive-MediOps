import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import type { AlertSeverity, ClinicalAlert } from "../../types/notification";

export interface NotificationPanelProps {
  notifications: ClinicalAlert[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const SEVERITY_ICON: Record<AlertSeverity, string> = {
  critical: "warning",
  elevated: "priority_high",
  info: "info",
};

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  critical: "bg-error",
  elevated: "bg-on-surface-variant",
  info: "bg-outline",
};

/**
 * Popover anchored under the notification bell. Level-2 surface per
 * DESIGN.md's elevation model (crisp white surface, light ambient
 * shadow) - distinct from the Level-1 cards used elsewhere on the page.
 */
export function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      role="menu"
      aria-label="Notifications"
      className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-surface-container-lowest border border-outline-variant rounded shadow-lg z-50 flex flex-col overflow-hidden animate-panel-in"
    >
      <div className="flex items-center justify-between px-stack-md py-stack-sm border-b border-outline-variant">
        <h3 className="font-title-lg text-title-lg text-on-surface">Notifications</h3>
        <button
          type="button"
          disabled={!hasUnread}
          onClick={onMarkAllRead}
          className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40 disabled:hover:text-on-surface-variant disabled:cursor-not-allowed"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto divide-y divide-outline-variant">
        {notifications.length === 0 && (
          <p className="p-stack-md font-body-sm text-body-sm text-on-surface-variant text-center">
            No notifications.
          </p>
        )}
        {notifications.map((alert) => (
          <button
            key={alert.id}
            type="button"
            role="menuitem"
            onClick={() => onMarkRead(alert.id)}
            className={clsx(
              "w-full text-left flex items-start gap-stack-sm px-stack-md py-stack-sm transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:bg-surface-container-low",
              !alert.read && "bg-surface-container-low/60",
            )}
          >
            <span
              className={clsx("mt-1 w-1.5 h-1.5 rounded-full shrink-0", SEVERITY_DOT[alert.severity])}
              aria-hidden="true"
            />
            <MaterialSymbol
              name={SEVERITY_ICON[alert.severity]}
              className={clsx(
                "text-base shrink-0",
                alert.severity === "critical" ? "text-error" : "text-on-surface-variant",
              )}
            />
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-2">
                <span
                  className={clsx(
                    "font-body-sm text-body-sm truncate",
                    alert.read ? "font-normal text-on-surface-variant" : "font-semibold text-on-surface",
                  )}
                >
                  {alert.title}
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap normal-case tracking-normal">
                  {alert.time}
                </span>
              </span>
              <span className="block font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {alert.message}
              </span>
            </span>
            {!alert.read && (
              <span
                className="mt-1.5 w-2 h-2 rounded-full bg-error shrink-0"
                aria-label="Unread"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
