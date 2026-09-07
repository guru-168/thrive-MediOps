import clsx from "clsx";
import type { SeverityLevel } from "../../types/patient";

const LABELS: Record<SeverityLevel, string> = {
  critical: "Critical",
  elevated: "Elevated",
  routine: "Routine",
};

export interface SeverityBadgeProps {
  severity: SeverityLevel;
}

/** Pill badge for the patient queue table's Severity column. */
export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
        severity === "critical" &&
          "bg-error-container text-on-error-container border-error/20",
        severity === "elevated" &&
          "bg-surface-container-high text-on-surface border-outline-variant",
        severity === "routine" &&
          "text-on-surface-variant border-outline-variant border-dashed",
      )}
    >
      {LABELS[severity]}
    </span>
  );
}
