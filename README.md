# MediOps Premium — Clinical Dashboard

Frontend-only React port of the Stitch-generated "Risk Command Center" UI
(`code.html` / `DESIGN.md` / `screen.png`). This is a static conversion:
no backend, no API calls, no auth, no state-management library. All data
is typed mock data in `src/data/mockPatients.ts`.

Only the **Overview** screen (`/`) was included in the reference design.
The other sidebar links (Patients, Follow-ups, Analytics, Settings) are
wired up with `react-router` but render a plain "not yet designed"
placeholder — routes are real and ready for a real screen to be dropped
in later.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v3 (`tailwind.config.ts` is a direct port of the design
  tokens in DESIGN.md / code.html's inline Tailwind config — colors,
  radii, spacing scale, and named font sizes)
- react-router-dom for the sidebar navigation
- Material Symbols Outlined (Google Fonts, ligature icon font) for every
  icon, matching the reference exactly rather than swapping to an SVG
  icon set

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # typecheck (tsc -b) + production build
npm run preview   # preview the production build locally
```

## Project structure

```
src/
├── components/
│   ├── icons/MaterialSymbol.tsx      # typed wrapper around the ligature icon font
│   ├── layout/                        # AppShell, SideNav, TopAppBar
│   ├── ui/                            # Card, Button, SearchInput primitives
│   └── dashboard/                     # MetricCard, PatientQueueTable, RiskDistributionPanel, ...
├── data/mockPatients.ts               # typed mock data (patients, metrics, risk distribution)
├── types/patient.ts                   # Patient, SeverityLevel, etc.
├── pages/                             # OverviewPage (designed) + PlaceholderPage (stub screens)
├── router/routes.tsx                  # sidebar nav item definitions
└── App.tsx                            # route table
```

## Notes on fidelity to the reference

- **Design tokens** are ported 1:1 — do not add/rename Tailwind tokens
  without updating DESIGN.md's source of truth alongside them.
- **Icons**: code.html's own inline `<style>` block set the Material
  Symbols variable-font axes but omitted the `font-family` declaration
  required to actually render the ligatures as glyphs — that's added in
  `src/index.css` (harmless fix, otherwise icons render as literal words
  like "dashboard" instead of the icon).
- **Risk Distribution donut**: the reference's arc was a hard-coded
  `clip-path` shape that didn't match its own legend (visually ~25%
  red, legend says 3.4%). This version draws the ring with a
  `conic-gradient` whose stops are computed from `riskDistribution` in
  `mockPatients.ts`, so the ring and legend can never disagree again —
  this was an explicitly approved deviation from the reference PNG, not
  an oversight.
- The clinician avatar and both fonts are loaded from their original
  external URLs (Google Fonts, `lh3.googleusercontent.com`) exactly as
  in code.html.
