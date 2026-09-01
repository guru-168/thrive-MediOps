/**
 * Centralized API client - the ONLY place in the frontend that calls
 * `fetch` against the backend. Every page/hook that needs a prediction
 * goes through the functions here rather than building its own request,
 * so the base URL, error handling, and request/response shapes stay in
 * one spot.
 *
 * Base URL comes from `VITE_API_URL` (see `.env.example`) - never
 * hard-code `localhost` in a component.
 */

import type {
  FollowUpPatient,
  ModelType,
  PredictionFormInput,
  PredictionReason,
  PredictionResult,
  RiskLevel,
} from "../types/followUp";

const API_BASE_URL: string = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:8000";

/** Thrown for any failed API call - network failure, non-2xx response,
 * or a response that doesn't match the expected shape. Pages catch this
 * and render a clean error state rather than ever falling back to fake
 * data. */
export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface HealthStatus {
  status: "ok";
  appName: string;
  appVersion: string;
  modelType: ModelType;
  modelLoaded: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      "Could not reach the prediction service. Confirm the backend is running and VITE_API_URL is correct.",
    );
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // Non-JSON error body - keep the generic message.
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}

export async function getHealth(): Promise<HealthStatus> {
  const body = await request<{
    status: "ok";
    app_name: string;
    app_version: string;
    model_type: ModelType;
    model_loaded: boolean;
  }>("/health");
  return {
    status: body.status,
    appName: body.app_name,
    appVersion: body.app_version,
    modelType: body.model_type,
    modelLoaded: body.model_loaded,
  };
}

/** Backend's PredictionRequest shape - snake_case, on the wire only. */
interface PredictionRequestBody {
  patient_id: string;
  patient_name: string | null;
  gender: string;
  age: number;
  neighbourhood: string;
  scholarship: number;
  hipertension: number;
  diabetes: number;
  alcoholism: number;
  handcap: number;
  sms_received: number;
  waiting_time_days: number;
  appointment_day_of_week: number;
  appointment_month: number;
  scheduled_hour: number;
  previous_appointments: number;
  previous_no_shows: number;
  previous_attendance_rate?: number;
  days_since_previous_appointment: number;
  distance_km: number;
  treatment_duration_months: number;
  appointment_frequency_days: number;
  total_appointments?: number;
  missed_appointments?: number;
}

interface ReasonBody {
  factor: string;
  label: string;
  value: string;
  impact: "low" | "medium" | "high";
  contribution_percent: number;
}

interface PredictionResponseBody {
  patient_id: string;
  patient_name: string | null;
  risk_score: number;
  risk_percent: number;
  risk_level: RiskLevel;
  intervention_required: boolean;
  reasons: ReasonBody[];
  summary: string;
  recommended_action: string;
  model_type: ModelType;
  generated_at: string;
}

function toRequestBody(input: PredictionFormInput): PredictionRequestBody {
  if (input.age === null) {
    throw new ApiError("Patient age is required before requesting a prediction.");
  }
  const total = input.previousAppointments ?? input.totalAppointments ?? 0;
  const missed = input.previousNoShows ?? input.missedAppointments ?? 0;
  return {
    patient_id: input.patientId ?? `NEW-${Date.now()}`,
    patient_name: input.patientName || null,
    gender: input.gender ?? "F",
    age: input.age,
    neighbourhood: input.neighbourhood || "JARDIM DA PENHA",
    scholarship: input.scholarship ?? 0,
    hipertension: input.hipertension ?? 0,
    diabetes: input.diabetes ?? 0,
    alcoholism: input.alcoholism ?? 0,
    handcap: input.handcap ?? 0,
    sms_received: input.smsReceived ?? 0,
    waiting_time_days: input.waitingTimeDays ?? 7,
    appointment_day_of_week: input.appointmentDayOfWeek ?? 2,
    appointment_month: input.appointmentMonth ?? 9,
    scheduled_hour: input.scheduledHour ?? 10,
    previous_appointments: total,
    previous_no_shows: missed,
    previous_attendance_rate:
      input.previousAttendanceRate ?? (total > 0 ? (total - missed) / total : 1.0),
    days_since_previous_appointment:
      input.daysSincePreviousAppointment ?? input.appointmentFrequencyDays ?? 30,
    distance_km: input.distanceKm ?? 10,
    treatment_duration_months: input.treatmentDurationMonths ?? 6,
    appointment_frequency_days: input.appointmentFrequencyDays ?? 14,
    total_appointments: total,
    missed_appointments: missed,
  };
}

