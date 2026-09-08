import type { Patient, RiskDistributionSlice } from "../types/patient";

/**
 * Builds the printable Clinical Risk Distribution Report.
 *
 * Deliberately a pure data -> HTML string function with no network access
 * and no scoring of its own: every number it prints is passed in from the
 * dashboard's own live `/patients/rank` state (see OverviewPage), so the
 * report cannot disagree with what the clinician is looking at on screen.
 * Nothing here recalculates a risk score, re-bands a severity, or derives
 * `intervention_required` - those all come from the backend response
 * unchanged.
 */

export interface ReportInput {
  generatedAt: Date;
  /** The full ranked panel, highest risk first - the backend's own ordering. */
  queue: Patient[];
  distribution: RiskDistributionSlice[];
  /** Count of patients whose score cleared the model's intervention threshold. */
  interventionsRequired: number;
  /** From the API response (e.g. "trained_model") - never assumed. */
  modelType: string | null;
  /** Signed-in user, for the report header. Null if unavailable. */
  preparedBy: string | null;
}

/** Patient names and factor labels are interpolated into markup - escape them. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function percent(count: number, total: number): string {
  if (total <= 0) return "—";
  return `${((count / total) * 100).toFixed(1)}%`;
}

const SEVERITY_LABEL: Record<Patient["severity"], string> = {
  critical: "High / Critical",
  elevated: "Medium / Elevated",
  routine: "Low / Routine",
};

/**
 * A standalone document: all styling is inlined and there are no external
 * requests, so the tab it opens in renders identically offline and prints
 * (or "Save as PDF"s) without the app's chrome. Print rules mirror the
 * dashboard's own restrained palette - neutral type, hairline rules, red
 * reserved for critical/urgent states.
 */
