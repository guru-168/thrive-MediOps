import { useRef, useState } from "react";
import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { useDismiss } from "../../hooks/useDismiss";
import type { SeverityFilter } from "../../types/patient";

export interface RiskFilterMenuProps {
  value: SeverityFilter;
  onChange: (value: SeverityFilter) => void;
}

const OPTIONS: { value: SeverityFilter; label: string }[] = [
  { value: "all", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "elevated", label: "Elevated" },
  { value: "routine", label: "Routine" },
];

/** Filter dropdown for the patient queue table's severity/status filter. */
export function RiskFilterMenu({ value, onChange }: RiskFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), containerRef);

  const activeLabel = OPTIONS.find((o) => o.value === value)?.label ?? "All severities";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={clsx(
          "flex items-center gap-2 transition-colors font-label-md text-label-md uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline focus-visible:ring-offset-1 rounded-sm",
          value !== "all" ? "text-on-surface font-bold" : "text-on-surface-variant hover:text-on-surface",
        )}
      >
        <MaterialSymbol name="filter_list" className="text-sm" />
        {value === "all" ? "Filter" : `Filter · ${activeLabel}`}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Filter by severity"
          className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded shadow-lg z-50 py-1 animate-panel-in"
        >
          {OPTIONS.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={clsx(
                  "w-full text-left flex items-center justify-between px-stack-md py-2 font-body-sm text-body-sm transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:bg-surface-container-low",
                  isActive ? "text-on-surface font-semibold" : "text-on-surface-variant",
                )}
              >
                {option.label}
                {isActive && <MaterialSymbol name="check" className="text-base" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
