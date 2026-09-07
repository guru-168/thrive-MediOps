import { useState } from "react";
import type { ReactNode } from "react";
import { useOutletContext } from "react-router-dom";
import clsx from "clsx";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Toggle } from "../components/ui/Toggle";
import { Select } from "../components/ui/Select";
import { MaterialSymbol } from "../components/icons/MaterialSymbol";
import type { DashboardOutletContext, Theme } from "../components/layout/AppShell";

interface SettingsDraft {
  highRiskAlerts: boolean;
  followUpReminders: boolean;
  weeklyDigest: boolean;
  theme: Theme;
  moderateThreshold: number;
  highThreshold: number;
  monitoringInterval: "weekly" | "biweekly" | "monthly";
}

function defaultDraft(theme: Theme): SettingsDraft {
  return {
    highRiskAlerts: true,
    followUpReminders: true,
    weeklyDigest: false,
    theme,
    moderateThreshold: 35,
    highThreshold: 65,
    monitoringInterval: "biweekly",
  };
}

/**
 * Application configuration - notification preferences, risk-assessment
 * scoring thresholds, and display theme.
 * Everything here is local, in-memory state (no backend yet); Save
 * Changes commits the draft, Reset discards unsaved edits. Theme is the
 * one setting with a real, immediately visible effect (see AppShell).
 */
export function SettingsPage() {
  const { theme, onThemeChange } = useOutletContext<DashboardOutletContext>();
  const [saved, setSaved] = useState<SettingsDraft>(() => defaultDraft(theme));
  const [draft, setDraft] = useState<SettingsDraft>(saved);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function update<K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
  }

  function handleSave() {
    setSaved(draft);
    onThemeChange(draft.theme);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  }

  function handleReset() {
    setDraft(saved);
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Settings</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Manage notification preferences, risk-assessment configuration, and display.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
        <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
          <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm">
            Notifications
          </h3>
          <ToggleRow
            label="High-risk alerts"
            description="Immediate notification when a patient is classified high risk."
            checked={draft.highRiskAlerts}
            onChange={(v) => update("highRiskAlerts", v)}
          />
          <ToggleRow
            label="Follow-up reminders"
            description="Reminders as follow-up tasks become due or overdue."
            checked={draft.followUpReminders}
            onChange={(v) => update("followUpReminders", v)}
          />
          <ToggleRow
            label="Weekly digest email"
            description="A weekly summary of assessments and outstanding follow-ups."
            checked={draft.weeklyDigest}
            onChange={(v) => update("weeklyDigest", v)}
          />
        </Card>

        <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
          <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm">
            Risk Assessment Configuration
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
            Score thresholds used to classify assessment results. Prototype configuration only.
          </p>
          <SettingRow label="Moderate risk threshold" htmlFor="mod-threshold">
            <NumberField
              id="mod-threshold"
              value={draft.moderateThreshold}
              onChange={(v) => update("moderateThreshold", v)}
              max={draft.highThreshold - 1}
            />
          </SettingRow>
          <SettingRow label="High risk threshold" htmlFor="high-threshold">
            <NumberField
              id="high-threshold"
              value={draft.highThreshold}
              onChange={(v) => update("highThreshold", v)}
              min={draft.moderateThreshold + 1}
            />
          </SettingRow>
          <SettingRow label="Default monitoring interval" htmlFor="interval">
            <Select
              id="interval"
              value={draft.monitoringInterval}
              onChange={(event) => update("monitoringInterval", event.target.value as SettingsDraft["monitoringInterval"])}
              className="w-full"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </SettingRow>
        </Card>

        <Card as="section" className="p-stack-md flex flex-col gap-stack-md lg:col-span-2">
          <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm">
            Display
          </h3>
          <div className="flex items-center justify-between flex-wrap gap-stack-sm">
            <div className="min-w-0">
              <p className="font-body-sm text-body-sm text-on-surface font-medium">Theme</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Applies across the whole application.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low rounded-full p-1 shrink-0">
              {(["light", "dark"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update("theme", option)}
                  aria-pressed={draft.theme === option}
                  className={clsx(
                    "flex items-center gap-1.5 px-stack-sm py-1.5 rounded-full font-label-md text-label-md uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline",
                    draft.theme === option
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  <MaterialSymbol name={option === "light" ? "light_mode" : "dark_mode"} className="!text-base" />
                  {option === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-stack-sm sticky bottom-4">
        <Card className="p-stack-sm flex items-center gap-stack-sm shadow-lg">
          <Button variant="primary" onClick={handleSave} disabled={!isDirty} className={clsx(!isDirty && "opacity-50")}>
            Save Changes
          </Button>
          <Button variant="secondary" className="w-auto" onClick={handleReset} disabled={!isDirty}>
            Reset
          </Button>
          {justSaved && (
            <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant animate-fade-in-up">
              <MaterialSymbol name="check_circle" className="!text-base" />
              Saved
            </span>
          )}
        </Card>
      </div>
    </>
  );
}

function SettingRow({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="font-label-md text-label-md text-on-surface-variant">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-stack-md">
      <div className="min-w-0">
        <p className="font-body-sm text-body-sm text-on-surface font-medium">{label}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} hideLabel />
    </div>
  );
}

function NumberField({
  id,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      id={id}
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full bg-surface-container-lowest border border-outline-variant rounded-sm py-2 px-3 text-body-sm font-body-sm font-data-mono text-on-surface focus:outline-none focus:border-outline focus:ring-1 focus:ring-outline transition-colors"
    />
  );
}
