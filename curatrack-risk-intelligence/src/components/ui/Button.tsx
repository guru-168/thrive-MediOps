import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

/**
 * Pill-shaped button per DESIGN.md's "Inputs & Actions" spec: primary is
 * solid neutral-gray/black, secondary is a ghost outline, ghost is text-only.
 */
export function Button({ variant = "secondary", className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "rounded-full font-label-md text-label-md uppercase tracking-wider transition-colors",
        variant === "primary" &&
          "bg-primary text-on-primary hover:opacity-90 px-stack-md py-2",
        variant === "secondary" &&
          "w-full py-2 bg-surface hover:bg-surface-container border border-outline-variant text-on-surface",
        variant === "ghost" && "text-on-surface hover:text-primary",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
