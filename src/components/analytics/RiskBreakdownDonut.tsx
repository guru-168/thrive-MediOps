import { useState } from "react";
import clsx from "clsx";
import type { RiskLevel } from "../../types/prenatal";

export interface RiskBreakdownDonutProps {
  data: { level: RiskLevel; label: string; count: number }[];
}

const STROKE_CLASS: Record<RiskLevel, string> = {
  high: "stroke-error",
  moderate: "stroke-secondary-container",
  low: "stroke-surface-container-highest",
};
const SWATCH_CLASS: Record<RiskLevel, string> = {
  high: "bg-error",
  moderate: "bg-secondary-container",
  low: "bg-surface-container-highest border border-outline-variant",
};

const RADIUS = 62;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE = 18;

/** Analytics' own risk-distribution donut - visually consistent with
 * Overview's (same SVG-stroke technique, same tokens) but a separate,
 * presentation-only component: Analytics shows aggregated read-only
 * stats, not a table filter, so it doesn't share Overview's interactive
 * filter-linked component. */
export function RiskBreakdownDonut({ data }: RiskBreakdownDonutProps) {
  const [hovered, setHovered] = useState<RiskLevel | null>(null);
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  const displayed = data.find((d) => d.level === hovered) ?? data[0];

  return (
    <div className="flex items-center gap-stack-lg flex-wrap">
      <div className="relative w-[160px] h-[160px] shrink-0">
        <svg viewBox="0 0 160 160" className="w-full h-full" role="img" aria-label="Risk level breakdown">
          <circle cx={80} cy={80} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-surface-container-highest" />
          <g transform="rotate(-90 80 80)">
            {data.map((d, index) => {
              const priorCount = data.slice(0, index).reduce((sum, s) => sum + s.count, 0);
              const fraction = d.count / total;
              const isEmphasized = hovered === d.level;
              const isDimmed = hovered !== null && !isEmphasized;
              return (
                <circle
                  key={d.level}
                  cx={80}
                  cy={80}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={isEmphasized ? STROKE + 4 : STROKE}
                  strokeDasharray={`${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-(priorCount / total) * CIRCUMFERENCE}
                  className={clsx(STROKE_CLASS[d.level], "transition-[stroke-width,opacity] duration-200 ease-out cursor-pointer", isDimmed && "opacity-45")}
                  onMouseEnter={() => setHovered(d.level)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display-lg text-display-lg leading-none text-on-surface">{displayed.count}</span>
          <span className={clsx("font-label-md text-label-md uppercase mt-1", displayed.level === "high" ? "text-error" : "text-on-surface-variant")}>
            {displayed.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[160px]">
        {data.map((d) => (
          <button
            key={d.level}
            type="button"
            onMouseEnter={() => setHovered(d.level)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center justify-between gap-2 rounded-sm px-1.5 py-1 -mx-1.5 hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline"
          >
            <span className="flex items-center gap-2">
              <span className={clsx("w-3 h-3 rounded-sm", SWATCH_CLASS[d.level])} aria-hidden="true" />
              <span className="font-body-sm text-body-sm text-on-surface">{d.label}</span>
            </span>
            <span className="font-data-mono text-data-mono text-on-surface-variant">
              {((d.count / total) * 100).toFixed(1)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
