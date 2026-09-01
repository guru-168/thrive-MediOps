import clsx from "clsx";
import { Card } from "../ui/Card";
import { SeverityBadge } from "./SeverityBadge";
import { RiskFilterMenu } from "./RiskFilterMenu";
import type { Patient, SeverityFilter } from "../../types/patient";

const COLUMNS = [
  { key: "id", label: "Patient ID", align: "left" },
  { key: "name", label: "Name", align: "left" },
  { key: "riskScore", label: "Risk Score", align: "right" },
  { key: "severity", label: "Severity", align: "center" },
  { key: "keyContributor", label: "Key Contributor", align: "left" },
  { key: "nextFollowUp", label: "Next Follow-up", align: "left" },
  { key: "action", label: "Action", align: "right" },
] as const;

export interface PatientQueueTableProps {
  patients: Patient[];
  severityFilter: SeverityFilter;
  onSeverityFilterChange: (value: SeverityFilter) => void;
  onSelectPatient: (id: string) => void;
}

/** "Prioritized Patient Queue" table - spans 2 of 3 columns on the lg grid. */
export function PatientQueueTable({
  patients,
  severityFilter,
  onSeverityFilterChange,
  onSelectPatient,
}: PatientQueueTableProps) {
  return (
    <Card as="section" className="lg:col-span-2 overflow-hidden flex flex-col">
      <div className="p-stack-md border-b border-outline-variant bg-surface flex items-center justify-between">
        <h3 className="font-title-lg text-title-lg text-on-surface">
          Prioritized Patient Queue
        </h3>
        <RiskFilterMenu value={severityFilter} onChange={onSeverityFilterChange} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low/50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    "py-stack-sm px-stack-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-normal",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
            {patients.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="py-stack-lg px-stack-md text-center text-on-surface-variant"
                >
                  No patients match your search or filter.
                </td>
              </tr>
            )}
            {patients.map((patient) => (
              <tr
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className="hover:bg-surface-container-low transition-colors group cursor-pointer"
              >
                <td className="py-stack-sm px-stack-md font-data-mono text-data-mono text-on-surface-variant">
                  {patient.id}
                </td>
                <td className="py-stack-sm px-stack-md font-medium">{patient.name}</td>
                <td
                  className={clsx(
                    "py-stack-sm px-stack-md text-right font-data-mono text-data-mono",
                    patient.isUrgent ? "text-error font-semibold" : "font-medium",
                  )}
                >
                  {patient.riskScore}%
                </td>
                <td className="py-stack-sm px-stack-md text-center">
                  <SeverityBadge severity={patient.severity} />
                </td>
                <td className="py-stack-sm px-stack-md text-on-surface-variant">
                  {patient.keyContributor}
                </td>
                <td
                  className={clsx(
                    "py-stack-sm px-stack-md",
                    patient.isUrgent
                      ? "text-error font-medium"
                      : "text-on-surface-variant",
                  )}
                >
                  {patient.nextFollowUp}
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

      <div className="p-stack-sm border-t border-outline-variant bg-surface flex items-center justify-center">
        <button
          type="button"
          onClick={() => onSeverityFilterChange("all")}
          disabled={severityFilter === "all"}
          className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors uppercase tracking-wider disabled:opacity-40 disabled:hover:text-on-surface disabled:cursor-default"
        >
          View All Patients
        </button>
      </div>
    </Card>
  );
}
