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
import { prenatalPatients } from "../data/prenatalPatients";
import { computeMockRiskAssessment } from "../data/riskAssessmentMock";
import type {
  DiabetesStatus,
  RiskAssessmentInput,
  RiskAssessmentResult,
  SmokingStatus,
} from "../types/prenatal";

const EMPTY_INPUT: RiskAssessmentInput = {
  patientId: null,
  patientName: "",
  age: null,
  gestationalAgeWeeks: null,
  systolicBP: null,
  diastolicBP: null,
  bmi: null,
  priorPreeclampsia: false,
  chronicHypertension: false,
  multiplePregnancy: false,
  previousPretermBirth: false,
  familyHistoryPreeclampsia: false,
  diabetesStatus: "none",
  smokingStatus: "never",
};

function initialInputFromQuery(patientId: string | null): RiskAssessmentInput {
  if (!patientId) return EMPTY_INPUT;
  const patient = prenatalPatients.find((p) => p.id === patientId);
  if (!patient) return EMPTY_INPUT;
  return {
    ...EMPTY_INPUT,
    patientId: patient.id,
    patientName: patient.name,
    age: patient.age,
    gestationalAgeWeeks: patient.gestationalAgeWeeks,
  };
}

type FieldErrors = Partial<Record<"patientName" | "age" | "gestationalAgeWeeks" | "systolicBP" | "diastolicBP" | "bmi", string>>;

/**
 * The product's core workflow: a clinician runs a prenatal risk
 * assessment for a patient and gets back a classification + explanation.
 * Scoring is a MOCK (see data/riskAssessmentMock.ts) - structured so a
 * real model/API call can replace `computeMockRiskAssessment` later
 * without changing this page's form or result rendering.
 */
