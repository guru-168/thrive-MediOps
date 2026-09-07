export type AlertSeverity = "critical" | "elevated" | "info";

export interface ClinicalAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  /** Relative display time, e.g. "2 min ago". Static mock value, not live. */
  time: string;
  read: boolean;
  /** Optional link back to a patient row, e.g. "PT-9821". */
  patientId?: string;
}
