/**
 * Domain types for the follow-up risk product's non-Overview screens
 * (Patients, Risk Assessment, Follow-ups, Analytics) - PS-01 "Patient
 * Follow-up Risk Predictor". Kept separate from `types/patient.ts` (the
 * Overview-only ICU-style queue model) deliberately - Overview is frozen
 * per the design brief, so its types and the components built on them
 * are never touched here.
 *
 * Field names/units mirror the backend's Pydantic schemas
 * (`backend/app/schemas.py`) 1:1 so mapping an API response onto these
 * types is a no-op rename, not a transformation.
 */

export type RiskLevel = "low" | "moderate" | "high";

/** Row shape for the Patients directory table. Demographic/appointment
 * facts only - `riskLevel`/`riskScore` are NOT stored here because they
 * are always a live prediction, never baked into demo data (see
 * `hooks/useFollowUpRiskPredictions`). */
export interface FollowUpPatient {
  id: string;
  name: string;
  age: number;
  gender?: "M" | "F" | string;
  neighbourhood?: string;
  scholarship?: number;
  hipertension?: number;
  diabetes?: number;
  alcoholism?: number;
  handcap?: number;
  smsReceived?: number;
  waitingTimeDays?: number;
  appointmentDayOfWeek?: number;
  appointmentMonth?: number;
  scheduledHour?: number;
  previousAppointments?: number;
  previousNoShows?: number;
  previousAttendanceRate?: number;
  daysSincePreviousAppointment?: number;

  /** Distance from the patient's home to the hospital, in kilometers. */
  distanceKm: number;
  /** How many months the patient has been in this course of treatment. */
  treatmentDurationMonths: number;
  /** Average days between this patient's scheduled appointments. */
  appointmentFrequencyDays: number;
  /** Total previous appointments scheduled (appointment history). */
  totalAppointments: number;
  /** Of those, how many the patient missed. */
  missedAppointments: number;
  treatmentType: string;
  assignedClinician: string;
  lastAppointmentDate: string;
  nextFollowUpDate: string | null;
}

/** One prior prediction shown in a patient's history log. */
export interface PredictionHistoryEntry {
  id: string;
  date: string;
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
}

/** Extended follow-up record shown in the Patients detail drawer. */
export interface PatientFollowUpRecord {
  patientId: string;
  distanceKm: number;
  treatmentDurationMonths: number;
  appointmentFrequencyDays: number;
  totalAppointments: number;
  missedAppointments: number;
  treatmentType: string;
  priorIssues: string[];
  currentNotes: string;
  predictionHistory: PredictionHistoryEntry[];
}

/** Everything the Risk Assessment form collects for one prediction run -
 * mirrors the backend's PredictionRequest exactly. */
export interface PredictionFormInput {
  patientId: string | null;
  patientName: string;
  age: number | null;
  gender: "M" | "F";
  neighbourhood: string;
  scholarship: number;
  hipertension: number;
  diabetes: number;
  alcoholism: number;
  handcap: number;
  smsReceived: number;
  waitingTimeDays: number | null;
  appointmentDayOfWeek: number | null;
  appointmentMonth: number | null;
  scheduledHour: number | null;
  previousAppointments: number | null;
  previousNoShows: number | null;
  previousAttendanceRate?: number | null;
  daysSincePreviousAppointment: number | null;

  // Contextual / PS-01
  distanceKm: number | null;
  treatmentDurationMonths: number | null;
  appointmentFrequencyDays: number | null;
  totalAppointments: number | null;
  missedAppointments: number | null;
}


export type ImpactLevel = "low" | "medium" | "high";

/** One factor behind a prediction - always traceable to an actual input
 * field, never a free-floating claim. Mirrors the backend's Reason. */
export interface PredictionReason {
  factor: string;
  label: string;
  value: string;
  impact: ImpactLevel;
  contributionPercent: number;
}

/** Rendered bar-chart shape (RiskContributorBar) derived from
 * PredictionReason - kept as its own type since the bar only needs a
 * label + 0-100 weight, not the full reason record. */
export interface RiskContributingFactor {
  label: string;
  weight: number;
}

export type ModelType = "rule_based" | "trained_model";

/** Output of a prediction - shaped to match the backend's
 * PredictionResponse so the API response can be used directly. */
export interface PredictionResult {
  riskLevel: RiskLevel;
  /** 0-100 for display (backend's risk_percent). */
  riskScore: number;
  interventionRequired: boolean;
  reasons: PredictionReason[];
  summary: string;
  recommendedAction: string;
  modelType: ModelType;
}

export type FollowUpStatus = "overdue" | "due" | "upcoming" | "completed";
export type FollowUpPriority = "high" | "medium" | "low";

export interface FollowUpTask {
  id: string;
  patientId: string;
  patientName: string;
  riskLevel: RiskLevel;
  reason: string;
  /** ISO datetime the follow-up is due. */
  dueAt: string;
  priority: FollowUpPriority;
  completed: boolean;
}
