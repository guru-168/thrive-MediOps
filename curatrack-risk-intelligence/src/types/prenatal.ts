/**
 * Domain types for the prenatal screening / risk-stratification product's
 * non-Overview screens (Patients, Risk Assessment, Follow-ups, Analytics).
 * Kept separate from `types/patient.ts` (the Overview-only ICU-style
 * queue model) deliberately - Overview is frozen per the design brief,
 * so its types and the components built on them are never touched here.
 */

export type RiskLevel = "low" | "moderate" | "high";

/** Row shape for the Patients directory table. */
export interface PregnantPatient {
  id: string;
  name: string;
  age: number;
  gestationalAgeWeeks: number;
  dueDate: string;
  gravidaPara: string;
  riskLevel: RiskLevel;
  primaryConcern: string;
  assignedClinician: string;
  lastAssessmentDate: string;
  nextFollowUpDate: string | null;
}

/** One prior risk assessment shown in a patient's history. */
export interface AssessmentHistoryEntry {
  id: string;
  date: string;
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
}

/** Extended clinical record shown in the Patients detail drawer. */
export interface PatientClinicalRecord {
  patientId: string;
  bloodPressure: string;
  bmi: number;
  gravidaPara: string;
  priorPregnancyComplications: string[];
  currentPregnancyNotes: string;
  assessmentHistory: AssessmentHistoryEntry[];
}

export type DiabetesStatus = "none" | "gestational" | "type1" | "type2";
export type SmokingStatus = "never" | "former" | "current";

/** Everything the Risk Assessment form collects for one run. */
export interface RiskAssessmentInput {
  patientId: string | null;
  patientName: string;
  age: number | null;
  gestationalAgeWeeks: number | null;
  systolicBP: number | null;
  diastolicBP: number | null;
  bmi: number | null;
  priorPreeclampsia: boolean;
  chronicHypertension: boolean;
  multiplePregnancy: boolean;
  previousPretermBirth: boolean;
  familyHistoryPreeclampsia: boolean;
  diabetesStatus: DiabetesStatus;
  smokingStatus: SmokingStatus;
}

export interface RiskContributingFactor {
  label: string;
  weight: number;
}

/** Output of the (mock) assessment engine - shaped so a real model/API
 * response can be dropped in later without changing the UI. */
export interface RiskAssessmentResult {
  riskLevel: RiskLevel;
  riskScore: number;
  contributingFactors: RiskContributingFactor[];
  interpretation: string;
  recommendedMonitoring: string;
  recommendedAction: string;
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
