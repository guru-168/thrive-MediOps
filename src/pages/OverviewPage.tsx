import { useCallback, useMemo, useState } from "react";
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
import { buildClinicalReportHtml } from "../utils/clinicalReport";
import { useAuth } from "../context/AuthContext";
import { displayNameFor } from "../types/profile";
import type { ReportStatus } from "../components/dashboard/RiskDistributionPanel";
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
  const { profile } = useAuth();
  const [reportStatus, setReportStatus] = useState<ReportStatus>("idle");
  const [reportError, setReportError] = useState<string | null>(null);

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

  /**
   * Builds the printable report from this page's live state - the same
   * `queue`, `riskDistribution` and `counts` objects rendered on screen,
   * so the report can never disagree with the dashboard. No network call
   * and no re-scoring: the risk numbers were produced by the backend's
   * /patients/rank response and are passed through untouched.
   */
  const handleGenerateReport = useCallback(() => {
    if (!predictions || !counts) return;
    setReportStatus("generating");
    setReportError(null);
    try {
      const html = buildClinicalReportHtml({
        generatedAt: new Date(),
        queue,
        distribution: riskDistribution,
        interventionsRequired: counts.interventionsRequired,
        // Reported, never assumed - whichever adapter actually scored these rows.
        modelType: predictions.values().next().value?.modelType ?? null,
        preparedBy: profile ? displayNameFor(profile) : null,
      });

      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      const opened = window.open(url, "_blank", "noopener");
      if (!opened) {
        // Popup blocked - fall back to a download so the click still
        // produces the report rather than silently doing nothing.
        const link = document.createElement("a");
        link.href = url;
        link.download = `mediops-risk-report-${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      // The new tab/download reads the blob synchronously; revoking on the
      // next macrotask frees the memory without racing that read.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);

      setReportStatus("ready");
      window.setTimeout(() => setReportStatus((s) => (s === "ready" ? "idle" : s)), 4000);
    } catch (err) {
      setReportStatus("error");
      setReportError(
        err instanceof Error
          ? `Could not generate the report: ${err.message}`
          : "Could not generate the report. Please try again.",
      );
    }
  }, [predictions, counts, queue, riskDistribution, profile]);

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
          onGenerateReport={predictions && counts ? handleGenerateReport : null}
          reportStatus={reportStatus}
          reportError={reportError}
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
