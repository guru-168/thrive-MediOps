import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { RiskLevelBadge } from "../ui/RiskLevelBadge";
import type { PregnantPatient } from "../../types/prenatal";

export type SortKey = "name" | "gestationalAgeWeeks" | "riskLevel";
export type SortDirection = "asc" | "desc";

export interface PatientDirectoryTableProps {
  patients: PregnantPatient[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onSelectPatient: (id: string) => void;
}

const SORTABLE_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "gestationalAgeWeeks", label: "Gestational Age" },
  { key: "riskLevel", label: "Risk Status" },
];

/** Patients directory table - search/filter/sort state lives in
 * PatientsPage; this component is purely presentational + row/header
 * interaction callbacks. */
export function PatientDirectoryTable({
  patients,
  sortKey,
  sortDirection,
  onSort,
  onSelectPatient,
}: PatientDirectoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low/50">
            <th className="py-stack-sm px-stack-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-normal">
              Patient ID
            </th>
            {SORTABLE_COLUMNS.map((col) => (
              <th key={col.key} className="py-stack-sm px-stack-md">
                <button
                  type="button"
                  onClick={() => onSort(col.key)}
                  className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-normal hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:text-on-surface"
                >
                  {col.label}
                  <MaterialSymbol
                    name={sortKey === col.key && sortDirection === "asc" ? "arrow_upward" : "arrow_downward"}
                    className={clsx("!text-sm transition-opacity", sortKey === col.key ? "opacity-100" : "opacity-0")}
                  />
                </button>
              </th>
            ))}
            <th className="py-stack-sm px-stack-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-normal">
              Primary Concern
            </th>
            <th className="py-stack-sm px-stack-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-normal">
              Last Assessment
            </th>
            <th className="py-stack-sm px-stack-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-normal">
              Next Follow-up
            </th>
            <th className="py-stack-sm px-stack-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-normal text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
          {patients.length === 0 && (
            <tr>
              <td colSpan={7} className="py-stack-lg px-stack-md text-center text-on-surface-variant">
                No patients match your search or filters.
              </td>
            </tr>
          )}
          {patients.map((patient) => (
            <tr
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className="hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <td className="py-stack-sm px-stack-md font-data-mono text-data-mono text-on-surface-variant">
                {patient.id}
              </td>
              <td className="py-stack-sm px-stack-md">
                <div className="font-medium">{patient.name}</div>
                <div className="font-data-mono text-data-mono text-on-surface-variant">
                  Age {patient.age}
                </div>
              </td>
              <td className="py-stack-sm px-stack-md font-data-mono text-data-mono">
                {patient.gestationalAgeWeeks}w
              </td>
              <td className="py-stack-sm px-stack-md">
                <RiskLevelBadge level={patient.riskLevel} />
              </td>
              <td className="py-stack-sm px-stack-md text-on-surface-variant max-w-[220px] truncate">
                {patient.primaryConcern}
              </td>
              <td className="py-stack-sm px-stack-md text-on-surface-variant">
                {new Date(patient.lastAssessmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </td>
              <td className="py-stack-sm px-stack-md text-on-surface-variant">
                {patient.nextFollowUpDate
                  ? new Date(patient.nextFollowUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "—"}
              </td>
              <td className="py-stack-sm px-stack-md text-right">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectPatient(patient.id);
                  }}
                  className="text-on-surface-variant hover:text-on-surface transition-colors font-medium hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
