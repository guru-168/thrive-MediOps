import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { Card } from "../ui/Card";
import { SeverityBadge } from "./SeverityBadge";
import { RiskContributorBar } from "./RiskContributorBar";
import { EventTimeline } from "./EventTimeline";
import type { Patient } from "../../types/patient";
import type { PatientDetail } from "../../types/patientDetail";

export interface PatientDetailDrawerProps {
  patient: Patient | null;
  detail: PatientDetail | null;
  onClose: () => void;
}

/**
 * Slide-in detail panel opened from a patient queue row. Built entirely
 * from existing design-system primitives (Card, SeverityBadge, the
 * DESIGN.md-specified Risk Contribution Bars and Timeline) rather than
 * new visual language.
 */
export function PatientDetailDrawer({ patient, detail, onClose }: PatientDetailDrawerProps) {
  const isOpen = patient !== null && detail !== null;
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Keep the last-shown patient/detail cached so the panel can render its
  // outgoing content while it slides off-screen, instead of going blank
  // the instant `patient` clears. Adjusted synchronously during render
  // (React's supported pattern for deriving state from props) rather
  // than in an effect, which would cost an extra render pass.
  const [cached, setCached] = useState<{ patient: Patient; detail: PatientDetail } | null>(null);
  if (patient && detail && cached?.patient.id !== patient.id) {
    setCached({ patient, detail });
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
  const { patient: p, detail: d } = cached;
  const isCritical = p.severity === "critical";

  return (
    <>
      <div
        className={clsx(
          // z-[60]: must sit above SideNav's z-50 (also `fixed`) so an outside click
          // over the sidebar area is caught by the backdrop instead of the nav underneath.
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
        aria-label={`Patient detail for ${p.name}`}
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
              {d.age} {d.sex} &middot; Room {d.room} &middot; {d.attendingClinician}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close patient detail"
            className="shrink-0 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full p-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline focus-visible:ring-offset-1"
          >
            <MaterialSymbol name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-stack-md flex flex-col gap-stack-lg">
          <section className="flex items-center justify-between">
            <div>
              <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                Risk score
              </p>
              <p
                className={clsx(
                  "font-display-lg text-display-lg leading-none mt-1",
                  isCritical ? "text-error" : "text-on-surface",
                )}
              >
                {p.riskScore}%
              </p>
            </div>
            <SeverityBadge severity={p.severity} />
          </section>

          <section className="grid grid-cols-2 gap-x-stack-md gap-y-stack-sm">
            {d.vitals.map((vital) => (
              <div key={vital.label}>
                <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  {vital.label}
                </p>
                <p className="font-data-mono text-data-mono text-on-surface mt-0.5">
                  {vital.value}
                </p>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-stack-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Key contributors
            </h3>
            <div className="flex flex-col gap-stack-sm">
              {d.riskContributors.map((contributor) => (
                <RiskContributorBar
                  key={contributor.label}
                  label={contributor.label}
                  weight={contributor.weight}
                  tone={isCritical ? "critical" : "neutral"}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-stack-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Relevant factors
            </h3>
            <div className="flex flex-wrap gap-2">
              {d.relevantFactors.map((factor) => (
                <span
                  key={factor}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-on-surface-variant border border-outline-variant"
                >
                  {factor}
                </span>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-stack-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Recommended follow-up
            </h3>
            <Card tone={isCritical ? "critical" : "default"} className="p-stack-sm">
              <p
                className={clsx(
                  "font-body-sm text-body-sm",
                  isCritical ? "text-error" : "text-on-surface",
                )}
              >
                {d.recommendedFollowUp}
              </p>
            </Card>
          </section>

          <section className="flex flex-col gap-stack-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Recent activity
            </h3>
            <EventTimeline events={d.timeline} />
          </section>
        </div>
      </aside>
    </>
  );
}
