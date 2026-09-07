/**
 * Extended per-patient detail shown in the patient-detail drawer. Separate
 * from the lightweight `Patient` row type (used by the queue table) since
 * this is only ever loaded for one patient at a time.
 *
 * The shapes here map directly onto two components DESIGN.md already
 * specs but that the reference screen never used ("Risk Contribution
 * Bars" and "Timelines") - the drawer is built from those existing
 * design-system primitives rather than inventing new visual language.
 */

/** One weighted factor behind a patient's risk score, rendered as a bar. */
export interface RiskContributor {
  label: string;
  /** Contribution weight, 0-100. */
  weight: number;
}

/** A vertical timeline entry (DESIGN.md's "Timelines" component). */
export interface TimelineEvent {
  id: string;
  label: string;
  time: string;
  /** Most recent event gets the emphasized node treatment. */
  isLatest?: boolean;
}

export interface PatientDetail {
  /** Foreign key into Patient.id. */
  patientId: string;
  age: number;
  sex: "Female" | "Male";
  room: string;
  attendingClinician: string;
  vitals: { label: string; value: string }[];
  riskContributors: RiskContributor[];
  /** Contextual clinical flags - informational, not weighted like riskContributors. */
  relevantFactors: string[];
  recommendedFollowUp: string;
  timeline: TimelineEvent[];
}
