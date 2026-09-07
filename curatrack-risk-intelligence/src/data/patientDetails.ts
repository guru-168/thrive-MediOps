import type { PatientDetail } from "../types/patientDetail";

/**
 * Extended mock detail records, keyed by Patient.id. Frontend-only
 * placeholder - replace with a real per-patient fetch when backend work
 * begins. Content is illustrative clinical flavor, not derived from any
 * real patient data.
 */
const patientDetails: Record<string, PatientDetail> = {
  "PT-9821": {
    patientId: "PT-9821",
    age: 68,
    sex: "Male",
    room: "ICU-4B",
    attendingClinician: "Dr. A. Smith",
    vitals: [
      { label: "SpO2", value: "88%" },
      { label: "Heart Rate", value: "128 bpm" },
      { label: "Blood Pressure", value: "96/58" },
      { label: "Temp", value: "38.4°C" },
    ],
    riskContributors: [
      { label: "SpO2 desaturation trend", weight: 46 },
      { label: "Elevated heart rate", weight: 27 },
      { label: "Rising temperature", weight: 16 },
      { label: "Reduced mobility (72h)", weight: 11 },
    ],
    relevantFactors: [
      "Post-operative day 2",
      "History of COPD",
      "On supplemental O2",
      "Age 68",
    ],
    recommendedFollowUp:
      "Immediate bedside assessment recommended. Notify attending physician and prepare for possible escalation to ICU respiratory support.",
    timeline: [
      { id: "t1", label: "SpO2 dropped to 88%", time: "2 min ago", isLatest: true },
      { id: "t2", label: "Heart rate exceeded 120 bpm", time: "18 min ago" },
      { id: "t3", label: "Routine vitals check", time: "1 hr ago" },
      { id: "t4", label: "Admitted to ICU-4B", time: "2 days ago" },
    ],
  },
  "PT-7442": {
    patientId: "PT-7442",
    age: 74,
    sex: "Female",
    room: "ICU-2A",
    attendingClinician: "Dr. A. Smith",
    vitals: [
      { label: "SpO2", value: "94%" },
      { label: "Heart Rate", value: "142 bpm" },
      { label: "Blood Pressure", value: "108/70" },
      { label: "Temp", value: "37.1°C" },
    ],
    riskContributors: [
      { label: "Irregular rhythm (AFib pattern)", weight: 52 },
      { label: "Tachycardia", weight: 24 },
      { label: "Electrolyte imbalance", weight: 15 },
      { label: "History of arrhythmia", weight: 9 },
    ],
    relevantFactors: [
      "Known atrial fibrillation",
      "On anticoagulants",
      "Age 74",
      "Recent electrolyte panel pending",
    ],
    recommendedFollowUp:
      "Immediate cardiac monitoring review. Confirm 12-lead ECG and consider rate-control medication per cardiology protocol.",
    timeline: [
      { id: "t1", label: "Arrhythmia detected on telemetry", time: "4 min ago", isLatest: true },
      { id: "t2", label: "Heart rate exceeded 135 bpm", time: "22 min ago" },
      { id: "t3", label: "Electrolyte panel ordered", time: "45 min ago" },
      { id: "t4", label: "Admitted to ICU-2A", time: "1 day ago" },
    ],
  },
  "PT-3310": {
    patientId: "PT-3310",
    age: 59,
    sex: "Male",
    room: "Med-Surg 214",
    attendingClinician: "Dr. R. Owusu",
    vitals: [
      { label: "SpO2", value: "97%" },
      { label: "Heart Rate", value: "88 bpm" },
      { label: "Blood Pressure", value: "158/96" },
      { label: "Temp", value: "36.9°C" },
    ],
    riskContributors: [
      { label: "Blood pressure fluctuation", weight: 41 },
      { label: "Missed antihypertensive dose", weight: 29 },
      { label: "Elevated stress indicators", weight: 18 },
      { label: "Sodium intake (dietary log)", weight: 12 },
    ],
    relevantFactors: [
      "History of hypertension",
      "Dose adjustment 3 days ago",
      "No prior cardiac events",
    ],
    recommendedFollowUp:
      "Recheck blood pressure in 15 minutes. Confirm medication administration and escalate if reading remains above threshold.",
    timeline: [
      { id: "t1", label: "BP reading 158/96", time: "15 min ago", isLatest: true },
      { id: "t2", label: "Antihypertensive dose delayed", time: "3 hr ago" },
      { id: "t3", label: "Routine vitals check", time: "6 hr ago" },
    ],
  },
  "PT-1099": {
    patientId: "PT-1099",
    age: 81,
    sex: "Female",
    room: "Med-Surg 208",
    attendingClinician: "Dr. R. Owusu",
    vitals: [
      { label: "SpO2", value: "96%" },
      { label: "Heart Rate", value: "76 bpm" },
      { label: "Blood Pressure", value: "132/84" },
      { label: "Temp", value: "37.0°C" },
    ],
    riskContributors: [
      { label: "Missed medication doses (2)", weight: 48 },
      { label: "Mild confusion noted on rounds", weight: 22 },
      { label: "Age-related fall risk", weight: 20 },
      { label: "Sleep disruption", weight: 10 },
    ],
    relevantFactors: [
      "Age 81",
      "Lives alone, discharge planning in progress",
      "Mild cognitive impairment noted",
    ],
    recommendedFollowUp:
      "Administer missed medication dose and document. Reassess fall-risk precautions before next mobility attempt.",
    timeline: [
      { id: "t1", label: "Evening medication missed", time: "30 min ago", isLatest: true },
      { id: "t2", label: "Confusion noted during rounds", time: "2 hr ago" },
      { id: "t3", label: "Morning medication administered", time: "8 hr ago" },
    ],
  },
  "PT-5521": {
    patientId: "PT-5521",
    age: 45,
    sex: "Male",
    room: "Med-Surg 112",
    attendingClinician: "Dr. R. Owusu",
    vitals: [
      { label: "SpO2", value: "99%" },
      { label: "Heart Rate", value: "70 bpm" },
      { label: "Blood Pressure", value: "118/76" },
      { label: "Temp", value: "36.7°C" },
    ],
    riskContributors: [
      { label: "No active risk indicators", weight: 12 },
      { label: "Baseline vitals stable", weight: 0 },
    ],
    relevantFactors: ["Scheduled for discharge", "No acute complaints"],
    recommendedFollowUp:
      "Continue routine monitoring through end of shift. No escalation required at this time.",
    timeline: [
      { id: "t1", label: "Routine vitals check - stable", time: "1 hr ago", isLatest: true },
      { id: "t2", label: "Discharge paperwork started", time: "3 hr ago" },
      { id: "t3", label: "Morning rounds - stable", time: "6 hr ago" },
    ],
  },
};

export function getPatientDetail(patientId: string): PatientDetail | undefined {
  return patientDetails[patientId];
}
