import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import clsx from "clsx";
import { Card } from "../components/ui/Card";
import { RiskLevelBadge } from "../components/ui/RiskLevelBadge";
import {
  FollowUpPriorityBadge,
  FollowUpStatusBadge,
} from "../components/ui/FollowUpStatusBadge";
import { MaterialSymbol } from "../components/icons/MaterialSymbol";
import { PatientRecordDrawer } from "../components/patients/PatientRecordDrawer";
import { followUpTasks as initialFollowUpTasks } from "../data/followUpTasks";
import { prenatalPatients } from "../data/prenatalPatients";
import { getPatientClinicalRecord } from "../data/prenatalPatientDetails";
import { formatDueAt, getFollowUpStatus } from "../utils/followUpStatus";
import type { DashboardOutletContext } from "../components/layout/AppShell";
import type { FollowUpStatus, FollowUpTask } from "../types/prenatal";

type StatusFilter = FollowUpStatus | "all";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "due", label: "Due Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

/**
 * Follow-up task tracking: overdue/due/upcoming/completed monitoring
 * tasks, independent of the full patient directory (Patients) and the
 * assessment workflow (Risk Assessment). Owns only scheduling/status
 * concerns per the information-architecture rule.
 */
export function FollowUpsPage() {
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext<DashboardOutletContext>();
  const [tasks, setTasks] = useState<FollowUpTask[]>(initialFollowUpTasks);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const withStatus = useMemo(
    () => tasks.map((task) => ({ task, status: getFollowUpStatus(task) })),
    [tasks],
  );

  const counts = useMemo(() => {
    const c: Record<FollowUpStatus, number> = { overdue: 0, due: 0, upcoming: 0, completed: 0 };
    for (const { status } of withStatus) c[status] += 1;
    return c;
  }, [withStatus]);

  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return withStatus
      .filter(({ status }) => statusFilter === "all" || status === statusFilter)
      .filter(
        ({ task }) => !needle || task.patientName.toLowerCase().includes(needle) || task.patientId.toLowerCase().includes(needle),
      )
      .sort((a, b) => new Date(a.task.dueAt).getTime() - new Date(b.task.dueAt).getTime());
  }, [withStatus, statusFilter, searchQuery]);

  function toggleComplete(taskId: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    );
  }

  const selectedPatient = selectedPatientId
    ? (prenatalPatients.find((p) => p.id === selectedPatientId) ?? null)
    : null;
  const selectedRecord = selectedPatientId
    ? (getPatientClinicalRecord(selectedPatientId) ?? null)
    : null;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Follow-ups</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Monitoring and reassessment tasks across all patients, grouped by urgency.
        </p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatTile
          label="Overdue"
          value={counts.overdue}
          icon="warning"
          critical
          active={statusFilter === "overdue"}
          onClick={() => setStatusFilter(statusFilter === "overdue" ? "all" : "overdue")}
        />
        <StatTile
          label="Due Today"
          value={counts.due}
          icon="today"
          active={statusFilter === "due"}
          onClick={() => setStatusFilter(statusFilter === "due" ? "all" : "due")}
        />
        <StatTile
          label="Upcoming"
          value={counts.upcoming}
          icon="event_upcoming"
          active={statusFilter === "upcoming"}
          onClick={() => setStatusFilter(statusFilter === "upcoming" ? "all" : "upcoming")}
        />
        <StatTile
          label="Completed"
          value={counts.completed}
          icon="check_circle"
          active={statusFilter === "completed"}
          onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
        />
      </section>

      <Card as="section" className="overflow-hidden flex flex-col">
        <div className="p-stack-md border-b border-outline-variant bg-surface flex flex-wrap items-center justify-between gap-stack-sm">
          <h3 className="font-title-lg text-title-lg text-on-surface">Follow-up Schedule</h3>
          <div className="flex items-center gap-1" role="tablist" aria-label="Filter by status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={statusFilter === tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={clsx(
                  "px-stack-sm py-1.5 rounded-full font-label-md text-label-md uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline",
                  statusFilter === tab.key
                    ? "bg-on-surface text-surface"
                    : "text-on-surface-variant hover:bg-surface-container-low",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-stack-md flex flex-col">
          {filtered.length === 0 && (
            <p className="py-stack-lg text-center font-body-sm text-body-sm text-on-surface-variant">
              No follow-ups match this filter.
            </p>
          )}
          {filtered.map(({ task, status }, index) => (
            <div key={task.id} className="flex gap-stack-sm">
              <div className="flex flex-col items-center">
                <span
                  className={clsx(
                    "w-2.5 h-2.5 rounded-full mt-4 shrink-0",
                    status === "overdue" && "bg-error",
                    status === "due" && "bg-on-surface",
                    status === "upcoming" && "bg-surface-container-highest border border-outline-variant",
                    status === "completed" && "bg-surface-container-highest border border-outline-variant",
                  )}
                />
                {index < filtered.length - 1 && <span className="w-0.5 flex-1 bg-outline-variant" />}
              </div>
              <div
                role="button"
                tabIndex={0}
                aria-label={`View record for ${task.patientName}`}
                onClick={() => setSelectedPatientId(task.patientId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedPatientId(task.patientId);
                  }
                }}
                className={clsx(
                  "flex-1 text-left flex flex-wrap items-center gap-x-stack-md gap-y-1 py-stack-sm pr-stack-sm rounded-sm transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:bg-surface-container-low cursor-pointer",
                  status === "completed" && "opacity-60",
                )}
              >
                <div className="min-w-[160px]">
                  <p className="font-body-sm text-body-sm font-medium text-on-surface">{task.patientName}</p>
                  <p className="font-data-mono text-data-mono text-on-surface-variant">{task.patientId}</p>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex-1 min-w-[180px]">
                  {task.reason}
                </p>
                <RiskLevelBadge level={task.riskLevel} />
                <FollowUpPriorityBadge priority={task.priority} />
                <span className="font-data-mono text-data-mono text-on-surface-variant min-w-[110px]">
                  {formatDueAt(task.dueAt)}
                </span>
                <FollowUpStatusBadge status={status} />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleComplete(task.id);
                  }}
                  className="inline-flex items-center gap-1 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  <MaterialSymbol
                    name={task.completed ? "check_box" : "check_box_outline_blank"}
                    className="!text-base"
                  />
                  {task.completed ? "Completed" : "Mark Complete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <PatientRecordDrawer
        patient={selectedPatient}
        record={selectedRecord}
        onClose={() => setSelectedPatientId(null)}
        onStartAssessment={(patientId) => {
          setSelectedPatientId(null);
          navigate(`/risk-assessment?patientId=${patientId}`);
        }}
      />
    </>
  );
}

function StatTile({
  label,
  value,
  icon,
  critical,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: string;
  critical?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      as="button"
      type="button"
      onClick={onClick}
      aria-pressed={active}
      tone={critical ? "critical" : "default"}
      className={clsx(
        "p-stack-md flex flex-col gap-stack-sm text-left transition-all duration-150 hover:border-outline active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline focus-visible:ring-offset-1 cursor-pointer",
        active && "ring-1 ring-inset ring-on-surface",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            "font-label-md text-label-md uppercase tracking-wider",
            critical ? "text-error" : "text-on-surface-variant",
          )}
        >
          {label}
        </span>
        <MaterialSymbol name={icon} className={critical ? "text-error" : "text-on-surface-variant"} />
      </div>
      <div className={clsx("font-display-lg text-display-lg", critical ? "text-error" : "text-on-surface")}>
        {value}
      </div>
    </Card>
  );
}
