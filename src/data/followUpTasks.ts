import type { FollowUpTask } from "../types/prenatal";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** ISO datetime offset from "now" by the given number of milliseconds. */
function offset(ms: number): string {
  return new Date(Date.now() + ms).toISOString();
}

/**
 * Mock follow-up task list, seeded with due dates computed relative to
 * the current time so overdue/due/upcoming buckets are realistic
 * whenever this runs rather than hard-coded to a fixed calendar date.
 * Frontend-only, in-memory - FollowUpsPage owns mutable state seeded
 * from this array (marking one complete doesn't persist across reload).
 */
export const followUpTasks: FollowUpTask[] = [
  {
    id: "fu-1",
    patientId: "MB-1267",
    patientName: "Olivia Bennett",
    riskLevel: "high",
    reason: "Severe-range blood pressure recheck",
    dueAt: offset(-3 * HOUR),
    priority: "high",
    completed: false,
  },
  {
    id: "fu-2",
    patientId: "MB-0987",
    patientName: "Elena Voss",
    riskLevel: "high",
    reason: "Chronic hypertension medication review",
    dueAt: offset(-1 * DAY),
    priority: "high",
    completed: false,
  },
  {
    id: "fu-3",
    patientId: "MB-1042",
    patientName: "Amara Chen",
    riskLevel: "high",
    reason: "Proteinuria screen result review",
    dueAt: offset(45 * 60 * 1000),
    priority: "high",
    completed: false,
  },
  {
    id: "fu-4",
    patientId: "MB-1155",
    patientName: "Wei Lin",
    riskLevel: "moderate",
    reason: "Twin growth scan follow-up",
    dueAt: offset(3 * HOUR),
    priority: "medium",
    completed: false,
  },
  {
    id: "fu-5",
    patientId: "MB-1108",
    patientName: "Priya Natarajan",
    riskLevel: "moderate",
    reason: "3-hour glucose tolerance test review",
    dueAt: offset(6 * HOUR),
    priority: "medium",
    completed: false,
  },
  {
    id: "fu-6",
    patientId: "MB-1188",
    patientName: "Naomi Kessler",
    riskLevel: "moderate",
    reason: "Aspirin prophylaxis compliance check",
    dueAt: offset(1 * DAY),
    priority: "medium",
    completed: false,
  },
  {
    id: "fu-7",
    patientId: "MB-1301",
    patientName: "Sofia Marino",
    riskLevel: "moderate",
    reason: "Cervical length ultrasound",
    dueAt: offset(2 * DAY),
    priority: "medium",
    completed: false,
  },
  {
    id: "fu-8",
    patientId: "MB-0942",
    patientName: "Isabella Rossi",
    riskLevel: "low",
    reason: "Term induction planning discussion",
    dueAt: offset(1.5 * DAY),
    priority: "low",
    completed: false,
  },
  {
    id: "fu-9",
    patientId: "MB-1223",
    patientName: "Grace Adeyemi",
    riskLevel: "low",
    reason: "Routine 16-week check-in",
    dueAt: offset(4 * DAY),
    priority: "low",
    completed: false,
  },
  {
    id: "fu-10",
    patientId: "MB-1019",
    patientName: "Fatima Al-Rashid",
    riskLevel: "low",
    reason: "Anatomy scan scheduling",
    dueAt: offset(5 * DAY),
    priority: "low",
    completed: false,
  },
  {
    id: "fu-11",
    patientId: "MB-0876",
    patientName: "Hannah Whitfield",
    riskLevel: "low",
    reason: "First trimester screening panel",
    dueAt: offset(-2 * DAY),
    priority: "low",
    completed: true,
  },
  {
    id: "fu-12",
    patientId: "MB-1340",
    patientName: "Camila Torres",
    riskLevel: "low",
    reason: "Confirmatory dating ultrasound",
    dueAt: offset(-4 * HOUR),
    priority: "low",
    completed: true,
  },
];
