import type {
  MetricSummary,
  Patient,
  RiskDistributionSlice,
} from "../types/patient";

/**
 * Mock data extracted verbatim from the Stitch reference (code.html).
 * Frontend-only placeholder — replace with real API data when backend
 * work begins.
 */
export const metricSummary: MetricSummary = {
  totalMonitored: 1240,
  totalMonitoredDelta: "12 since last shift",
  highRisk: 42,
  medRisk: 156,
  lowRisk: 1042,
};

export const patientQueue: Patient[] = [
  {
    id: "PT-9821",
    name: "Doe, Jonathan",
    riskScore: 92,
    severity: "critical",
    keyContributor: "SpO2 Drop (88%)",
    nextFollowUp: "Immediate",
    isUrgent: true,
  },
  {
    id: "PT-7442",
    name: "Smith, Maria",
    riskScore: 87,
    severity: "critical",
    keyContributor: "Arrhythmia Detect",
    nextFollowUp: "Immediate",
    isUrgent: true,
  },
  {
    id: "PT-3310",
    name: "Johnson, Robert",
    riskScore: 64,
    severity: "elevated",
    keyContributor: "BP Fluctuation",
    nextFollowUp: "In 15 Mins",
    isUrgent: false,
  },
  {
    id: "PT-1099",
    name: "Williams, Sarah",
    riskScore: 58,
    severity: "elevated",
    keyContributor: "Missed Meds",
    nextFollowUp: "In 30 Mins",
    isUrgent: false,
  },
  {
    id: "PT-5521",
    name: "Brown, Michael",
    riskScore: 12,
    severity: "routine",
    keyContributor: "N/A",
    nextFollowUp: "End of Shift",
    isUrgent: false,
  },
];

/**
 * Risk Distribution panel figures. The reference screen's legend shows
 * 3.4% / 12.6% / 84.0% but the donut arc itself was a hard-coded CSS
 * clip-path that didn't match those numbers. Here the slices are defined
 * by patient counts and both the legend percentages and the donut arc are
 * derived from the same source (see RiskDistributionPanel), so they can
 * never drift apart again.
 */
export const riskDistribution: RiskDistributionSlice[] = [
  { label: "Critical Risk", count: 42, colorToken: "error", severity: "critical" },
  {
    label: "Elevated Risk",
    count: 156,
    colorToken: "secondary-container",
    severity: "elevated",
  },
  {
    label: "Routine Monitoring",
    count: 1042,
    colorToken: "surface-container-highest",
    severity: "routine",
  },
];
