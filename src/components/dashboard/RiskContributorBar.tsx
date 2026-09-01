import clsx from "clsx";

export interface RiskContributorBarProps {
  label: string;
  /** 0-100 contribution weight. */
  weight: number;
  /** Colors the fill - error for a critical patient's bars, neutral otherwise. */
  tone?: "critical" | "neutral";
}

/**
 * "Risk Contribution Bars" per DESIGN.md's Components spec: a thin 4px
 * track with a rounded-full colored fill, factor name left-aligned,
 * value right-aligned in data-mono. Documented in the design system but
 * never used on the reference's single Overview screen - built here for
 * the patient detail drawer instead of inventing a new pattern.
 */
export function RiskContributorBar({ label, weight, tone = "neutral" }: RiskContributorBarProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body-sm text-body-sm text-on-surface">{label}</span>
        <span className="font-data-mono text-data-mono text-on-surface-variant shrink-0">
          {weight}%
        </span>
      </div>
      <div className="h-1 rounded-full bg-surface-container-highest overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            tone === "critical" ? "bg-error" : "bg-on-surface",
          )}
          style={{ width: `${Math.max(weight, 2)}%` }}
        />
      </div>
    </div>
  );
}
