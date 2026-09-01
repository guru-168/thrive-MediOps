import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { riskDistribution } from "../../data/mockPatients";
import type { RiskDistributionSlice, SeverityFilter } from "../../types/patient";

const SWATCH_CLASS: Record<RiskDistributionSlice["colorToken"], string> = {
  error: "bg-error",
  "secondary-container": "bg-secondary-container",
  "surface-container-highest": "bg-surface-container-highest border border-outline-variant",
};

const STROKE_CLASS: Record<RiskDistributionSlice["colorToken"], string> = {
  error: "stroke-error",
  "secondary-container": "stroke-secondary-container",
  "surface-container-highest": "stroke-surface-container-highest",
};

const RADIUS = 76;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const BASE_STROKE = 20;
const EMPHASIZED_STROKE = 25;

function formatPercent(count: number, total: number): string {
  return `${((count / total) * 100).toFixed(1)}%`;
}

export interface RiskDistributionPanelProps {
  activeSeverity: SeverityFilter;
  hoveredSeverity: SeverityFilter | null;
  onSeverityChange: (value: SeverityFilter) => void;
  onHoverSeverity: (value: SeverityFilter | null) => void;
}

/**
 * "Risk Distribution" side panel. The ring is drawn as an SVG so each
 * segment can be its own interactive element (hover/click, smooth
 * stroke-width and opacity transitions) - a plain CSS conic-gradient
 * background can't animate per-segment. Clicking a segment or a legend
 * row sets the same severity filter the patient queue table uses, so
 * the chart is a real filter control, not just a picture.
 */
export function RiskDistributionPanel({
  activeSeverity,
  hoveredSeverity,
  onSeverityChange,
  onHoverSeverity,
}: RiskDistributionPanelProps) {
  const total = riskDistribution.reduce((sum, slice) => sum + slice.count, 0);

  const displayedSlice =
    riskDistribution.find((s) => s.severity === hoveredSeverity) ??
    riskDistribution.find((s) => s.severity === activeSeverity) ??
    riskDistribution.find((s) => s.severity === "critical") ??
    riskDistribution[0];

  function toggleSeverity(severity: SeverityFilter) {
    onSeverityChange(activeSeverity === severity ? "all" : severity);
  }

  return (
    <Card as="aside" className="p-stack-md flex flex-col gap-stack-md">
      <div className="flex items-center justify-between border-b border-outline-variant pb-stack-sm">
        <h3 className="font-title-lg text-title-lg text-on-surface">Risk Distribution</h3>
        <MaterialSymbol name="pie_chart" className="text-on-surface-variant" />
      </div>

      <div className="relative w-full aspect-square max-h-[250px] mx-auto flex items-center justify-center py-stack-md">
        <svg
          viewBox="0 0 192 192"
          className="w-48 h-48"
          role="img"
          aria-label={`Risk distribution: ${riskDistribution
            .map((s) => `${s.label} ${formatPercent(s.count, total)}`)
            .join(", ")}`}
        >
          <circle
            cx={96}
            cy={96}
            r={RADIUS}
            fill="none"
            strokeWidth={BASE_STROKE}
            className="stroke-surface-container-highest"
          />
          <g transform="rotate(-90 96 96)">
            {riskDistribution.map((slice, index) => {
              const priorCount = riskDistribution
                .slice(0, index)
                .reduce((sum, s) => sum + s.count, 0);
              const fraction = slice.count / total;
              const isEmphasized =
                hoveredSeverity === slice.severity ||
                (!hoveredSeverity && activeSeverity === slice.severity);
              const isDimmed =
                (hoveredSeverity !== null || activeSeverity !== "all") && !isEmphasized;

              return (
                <circle
                  key={slice.label}
                  cx={96}
                  cy={96}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={isEmphasized ? EMPHASIZED_STROKE : BASE_STROKE}
                  strokeDasharray={`${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-(priorCount / total) * CIRCUMFERENCE}
                  className={clsx(
                    STROKE_CLASS[slice.colorToken],
                    "cursor-pointer transition-[stroke-width,opacity] duration-200 ease-out",
                    isDimmed && "opacity-45",
                  )}
                  onMouseEnter={() => onHoverSeverity(slice.severity)}
                  onMouseLeave={() => onHoverSeverity(null)}
                  onClick={() => toggleSeverity(slice.severity)}
                />
              );
            })}
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span className="font-display-lg text-display-lg text-on-surface leading-none transition-all duration-150">
            {displayedSlice.count}
          </span>
          <span
            className={clsx(
              "font-label-md text-label-md uppercase mt-1 transition-all duration-150",
              displayedSlice.severity === "critical" ? "text-error" : "text-on-surface-variant",
            )}
          >
            {displayedSlice.label.replace(/ Risk| Monitoring/, "")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-auto" role="group" aria-label="Filter by severity">
        {riskDistribution.map((slice) => {
          const isActive = activeSeverity === slice.severity;
          return (
            <button
              key={slice.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => toggleSeverity(slice.severity)}
              onMouseEnter={() => onHoverSeverity(slice.severity)}
              onMouseLeave={() => onHoverSeverity(null)}
              className={clsx(
                "flex items-center justify-between rounded-sm px-1.5 py-1 -mx-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline",
                isActive ? "bg-surface-container-low" : "hover:bg-surface-container-low",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={clsx("w-3 h-3 rounded-sm", SWATCH_CLASS[slice.colorToken])}
                  aria-hidden="true"
                />
                <span
                  className={clsx(
                    "font-body-sm text-body-sm",
                    isActive ? "text-on-surface font-semibold" : "text-on-surface",
                  )}
                >
                  {slice.label}
                </span>
              </span>
              <span className="font-data-mono text-data-mono text-on-surface-variant">
                {formatPercent(slice.count, total)}
              </span>
            </button>
          );
        })}
      </div>

      <Button variant="secondary" className="mt-stack-sm">
        Generate Report
      </Button>
    </Card>
  );
}
