import { useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { MetricCardsRow } from "../components/dashboard/MetricCardsRow";
import { PatientQueueTable } from "../components/dashboard/PatientQueueTable";
import { RiskDistributionPanel } from "../components/dashboard/RiskDistributionPanel";
import { PatientRecordDrawer } from "../components/patients/PatientRecordDrawer";
import { ErrorBanner, LoadingBanner } from "../components/ui/AsyncState";
import { followUpPatients } from "../data/followUpPatients";
import { getPatientFollowUpRecord } from "../data/followUpPatientDetails";
import { useFollowUpRiskPredictions } from "../hooks/useFollowUpRiskPredictions";
import { buildQueue, buildRiskDistribution, countInterventions } from "../utils/overviewQueue";
import type { DashboardOutletContext } from "../components/layout/AppShell";
import type { SeverityFilter } from "../types/patient";

function matchesSearch(name: string, id: string, query: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return name.toLowerCase().includes(needle) || id.toLowerCase().includes(needle);
}

/**
 * "Clinical Dashboard / Overview" screen.
 *
 * Every number on this page - the four metric cards, the risk donut, and
 * every row of the Prioritized Patient Queue - comes from a single live
 * `POST /patients/rank` call (see hooks/useFollowUpRiskPredictions).
 * `data/followUpPatients.ts` supplies only the demographic/appointment
 * *inputs*; risk score, band, leading factor and the urgent flag are all
 * backend output. If that call fails the page shows an error with a
 * retry - it never falls back to static scores.
 */
export function OverviewPage() {
  const { searchQuery } = useOutletContext<DashboardOutletContext>();
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [hoveredSeverity, setHoveredSeverity] = useState<SeverityFilter | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { predictions, loading, error, refetch } = useFollowUpRiskPredictions();

  // Backend ranking order (highest risk first) is preserved - buildQueue
  // iterates the prediction map, which was built from the sorted response.
  const queue = useMemo(
    () => (predictions ? buildQueue(followUpPatients, predictions) : []),
    [predictions],
  );

  const filteredQueue = useMemo(
    () =>
      queue.filter(
        (row) =>
          matchesSearch(row.name, row.id, searchQuery) &&
          (severityFilter === "all" || row.severity === severityFilter),
      ),
    [queue, searchQuery, severityFilter],
  );

  const riskDistribution = useMemo(() => buildRiskDistribution(queue), [queue]);

  const counts = useMemo(() => {
    if (!predictions) return null;
    const bySeverity = (severity: string) => queue.filter((r) => r.severity === severity).length;
    return {
      totalMonitored: queue.length,
      highRisk: bySeverity("critical"),
      medRisk: bySeverity("elevated"),
      lowRisk: bySeverity("routine"),
      interventionsRequired: countInterventions(predictions),
    };
  }, [predictions, queue]);

  const selectedPatient = selectedPatientId
    ? (followUpPatients.find((p) => p.id === selectedPatientId) ?? null)
    : null;
  const selectedRecord = selectedPatientId
    ? (getPatientFollowUpRecord(selectedPatientId) ?? null)
    : null;
  const selectedPrediction = selectedPatientId
    ? (predictions?.get(selectedPatientId) ?? null)
    : null;

  return (
    <>
      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {loading && <LoadingBanner />}

      <MetricCardsRow
        activeSeverity={severityFilter}
        onSeverityChange={setSeverityFilter}
        counts={counts}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        <PatientQueueTable
          patients={filteredQueue}
          severityFilter={severityFilter}
          onSeverityFilterChange={setSeverityFilter}
          onSelectPatient={setSelectedPatientId}
        />
        <RiskDistributionPanel
          activeSeverity={severityFilter}
          hoveredSeverity={hoveredSeverity}
          onSeverityChange={setSeverityFilter}
          onHoverSeverity={setHoveredSeverity}
          riskDistribution={riskDistribution}
        />
      </div>
      <PatientRecordDrawer
        patient={selectedPatient}
        record={selectedRecord}
        prediction={selectedPrediction}
        onClose={() => setSelectedPatientId(null)}
        onStartAssessment={(patientId) => navigate(`/risk-assessment?patientId=${patientId}`)}
      />
    </>
  );
}
