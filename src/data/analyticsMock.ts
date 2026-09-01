import { followUpPatients } from "./followUpPatients";
import type { PredictionResult, RiskLevel } from "../types/followUp";

/** One day's worth of prediction-volume trend data. */
export interface PredictionVolumePoint {
  date: string;
  predictions: number;
  highRisk: number;
}

/**
 * 30 days of mock daily prediction volume, most recent last. Analytics'
 * date-range control (7D/14D/30D) simply slices the tail of this array.
 * Illustrative dashboard trend data (how busy the risk-prediction
 * workflow has been) - not itself a prediction, so it stays a
 * deterministic mock rather than requiring a backend call.
 */
export const predictionVolumeTrend: PredictionVolumePoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const dayIndex = i;
    // Deterministic pseudo-variation so the trend looks organic without
    // being random-per-render (a fresh Math.random() each render would
    // make the chart jump on every re-render/filter change).
    const base = 14 + Math.round(6 * Math.sin(dayIndex / 3.2)) + (dayIndex % 5 === 0 ? 4 : 0);
    const predictions = Math.max(6, base);
    const highRisk = Math.max(1, Math.round(predictions * (0.12 + 0.05 * Math.sin(dayIndex / 4))));
    const date = new Date(Date.now() - (29 - dayIndex) * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().slice(0, 10),
      predictions,
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

/** Missed-appointment-rate distribution, derived live from the patient
 * directory's appointment-history fields (not a prediction - just a
 * demographic histogram over synthetic demo data). */
export function getMissedRateDistribution(): { label: string; count: number }[] {
  const buckets = { "Low (<20% missed)": 0, "Moderate (20-50% missed)": 0, "High (50%+ missed)": 0 };
  for (const p of followUpPatients) {
    const rate = p.totalAppointments > 0 ? p.missedAppointments / p.totalAppointments : 0;
    if (rate < 0.2) buckets["Low (<20% missed)"] += 1;
    else if (rate < 0.5) buckets["Moderate (20-50% missed)"] += 1;
    else buckets["High (50%+ missed)"] += 1;
  }
  return Object.entries(buckets).map(([label, count]) => ({ label, count }));
}

/** Risk-level breakdown, derived from the LIVE prediction map (never
 * from static mock data - see hooks/useFollowUpRiskPredictions). Returns
 * all-zero counts if predictions haven't loaded yet; callers should gate
 * on the hook's own loading/error state before relying on this. */
export function getRiskBreakdown(
  predictions: Map<string, PredictionResult> | null,
): { level: RiskLevel; label: string; count: number }[] {
  const counts: Record<RiskLevel, number> = { high: 0, moderate: 0, low: 0 };
  if (predictions) {
    for (const result of predictions.values()) counts[result.riskLevel] += 1;
  }
  return [
    { level: "high", label: "High Risk", count: counts.high },
    { level: "moderate", label: "Moderate Risk", count: counts.moderate },
    { level: "low", label: "Low Risk", count: counts.low },
  ];
}