export function buildClinicalReportHtml(input: ReportInput): string {
  const { generatedAt, queue, distribution, interventionsRequired, modelType, preparedBy } = input;
  const total = queue.length;

  const generatedStamp = generatedAt.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });

  const summaryRows = distribution
    .map(
      (slice) => `
        <tr>
          <td><span class="swatch swatch-${slice.severity}"></span>${escapeHtml(slice.label)}</td>
          <td class="num">${slice.count}</td>
          <td class="num">${percent(slice.count, total)}</td>
        </tr>`,
    )
    .join("");

  const patientRows = queue
    .map(
      (patient, index) => `
        <tr>
          <td class="num muted">${index + 1}</td>
          <td class="mono">${escapeHtml(patient.id)}</td>
          <td>${escapeHtml(patient.name)}</td>
          <td class="num ${patient.isUrgent ? "urgent" : ""}">${patient.riskScore}%</td>
          <td><span class="badge badge-${patient.severity}">${SEVERITY_LABEL[patient.severity]}</span></td>
          <td>${escapeHtml(patient.keyContributor)}</td>
          <td>${escapeHtml(patient.nextFollowUp)}</td>
          <td class="center">${patient.isUrgent ? '<strong class="urgent">Yes</strong>' : "No"}</td>
        </tr>`,
    )
    .join("");

  const emptyState = `
    <tr><td colspan="8" class="empty">No patients are currently under active follow-up monitoring.</td></tr>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MediOps Premium - Clinical Risk Report</title>
<style>
  :root { --ink:#16181c; --muted:#5f6368; --line:#dfe1e5; --bg:#fff; --error:#b3261e; --chip:#eef0f3; }
  * { box-sizing: border-box; }
  body { margin:0; padding:40px; background:var(--bg); color:var(--ink);
         font:14px/1.5 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
         -webkit-font-smoothing:antialiased; }
  .sheet { max-width: 1000px; margin: 0 auto; }
  header { border-bottom:2px solid var(--ink); padding-bottom:16px; margin-bottom:24px; }
  h1 { font-size:20px; font-weight:700; margin:0; letter-spacing:-.01em; }
  .sub { font-size:13px; color:var(--muted); margin-top:2px; }
  .meta { margin-top:14px; display:flex; flex-wrap:wrap; gap:8px 32px; font-size:12px; color:var(--muted); }
  .meta b { color:var(--ink); font-weight:600; }
  h2 { font-size:12px; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
       color:var(--muted); margin:28px 0 10px; }
  .cards { display:flex; flex-wrap:wrap; gap:12px; }
  .card { flex:1 1 150px; border:1px solid var(--line); border-radius:8px; padding:12px 14px; }
  .card .k { font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); }
  .card .v { font-size:26px; font-weight:700; margin-top:4px; font-variant-numeric:tabular-nums; }
  .card.crit { border-color:#f3c9c5; background:#fdf6f5; }
  .card.crit .v { color:var(--error); }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; font-size:11px; letter-spacing:.06em; text-transform:uppercase;
       color:var(--muted); font-weight:600; padding:8px 10px; border-bottom:1px solid var(--line); }
  td { padding:8px 10px; border-bottom:1px solid var(--line); vertical-align:top; }
  .num { text-align:right; font-variant-numeric:tabular-nums; }
  .center { text-align:center; }
  .mono { font-variant-numeric:tabular-nums; color:var(--muted); }
  .muted { color:var(--muted); }
  .urgent { color:var(--error); font-weight:600; }
  .empty { text-align:center; color:var(--muted); padding:24px 10px; }
  .swatch { display:inline-block; width:10px; height:10px; border-radius:2px; margin-right:8px; vertical-align:middle; }
  .swatch-critical { background:var(--error); }
  .swatch-elevated { background:#c9ccd1; }
  .swatch-routine  { background:var(--chip); border:1px solid var(--line); }
  .badge { display:inline-block; font-size:11px; font-weight:600; letter-spacing:.04em;
           padding:2px 8px; border-radius:999px; background:var(--chip); white-space:nowrap; }
  .badge-critical { background:#fbe9e7; color:var(--error); }
  .disclaimer { margin-top:32px; border:1px solid var(--line); border-left:3px solid var(--ink);
                border-radius:6px; padding:14px 16px; font-size:12px; color:var(--muted); }
  .disclaimer b { color:var(--ink); }
  footer { margin-top:24px; padding-top:12px; border-top:1px solid var(--line);
           font-size:11px; color:var(--muted); display:flex; justify-content:space-between; gap:16px; }
  @media print {
    body { padding:0; }
    .card, .disclaimer, table { break-inside:avoid; }
    thead { display:table-header-group; }
    tr { break-inside:avoid; }
  }
</style>
</head>
<body>
<div class="sheet">
  <header>
    <h1>MediOps Premium</h1>
    <div class="sub">Clinical Dashboard &mdash; Follow-up Risk Distribution Report</div>
    <div class="meta">
      <span>Generated <b>${escapeHtml(generatedStamp)}</b></span>
      ${preparedBy ? `<span>Prepared by <b>${escapeHtml(preparedBy)}</b></span>` : ""}
      ${modelType ? `<span>Scoring source <b>${escapeHtml(modelType)}</b></span>` : ""}
    </div>
  </header>

  <h2>Population Summary</h2>
  <div class="cards">
    <div class="card"><div class="k">Total Monitored</div><div class="v">${total}</div></div>
    <div class="card crit"><div class="k">High / Critical</div><div class="v">${
      distribution.find((s) => s.severity === "critical")?.count ?? 0
    }</div></div>
    <div class="card"><div class="k">Medium / Elevated</div><div class="v">${
      distribution.find((s) => s.severity === "elevated")?.count ?? 0
    }</div></div>
    <div class="card"><div class="k">Low / Routine</div><div class="v">${
      distribution.find((s) => s.severity === "routine")?.count ?? 0
    }</div></div>
    <div class="card"><div class="k">Intervention Required</div><div class="v">${interventionsRequired}</div></div>
  </div>

  <h2>Risk Distribution</h2>
  <table>
    <thead><tr><th>Risk Band</th><th class="num">Patients</th><th class="num">Share</th></tr></thead>
    <tbody>${summaryRows}</tbody>
  </table>

  <h2>Prioritized Patient Queue</h2>
  <table>
    <thead>
      <tr>
        <th class="num">#</th><th>Patient ID</th><th>Name</th><th class="num">Risk Score</th>
        <th>Severity</th><th>Key Contributor</th><th>Next Follow-up</th><th class="center">Intervention</th>
      </tr>
    </thead>
    <tbody>${patientRows || emptyState}</tbody>
  </table>

  <div class="disclaimer">
    <b>Clinical decision-support notice.</b> This report is generated by an automated
    follow-up risk model and is intended solely to help staff prioritise outreach. It is
    <b>not a medical diagnosis</b> and must not be used as the sole basis for any clinical
    decision. Risk bands are operational triage categories, and &ldquo;Intervention&rdquo;
    reflects the model&rsquo;s own decision threshold, which is independent of the risk band &mdash;
    a patient may be banded Low while still warranting preventive outreach. All scores reflect
    the data available at the moment of generation and may change as new information is recorded.
    Clinical judgement always takes precedence.
  </div>

  <footer>
    <span>MediOps Premium &mdash; Clinical Command Center</span>
    <span>${total} patient${total === 1 ? "" : "s"} in this report</span>
  </footer>
</div>
</body>
</html>`;
}
