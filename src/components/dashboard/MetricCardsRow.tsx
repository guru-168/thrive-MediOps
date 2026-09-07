import { MetricCard } from "./MetricCard";
import type { SeverityFilter } from "../../types/patient";

export interface MetricCounts {
  totalMonitored: number;
  highRisk: number;
  medRisk: number;
  lowRisk: number;
  /** How many scored patients cleared the model's intervention threshold. */
  interventionsRequired: number;
}

export interface MetricCardsRowProps {
  activeSeverity: SeverityFilter;
  onSeverityChange: (value: SeverityFilter) => void;
  /**
   * Live counts derived from the `/patients/rank` response, or null while
   * that call is in flight or has failed. Null renders an em dash rather
   * than a zero or a stale placeholder - a number on this row must always
   * be one the backend actually produced.
   */
  counts: MetricCounts | null;
}

/**
 * Top-row grid of the four summary metric cards. The three risk-tier
 * cards double as filter shortcuts for the queue table below - clicking
 * "High Risk" is the same as picking "Critical" from the table's filter
 * menu or the donut legend, so the whole dashboard filters as one system
 * instead of three disconnected controls.
 *
 * Column breakpoints are shifted up from Tailwind's raw defaults (was
 * `md:grid-cols-4`, matching the reference verbatim) because the fixed
 * 240px sidebar + container margin permanently eat into the available
 * width - at the plain `md` (768px) breakpoint that only leaves ~480px
 * for 4 cards, causing the label/value text to wrap and overlap. 2
 * columns from `sm`, 4 only once there's enough real content width
 * at `xl`.
 */
export function MetricCardsRow({ activeSeverity, onSeverityChange, counts }: MetricCardsRowProps) {
  function toggle(severity: SeverityFilter) {
    onSeverityChange(activeSeverity === severity ? "all" : severity);
  }

  /** Em dash while there is no prediction data - never a fabricated zero. */
  const show = (value: number | undefined) =>
    counts && value !== undefined ? value.toLocaleString("en-US") : "—";

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
      <MetricCard
        label="Total Monitored"
        value={show(counts?.totalMonitored)}
        icon="groups"
        deltaText={
          counts
            ? `${counts.interventionsRequired} need intervention`
            : "Awaiting prediction service"
        }
        deltaIcon={counts ? "trending_up" : undefined}
      />
      <MetricCard
        label="High Risk"
        value={show(counts?.highRisk)}
        icon="warning"
        critical
        deltaText="Needs immediate review"
        deltaIcon="trending_up"
        onClick={() => toggle("critical")}
        selected={activeSeverity === "critical"}
      />
      <MetricCard
        label="Med Risk"
        value={show(counts?.medRisk)}
        icon="priority_high"
        deltaText="Monitor closely"
        onClick={() => toggle("elevated")}
        selected={activeSeverity === "elevated"}
      />
      <MetricCard
        label="Low Risk"
        value={show(counts?.lowRisk)}
        icon="check_circle"
        deltaText="Stable condition"
        onClick={() => toggle("routine")}
        selected={activeSeverity === "routine"}
      />
    </section>
  );
}
