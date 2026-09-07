import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { Select } from "../components/ui/Select";
import { Card } from "../components/ui/Card";
import { ErrorBanner, LoadingBanner } from "../components/ui/AsyncState";
import {
  PatientDirectoryTable,
  type SortDirection,
  type SortKey,
} from "../components/patients/PatientDirectoryTable";
import { PatientRecordDrawer } from "../components/patients/PatientRecordDrawer";
import { followUpPatients } from "../data/followUpPatients";
import { getPatientFollowUpRecord } from "../data/followUpPatientDetails";
import { useFollowUpRiskPredictions } from "../hooks/useFollowUpRiskPredictions";
import type { DashboardOutletContext } from "../components/layout/AppShell";
import type { RiskLevel } from "../types/followUp";

const RISK_LEVEL_ORDER: Record<RiskLevel, number> = { high: 0, moderate: 1, low: 2 };

function matchesSearch(name: string, id: string, query: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return name.toLowerCase().includes(needle) || id.toLowerCase().includes(needle);
}

/**
 * Patient records screen: the directory of follow-up patients, with
 * search, risk-level filtering, sortable columns, and a detail drawer.
 * Owns only patient-record concerns - risk assessment inputs live on
 * the dedicated Risk Assessment page, follow-up scheduling lives on
 * Follow-ups, per the information-architecture rule.
 *
 * Risk level/score shown anywhere on this page always comes from the
 * live `/patients/rank` prediction (useFollowUpRiskPredictions) - never
 * from static mock data.
 */
export function PatientsPage() {
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext<DashboardOutletContext>();
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("riskLevel");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { predictions, loading, error, refetch } = useFollowUpRiskPredictions();

  const patients = useMemo(() => {
    const filtered = followUpPatients.filter((p) => {
      if (!matchesSearch(p.name, p.id, searchQuery)) return false;
      if (riskFilter === "all") return true;
      return predictions?.get(p.id)?.riskLevel === riskFilter;
    });
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "missedAppointments") cmp = a.missedAppointments - b.missedAppointments;
      else if (sortKey === "riskLevel") {
        const aLevel = predictions?.get(a.id)?.riskLevel;
        const bLevel = predictions?.get(b.id)?.riskLevel;
        cmp = (aLevel ? RISK_LEVEL_ORDER[aLevel] : 99) - (bLevel ? RISK_LEVEL_ORDER[bLevel] : 99);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [searchQuery, riskFilter, sortKey, sortDirection, predictions]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const selectedPatient = selectedPatientId
    ? (followUpPatients.find((p) => p.id === selectedPatientId) ?? null)
    : null;
  const selectedRecord = selectedPatientId
    ? (getPatientFollowUpRecord(selectedPatientId) ?? null)
    : null;
  const selectedPrediction = selectedPatientId ? (predictions?.get(selectedPatientId) ?? null) : null;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          Patient Directory
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {followUpPatients.length} patients under active follow-up care. Search, filter, and open a
          record to review appointment history or start a new risk assessment.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {loading && !error && <LoadingBanner />}

      <Card as="section" className="overflow-hidden flex flex-col">
        <div className="p-stack-md border-b border-outline-variant bg-surface flex flex-wrap items-center justify-between gap-stack-sm">
          <h3 className="font-title-lg text-title-lg text-on-surface">All Patients</h3>
          <div className="flex items-center gap-stack-sm">
            {searchQuery.trim() && (
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Filtering by "{searchQuery.trim()}" (top bar search)
              </span>
            )}
            <Select
              aria-label="Filter by risk level"
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value as RiskLevel | "all")}
              disabled={!predictions}
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="low">Low Risk</option>
            </Select>
          </div>
        </div>

        <PatientDirectoryTable
          patients={patients}
          predictions={predictions}
          predictionsErrored={Boolean(error)}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSelectPatient={setSelectedPatientId}
        />
      </Card>

      <PatientRecordDrawer
        patient={selectedPatient}
        record={selectedRecord}
        prediction={selectedPrediction}
        onClose={() => setSelectedPatientId(null)}
        onStartAssessment={(patientId) => {
          setSelectedPatientId(null);
          navigate(`/risk-assessment?patientId=${patientId}`);
        }}
      />
    </>
  );
}
