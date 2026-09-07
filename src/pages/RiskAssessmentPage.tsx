import { useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { RiskLevelBadge } from "../components/ui/RiskLevelBadge";
import { MaterialSymbol } from "../components/icons/MaterialSymbol";
import { RiskContributorBar } from "../components/dashboard/RiskContributorBar";
import { followUpPatients } from "../data/followUpPatients";
import { predictRisk, ApiError } from "../services/api";
import type { PredictionFormInput, PredictionResult } from "../types/followUp";

const EMPTY_INPUT: PredictionFormInput = {
  patientId: null,
  patientName: "",
  age: null,
  gender: "F",
  neighbourhood: "JARDIM DA PENHA",
  scholarship: 0,
  hipertension: 0,
  diabetes: 0,
  alcoholism: 0,
  handcap: 0,
  smsReceived: 0,
  waitingTimeDays: 7,
  appointmentDayOfWeek: 2,
  appointmentMonth: 9,
  scheduledHour: 10,
  previousAppointments: null,
  previousNoShows: null,
  previousAttendanceRate: null,
  daysSincePreviousAppointment: 14,
  distanceKm: 10,
  treatmentDurationMonths: 6,
  appointmentFrequencyDays: 14,
  totalAppointments: null,
  missedAppointments: null,
};

function initialInputFromQuery(patientId: string | null): PredictionFormInput {
  if (!patientId) return EMPTY_INPUT;
  const patient = followUpPatients.find((p) => p.id === patientId);
  if (!patient) return EMPTY_INPUT;
  return {
    ...EMPTY_INPUT,
    patientId: patient.id,
    patientName: patient.name,
    age: patient.age,
    gender: (patient.gender as "M" | "F") || "F",
    neighbourhood: patient.neighbourhood || "JARDIM DA PENHA",
    scholarship: patient.scholarship ?? 0,
    hipertension: patient.hipertension ?? 0,
    diabetes: patient.diabetes ?? 0,
    alcoholism: patient.alcoholism ?? 0,
    handcap: patient.handcap ?? 0,
    smsReceived: patient.smsReceived ?? 0,
    waitingTimeDays: patient.waitingTimeDays ?? 7,
    appointmentDayOfWeek: patient.appointmentDayOfWeek ?? 2,
    appointmentMonth: patient.appointmentMonth ?? 9,
    scheduledHour: patient.scheduledHour ?? 10,
    previousAppointments: patient.previousAppointments ?? patient.totalAppointments,
    previousNoShows: patient.previousNoShows ?? patient.missedAppointments,
    daysSincePreviousAppointment:
      patient.daysSincePreviousAppointment ?? patient.appointmentFrequencyDays ?? 14,
    distanceKm: patient.distanceKm,
    treatmentDurationMonths: patient.treatmentDurationMonths,
    appointmentFrequencyDays: patient.appointmentFrequencyDays,
    totalAppointments: patient.totalAppointments,
    missedAppointments: patient.missedAppointments,
  };
}

type FieldErrors = Partial<
  Record<
    | "patientName"
    | "age"
    | "distanceKm"
    | "treatmentDurationMonths"
    | "appointmentFrequencyDays"
    | "totalAppointments"
    | "missedAppointments"
    | "waitingTimeDays",
    string
  >
>;

/**
 * The product's core workflow (PS-01): a staff member runs a follow-up
 * risk prediction for a patient and gets back a classification +
 * factor-grounded explanation from the backend. `predictRisk` (see
 * services/api.ts) is the only place this page touches the network -
 * on failure the page shows a clean error state and never falls back to
 * a fake result.
 */
export function RiskAssessmentPage() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState<PredictionFormInput>(() =>
    initialInputFromQuery(searchParams.get("patientId")),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState(false);

  function update<K extends keyof PredictionFormInput>(key: K, value: PredictionFormInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handlePatientSelect(patientId: string) {
    if (!patientId) {
      setInput(EMPTY_INPUT);
      return;
    }
    const patient = followUpPatients.find((p) => p.id === patientId);
    if (!patient) return;
    setInput({
      ...EMPTY_INPUT,
      patientId: patient.id,
      patientName: patient.name,
      age: patient.age,
      gender: (patient.gender as "M" | "F") || "F",
      neighbourhood: patient.neighbourhood || "JARDIM DA PENHA",
      scholarship: patient.scholarship ?? 0,
      hipertension: patient.hipertension ?? 0,
      diabetes: patient.diabetes ?? 0,
      alcoholism: patient.alcoholism ?? 0,
      handcap: patient.handcap ?? 0,
      smsReceived: patient.smsReceived ?? 0,
      waitingTimeDays: patient.waitingTimeDays ?? 7,
      appointmentDayOfWeek: patient.appointmentDayOfWeek ?? 2,
      appointmentMonth: patient.appointmentMonth ?? 9,
      scheduledHour: patient.scheduledHour ?? 10,
      previousAppointments: patient.previousAppointments ?? patient.totalAppointments,
      previousNoShows: patient.previousNoShows ?? patient.missedAppointments,
      daysSincePreviousAppointment:
        patient.daysSincePreviousAppointment ?? patient.appointmentFrequencyDays ?? 14,
      distanceKm: patient.distanceKm,
      treatmentDurationMonths: patient.treatmentDurationMonths,
      appointmentFrequencyDays: patient.appointmentFrequencyDays,
      totalAppointments: patient.totalAppointments,
      missedAppointments: patient.missedAppointments,
    });
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!input.patientName.trim()) next.patientName = "Patient name is required.";
    if (input.age === null || input.age <= 0) next.age = "Enter a valid age.";
    const total = input.previousAppointments ?? input.totalAppointments;
    const missed = input.previousNoShows ?? input.missedAppointments;

    if (total === null || total < 0) next.totalAppointments = "Required.";
    if (missed === null || missed < 0) next.missedAppointments = "Required.";
    if (total !== null && missed !== null && missed > total) {
      next.missedAppointments = "Cannot exceed total appointments.";
    }
    if (input.waitingTimeDays !== null && input.waitingTimeDays < 0) {
      next.waitingTimeDays = "Must be 0 or more.";
    }
    if (input.appointmentFrequencyDays === null || input.appointmentFrequencyDays <= 0) {
      next.appointmentFrequencyDays = "Must be greater than 0.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function runAssessment() {
    if (!validate()) return;
    setStatus("running");
    setScheduled(false);
    setErrorMessage(null);
    try {
      const prediction = await predictRisk(input);
      setResult(prediction);
      setStatus("done");
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Something went wrong while scoring this patient.",
      );
      setStatus("error");
    }
  }

  function runNewAssessment() {
    setStatus("idle");
    setResult(null);
    setErrors({});
    setErrorMessage(null);
    setScheduled(false);
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          Risk Assessment
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
          Predict a patient's risk of missing their next follow-up appointment using the calibrated
          risk model based on medical history, clinical factors, and appointment logistics.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-gutter items-start">
        <div className="flex flex-col gap-stack-lg">
          {/* Section 1: Demographics & Location */}
          <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
            <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm flex items-center gap-2">
              <MaterialSymbol name="person" className="text-primary !text-xl" />
              Patient Demographics &amp; Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
              <FormField label="Select Existing Patient" htmlFor="patient-select">
                <Select
                  id="patient-select"
                  value={input.patientId ?? ""}
                  onChange={(event) => handlePatientSelect(event.target.value)}
                  className="w-full"
                >
                  <option value="">— New / unlisted patient —</option>
                  {followUpPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Patient Name" htmlFor="patient-name" error={errors.patientName}>
                <TextInput
                  id="patient-name"
                  value={input.patientName}
                  onChange={(value) => update("patientName", value)}
                  placeholder="e.g. Jordan Lee"
                  error={Boolean(errors.patientName)}
                />
              </FormField>
              <FormField label="Age (years)" htmlFor="age" error={errors.age}>
                <NumberInput
                  id="age"
                  value={input.age}
                  onChange={(value) => update("age", value)}
                  error={Boolean(errors.age)}
                />
              </FormField>
              <FormField label="Gender" htmlFor="gender">
                <Select
                  id="gender"
                  value={input.gender}
                  onChange={(event) => update("gender", event.target.value as "M" | "F")}
                  className="w-full"
                >
                  <option value="F">Female (F)</option>
                  <option value="M">Male (M)</option>
                </Select>
              </FormField>
              <FormField label="Neighbourhood / District" htmlFor="neighbourhood">
                <TextInput
                  id="neighbourhood"
                  value={input.neighbourhood}
                  onChange={(value) => update("neighbourhood", value)}
                  placeholder="e.g. JARDIM DA PENHA"
                />
              </FormField>
              <FormField label="Distance from Hospital (km)" htmlFor="distance">
                <NumberInput
                  id="distance"
                  value={input.distanceKm}
                  onChange={(value) => update("distanceKm", value)}
                  step={0.1}
                />
              </FormField>
            </div>
          </Card>

          {/* Section 2: Clinical Conditions & Social Support */}
          <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
            <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm flex items-center gap-2">
              <MaterialSymbol name="clinical_notes" className="text-primary !text-xl" />
              Clinical Conditions &amp; Social Support
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-stack-md">
              <FormField label="Hypertension" htmlFor="hipertension">
                <Select
                  id="hipertension"
                  value={String(input.hipertension)}
                  onChange={(e) => update("hipertension", Number(e.target.value))}
                  className="w-full"
                >
                  <option value="0">No</option>
                  <option value="1">Yes (Diagnosed)</option>
                </Select>
              </FormField>
              <FormField label="Diabetes" htmlFor="diabetes">
                <Select
                  id="diabetes"
                  value={String(input.diabetes)}
                  onChange={(e) => update("diabetes", Number(e.target.value))}
                  className="w-full"
                >
                  <option value="0">No</option>
                  <option value="1">Yes (Diagnosed)</option>
                </Select>
              </FormField>
              <FormField label="Alcoholism History" htmlFor="alcoholism">
                <Select
                  id="alcoholism"
                  value={String(input.alcoholism)}
                  onChange={(e) => update("alcoholism", Number(e.target.value))}
                  className="w-full"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </Select>
              </FormField>
              <FormField label="Disability / Handicap Level" htmlFor="handcap">
                <Select
                  id="handcap"
                  value={String(input.handcap)}
                  onChange={(e) => update("handcap", Number(e.target.value))}
                  className="w-full"
                >
                  <option value="0">0 - None</option>
                  <option value="1">1 - Mild</option>
                  <option value="2">2 - Moderate</option>
                  <option value="3">3 - Severe</option>
                  <option value="4">4 - High Restriction</option>
                </Select>
              </FormField>
              <FormField label="Welfare / Bolsa Família" htmlFor="scholarship">
                <Select
                  id="scholarship"
                  value={String(input.scholarship)}
                  onChange={(e) => update("scholarship", Number(e.target.value))}
                  className="w-full"
                >
                  <option value="0">No (Not Enrolled)</option>
                  <option value="1">Yes (Recipient)</option>
                </Select>
              </FormField>
              <FormField label="SMS Reminder Received" htmlFor="sms-received">
                <Select
                  id="sms-received"
                  value={String(input.smsReceived)}
                  onChange={(e) => update("smsReceived", Number(e.target.value))}
                  className="w-full"
                >
                  <option value="1">Yes (SMS Sent &amp; Confirmed)</option>
                  <option value="0">No (No SMS Sent)</option>
                </Select>
              </FormField>
            </div>
          </Card>

          {/* Section 3: Appointment Logistics & Scheduling */}
          <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
            <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm flex items-center gap-2">
              <MaterialSymbol name="calendar_month" className="text-primary !text-xl" />
              Appointment Logistics &amp; Scheduling
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-stack-md">
              <FormField
                label="Lead Waiting Time (days)"
                htmlFor="waiting-time"
                error={errors.waitingTimeDays}
              >
                <NumberInput
                  id="waiting-time"
                  value={input.waitingTimeDays}
                  onChange={(val) => update("waitingTimeDays", val)}
                  error={Boolean(errors.waitingTimeDays)}
                />
              </FormField>
              <FormField label="Scheduled Hour (0-23)" htmlFor="scheduled-hour">
                <NumberInput
                  id="scheduled-hour"
                  value={input.scheduledHour}
                  onChange={(val) => update("scheduledHour", val)}
                />
              </FormField>
              <FormField label="Day of Week" htmlFor="day-of-week">
                <Select
                  id="day-of-week"
                  value={String(input.appointmentDayOfWeek ?? 2)}
                  onChange={(e) => update("appointmentDayOfWeek", Number(e.target.value))}
                  className="w-full"
                >
                  <option value="0">Monday</option>
                  <option value="1">Tuesday</option>
                  <option value="2">Wednesday</option>
                  <option value="3">Thursday</option>
                  <option value="4">Friday</option>
                  <option value="5">Saturday</option>
                  <option value="6">Sunday</option>
                </Select>
              </FormField>
            </div>
          </Card>

          {/* Section 4: Attendance History */}
          <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
            <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm flex items-center gap-2">
              <MaterialSymbol name="history" className="text-primary !text-xl" />
              Attendance History &amp; Cadence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
              <FormField
                label="Total Previous Appointments"
                htmlFor="total-appts"
                error={errors.totalAppointments}
              >
                <NumberInput
                  id="total-appts"
                  value={input.previousAppointments ?? input.totalAppointments}
                  onChange={(value) => {
                    update("previousAppointments", value);
                    update("totalAppointments", value);
                  }}
                  error={Boolean(errors.totalAppointments)}
                />
              </FormField>
              <FormField
                label="Previous Missed Appointments (No-shows)"
                htmlFor="missed-appts"
                error={errors.missedAppointments}
              >
                <NumberInput
                  id="missed-appts"
                  value={input.previousNoShows ?? input.missedAppointments}
                  onChange={(value) => {
                    update("previousNoShows", value);
                    update("missedAppointments", value);
                  }}
                  error={Boolean(errors.missedAppointments)}
                />
              </FormField>
              <FormField
                label="Days Since Previous Appointment"
                htmlFor="days-since"
              >
                <NumberInput
                  id="days-since"
                  value={input.daysSincePreviousAppointment}
                  onChange={(value) => update("daysSincePreviousAppointment", value)}
                />
              </FormField>
              <FormField
                label="Treatment Duration (months)"
                htmlFor="duration"
              >
                <NumberInput
                  id="duration"
                  value={input.treatmentDurationMonths}
                  onChange={(value) => update("treatmentDurationMonths", value)}
                  step={0.1}
                />
              </FormField>
              <FormField
                label="Appointment Frequency (days between visits)"
                htmlFor="frequency"
                error={errors.appointmentFrequencyDays}
              >
                <NumberInput
                  id="frequency"
                  value={input.appointmentFrequencyDays}
                  onChange={(value) => update("appointmentFrequencyDays", value)}
                  error={Boolean(errors.appointmentFrequencyDays)}
                />
              </FormField>
            </div>
          </Card>

          <div className="flex items-center gap-stack-sm">
            <Button
              variant="primary"
              onClick={runAssessment}
              disabled={status === "running"}
              className={clsx(
                "flex items-center gap-2",
                status === "running" && "opacity-70 cursor-wait",
              )}
            >
              {status === "running" ? (
                <>
                  <MaterialSymbol name="progress_activity" className="animate-spin !text-base" />
                  Analyzing with Calibrated Model...
                </>
              ) : (
                "Run Risk Assessment"
              )}
            </Button>
            {(status === "done" || status === "error") && (
              <Button variant="secondary" className="w-auto" onClick={runNewAssessment}>
                Run New Assessment
              </Button>
            )}
          </div>
        </div>


        <div className="xl:sticky xl:top-[88px]">
          {status === "error" ? (
            <Card tone="critical" className="p-stack-lg flex flex-col items-center gap-stack-sm text-center min-h-[280px]">
              <MaterialSymbol name="error" className="text-error !text-4xl" />
              <p className="font-body-sm text-body-sm font-medium text-error">Prediction failed</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">{errorMessage}</p>
              <Button variant="secondary" className="w-auto" onClick={runAssessment}>
                Retry
              </Button>
            </Card>
          ) : status !== "done" || !result ? (
            <Card className="p-stack-lg flex flex-col items-center justify-center gap-stack-sm text-center min-h-[280px]">
              <MaterialSymbol name="monitor_heart" className="text-on-surface-variant !text-4xl" />
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[220px]">
                {status === "running"
                  ? "Scoring follow-up risk from appointment history and treatment schedule..."
                  : "Fill in the form and run an assessment to see the result here."}
              </p>
            </Card>
          ) : (
            <Card className="p-stack-md flex flex-col gap-stack-md">
              <div className="flex items-center justify-between border-b border-outline-variant pb-stack-sm">
                <h3 className="font-title-lg text-title-lg text-on-surface">Assessment Result</h3>
                <RiskLevelBadge level={result.riskLevel} />
              </div>

              <div className="flex items-start justify-between gap-stack-sm">
                <div>
                  <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Risk Score
                  </p>
                  <p
                    className={clsx(
                      "font-display-lg text-display-lg leading-none mt-1",
                      result.riskLevel === "high" ? "text-error" : "text-on-surface",
                    )}
                  >
                    {result.riskScore}
                  </p>
                </div>
                <span
                  className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant border border-outline-variant rounded-full px-2.5 py-1 mt-1"
                  title="Whether this came from the trained model or the interim rule-based baseline"
                >
                  {result.modelType === "trained_model" ? "Trained model" : "Rule-based baseline"}
                </span>
              </div>

              <div className="flex flex-col gap-stack-sm">
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Contributing Factors
                </h4>
                <div className="flex flex-col gap-stack-sm">
                  {result.reasons.map((reason) => (
                    <RiskContributorBar
                      key={reason.factor}
                      label={`${reason.label} (${reason.value})`}
                      weight={reason.contributionPercent}
                      tone={reason.impact === "high" ? "critical" : "neutral"}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Interpretation
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface">{result.summary}</p>
              </div>

              <Card tone={result.riskLevel === "high" ? "critical" : "default"} className="p-stack-sm">
                <p
                  className={clsx(
                    "font-body-sm text-body-sm",
                    result.riskLevel === "high" ? "text-error" : "text-on-surface",
                  )}
                >
                  {result.recommendedAction}
                </p>
              </Card>

              <Button
                variant={scheduled ? "secondary" : "primary"}
                disabled={scheduled}
                onClick={() => setScheduled(true)}
                className="w-full flex items-center justify-center gap-2"
              >
                {scheduled ? (
                  <>
                    <MaterialSymbol name="check" className="!text-base" />
                    Follow-up Scheduled
                  </>
                ) : (
                  "Schedule Follow-up"
                )}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="font-label-md text-label-md text-on-surface-variant">
        {label}
      </label>
      {children}
      {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={clsx(
        "w-full bg-surface-container-lowest border rounded-sm py-2 px-3 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 transition-colors",
        error
          ? "border-error focus:border-error focus:ring-error"
          : "border-outline-variant focus:border-outline focus:ring-outline",
      )}
    />
  );
}

function NumberInput({
  id,
  value,
  onChange,
  step,
  error,
}: {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  step?: number;
  error?: boolean;
}) {
  return (
    <input
      id={id}
      type="number"
      step={step}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
      className={clsx(
        "w-full bg-surface-container-lowest border rounded-sm py-2 px-3 text-body-sm font-body-sm text-on-surface font-data-mono focus:outline-none focus:ring-1 transition-colors",
        error
          ? "border-error focus:border-error focus:ring-error"
          : "border-outline-variant focus:border-outline focus:ring-outline",
      )}
    />
  );
}
