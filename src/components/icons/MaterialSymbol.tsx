import type { HTMLAttributes } from "react";
import clsx from "clsx";

export interface MaterialSymbolProps extends HTMLAttributes<HTMLSpanElement> {
  /** Material Symbols ligature name, e.g. "dashboard", "warning". */
  name: string;
  /** Renders the filled ('FILL' 1) variant, as used on the High Risk warning icon. */
  filled?: boolean;
  className?: string;
}

/**
 * Typed wrapper around Google's Material Symbols Outlined ligature font -
 * the same icon technique used in the Stitch reference (code.html), kept
 * as-is so every glyph renders pixel-identical to the source instead of
 * swapping in a different icon set.
 */
export function MaterialSymbol({
  name,
  filled = false,
  className,
  ...rest
}: MaterialSymbolProps) {
  return (
    <span
      className={clsx("material-symbols-outlined", filled && "fill", className)}
      aria-hidden="true"
      {...rest}
    >
      {name}
    </span>
  );
}
