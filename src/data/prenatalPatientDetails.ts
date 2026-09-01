import type { PatientClinicalRecord } from "../types/prenatal";

/**
 * Extended clinical record per patient, keyed by PregnantPatient.id.
 * Frontend-only mock - replace with a real per-patient fetch later.
 */
const records: Record<string, PatientClinicalRecord> = {
  "MB-1042": {
    patientId: "MB-1042",
    bloodPressure: "148/96",
    bmi: 31.2,
    gravidaPara: "G2P1",
    priorPregnancyComplications: ["Gestational hypertension (prior pregnancy)"],
    currentPregnancyNotes:
      "Trending blood pressure elevation over the last 3 visits. Proteinuria screen ordered.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-30", riskLevel: "high", riskScore: 78, summary: "BP 148/96, mild proteinuria" },
      { id: "a2", date: "2026-08-16", riskLevel: "moderate", riskScore: 58, summary: "BP trending upward" },
      { id: "a3", date: "2026-08-02", riskLevel: "low", riskScore: 24, summary: "Baseline, unremarkable" },
    ],
  },
  "MB-1108": {
    patientId: "MB-1108",
    bloodPressure: "118/76",
    bmi: 27.4,
    gravidaPara: "G1P0",
    priorPregnancyComplications: [],
    currentPregnancyNotes:
      "1-hour glucose challenge elevated; follow-up 3-hour GTT scheduled. No hypertension noted.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-28", riskLevel: "moderate", riskScore: 46, summary: "Glucose challenge elevated" },
      { id: "a2", date: "2026-08-01", riskLevel: "low", riskScore: 20, summary: "Baseline, unremarkable" },
    ],
  },
  "MB-0987": {
    patientId: "MB-0987",
    bloodPressure: "152/98",
    bmi: 29.8,
    gravidaPara: "G3P1",
    priorPregnancyComplications: ["Chronic hypertension", "Prior miscarriage (G1)"],
    currentPregnancyNotes:
      "Chronic hypertension on labetalol. Advanced maternal age (41). Growth scan shows appropriate fetal growth.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-29", riskLevel: "high", riskScore: 82, summary: "BP 152/98 on medication" },
      { id: "a2", date: "2026-08-15", riskLevel: "high", riskScore: 74, summary: "BP elevated, med dose adjusted" },
      { id: "a3", date: "2026-08-01", riskLevel: "moderate", riskScore: 61, summary: "Chronic HTN, stable" },
    ],
  },
  "MB-1223": {
    patientId: "MB-1223",
    bloodPressure: "112/70",
    bmi: 23.1,
    gravidaPara: "G1P0",
    priorPregnancyComplications: [],
    currentPregnancyNotes: "Uncomplicated first pregnancy. All screens within normal range.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-20", riskLevel: "low", riskScore: 14, summary: "Routine, unremarkable" },
    ],
  },
  "MB-1301": {
    patientId: "MB-1301",
    bloodPressure: "124/80",
    bmi: 26.6,
    gravidaPara: "G2P0",
    priorPregnancyComplications: ["Previous preterm birth (34 weeks)"],
    currentPregnancyNotes:
      "History of spontaneous preterm birth. On progesterone supplementation, cervical length monitoring.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-27", riskLevel: "moderate", riskScore: 52, summary: "Cervical length stable, monitoring continues" },
      { id: "a2", date: "2026-08-13", riskLevel: "moderate", riskScore: 55, summary: "Started progesterone supplementation" },
    ],
  },
  "MB-0876": {
    patientId: "MB-0876",
    bloodPressure: "108/68",
    bmi: 22.0,
    gravidaPara: "G1P0",
    priorPregnancyComplications: [],
    currentPregnancyNotes: "First trimester, dating scan confirmed. No concerns.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-15", riskLevel: "low", riskScore: 9, summary: "Dating scan, baseline labs unremarkable" },
    ],
  },
  "MB-1155": {
    patientId: "MB-1155",
    bloodPressure: "126/82",
    bmi: 28.9,
    gravidaPara: "G4P2",
    priorPregnancyComplications: ["Twin pregnancy - increased surveillance"],
    currentPregnancyNotes:
      "Dichorionic diamniotic twins. Growth discordance under 15%, biweekly growth scans.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-30", riskLevel: "moderate", riskScore: 49, summary: "Twin growth scan, discordance 12%" },
      { id: "a2", date: "2026-08-16", riskLevel: "moderate", riskScore: 47, summary: "Routine twin surveillance" },
    ],
  },
  "MB-1019": {
    patientId: "MB-1019",
    bloodPressure: "110/72",
    bmi: 24.5,
    gravidaPara: "G1P0",
    priorPregnancyComplications: [],
    currentPregnancyNotes: "Uncomplicated pregnancy, anatomy scan scheduled next visit.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-22", riskLevel: "low", riskScore: 12, summary: "Routine, unremarkable" },
    ],
  },
  "MB-1267": {
    patientId: "MB-1267",
    bloodPressure: "156/102",
    bmi: 33.4,
    gravidaPara: "G2P1",
    priorPregnancyComplications: ["Gestational hypertension (prior pregnancy)"],
    currentPregnancyNotes:
      "Severe range BP on two occasions this week. Inpatient monitoring protocol initiated, betamethasone given.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-31", riskLevel: "high", riskScore: 91, summary: "BP 156/102, severe range" },
      { id: "a2", date: "2026-08-24", riskLevel: "high", riskScore: 79, summary: "BP elevated, labs ordered" },
      { id: "a3", date: "2026-08-10", riskLevel: "moderate", riskScore: 55, summary: "Mild BP elevation noted" },
    ],
  },
  "MB-1340": {
    patientId: "MB-1340",
    bloodPressure: "104/66",
    bmi: 21.7,
    gravidaPara: "G1P0",
    priorPregnancyComplications: [],
    currentPregnancyNotes: "Early first trimester. Confirmatory ultrasound pending.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-18", riskLevel: "low", riskScore: 7, summary: "Intake visit, unremarkable" },
    ],
  },
  "MB-1188": {
    patientId: "MB-1188",
    bloodPressure: "122/78",
    bmi: 25.9,
    gravidaPara: "G2P1",
    priorPregnancyComplications: [],
    currentPregnancyNotes:
      "Mother had preeclampsia in her own birth history. Low-dose aspirin prophylaxis started at 14 weeks.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-26", riskLevel: "moderate", riskScore: 44, summary: "Aspirin prophylaxis, BP stable" },
      { id: "a2", date: "2026-08-12", riskLevel: "moderate", riskScore: 42, summary: "Family history flagged" },
    ],
  },
  "MB-0942": {
    patientId: "MB-0942",
    bloodPressure: "116/74",
    bmi: 24.0,
    gravidaPara: "G1P0",
    priorPregnancyComplications: [],
    currentPregnancyNotes: "Term pregnancy, cephalic presentation. Birth plan reviewed.",
    assessmentHistory: [
      { id: "a1", date: "2026-08-29", riskLevel: "low", riskScore: 15, summary: "Term check, unremarkable" },
      { id: "a2", date: "2026-08-15", riskLevel: "low", riskScore: 13, summary: "Routine, unremarkable" },
    ],
  },
};

export function getPatientClinicalRecord(patientId: string): PatientClinicalRecord | undefined {
  return records[patientId];
}
