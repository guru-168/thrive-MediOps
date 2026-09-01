import { useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export interface TrendLineChartProps {
  data: { label: string; value: number }[];
  /** Optional second series drawn thinner/muted (e.g. high-risk count within total assessments). */
  secondary?: { label: string; value: number }[];
  height?: number;
  valueSuffix?: string;
}

const WIDTH = 640;

/**
 * Hand-rolled SVG line chart (no charting dependency, matching the
 * existing project convention set by Overview's donut). Renders a real
 * axis, a hoverable tooltip driven by pointer position, and scales to
 * the data range rather than a fixed domain.
 */
export function TrendLineChart({ data, secondary, height = 200, valueSuffix = "" }: TrendLineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const padding = { top: 16, right: 12, bottom: 24, left: 32 };
  const innerWidth = WIDTH - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const allValues = [...data.map((d) => d.value), ...(secondary?.map((d) => d.value) ?? [])];
  const maxValue = Math.max(...allValues, 1);
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  function pointFor(value: number, index: number) {
    const x = padding.left + index * stepX;
    const y = padding.top + innerHeight - (value / maxValue) * innerHeight;
    return { x, y };
  }

  function pathFor(series: { value: number }[]) {
    return series.map((d, i) => pointFor(d.value, i)).map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }

  const gridLines = [0, 0.5, 1];
  const labelStride = Math.max(1, Math.ceil(data.length / 7));

  function handleMove(event: ReactPointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH - padding.left;
    const index = Math.round(relativeX / stepX);
    setHoverIndex(Math.max(0, Math.min(data.length - 1, index)));
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const hoveredPoint = hoverIndex !== null ? pointFor(data[hoverIndex].value, hoverIndex) : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Trend chart: ${data.map((d) => `${d.label} ${d.value}${valueSuffix}`).join(", ")}`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {gridLines.map((fraction) => {
          const y = padding.top + innerHeight * (1 - fraction);
          return (
            <line
              key={fraction}
              x1={padding.left}
              x2={WIDTH - padding.right}
              y1={y}
              y2={y}
              className="stroke-outline-variant"
              strokeWidth={1}
            />
          );
        })}
        <text x={4} y={padding.top + 4} className="fill-on-surface-variant" fontSize={9}>
          {maxValue}
        </text>
        <text x={4} y={padding.top + innerHeight} className="fill-on-surface-variant" fontSize={9}>
          0
        </text>

        {secondary && (
          <path d={pathFor(secondary)} fill="none" className="stroke-outline" strokeWidth={1.5} strokeDasharray="3 3" />
        )}
        <path d={pathFor(data)} fill="none" className="stroke-on-surface" strokeWidth={2} />

        {data.map((d, i) => {
          const p = pointFor(d.value, i);
          return (
            <circle
              key={d.label}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 3.5 : 0}
              className="fill-on-surface transition-all"
            />
          );
        })}

        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            x2={hoveredPoint.x}
            y1={padding.top}
            y2={padding.top + innerHeight}
            className="stroke-outline"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        )}

        {data.map((d, i) =>
          i % labelStride === 0 ? (
            <text
              key={d.label}
              x={pointFor(d.value, i).x}
              y={height - 6}
              textAnchor="middle"
              className="fill-on-surface-variant"
              fontSize={9}
            >
              {d.label}
            </text>
          ) : null,
        )}
      </svg>

      {hovered && hoveredPoint && (
        <div
          className="absolute pointer-events-none bg-inverse-surface text-inverse-on-surface text-[11px] font-body-sm rounded-sm px-2 py-1 -translate-x-1/2 -translate-y-full whitespace-nowrap"
          style={{ left: `${(hoveredPoint.x / WIDTH) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
        >
          {hovered.label}: {hovered.value}
          {valueSuffix}
        </div>
      )}
    </div>
  );
}
