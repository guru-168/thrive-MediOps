import clsx from "clsx";
import type { FollowUpStatus } from "../../types/prenatal";

const LABELS: Record<FollowUpStatus, string> = {
  overdue: "Overdue",
  due: "Due Today",
  upcoming: "Upcoming",
  completed: "Completed",
};

export function FollowUpStatusBadge({ status }: { status: FollowUpStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
        status === "overdue" && "bg-error-container text-on-error-container border-error/20",
        status === "due" && "bg-surface-container-high text-on-surface border-outline-variant",
        status === "upcoming" && "text-on-surface-variant border-outline-variant",
        status === "completed" && "text-on-surface-variant border-outline-variant border-dashed",
      )}
    >
      {LABELS[status]}
    </span>
  );
}

const PRIORITY_LABELS = { high: "High", medium: "Medium", low: "Low" } as const;

export function FollowUpPriorityBadge({ priority }: { priority: keyof typeof PRIORITY_LABELS }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-label-md text-label-md uppercase tracking-wider",
        priority === "high" ? "text-error" : "text-on-surface-variant",
      )}
    >
      <span
        className={clsx(
          "w-1.5 h-1.5 rounded-full",
          priority === "high" && "bg-error",
          priority === "medium" && "bg-on-surface-variant",
          priority === "low" && "bg-outline",
        )}
        aria-hidden="true"
      />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
