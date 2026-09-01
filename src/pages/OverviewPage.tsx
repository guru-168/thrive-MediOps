import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MetricCardsRow } from "../components/dashboard/MetricCardsRow";
import { PatientQueueTable } from "../components/dashboard/PatientQueueTable";
import { RiskDistributionPanel } from "../components/dashboard/RiskDistributionPanel";
import { PatientDetailDrawer } from "../components/dashboard/PatientDetailDrawer";
import { patientQueue } from "../data/mockPatients";
import { getPatientDetail } from "../data/patientDetails";
import type { DashboardOutletContext } from "../components/layout/AppShell";
import type { SeverityFilter } from "../types/patient";

function matchesSearch(name: string, id: string, query: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return name.toLowerCase().includes(needle) || id.toLowerCase().includes(needle);
}

/** "Clinical Dashboard / Overview" screen - the only fully designed screen in the reference. */
export function OverviewPage() {
  const { searchQuery } = useOutletContext<DashboardOutletContext>();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [hoveredSeverity, setHoveredSeverity] = useState<SeverityFilter | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const filteredPatients = useMemo(
    () =>
      patientQueue.filter(
        (patient) =>
          matchesSearch(patient.name, patient.id, searchQuery) &&
          (severityFilter === "all" || patient.severity === severityFilter),
      ),
    [searchQuery, severityFilter],
  );

  const selectedPatient = selectedPatientId
    ? (patientQueue.find((p) => p.id === selectedPatientId) ?? null)
    : null;
  const selectedDetail = selectedPatientId ? (getPatientDetail(selectedPatientId) ?? null) : null;

  return (
    <>
      <MetricCardsRow activeSeverity={severityFilter} onSeverityChange={setSeverityFilter} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        <PatientQueueTable
          patients={filteredPatients}
          severityFilter={severityFilter}
          onSeverityFilterChange={setSeverityFilter}
          onSelectPatient={setSelectedPatientId}
        />
        <RiskDistributionPanel
          activeSeverity={severityFilter}
          hoveredSeverity={hoveredSeverity}
          onSeverityChange={setSeverityFilter}
          onHoverSeverity={setHoveredSeverity}
        />
      </div>
      <PatientDetailDrawer
        patient={selectedPatient}
        detail={selectedDetail}
        onClose={() => setSelectedPatientId(null)}
      />
    </>
  );
}
