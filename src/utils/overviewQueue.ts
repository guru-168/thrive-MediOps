import type { FollowUpPatient, PredictionResult, RiskLevel } from "../types/followUp";
import type { Patient, RiskDistributionSlice, SeverityLevel } from "../types/patient";

/**
 * Adapts live `/patients/rank` predictions onto the Overview screen's own
 * `Patient` shape, so the Prioritized Patient Queue table, metric cards
 * and risk donut keep rendering exactly as designed while every number
 * they show comes from the backend instead of `data/mockPatients.ts`.
 *
 * Nothing here invents a value: a patient with no prediction yet is
 * simply not in the queue (see `buildQueue`), rather than being shown
 * with a placeholder score.
 */

/** The Overview screen's severity vocabulary maps 1:1 onto the API's risk_level. */
const SEVERITY_BY_RISK_LEVEL: Record<RiskLevel, SeverityLevel> = {
  high: "critical",
  moderate: "elevated",
  low: "routine",
};

/** Reverse of the above, for translating a severity filter back to a risk level. */
export const RISK_LEVEL_BY_SEVERITY: Record<SeverityLevel, RiskLevel> = {
  critical: "high",
  elevated: "moderate",
  routine: "low",
};

function formatNextFollowUp(isoDate: string | null): string {
  if (!isoDate) return "Not scheduled";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * One queue row per patient that actually has a prediction. Ordering is
 * the backend's own ranking (highest risk first) - `rankPatients` returns
 * a Map built from the sorted response, so iterating the predictions
 * preserves that order rather than re-sorting on the client.
 */
export function buildQueue(
  patients: FollowUpPatient[],
  predictions: Map<string, PredictionResult>,
): Patient[] {
  const byId = new Map(patients.map((patient) => [patient.id, patient]));
  const rows: Patient[] = [];

  for (const [patientId, prediction] of predictions) {
    const patient = byId.get(patientId);
    if (!patient) continue;

    const topReason = prediction.reasons[0];
    rows.push({
      id: patient.id,
      name: patient.name,
      riskScore: prediction.riskScore,
      severity: SEVERITY_BY_RISK_LEVEL[prediction.riskLevel],
      // The backend's leading factor for THIS patient. `reasons` is never
      // empty (the API emits a "baseline" reason when nothing is
      // elevated), but guard anyway rather than render "undefined".
      keyContributor: topReason ? topReason.label : "No elevated risk factors",
      nextFollowUp: formatNextFollowUp(patient.nextFollowUpDate),
      // Read straight from the API. Deliberately NOT derived from
      // severity: the model's intervention threshold (0.22) is
      // independent of the risk bands (0.40/0.70), so a "routine" row can
      // legitimately still be flagged urgent.
      isUrgent: prediction.interventionRequired,
    });
  }

  return rows;
}

/** Live counts for the risk donut, in the same order/colors the design uses. */
export function buildRiskDistribution(queue: Patient[]): RiskDistributionSlice[] {
  const count = (severity: SeverityLevel) => queue.filter((row) => row.severity === severity).length;
  return [
    { label: "Critical Risk", count: count("critical"), colorToken: "error", severity: "critical" },
    {
      label: "Elevated Risk",
      count: count("elevated"),
      colorToken: "secondary-container",
      severity: "elevated",
    },
    {
      label: "Routine Monitoring",
      count: count("routine"),
      colorToken: "surface-container-highest",
      severity: "routine",
    },
  ];
}

/** How many of the scored patients cleared the model's intervention threshold. */
export function countInterventions(predictions: Map<string, PredictionResult>): number {
  let total = 0;
  for (const prediction of predictions.values()) {
    if (prediction.interventionRequired) total += 1;
  }
  return total;
}
