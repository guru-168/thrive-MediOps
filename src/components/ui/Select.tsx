import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/** Native <select>, styled to match the app's input/border tokens. Native
 * rather than a custom listbox so keyboard/screen-reader support is free. */
export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <select
      className={clsx(
        "bg-surface-container-lowest border border-outline-variant rounded-sm py-2 pl-3 pr-8 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-outline focus:ring-1 focus:ring-outline transition-colors cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}
