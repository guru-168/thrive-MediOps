import type { FollowUpTask } from "../types/followUp";

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
 *
 * `riskLevel` here is a static, human-set task priority tag (an
 * operational scheduling label), independent from the live ML/rule-based
 * prediction shown elsewhere for the same patient - it is never
 * presented as an AI output.
 */
export const followUpTasks: FollowUpTask[] = [
  {
    id: "fu-1",
    patientId: "MB-1267",
    patientName: "Olivia Bennett",
    riskLevel: "high",
    reason: "11 missed appointments - priority outreach before next dialysis visit",
    dueAt: offset(-3 * HOUR),
    priority: "high",
    completed: false,
  },
  {
    id: "fu-2",
    patientId: "MB-0987",
    patientName: "Elena Voss",
    riskLevel: "high",
    reason: "Long commute + rising missed-visit rate - confirm attendance by phone",
    dueAt: offset(-1 * DAY),
    priority: "high",
    completed: false,
  },
  {
    id: "fu-3",
    patientId: "MB-1042",
    patientName: "Amara Chen",
    riskLevel: "high",
    reason: "2 consecutive missed visits in July - reminder call before next appointment",
    dueAt: offset(45 * 60 * 1000),
    priority: "high",
    completed: false,
  },
  {
    id: "fu-4",
    patientId: "MB-1155",
    patientName: "Wei Lin",
    riskLevel: "moderate",
    reason: "Weekly visit schedule - check in on transport arrangements",
    dueAt: offset(3 * HOUR),
    priority: "medium",
    completed: false,
  },
  {
    id: "fu-5",
    patientId: "MB-1301",
    patientName: "Sofia Marino",
    riskLevel: "moderate",
    reason: "3 of 10 appointments missed - confirm next cardiac rehab session",
    dueAt: offset(6 * HOUR),
    priority: "medium",
    completed: false,
  },
  {
    id: "fu-6",
    patientId: "MB-1188",
    patientName: "Naomi Kessler",
    riskLevel: "moderate",
    reason: "Send appointment reminder ahead of biweekly check-in",
    dueAt: offset(1 * DAY),
    priority: "medium",
    completed: false,
  },
  {
    id: "fu-7",
    patientId: "MB-1108",
    patientName: "Priya Natarajan",
    riskLevel: "moderate",
    reason: "One early missed visit - confirm continued engagement",
    dueAt: offset(2 * DAY),
    priority: "medium",
    completed: false,
  },
  {
    id: "fu-8",
    patientId: "MB-0942",
    patientName: "Isabella Rossi",
    riskLevel: "low",
    reason: "Routine physical therapy reminder",
    dueAt: offset(1.5 * DAY),
    priority: "low",
    completed: false,
  },
  {
    id: "fu-9",
    patientId: "MB-1223",
    patientName: "Grace Adeyemi",
    riskLevel: "low",
    reason: "Routine post-op check-in scheduling",
    dueAt: offset(4 * DAY),
    priority: "low",
    completed: false,
  },
  {
    id: "fu-10",
    patientId: "MB-1019",
    patientName: "Fatima Al-Rashid",
    riskLevel: "low",
    reason: "Standard reminder ahead of next chronic-care check-in",
    dueAt: offset(5 * DAY),
    priority: "low",
    completed: false,
  },
  {
    id: "fu-11",
    patientId: "MB-0876",
    patientName: "Hannah Whitfield",
    riskLevel: "low",
    reason: "Physical therapy intake follow-up",
    dueAt: offset(-2 * DAY),
    priority: "low",
    completed: true,
  },
  {
    id: "fu-12",
    patientId: "MB-1340",
    patientName: "Camila Torres",
    riskLevel: "low",
    reason: "Post-op wound check confirmation",
    dueAt: offset(-4 * HOUR),
    priority: "low",
    completed: true,
  },
];
