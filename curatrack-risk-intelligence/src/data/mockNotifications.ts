import type { ClinicalAlert } from "../types/notification";

/**
 * Mock clinical alerts for the notification panel. Frontend-only
 * placeholder - replace with a real alert feed when backend work begins.
 */
export const mockNotifications: ClinicalAlert[] = [
  {
    id: "n1",
    severity: "critical",
    title: "SpO2 critical drop",
    message: "Doe, Jonathan (PT-9821) desaturated to 88%. Immediate review required.",
    time: "2 min ago",
    read: false,
    patientId: "PT-9821",
  },
  {
    id: "n2",
    severity: "critical",
    title: "Arrhythmia detected",
    message: "Smith, Maria (PT-7442) flagged for irregular rhythm on telemetry.",
    time: "4 min ago",
    read: false,
    patientId: "PT-7442",
  },
  {
    id: "n3",
    severity: "elevated",
    title: "Blood pressure fluctuation",
    message: "Johnson, Robert (PT-3310) reading of 158/96 - recheck due in 15 minutes.",
    time: "15 min ago",
    read: false,
    patientId: "PT-3310",
  },
  {
    id: "n4",
    severity: "elevated",
    title: "Missed medication dose",
    message: "Williams, Sarah (PT-1099) evening dose not yet administered.",
    time: "30 min ago",
    read: true,
    patientId: "PT-1099",
  },
  {
    id: "n5",
    severity: "info",
    title: "Shift handoff report ready",
    message: "The end-of-shift risk summary for Ward 4 has been generated.",
    time: "1 hr ago",
    read: true,
  },
  {
    id: "n6",
    severity: "info",
    title: "Weekly analytics digest",
    message: "Risk trend report for the past 7 days is available to review.",
    time: "3 hr ago",
    read: true,
  },
];
