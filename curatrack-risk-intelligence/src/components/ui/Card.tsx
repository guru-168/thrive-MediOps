import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import clsx from "clsx";

interface CardOwnProps<T extends ElementType> {
  /** Underlying element/tag, e.g. "section", "aside", or "button" for a clickable card. */
  as?: T;
  /** Adds the error-tinted border used by the "High Risk" metric card. */
  tone?: "default" | "critical";
  className?: string;
  children?: ReactNode;
}

export type CardProps<T extends ElementType = "div"> = CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

/**
 * Shared Level-1 surface primitive (per DESIGN.md's elevation model):
 * surface-container-lowest background, 1px outline-variant border,
 * base radius, and a subtle shadow.
 *
 * Properly polymorphic over `as` (via a generic element type) so that,
 * e.g., `as="button"` correctly types through button-specific props like
 * `type` and `onClick` instead of the narrower `HTMLAttributes<HTMLElement>`.
 */
export function Card<T extends ElementType = "div">({
  tone = "default",
  as,
  className,
  children,
  ...rest
}: CardProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      className={clsx(
        "bg-surface-container-lowest rounded shadow-sm",
        tone === "critical" ? "border border-error-container" : "border border-outline-variant",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
