import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { RiskLevelBadge } from "../ui/RiskLevelBadge";
import type { PatientClinicalRecord, PregnantPatient } from "../../types/prenatal";

export interface PatientRecordDrawerProps {
  patient: PregnantPatient | null;
  record: PatientClinicalRecord | null;
  onClose: () => void;
  onStartAssessment: (patientId: string) => void;
}

/**
 * Slide-in detail panel for the prenatal patient directory (Patients page
 * and, by reuse, the Follow-ups page's row click). Same structural
 * pattern as Overview's PatientDetailDrawer (backdrop + aside, focus
 * trap/restore, Escape-to-close, elevated z-index so an outside click
 * over the fixed sidebar still dismisses it) but built fresh for the
 * prenatal domain rather than reusing that Overview-only component.
 */
export function PatientRecordDrawer({
  patient,
  record,
  onClose,
  onStartAssessment,
}: PatientRecordDrawerProps) {
  const isOpen = patient !== null && record !== null;
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const [cached, setCached] = useState<{ patient: PregnantPatient; record: PatientClinicalRecord } | null>(
    null,
  );
  if (patient && record && cached?.patient.id !== patient.id) {
    setCached({ patient, record });
  }

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      previouslyFocused.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!cached) return null;
  const { patient: p, record: r } = cached;

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 bg-inverse-surface/40 z-[60] transition-opacity duration-300 ease-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Patient record for ${p.name}`}
        className={clsx(
          "fixed right-0 top-0 h-screen w-full sm:w-[440px] max-w-full bg-surface-container-lowest border-l border-outline-variant z-[70] flex flex-col shadow-lg transition-transform duration-300 ease-out focus:outline-none",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-stack-md p-stack-md border-b border-outline-variant">
          <div className="min-w-0">
            <p className="font-data-mono text-data-mono text-on-surface-variant">{p.id}</p>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
              {p.name}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {p.age} yrs &middot; {p.gestationalAgeWeeks}w gestation &middot; {p.gravidaPara}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close patient record"
            className="shrink-0 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full p-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline focus-visible:ring-offset-1"
          >
            <MaterialSymbol name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-stack-md flex flex-col gap-stack-lg">
          <section className="flex items-center justify-between">
            <div>
              <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                Risk status
              </p>
              <p className="font-body-sm text-body-sm text-on-surface mt-1 max-w-[240px]">
                {p.primaryConcern}
              </p>
            </div>
            <RiskLevelBadge level={p.riskLevel} className="text-xs px-2.5 py-1" />
          </section>

          <section className="grid grid-cols-2 gap-x-stack-md gap-y-stack-sm">
            <Field label="Blood Pressure" value={r.bloodPressure} />
            <Field label="BMI" value={r.bmi.toFixed(1)} />
            <Field label="Due Date" value={new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
            <Field label="Attending Clinician" value={p.assignedClinician} />
          </section>

          {r.priorPregnancyComplications.length > 0 && (
            <section className="flex flex-col gap-stack-sm">
              <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                Prior Pregnancy Complications
              </h3>
              <div className="flex flex-wrap gap-2">
                {r.priorPregnancyComplications.map((factor) => (
                  <span
                    key={factor}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-on-surface-variant border border-outline-variant"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-stack-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Current Pregnancy Notes
            </h3>
            <Card className="p-stack-sm">
              <p className="font-body-sm text-body-sm text-on-surface">{r.currentPregnancyNotes}</p>
            </Card>
          </section>

          <section className="flex flex-col gap-stack-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Assessment History
            </h3>
            <div className="flex flex-col">
              {r.assessmentHistory.map((entry, index) => (
                <div key={entry.id} className="flex gap-stack-sm">
                  <div className="flex flex-col items-center">
                    <span
                      className={clsx(
                        "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0",
                        index === 0 ? "bg-on-surface" : "bg-surface-container-highest border border-outline-variant",
                      )}
                    />
                    {index < r.assessmentHistory.length - 1 && (
                      <span className="w-0.5 flex-1 bg-outline-variant" />
                    )}
                  </div>
                  <div className="pb-stack-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-body-sm text-body-sm font-medium text-on-surface">
                        {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <RiskLevelBadge level={entry.riskLevel} />
                      <span className="font-data-mono text-data-mono text-on-surface-variant">
                        {entry.riskScore}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {entry.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-stack-md border-t border-outline-variant">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => onStartAssessment(p.id)}
          >
            Start Risk Assessment
          </Button>
        </div>
      </aside>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="font-data-mono text-data-mono text-on-surface mt-0.5">{value}</p>
    </div>
  );
}
