import type { Config } from "tailwindcss";

// Design tokens ported 1:1 from the Stitch reference (DESIGN.md frontmatter +
// code.html's inline tailwind.config). Do not add or rename tokens here —
// this file is the single source of truth for the "Monochrome Clinical
// Light" design system and every component class should resolve against it.
//
// Each token resolves through a CSS custom property (defined in index.css
// as "R G B" channel triplets, for both `:root` and `.dark`) rather than a
// static hex value, so toggling the `dark` class on the app root re-themes
// every utility class that uses these tokens - bg-surface, text-on-surface,
// border-outline-variant, etc. - across the whole app at once. The
// `withOpacity` helper preserves support for Tailwind opacity modifiers
// (e.g. bg-surface/50) on top of the CSS-variable indirection.
function withOpacity(variable: string) {
  return ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined
      ? `rgb(var(${variable}))`
      : `rgb(var(${variable}) / ${opacityValue})`;
}

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "secondary-container": withOpacity("--color-secondary-container"),
        "on-primary-container": withOpacity("--color-on-primary-container"),
        "surface-container-high": withOpacity("--color-surface-container-high"),
        "surface-container-highest": withOpacity("--color-surface-container-highest"),
        "tertiary-container": withOpacity("--color-tertiary-container"),
        "on-secondary-container": withOpacity("--color-on-secondary-container"),
        "on-primary-fixed-variant": withOpacity("--color-on-primary-fixed-variant"),
        "surface-container-lowest": withOpacity("--color-surface-container-lowest"),
        "surface-bright": withOpacity("--color-surface-bright"),
        "inverse-primary": withOpacity("--color-inverse-primary"),
        "secondary-fixed": withOpacity("--color-secondary-fixed"),
        "error-container": withOpacity("--color-error-container"),
        "surface-container-low": withOpacity("--color-surface-container-low"),
        "on-error-container": withOpacity("--color-on-error-container"),
        "secondary-fixed-dim": withOpacity("--color-secondary-fixed-dim"),
        tertiary: withOpacity("--color-tertiary"),
        "primary-fixed-dim": withOpacity("--color-primary-fixed-dim"),
        "surface-container": withOpacity("--color-surface-container"),
        "surface-tint": withOpacity("--color-surface-tint"),
        error: withOpacity("--color-error"),
        "inverse-surface": withOpacity("--color-inverse-surface"),
        "tertiary-fixed-dim": withOpacity("--color-tertiary-fixed-dim"),
        outline: withOpacity("--color-outline"),
        "on-surface-variant": withOpacity("--color-on-surface-variant"),
        "primary-fixed": withOpacity("--color-primary-fixed"),
        "on-tertiary-container": withOpacity("--color-on-tertiary-container"),
        primary: withOpacity("--color-primary"),
        "on-tertiary-fixed": withOpacity("--color-on-tertiary-fixed"),
        "on-tertiary-fixed-variant": withOpacity("--color-on-tertiary-fixed-variant"),
        "primary-container": withOpacity("--color-primary-container"),
        "on-primary-fixed": withOpacity("--color-on-primary-fixed"),
        "outline-variant": withOpacity("--color-outline-variant"),
        "surface-variant": withOpacity("--color-surface-variant"),
        surface: withOpacity("--color-surface"),
        "on-surface": withOpacity("--color-on-surface"),
        "surface-dim": withOpacity("--color-surface-dim"),
        "on-secondary-fixed-variant": withOpacity("--color-on-secondary-fixed-variant"),
        background: withOpacity("--color-background"),
        "inverse-on-surface": withOpacity("--color-inverse-on-surface"),
        "on-primary": withOpacity("--color-on-primary"),
        "on-error": withOpacity("--color-on-error"),
        secondary: withOpacity("--color-secondary"),
        "tertiary-fixed": withOpacity("--color-tertiary-fixed"),
        "on-background": withOpacity("--color-on-background"),
        "on-tertiary": withOpacity("--color-on-tertiary"),
        "on-secondary-fixed": withOpacity("--color-on-secondary-fixed"),
        "on-secondary": withOpacity("--color-on-secondary"),
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        "stack-lg": "32px",
        "stack-md": "16px",
        "stack-sm": "8px",
        "container-margin": "24px",
        gutter: "16px",
      },
      fontFamily: {
        "headline-md": ["Inter", "sans-serif"],
        "data-mono": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "title-lg": ["Inter", "sans-serif"],
      },
      fontSize: {
        "headline-md": [
          "24px",
          { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "data-mono": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "500",
            fontVariantNumeric: "tabular-nums",
          },
        ],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" },
        ],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "display-lg": [
          "36px",
          {
            lineHeight: "44px",
            letterSpacing: "-0.02em",
            fontWeight: "700",
            fontVariantNumeric: "tabular-nums",
          },
        ],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "title-lg": ["18px", { lineHeight: "24px", fontWeight: "600" }],
      },
      // Small, functional motion primitives for popovers/menus and the
      // route-content fade - not decorative flourish, just enough to
      // signal state changes (open/close, navigation) the way a serious
      // product's UI already does by default.
      keyframes: {
        "panel-in": {
          "0%": { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "panel-in": "panel-in 150ms ease-out",
        "fade-in-up": "fade-in-up 200ms ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
};

export default config;