export function RiskAssessmentPage() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState<RiskAssessmentInput>(() =>
    initialInputFromQuery(searchParams.get("patientId")),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);
  const [scheduled, setScheduled] = useState(false);

  function update<K extends keyof RiskAssessmentInput>(key: K, value: RiskAssessmentInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handlePatientSelect(patientId: string) {
    if (!patientId) {
      setInput(EMPTY_INPUT);
      return;
    }
    const patient = prenatalPatients.find((p) => p.id === patientId);
    if (!patient) return;
    setInput({
      ...EMPTY_INPUT,
      patientId: patient.id,
      patientName: patient.name,
      age: patient.age,
      gestationalAgeWeeks: patient.gestationalAgeWeeks,
    });
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!input.patientName.trim()) next.patientName = "Patient name is required.";
    if (input.age === null || input.age <= 0) next.age = "Enter a valid age.";
    if (input.gestationalAgeWeeks === null || input.gestationalAgeWeeks <= 0)
      next.gestationalAgeWeeks = "Enter gestational age in weeks.";
    if (input.systolicBP === null || input.systolicBP <= 0) next.systolicBP = "Required.";
    if (input.diastolicBP === null || input.diastolicBP <= 0) next.diastolicBP = "Required.";
    if (input.bmi === null || input.bmi <= 0) next.bmi = "Required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function runAssessment() {
    if (!validate()) return;
    setStatus("running");
    setScheduled(false);
    // Simulated latency so the loading state is visible - stands in for a
    // real backend/model call, which would replace this entire function
    // body with an awaited fetch to the assessment API.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setResult(computeMockRiskAssessment(input));
    setStatus("done");
  }

  function runNewAssessment() {
    setStatus("idle");
    setResult(null);
    setErrors({});
    setScheduled(false);
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          Risk Assessment
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
          Run a prenatal risk assessment using current clinical and pregnancy information.
          Results use demo scoring logic for this prototype - not a validated clinical model.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-gutter items-start">
        <div className="flex flex-col gap-stack-lg">
          <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
            <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm">
              Patient Information
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
                  {prenatalPatients.map((p) => (
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
              <FormField label="Gestational Age (weeks)" htmlFor="ga" error={errors.gestationalAgeWeeks}>
                <NumberInput
                  id="ga"
                  value={input.gestationalAgeWeeks}
                  onChange={(value) => update("gestationalAgeWeeks", value)}
                  error={Boolean(errors.gestationalAgeWeeks)}
                />
              </FormField>
            </div>
          </Card>

          <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
            <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm">
              Clinical &amp; Pregnancy Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-stack-md">
              <FormField label="Systolic BP (mmHg)" htmlFor="sbp" error={errors.systolicBP}>
                <NumberInput
                  id="sbp"
                  value={input.systolicBP}
                  onChange={(value) => update("systolicBP", value)}
                  error={Boolean(errors.systolicBP)}
                />
              </FormField>
              <FormField label="Diastolic BP (mmHg)" htmlFor="dbp" error={errors.diastolicBP}>
                <NumberInput
                  id="dbp"
                  value={input.diastolicBP}
                  onChange={(value) => update("diastolicBP", value)}
                  error={Boolean(errors.diastolicBP)}
                />
              </FormField>
              <FormField label="BMI" htmlFor="bmi" error={errors.bmi}>
                <NumberInput
                  id="bmi"
                  value={input.bmi}
                  onChange={(value) => update("bmi", value)}
                  step={0.1}
                  error={Boolean(errors.bmi)}
                />
              </FormField>
              <FormField label="Diabetes Status" htmlFor="diabetes">
                <Select
                  id="diabetes"
                  value={input.diabetesStatus}
                  onChange={(event) => update("diabetesStatus", event.target.value as DiabetesStatus)}
                  className="w-full"
                >
                  <option value="none">None</option>
                  <option value="gestational">Gestational</option>
                  <option value="type1">Pre-existing Type 1</option>
                  <option value="type2">Pre-existing Type 2</option>
                </Select>
              </FormField>
              <FormField label="Smoking Status" htmlFor="smoking">
                <Select
                  id="smoking"
                  value={input.smokingStatus}
                  onChange={(event) => update("smokingStatus", event.target.value as SmokingStatus)}
                  className="w-full"
                >
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-stack-md gap-y-stack-sm pt-stack-sm border-t border-outline-variant">
              <CheckboxField
                label="Prior preeclampsia"
                checked={input.priorPreeclampsia}
                onChange={(v) => update("priorPreeclampsia", v)}
              />
              <CheckboxField
                label="Chronic hypertension"
                checked={input.chronicHypertension}
                onChange={(v) => update("chronicHypertension", v)}
              />
              <CheckboxField
                label="Multiple pregnancy"
                checked={input.multiplePregnancy}
                onChange={(v) => update("multiplePregnancy", v)}
              />
              <CheckboxField
                label="Previous preterm birth"
                checked={input.previousPretermBirth}
                onChange={(v) => update("previousPretermBirth", v)}
              />
              <CheckboxField
                label="Family history of preeclampsia"
                checked={input.familyHistoryPreeclampsia}
                onChange={(v) => update("familyHistoryPreeclampsia", v)}
              />
            </div>
          </Card>

          <div className="flex items-center gap-stack-sm">
            <Button
              variant="primary"
              onClick={runAssessment}
              disabled={status === "running"}
              className={clsx("flex items-center gap-2", status === "running" && "opacity-70 cursor-wait")}
            >
              {status === "running" ? (
                <>
                  <MaterialSymbol name="progress_activity" className="animate-spin !text-base" />
                  Analyzing...
                </>
              ) : (
                "Run Risk Assessment"
              )}
            </Button>
            {status === "done" && (
              <Button variant="secondary" className="w-auto" onClick={runNewAssessment}>
                Run New Assessment
              </Button>
            )}
          </div>
        </div>

        <div className="xl:sticky xl:top-[88px]">
          {status !== "done" || !result ? (
            <Card className="p-stack-lg flex flex-col items-center justify-center gap-stack-sm text-center min-h-[280px]">
              <MaterialSymbol name="monitor_heart" className="text-on-surface-variant !text-4xl" />
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[220px]">
                {status === "running"
                  ? "Analyzing clinical and pregnancy information..."
                  : "Fill in the form and run an assessment to see the result here."}
              </p>
            </Card>
          ) : (
            <Card className="p-stack-md flex flex-col gap-stack-md">
              <div className="flex items-center justify-between border-b border-outline-variant pb-stack-sm">
                <h3 className="font-title-lg text-title-lg text-on-surface">Assessment Result</h3>
                <RiskLevelBadge level={result.riskLevel} />
              </div>

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

              <div className="flex flex-col gap-stack-sm">
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Major Contributing Factors
                </h4>
                <div className="flex flex-col gap-stack-sm">
                  {result.contributingFactors.map((factor) => (
                    <RiskContributorBar
                      key={factor.label}
                      label={factor.label}
                      weight={factor.weight}
                      tone={result.riskLevel === "high" ? "critical" : "neutral"}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Interpretation
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface">{result.interpretation}</p>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Recommended Monitoring
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface">{result.recommendedMonitoring}</p>
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

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="rounded-sm border-outline-variant text-on-surface focus:ring-outline focus:ring-offset-0 w-4 h-4"
      />
      {label}
    </label>
  );
}
