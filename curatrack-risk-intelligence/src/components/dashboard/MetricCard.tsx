import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { Card } from "../ui/Card";

export interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  /** Renders the filled icon variant + error-tinted card, used for "High Risk". */
  critical?: boolean;
  deltaText: string;
  deltaIcon?: string;
  /** When provided, the card becomes a toggle button that filters the queue below. */
  onClick?: () => void;
  selected?: boolean;
}

/** One of the four top-row metric tiles (Total Monitored / High Risk / Med Risk / Low Risk). */
export function MetricCard({
  label,
  value,
  icon,
  critical = false,
  deltaText,
  deltaIcon,
  onClick,
  selected = false,
}: MetricCardProps) {
  const interactive = Boolean(onClick);

  const cardClassName = clsx(
    "p-stack-md flex flex-col gap-stack-sm text-left",
    critical && "relative overflow-hidden",
    interactive &&
      "transition-all duration-150 hover:border-outline active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline focus-visible:ring-offset-1 cursor-pointer",
    selected && "ring-1 ring-inset ring-on-surface",
  );

  const content = (
    <>
      {critical && <div className="absolute inset-0 bg-error/5" aria-hidden="true" />}

      <div className={clsx("flex items-center justify-between", critical && "relative z-10")}>
        <span
          className={clsx(
            "font-label-md text-label-md uppercase tracking-wider",
            critical ? "text-error" : "text-on-surface-variant",
          )}
        >
          {label}
        </span>
        <MaterialSymbol
          name={icon}
          filled={critical}
          className={critical ? "text-error" : "text-on-surface-variant"}
        />
      </div>

      <div
        className={clsx(
          "font-display-lg text-display-lg",
          critical ? "relative z-10 text-error" : "text-on-surface",
        )}
      >
        {value}
      </div>

      <div
        className={clsx(
          "font-body-sm text-body-sm flex items-center gap-1",
          critical ? "relative z-10 text-error" : "text-on-surface-variant",
        )}
      >
        {deltaIcon && <MaterialSymbol name={deltaIcon} className="text-sm" />}
        {deltaText}
      </div>
    </>
  );

  // Two literal-`as` branches (rather than a computed `as`) so Card's
  // polymorphic generic can properly narrow button-specific props like
  // `type` in the interactive case.
  if (interactive) {
    return (
      <Card
        as="button"
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        tone={critical ? "critical" : "default"}
        className={cardClassName}
      >
        {content}
      </Card>
    );
  }

  return (
    <Card tone={critical ? "critical" : "default"} className={cardClassName}>
      {content}
    </Card>
  );
}
