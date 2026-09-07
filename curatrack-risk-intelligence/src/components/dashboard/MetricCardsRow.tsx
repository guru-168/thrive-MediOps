import { metricSummary } from "../../data/mockPatients";
import { MetricCard } from "./MetricCard";
import type { SeverityFilter } from "../../types/patient";

export interface MetricCardsRowProps {
  activeSeverity: SeverityFilter;
  onSeverityChange: (value: SeverityFilter) => void;
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
export function MetricCardsRow({ activeSeverity, onSeverityChange }: MetricCardsRowProps) {
  function toggle(severity: SeverityFilter) {
    onSeverityChange(activeSeverity === severity ? "all" : severity);
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
      <MetricCard
        label="Total Monitored"
        value={metricSummary.totalMonitored.toLocaleString("en-US")}
        icon="groups"
        deltaText={metricSummary.totalMonitoredDelta}
        deltaIcon="arrow_upward"
      />
      <MetricCard
        label="High Risk"
        value={metricSummary.highRisk.toLocaleString("en-US")}
        icon="warning"
        critical
        deltaText="Needs immediate review"
        deltaIcon="trending_up"
        onClick={() => toggle("critical")}
        selected={activeSeverity === "critical"}
      />
      <MetricCard
        label="Med Risk"
        value={metricSummary.medRisk.toLocaleString("en-US")}
        icon="priority_high"
        deltaText="Monitor closely"
        onClick={() => toggle("elevated")}
        selected={activeSeverity === "elevated"}
      />
      <MetricCard
        label="Low Risk"
        value={metricSummary.lowRisk.toLocaleString("en-US")}
        icon="check_circle"
        deltaText="Stable condition"
        onClick={() => toggle("routine")}
        selected={activeSeverity === "routine"}
      />
    </section>
  );
}