function toReason(body: ReasonBody): PredictionReason {
  return {
    factor: body.factor,
    label: body.label,
    value: body.value,
    impact: body.impact,
    contributionPercent: body.contribution_percent,
  };
}

function toPredictionResult(body: PredictionResponseBody): PredictionResult {
  return {
    riskLevel: body.risk_level,
    riskScore: body.risk_percent,
    interventionRequired: body.intervention_required,
    reasons: body.reasons.map(toReason),
    summary: body.summary,
    recommendedAction: body.recommended_action,
    modelType: body.model_type,
  };
}

/** Single-patient prediction - powers the Risk Assessment form. */
export async function predictRisk(input: PredictionFormInput): Promise<PredictionResult> {
  const body = await request<PredictionResponseBody>("/predict", {
    method: "POST",
    body: JSON.stringify(toRequestBody(input)),
  });
  return toPredictionResult(body);
}

/** Feature payload for one directory patient, built from demo/synthetic
 * appointment-history data - see `data/followUpPatients.ts`. */
export function patientToFormInput(patient: FollowUpPatient): PredictionFormInput {
  return {
    patientId: patient.id,
    patientName: patient.name,
    age: patient.age,
    gender: (patient.gender as "M" | "F") || "F",
    neighbourhood: patient.neighbourhood || "JARDIM DA PENHA",
    scholarship: patient.scholarship ?? 0,
    hipertension: patient.hipertension ?? 0,
    diabetes: patient.diabetes ?? 0,
    alcoholism: patient.alcoholism ?? 0,
    handcap: patient.handcap ?? 0,
    smsReceived: patient.smsReceived ?? 0,
    waitingTimeDays: patient.waitingTimeDays ?? 7,
    appointmentDayOfWeek: patient.appointmentDayOfWeek ?? 2,
    appointmentMonth: patient.appointmentMonth ?? 9,
    scheduledHour: patient.scheduledHour ?? 10,
    previousAppointments: patient.previousAppointments ?? patient.totalAppointments,
    previousNoShows: patient.previousNoShows ?? patient.missedAppointments,
    previousAttendanceRate: patient.previousAttendanceRate,
    daysSincePreviousAppointment:
      patient.daysSincePreviousAppointment ?? patient.appointmentFrequencyDays ?? 30,
    distanceKm: patient.distanceKm,
    treatmentDurationMonths: patient.treatmentDurationMonths,
    appointmentFrequencyDays: patient.appointmentFrequencyDays,
    totalAppointments: patient.totalAppointments,
    missedAppointments: patient.missedAppointments,
  };
}

function patientToRequestBody(patient: FollowUpPatient): PredictionRequestBody {
  return toRequestBody(patientToFormInput(patient));
}


/** Batch ranking - powers the Patients directory and Follow-ups risk
 * badges. Returns patients ordered highest-risk-first (the backend's
 * deterministic ranking), keyed by patient_id for easy lookup. */
export async function rankPatients(
  patients: FollowUpPatient[],
): Promise<Map<string, PredictionResult>> {
  const body = await request<PredictionResponseBody[]>("/patients/rank", {
    method: "POST",
    body: JSON.stringify({ patients: patients.map(patientToRequestBody) }),
  });
  return new Map(body.map((row) => [row.patient_id, toPredictionResult(row)]));
}
