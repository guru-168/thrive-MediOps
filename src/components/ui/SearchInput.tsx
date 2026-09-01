import type { InputHTMLAttributes } from "react";
import { MaterialSymbol } from "../icons/MaterialSymbol";

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

/** Pill search field with a leading icon, used in the top app bar. */
export function SearchInput(props: SearchInputProps) {
  return (
    <div className="relative w-full min-w-0 max-w-xs">
      <MaterialSymbol
        name="search"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
      />
      <input
        type="text"
        className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-outline focus:ring-1 focus:ring-outline transition-colors"
        {...props}
      />
    </div>
  );
}
