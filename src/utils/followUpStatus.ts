import type { FollowUpStatus, FollowUpTask } from "../types/followUp";

const HOUR = 60 * 60 * 1000;

/** Buckets a task into overdue/due/upcoming/completed relative to now.
 * Computed on read (not stored) so the bucket is always correct even as
 * time passes during a session. */
export function getFollowUpStatus(task: FollowUpTask, now: number = Date.now()): FollowUpStatus {
  if (task.completed) return "completed";
  const dueTime = new Date(task.dueAt).getTime();
  if (dueTime < now) return "overdue";
  if (dueTime - now <= 24 * HOUR) return "due";
  return "upcoming";
}

export function formatDueAt(dueAt: string): string {
  const date = new Date(dueAt);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
