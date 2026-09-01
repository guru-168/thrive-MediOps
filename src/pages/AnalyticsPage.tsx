import { useMemo, useState } from "react";
import clsx from "clsx";
import { Card } from "../components/ui/Card";
import { MaterialSymbol } from "../components/icons/MaterialSymbol";
import { TrendLineChart } from "../components/analytics/TrendLineChart";
import { HorizontalBarChart } from "../components/analytics/HorizontalBarChart";
import { RiskBreakdownDonut } from "../components/analytics/RiskBreakdownDonut";
import {
  assessmentVolumeTrend,
  followUpCompletionTrend,
  getRiskBreakdown,
  getTrimesterDistribution,
} from "../data/analyticsMock";
import { prenatalPatients } from "../data/prenatalPatients";

const RANGE_OPTIONS = [
  { key: 7, label: "7D" },
  { key: 14, label: "14D" },
  { key: 30, label: "30D" },
] as const;

/**
 * Aggregated system-level trends and statistics. Read-only by design -
 * Analytics explains what's happening across the patient population, it
 * doesn't manage individual records (Patients) or run assessments (Risk
 * Assessment).
 */
export function AnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);

  const rangeData = useMemo(() => assessmentVolumeTrend.slice(-rangeDays), [rangeDays]);
  const riskBreakdown = useMemo(() => getRiskBreakdown(), []);
  const trimesterDistribution = useMemo(() => getTrimesterDistribution(), []);

  const totalAssessments = rangeData.reduce((sum, d) => sum + d.assessments, 0);
  const totalHighRisk = rangeData.reduce((sum, d) => sum + d.highRisk, 0);
  const highRiskRate = totalAssessments > 0 ? Math.round((totalHighRisk / totalAssessments) * 100) : 0;
  const avgCompletion = Math.round(
    followUpCompletionTrend.reduce((sum, d) => sum + d.completionRate, 0) / followUpCompletionTrend.length,
  );
  const latestCompletion = followUpCompletionTrend[followUpCompletionTrend.length - 1].completionRate;

  const trendChartData = rangeData.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.assessments,
  }));
  const highRiskTrendData = rangeData.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.highRisk,
  }));

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Analytics</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Aggregated trends across the patient population - not individual patient records.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <KpiCard label="Assessments" value={totalAssessments.toLocaleString("en-US")} icon="fact_check" note={`Last ${rangeDays} days`} />
        <KpiCard label="High-Risk Rate" value={`${highRiskRate}%`} icon="warning" critical note={`Of ${totalAssessments} assessments`} />
        <KpiCard label="Follow-up Completion" value={`${latestCompletion}%`} icon="event_available" note={`8-week avg ${avgCompletion}%`} />
        <KpiCard label="Patients Tracked" value={prenatalPatients.length.toString()} icon="groups" note="Active directory" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter items-start">
        <Card as="section" className="xl:col-span-2 p-stack-md flex flex-col gap-stack-md">
          <div className="flex items-center justify-between flex-wrap gap-stack-sm border-b border-outline-variant pb-stack-sm">
            <h3 className="font-title-lg text-title-lg text-on-surface">Assessment Volume</h3>
            <div className="flex items-center gap-1">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRangeDays(opt.key)}
                  aria-pressed={rangeDays === opt.key}
                  className={clsx(
                    "px-2.5 py-1 rounded-full font-label-md text-label-md uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline",
                    rangeDays === opt.key
                      ? "bg-on-surface text-surface"
                      : "text-on-surface-variant hover:bg-surface-container-low",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
            Total assessments per day (solid) vs. high-risk classifications (dashed). Hover the chart for exact values.
          </p>
          <TrendLineChart data={trendChartData} secondary={highRiskTrendData} />
        </Card>

        <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
          <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm">
            Risk Distribution
          </h3>
          <RiskBreakdownDonut data={riskBreakdown} />
        </Card>

        <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
          <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm">
            Follow-up Completion Trend
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
            Weekly percentage of follow-ups completed on time.
          </p>
          <TrendLineChart
            data={followUpCompletionTrend.map((d) => ({ label: d.week, value: d.completionRate }))}
            valueSuffix="%"
            height={180}
          />
        </Card>

        <Card as="section" className="xl:col-span-2 p-stack-md flex flex-col gap-stack-md">
          <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-stack-sm">
            Patients by Trimester
          </h3>
          <HorizontalBarChart data={trimesterDistribution.map((d) => ({ label: d.label, value: d.count }))} />
        </Card>
      </div>
    </>
  );
}

function KpiCard({
  label,
  value,
  icon,
  critical,
  note,
}: {
  label: string;
  value: string;
  icon: string;
  critical?: boolean;
  note: string;
}) {
  return (
    <Card tone={critical ? "critical" : "default"} className="p-stack-md flex flex-col gap-stack-sm">
      <div className="flex items-center justify-between">
        <span className={clsx("font-label-md text-label-md uppercase tracking-wider", critical ? "text-error" : "text-on-surface-variant")}>
          {label}
        </span>
        <MaterialSymbol name={icon} className={critical ? "text-error" : "text-on-surface-variant"} />
      </div>
      <div className={clsx("font-display-lg text-display-lg", critical ? "text-error" : "text-on-surface")}>{value}</div>
      <div className={clsx("font-body-sm text-body-sm", critical ? "text-error" : "text-on-surface-variant")}>{note}</div>
    </Card>
  );
}
