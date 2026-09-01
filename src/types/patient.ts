/**
 * Domain types for the Clinical Dashboard (Overview) screen, matching the
 * fields present in the Stitch reference's "Prioritized Patient Queue"
 * table and "Risk Distribution" panel.
 */

/** Severity band shown as a pill badge in the patient queue table. */
export type SeverityLevel = "critical" | "elevated" | "routine";

/** Table/donut/metric-card filter state: a specific severity, or no filter. */
export type SeverityFilter = SeverityLevel | "all";

export interface Patient {
  /** e.g. "PT-9821" */
  id: string;
  /** Display name, "Last, First" as shown in the reference table. */
  name: string;
  /** Risk score as a whole-number percentage (0-100). */
  riskScore: number;
  severity: SeverityLevel;
  /** e.g. "SpO2 Drop (88%)" */
  keyContributor: string;
  /** e.g. "Immediate", "In 15 Mins", "End of Shift" */
  nextFollowUp: string;
  /** Whether the follow-up column should render in the error/red tone. */
  isUrgent: boolean;
}

export interface RiskDistributionSlice {
  label: string;
  /** Patient count backing this slice (used to derive the percentage). */
  count: number;
  /** Tailwind color token used for the legend swatch and donut arc. */
  colorToken: "error" | "secondary-container" | "surface-container-highest";
  /** Ties this slice to the same filter used by the patient queue table. */
  severity: SeverityLevel;
}

export interface MetricSummary {
  totalMonitored: number;
  totalMonitoredDelta: string;
  highRisk: number;
  medRisk: number;
  lowRisk: number;
}
