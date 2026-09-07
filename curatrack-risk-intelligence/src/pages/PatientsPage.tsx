import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { Select } from "../components/ui/Select";
import { Card } from "../components/ui/Card";
import {
  PatientDirectoryTable,
  type SortDirection,
  type SortKey,
} from "../components/patients/PatientDirectoryTable";
import { PatientRecordDrawer } from "../components/patients/PatientRecordDrawer";
import { prenatalPatients } from "../data/prenatalPatients";
import { getPatientClinicalRecord } from "../data/prenatalPatientDetails";
import type { DashboardOutletContext } from "../components/layout/AppShell";
import type { RiskLevel } from "../types/prenatal";

const RISK_LEVEL_ORDER: Record<RiskLevel, number> = { high: 0, moderate: 1, low: 2 };

function matchesSearch(name: string, id: string, query: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return name.toLowerCase().includes(needle) || id.toLowerCase().includes(needle);
}

/**
 * Patient records screen: the directory of pregnant patients, with
 * search, risk-level filtering, sortable columns, and a detail drawer.
 * Owns only patient-record concerns - risk assessment inputs live on
 * the dedicated Risk Assessment page, follow-up scheduling lives on
 * Follow-ups, per the information-architecture rule.
 */
export function PatientsPage() {
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext<DashboardOutletContext>();
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("riskLevel");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const patients = useMemo(() => {
    const filtered = prenatalPatients.filter(
      (p) =>
        matchesSearch(p.name, p.id, searchQuery) &&
        (riskFilter === "all" || p.riskLevel === riskFilter),
    );
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "gestationalAgeWeeks") cmp = a.gestationalAgeWeeks - b.gestationalAgeWeeks;
      else if (sortKey === "riskLevel") cmp = RISK_LEVEL_ORDER[a.riskLevel] - RISK_LEVEL_ORDER[b.riskLevel];
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [searchQuery, riskFilter, sortKey, sortDirection]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
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
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          Patient Directory
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {prenatalPatients.length} patients under active prenatal care. Search, filter, and open a
          record to review clinical history or start a new risk assessment.
        </p>
      </div>

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
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSelectPatient={setSelectedPatientId}
        />
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
