# Patient Follow-up Risk Predictor API (PS-01)

FastAPI backend that scores patients on how likely they are to miss their
next follow-up appointment, and ranks a patient panel by that risk so
staff know who to reach out to first. Every score ships with the actual
input factors that produced it - see [Explanations](#explanations) below.

## Quick start

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

> If port 8000 is already in use on your machine, pass `--port 8001` (or
> any free port) and set the frontend's `VITE_API_URL` to match.

## Environment variables

Copy `.env.example` to `.env` and adjust as needed - see that file for
the full list (`ALLOWED_ORIGINS`, `MODEL_PATH`, `RISK_THRESHOLD_LOW`,
`RISK_THRESHOLD_HIGH`, `INTERVENTION_THRESHOLD`, `MAX_BATCH_SIZE`). The
app runs with sensible defaults with no `.env` file at all.

## Running tests

```bash
cd backend
pip install -r requirements.txt   # includes pytest/httpx
pytest -q
```

29 tests cover `/health`, valid/invalid `/predict` requests, batch
ranking (including determinism), risk-level classification, explanation
generation, that a trained-model prediction never cites a feature the
model wasn't fitted on, and that error responses never leak internals.

## API endpoints

### `GET /health`

```json
{
  "status": "ok",
  "app_name": "Patient Follow-up Risk Predictor API",
  "app_version": "0.1.0",
  "model_type": "trained_model",
  "model_loaded": true
}
```

`model_type` reads `"rule_based"` whenever no file exists at `MODEL_PATH`
(`app/ml/model.joblib` by default) and `"trained_model"` once one is
present and loads successfully - see [Model integration](#model-integration)
below. The frontend surfaces this field directly so nobody mistakes one
for the other.

### `POST /predict`

Score one patient. Request body - strongly typed and bounded, see
`app/schemas.py::PredictionRequest` for the full 17-field contract the
trained model expects (only `patient_id` and `age` are required; every
other field has a documented default so a minimal PS-01-shaped request
still works):

```json
{
  "patient_id": "P001",
  "patient_name": "Jordan Lee",
  "gender": "F",
  "age": 45,
  "neighbourhood": "JARDIM DA PENHA",
  "scholarship": 0,
  "hipertension": 1,
  "diabetes": 0,
  "alcoholism": 0,
  "handcap": 0,
  "sms_received": 1,
  "waiting_time_days": 7,
  "appointment_day_of_week": 2,
  "appointment_month": 9,
  "scheduled_hour": 10,
  "previous_appointments": 8,
  "previous_no_shows": 3,
  "days_since_previous_appointment": 14,
  "distance_km": 18,
  "treatment_duration_months": 6,
  "appointment_frequency_days": 14
}
```

Response:

```json
{
  "patient_id": "P001",
  "patient_name": "Jordan Lee",
  "risk_score": 0.52,
  "risk_percent": 52,
  "risk_level": "moderate",
  "intervention_required": true,
  "reasons": [
    {
      "factor": "missed_appointments",
      "label": "Previous missed appointments",
      "value": "3 of 8 missed (38% no-show rate)",
      "impact": "high",
      "contribution_percent": 38.0
    },
    {
      "factor": "hipertension",
      "label": "Hypertension diagnosis",
      "value": "Positive",
      "impact": "medium",
      "contribution_percent": 22.4
    }
  ],
  "summary": "This patient is at MODERATE risk of missing their next follow-up, with previous missed appointments (3 of 8 missed (38% no-show rate)) as the leading factor.",
  "recommended_action": "Send a reminder 48-72 hours before the appointment and confirm attendance by phone or message.",
  "model_type": "trained_model",
  "generated_at": "2026-09-01T12:00:00Z"
}
```

Note `distance_km`, `treatment_duration_months`, and
`appointment_frequency_days` are still accepted (PS-01's original
contextual inputs, and what `RuleBasedAdapter` scores on) but are never
cited in a `"trained_model"` response's `reasons[]` - the trained model
wasn't fitted on them, so claiming otherwise would violate PS-01's
"explanations must genuinely follow from the input factors."

### `POST /patients/rank`

Score and rank multiple patients, highest risk first - "which patients
should I intervene with first?"

```json
{ "patients": [ { "patient_id": "P001", ... }, { "patient_id": "P002", ... } ] }
```

Returns `PredictionResponse[]`, **sorted by `risk_score` descending, tied
scores broken by `patient_id` ascending** - the same input always
produces the same order (see `PredictionService.predict_batch`), which
is what makes the ranking defensible rather than an implementation
accident. Bounded to `MAX_BATCH_SIZE` (default 500) patients per call.

## How ranking works

Every patient in the request is scored independently through the same
`PredictionService.predict` used by `/predict`, then the whole list is
sorted once. There's no separate "ranking model" - ranking is just a
deterministic sort over individually-explainable scores, so every row in
a ranked list carries the same reasons a single `/predict` call would
give that patient.

## Explanations

Every `reasons[]` entry is computed from - and only from - that
patient's actual input values:

- `RuleBasedAdapter` (used only as a fallback when no model file is
  present) *is* a weighted sum, so each factor's `contribution_percent`
  is the exact share of the score it produced - see
  `app/services/model_adapter.py` for the documented weights and
  `app/services/features.py` for what each factor measures and why.
- `TrainedModelAdapter` (the active adapter today) derives
  `contribution_percent` from the model's own `feature_importances_`
  weighted by each patient's actual feature values - see
  `TrainedModelAdapter.feature_contributions`. It **only ever cites the
  17 features the model was actually fitted on** (`FEATURE_ORDER` in
  `app/services/features.py`) - `distance_km`, `treatment_duration_months`,
  and `appointment_frequency_days` are deliberately excluded from its
  output, since the model never saw them.
- `app/services/explanation_service.py` turns whichever adapter's
  contributions into human-readable reasons, sorted by contribution,
  each carrying the patient's actual value (e.g. `"3 of 8 missed (38%
  no-show rate)"`) - never a generic "AI detected high risk" statement.
- `TrainedModelAdapter.feature_contributions` is also the documented spot
  to swap in real per-instance attributions (e.g. SHAP) later -
  `explanation_service.py` needs no changes when that happens, since it
  already consumes "factor -> contribution %" generically.

## Risk levels

Two **independent** thresholds, both centralized in
`app/services/risk_classifier.py` - matching the source model project
(`D:\Thrive Ml\src\api.py`) exactly, so recalibrating either is a
one-line config change and nothing else in the codebase hard-codes a
cutoff:

- **`risk_level` band** (`Settings.risk_threshold_low` / `risk_threshold_high`,
  env vars `RISK_THRESHOLD_LOW` / `RISK_THRESHOLD_HIGH`, default `0.40` /
  `0.70`) - the low/moderate/high badge shown to staff. Operational
  triage categories, **not a medical diagnosis**.
- **`intervention_required`** (`Settings.intervention_threshold`, env var
  `INTERVENTION_THRESHOLD`, default `0.22`) - the model's own locked
  decision threshold, selected on validation F1
  (`D:\Thrive Ml\src\calibrate_model.py` /
  `D:\Thrive Ml\outputs\calibrated_threshold_config.json`).

These do **not** move together: a patient can be `risk_level: "low"`
(below 0.40) while still `intervention_required: true` (above 0.22) -
e.g. a score of `0.30`. That's the source model's intended behavior, not
a bug - deriving one from the other was an actual bug that's since been
fixed (see `app/services/risk_classifier.py`'s module docstring).

## Model integration

The trained model is **already active** at `backend/app/ml/model.joblib`
(a calibrated XGBoost classifier) - every response's `model_type` reads
`"trained_model"`. `RuleBasedAdapter` remains as the automatic fallback
whenever no file exists at `MODEL_PATH`, so the API stays fully demoable
even without it (PS-01: "Model or rules are both acceptable").

To replace it with a different/retrained model:

1. Save it to **`backend/app/ml/model.joblib`** (path configurable via
   `MODEL_PATH`) with `joblib.dump(model, path)`.
2. It must implement **`.predict_proba(X)`** (standard scikit-learn
   binary classifier interface) over a DataFrame/array with the 17
   columns in **[`app/ml/README.md`](app/ml/README.md)**, in that exact
   order (`app/services/features.py::FEATURE_ORDER`).
3. Pin `requirements.txt`'s `scikit-learn`/`xgboost`/`numpy`/`pandas`/`joblib`
   versions to whatever your model was actually pickled with - a version
   mismatch loads (with a warning) but scikit-learn's own docs say it
   "might lead to breaking code or invalid results," so this repo pins
   exact versions rather than risk it.

`app/services/model_adapter.py::load_model_adapter` picks up whatever is
at `MODEL_PATH` on the next process start. If loading fails for any
reason, the API logs it and falls back to `RuleBasedAdapter` rather than
crashing.

**Nothing in `backend/` trains, retrains, or evaluates a model, and
nothing here touches the training pipeline or test dataset in
`D:\Thrive Ml`** - this service only ever calls `.predict_proba()` on
the artifact at `MODEL_PATH`.

## Security / data handling

- CORS origins are configurable (`ALLOWED_ORIGINS`), never wildcarded.
- Validation and unhandled-exception handlers in `app/main.py` return
  clean, generic error bodies - stack traces, file paths, and internal
  exception text are logged server-side only, never sent to the client.
- All patient identifiers in this prototype are synthetic/demo data.

## Project structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app, CORS, error handlers
│   ├── schemas.py                 # Pydantic request/response contracts
│   ├── core/config.py             # Centralized settings (env-driven)
│   ├── routes/
│   │   ├── health.py              # GET /health
│   │   └── predictions.py         # POST /predict, POST /patients/rank
│   ├── services/
│   │   ├── features.py            # Feature preparation
│   │   ├── model_adapter.py       # ModelAdapter interface + rule-based/trained impls
│   │   ├── risk_classifier.py     # Centralized risk-level thresholds
│   │   ├── explanation_service.py # Turns contributions into grounded reasons
│   │   └── prediction_service.py  # Orchestrates the above
│   └── ml/
│       ├── README.md              # Model drop-in contract
│       └── model.joblib           # active trained model (calibrated XGBoost)
├── tests/
├── requirements.txt
└── .env.example
```
