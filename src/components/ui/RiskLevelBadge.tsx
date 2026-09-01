import clsx from "clsx";
import type { RiskLevel } from "../../types/prenatal";

const LABELS: Record<RiskLevel, string> = {
  high: "High Risk",
  moderate: "Moderate Risk",
  low: "Low Risk",
};

export interface RiskLevelBadgeProps {
  level: RiskLevel;
  className?: string;
}

/** Pill badge for prenatal risk level - same visual language as the
 * Overview queue's SeverityBadge (border + tint, no new colors), but a
 * separate component since the label set (Low/Moderate/High) and the
 * domain it describes differ from Overview's Critical/Elevated/Routine. */
export function RiskLevelBadge({ level, className }: RiskLevelBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
        level === "high" && "bg-error-container text-on-error-container border-error/20",
        level === "moderate" && "bg-surface-container-high text-on-surface border-outline-variant",
        level === "low" && "text-on-surface-variant border-outline-variant border-dashed",
        className,
      )}
    >
      {LABELS[level]}
    </span>
  );
}
