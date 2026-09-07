import clsx from "clsx";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Shows the label text next to the switch (default) or visually hides it, e.g. when a caller already renders its own label. */
  hideLabel?: boolean;
  disabled?: boolean;
}

/** Accessible switch control, styled with the same monochrome design
 * tokens as the rest of the app (no new colors introduced). */
export function Toggle({ checked, onChange, label, hideLabel = false, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline focus-visible:ring-offset-1",
        checked ? "bg-on-surface border-on-surface" : "bg-surface-container-high border-outline-variant",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-surface-container-lowest shadow-sm transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-[3px]",
        )}
      />
      {!hideLabel && <span className="sr-only">{label}</span>}
    </button>
  );
}
