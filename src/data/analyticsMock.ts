import { prenatalPatients } from "./prenatalPatients";
import type { RiskLevel } from "../types/prenatal";

/** One day's worth of assessment-volume trend data. */
export interface AssessmentVolumePoint {
  date: string;
  assessments: number;
  highRisk: number;
}

/** 30 days of mock daily assessment volume, most recent last. Analytics'
 * date-range control (7D/14D/30D) simply slices the tail of this array. */
export const assessmentVolumeTrend: AssessmentVolumePoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const dayIndex = i;
    // Deterministic pseudo-variation so the trend looks organic without
    // being random-per-render (a fresh Math.random() each render would
    // make the chart jump on every re-render/filter change).
    const base = 14 + Math.round(6 * Math.sin(dayIndex / 3.2)) + (dayIndex % 5 === 0 ? 4 : 0);
    const assessments = Math.max(6, base);
    const highRisk = Math.max(1, Math.round(assessments * (0.12 + 0.05 * Math.sin(dayIndex / 4))));
    const date = new Date(Date.now() - (29 - dayIndex) * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().slice(0, 10),
      assessments,
      highRisk,
    };
  },
);

/** Weekly follow-up completion rate for the last 8 weeks (0-100). */
export const followUpCompletionTrend: { week: string; completionRate: number }[] = [
  { week: "Jun 29", completionRate: 71 },
  { week: "Jul 06", completionRate: 76 },
  { week: "Jul 13", completionRate: 68 },
  { week: "Jul 20", completionRate: 82 },
  { week: "Jul 27", completionRate: 79 },
  { week: "Aug 03", completionRate: 85 },
  { week: "Aug 10", completionRate: 88 },
  { week: "Aug 17", completionRate: 91 },
];

/** Gestational-age trimester distribution, derived live from the patient
 * directory rather than duplicated as separate hand-typed numbers. */
export function getTrimesterDistribution(): { label: string; count: number }[] {
  const buckets = { "1st trimester (≤13w)": 0, "2nd trimester (14–27w)": 0, "3rd trimester (28w+)": 0 };
  for (const p of prenatalPatients) {
    if (p.gestationalAgeWeeks <= 13) buckets["1st trimester (≤13w)"] += 1;
    else if (p.gestationalAgeWeeks <= 27) buckets["2nd trimester (14–27w)"] += 1;
    else buckets["3rd trimester (28w+)"] += 1;
  }
  return Object.entries(buckets).map(([label, count]) => ({ label, count }));
}

/** Risk-level breakdown, derived live from the patient directory. */
export function getRiskBreakdown(): { level: RiskLevel; label: string; count: number }[] {
  const counts: Record<RiskLevel, number> = { high: 0, moderate: 0, low: 0 };
  for (const p of prenatalPatients) counts[p.riskLevel] += 1;
  return [
    { level: "high", label: "High Risk", count: counts.high },
    { level: "moderate", label: "Moderate Risk", count: counts.moderate },
    { level: "low", label: "Low Risk", count: counts.low },
  ];
}
