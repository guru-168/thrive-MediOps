import type { PatientFollowUpRecord } from "../types/followUp";

/**
 * Extended follow-up record per patient, keyed by FollowUpPatient.id.
 * Frontend-only demo data - replace with a real per-patient fetch later.
 *
 * `predictionHistory` is an illustrative log of past prediction runs
 * (what the risk score/level would have read on earlier dates) - display
 *-only history, not the current live prediction. The patient's *current*
 * risk status shown at the top of the drawer always comes from the live
 * batch prediction (see PatientRecordDrawer / useFollowUpRiskPredictions),
 * never from this file.
 */
const records: Record<string, PatientFollowUpRecord> = {
  "MB-1042": {
    patientId: "MB-1042",
    distanceKm: 42,
    treatmentDurationMonths: 8,
    appointmentFrequencyDays: 14,
    totalAppointments: 12,
    missedAppointments: 5,
    treatmentType: "Hypertension management",
    priorIssues: ["Missed 2 consecutive visits in July", "No reliable transport on dialysis days"],
    currentNotes: "Missed rate has climbed over the last quarter. Care coordinator outreach recommended before the next visit.",
    predictionHistory: [
      { id: "a1", date: "2026-08-30", riskLevel: "high", riskScore: 78, summary: "5 of 12 appointments missed, 42km from hospital" },
      { id: "a2", date: "2026-08-02", riskLevel: "moderate", riskScore: 58, summary: "Missed-appointment rate trending upward" },
      { id: "a3", date: "2026-07-05", riskLevel: "low", riskScore: 24, summary: "Baseline, attendance on track" },
    ],
  },
  "MB-1108": {
    patientId: "MB-1108",
    distanceKm: 6,
    treatmentDurationMonths: 3,
    appointmentFrequencyDays: 21,
    totalAppointments: 6,
    missedAppointments: 1,
    treatmentType: "Diabetes monitoring",
    priorIssues: [],
    currentNotes: "One missed visit early in treatment, otherwise consistent attendance. Lives close to the hospital.",
    predictionHistory: [
      { id: "a1", date: "2026-08-28", riskLevel: "moderate", riskScore: 46, summary: "1 missed appointment out of 6" },
      { id: "a2", date: "2026-08-01", riskLevel: "low", riskScore: 20, summary: "Baseline, unremarkable" },
    ],
  },
  "MB-0987": {
    patientId: "MB-0987",
    distanceKm: 55,
    treatmentDurationMonths: 14,
    appointmentFrequencyDays: 10,
    totalAppointments: 20,
    missedAppointments: 8,
    treatmentType: "Chronic hypertension follow-up",
    priorIssues: ["Long-distance commute (55km)", "Long treatment course (14 months) with visit fatigue noted"],
    currentNotes: "High-frequency visit schedule (every 10 days) combined with a long commute. Consider consolidating visits or offering telehealth check-ins.",
    predictionHistory: [
      { id: "a1", date: "2026-08-29", riskLevel: "high", riskScore: 82, summary: "8 of 20 appointments missed, 55km commute" },
      { id: "a2", date: "2026-08-15", riskLevel: "high", riskScore: 74, summary: "Missed-rate elevated, distance flagged" },
      { id: "a3", date: "2026-08-01", riskLevel: "moderate", riskScore: 61, summary: "Attendance declining" },
    ],
  },
  "MB-1223": {
    patientId: "MB-1223",
    distanceKm: 3,
    treatmentDurationMonths: 1,
    appointmentFrequencyDays: 30,
    totalAppointments: 2,
    missedAppointments: 0,
    treatmentType: "Routine post-op check",
    priorIssues: [],
    currentNotes: "Early in a short, low-frequency treatment course. All appointments attended so far.",
    predictionHistory: [{ id: "a1", date: "2026-08-20", riskLevel: "low", riskScore: 14, summary: "Routine, unremarkable" }],
  },
  "MB-1301": {
    patientId: "MB-1301",
    distanceKm: 22,
    treatmentDurationMonths: 9,
    appointmentFrequencyDays: 14,
    totalAppointments: 10,
    missedAppointments: 3,
    treatmentType: "Cardiac rehabilitation",
    priorIssues: ["Missed appointment history (3 of 10)"],
    currentNotes: "Moderate distance and a mid-length treatment course. Missed-visit rate is a growing concern; reminder cadence increased.",
    predictionHistory: [
      { id: "a1", date: "2026-08-27", riskLevel: "moderate", riskScore: 52, summary: "3 of 10 appointments missed" },
      { id: "a2", date: "2026-08-13", riskLevel: "moderate", riskScore: 55, summary: "Reminder cadence increased" },
    ],
  },
  "MB-0876": {
    patientId: "MB-0876",
    distanceKm: 8,
    treatmentDurationMonths: 2,
    appointmentFrequencyDays: 28,
    totalAppointments: 3,
    missedAppointments: 0,
    treatmentType: "Physical therapy",
    priorIssues: [],
    currentNotes: "Early in treatment, close to the hospital, low visit frequency. No concerns.",
    predictionHistory: [{ id: "a1", date: "2026-08-15", riskLevel: "low", riskScore: 9, summary: "Intake visit, unremarkable" }],
  },
  "MB-1155": {
    patientId: "MB-1155",
    distanceKm: 31,
    treatmentDurationMonths: 11,
    appointmentFrequencyDays: 7,
    totalAppointments: 24,
    missedAppointments: 4,
    treatmentType: "Oncology follow-up",
    priorIssues: ["Weekly visit schedule - high visit burden"],
    currentNotes: "Weekly visits over 11 months. Attendance is reasonable given the burden, but the frequent cadence keeps risk elevated.",
    predictionHistory: [
      { id: "a1", date: "2026-08-30", riskLevel: "moderate", riskScore: 49, summary: "Weekly visits, 4 of 24 missed" },
      { id: "a2", date: "2026-08-16", riskLevel: "moderate", riskScore: 47, summary: "Consistent moderate risk" },
    ],
  },
  "MB-1019": {
    patientId: "MB-1019",
    distanceKm: 5,
    treatmentDurationMonths: 4,
    appointmentFrequencyDays: 21,
    totalAppointments: 6,
    missedAppointments: 1,
    treatmentType: "Routine chronic care check-in",
    priorIssues: [],
    currentNotes: "Close to the hospital with a mostly consistent attendance record.",
    predictionHistory: [{ id: "a1", date: "2026-08-22", riskLevel: "low", riskScore: 12, summary: "Routine, unremarkable" }],
  },
  "MB-1267": {
    patientId: "MB-1267",
    distanceKm: 61,
    treatmentDurationMonths: 16,
    appointmentFrequencyDays: 7,
    totalAppointments: 28,
    missedAppointments: 11,
    treatmentType: "Renal dialysis follow-up",
    priorIssues: ["Longest commute in the panel (61km)", "Weekly visits for over a year - severe visit fatigue"],
    currentNotes: "Highest-risk profile in the panel: long commute, weekly cadence, sustained over 16 months, with a high missed-visit count. Priority outreach case.",
    predictionHistory: [
      { id: "a1", date: "2026-08-31", riskLevel: "high", riskScore: 91, summary: "11 of 28 appointments missed, 61km commute" },
      { id: "a2", date: "2026-08-24", riskLevel: "high", riskScore: 79, summary: "Missed-visit count climbing" },
      { id: "a3", date: "2026-08-10", riskLevel: "moderate", riskScore: 55, summary: "Early signs of disengagement" },
    ],
  },
  "MB-1340": {
    patientId: "MB-1340",
    distanceKm: 4,
    treatmentDurationMonths: 1,
    appointmentFrequencyDays: 30,
    totalAppointments: 1,
    missedAppointments: 0,
    treatmentType: "Post-op wound check",
    priorIssues: [],
    currentNotes: "First appointment attended, close to the hospital. Too early for a meaningful attendance history.",
    predictionHistory: [{ id: "a1", date: "2026-08-18", riskLevel: "low", riskScore: 7, summary: "Intake visit, unremarkable" }],
  },
  "MB-1188": {
    patientId: "MB-1188",
    distanceKm: 19,
    treatmentDurationMonths: 7,
    appointmentFrequencyDays: 14,
    totalAppointments: 9,
    missedAppointments: 2,
    treatmentType: "Mental health follow-up",
    priorIssues: ["2 missed appointments over 7 months"],
    currentNotes: "Moderate distance, biweekly cadence. Missed visits are infrequent but worth a reminder check-in.",
    predictionHistory: [
      { id: "a1", date: "2026-08-26", riskLevel: "moderate", riskScore: 44, summary: "2 of 9 appointments missed" },
      { id: "a2", date: "2026-08-12", riskLevel: "moderate", riskScore: 42, summary: "Distance flagged as contributing factor" },
    ],
  },
  "MB-0942": {
    patientId: "MB-0942",
    distanceKm: 12,
    treatmentDurationMonths: 5,
    appointmentFrequencyDays: 21,
    totalAppointments: 7,
    missedAppointments: 1,
    treatmentType: "Physical therapy",
    priorIssues: [],
    currentNotes: "Consistent attendance with one early missed visit. No current concerns.",
    predictionHistory: [
      { id: "a1", date: "2026-08-29", riskLevel: "low", riskScore: 15, summary: "Attendance on track" },
      { id: "a2", date: "2026-08-15", riskLevel: "low", riskScore: 13, summary: "Routine, unremarkable" },
    ],
  },
};

export function getPatientFollowUpRecord(patientId: string): PatientFollowUpRecord | undefined {
  return records[patientId];
}
