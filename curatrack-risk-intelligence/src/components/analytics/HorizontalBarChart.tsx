export interface HorizontalBarChartProps {
  data: { label: string; value: number; emphasized?: boolean }[];
  valueSuffix?: string;
}

/** Simple, readable horizontal bar chart - each bar's length is
 * proportional to its value against the series max, with the value
 * printed at the end so exact numbers are always legible (not just
 * implied by bar length). */
export function HorizontalBarChart({ data, valueSuffix = "" }: HorizontalBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-stack-sm">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-stack-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant w-[150px] shrink-0 truncate">
            {d.label}
          </span>
          <div className="flex-1 h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-on-surface transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max((d.value / max) * 100, 2)}%` }}
            />
          </div>
          <span className="font-data-mono text-data-mono text-on-surface w-[44px] text-right shrink-0">
            {d.value}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
}
