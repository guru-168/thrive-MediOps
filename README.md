# MediOps Premium — Patient Follow-up Risk Predictor (PS-01)

A clinical dashboard that predicts which patients are most likely to
miss their next follow-up appointment, ranks them so staff know who to
reach out to first, and explains every score with the actual input
factors behind it. React/TypeScript frontend + FastAPI backend.

> The Overview screen (`/`) is a separate, frozen ICU-vitals demo screen
> from this project's original design brief - unrelated to PS-01 and
> intentionally untouched. Everything else (Patients, Risk Assessment,
> Follow-ups, Analytics) is the follow-up risk product described here.

## Stack

- **Frontend:** Vite + React 19 + TypeScript, Tailwind CSS v3, react-router-dom
- **Backend:** FastAPI (Python), Pydantic v2 - see [`backend/README.md`](backend/README.md) for the full API reference

## Running the whole app

**Backend** (from `backend/`):

```bash
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (from the repo root, in another terminal):

```bash
npm install
cp .env.example .env.local      # VITE_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:5173. If the backend isn't reachable, pages that
depend on it (Patients, Risk Assessment, Follow-ups, Analytics' risk
chart) show a clean error banner with a Retry button - never fake data.

## Running tests

```bash
# Backend - 25 tests: health, valid/invalid /predict, batch ranking &
# determinism, risk classification, explanation generation, error handling
cd backend && pytest -q

# Frontend - the API client (services/api.ts) is the only module that
# talks to the backend; these pin down the camelCase <-> snake_case wire
# contract and error handling
npm test
```

## Environment variables

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `VITE_API_URL` | frontend `.env.local` | `http://localhost:8000` | Base URL the frontend calls for predictions |
| `ALLOWED_ORIGINS` | `backend/.env` | `http://localhost:5173,http://127.0.0.1:5173` | CORS allow-list |
| `MODEL_PATH` | `backend/.env` | `app/ml/model.joblib` | Where the trained model is loaded from |
| `RISK_THRESHOLD_LOW` / `RISK_THRESHOLD_HIGH` | `backend/.env` | `0.40` / `0.70` | Risk-band cutoffs (operational, not medical) |
| `INTERVENTION_THRESHOLD` | `backend/.env` | `0.22` | Model's locked decision threshold - drives `intervention_required` only, independent of the risk band above |

See `.env.example` (root) and `backend/.env.example` for the complete,
commented lists.

## How it works

```
Frontend (src/pages/RiskAssessmentPage, PatientsPage, ...)
   │  src/services/api.ts  (the ONLY place that calls fetch)
   ▼
POST /predict  or  POST /patients/rank
   │  Pydantic validation (app/schemas.py)
   ▼
PredictionService
   │  feature preparation (app/services/features.py)
   ▼
ModelAdapter.predict_proba()   ← TrainedModelAdapter (calibrated XGBoost)
   │  risk probability
   ▼
risk_classifier.classify() + intervention_required()  +  explanation_service.build_reasons()
   ▼
PredictionResponse JSON  →  rendered as risk badge + score + factor-grounded reasons
```

Full request/response examples, the ranking/explanation logic, and the
risk-level/intervention thresholds are documented in
[`backend/README.md`](backend/README.md) and
[`backend/app/ml/README.md`](backend/app/ml/README.md).

**The backend scores patients with a real trained model** - a calibrated
XGBoost classifier at `backend/app/ml/model.joblib` - and every API
response's `model_type` field confirms this (`"trained_model"`). If that
file is ever absent or fails to load, the backend automatically falls
back to a transparent, documented rule-based baseline (`RuleBasedAdapter`)
instead of crashing; the same `model_type` field would then read
`"rule_based"`. The frontend surfaces this field directly next to the
risk score either way, so it's never ambiguous which one produced a
given prediction.

## Project structure

```
backend/                               # FastAPI API - see backend/README.md
src/
├── components/
│   ├── icons/MaterialSymbol.tsx       # typed wrapper around the ligature icon font
│   ├── layout/                        # AppShell, SideNav, TopAppBar
│   ├── ui/                            # Card, Button, Select, RiskLevelBadge, AsyncState, ...
│   ├── dashboard/                     # Overview-only components (frozen)
│   ├── patients/                      # PatientDirectoryTable, PatientRecordDrawer
│   └── analytics/                     # TrendLineChart, RiskBreakdownDonut, ...
├── data/
│   ├── followUpPatients.ts            # demo patient directory (appointment-history inputs only)
│   ├── followUpPatientDetails.ts      # demo per-patient detail-drawer records
│   ├── followUpTasks.ts               # demo follow-up scheduling tasks
│   ├── analyticsMock.ts               # illustrative dashboard trend data
│   └── mockPatients.ts, ...           # Overview-only mock data (frozen, unrelated domain)
├── services/api.ts                    # centralized API client (predict / rank)
├── hooks/useFollowUpRiskPredictions.ts# shared, session-cached batch ranking
├── types/followUp.ts                  # domain types, mirror the backend's Pydantic schemas
├── pages/                             # PatientsPage, RiskAssessmentPage, FollowUpsPage, AnalyticsPage, OverviewPage (frozen)
└── router/routes.tsx, App.tsx
```

## What's mock vs. live

- **Demo inputs are synthetic** (`data/followUpPatients.ts`,
  `data/followUpPatientDetails.ts`) - per PS-01, using synthetic/demo
  patient identifiers for the prototype.
- **Every risk score, risk level, and reason shown anywhere in the UI is
  a live API response.** No component stores or displays a `riskLevel`
  baked into mock data - `useFollowUpRiskPredictions` fetches it from
  `POST /patients/rank` once per session and every page reads from that
  same result.
- Prediction-history entries in the patient detail drawer and the
  Analytics dashboard's volume/completion trend charts are labeled
  illustrative demo data (no backend endpoint for historical logs exists
  in this prototype) - they are never presented as live predictions.

## Notes on fidelity to the original design

- **Design tokens** are ported 1:1 from the original Stitch reference -
  do not add/rename Tailwind tokens without updating `DESIGN.md`.
- **Icons**: Material Symbols ligature font, loaded from Google Fonts.
- The Overview screen's Risk Distribution donut and its ICU-vitals mock
  data are untouched from the original build - a deliberately separate,
  frozen demo screen.
