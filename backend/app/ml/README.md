# Trained Model Integration

The trained model artifact is active at:

```
backend/app/ml/model.joblib
```

`app/services/model_adapter.py::load_model_adapter` loads this artifact on startup and sets `model_type` to `"trained_model"`.

## Model Architecture & Training Contract

- **Model Type**: Calibrated XGBoost Classifier (`sklearn.calibration.CalibratedClassifierCV` using Platt/sigmoid scaling over a `Pipeline([('preprocessor', ColumnTransformer(...)), ('classifier', XGBClassifier(...))])`).
- **Two independent thresholds** - matching `D:\Thrive Ml\src\api.py` exactly. Do not conflate them:
  - **Intervention threshold: `0.22`** - the model's locked decision threshold, selected on validation F1 in `D:\Thrive Ml\src\calibrate_model.py` and persisted at `D:\Thrive Ml\outputs\calibrated_threshold_config.json` (`"selected_threshold"`). Drives `intervention_required` ONLY (`Settings.intervention_threshold`).
  - **Risk-level bands** (`get_risk_category` in `D:\Thrive Ml\src\api.py`) - drive the low/moderate/high badge shown to staff (`Settings.risk_threshold_low` / `risk_threshold_high`):
    - `risk_score >= 0.70`: High Risk
    - `0.40 <= risk_score < 0.70`: Moderate Risk
    - `risk_score < 0.40`: Low Risk
  - Because these are independent, a patient can be labeled **Low Risk** while still having `intervention_required: true` (e.g. score `0.30`: below the 0.40 moderate band, above the 0.22 intervention cutoff) - that's the source model's intended behavior, not a bug.

## Expected Features (`FEATURE_ORDER`)

The model receives a 2D DataFrame or array with exactly these 17 features in order:

| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 0 | `Gender` | str | Patient gender (`"M"` or `"F"`) |
| 1 | `age_clean` | float | Patient age (0–120) |
| 2 | `Scholarship` | int | Welfare program enrollment (0 or 1) |
| 3 | `Hipertension` | int | Hypertension diagnosis (0 or 1) |
| 4 | `Diabetes` | int | Diabetes diagnosis (0 or 1) |
| 5 | `Alcoholism` | int | History of alcoholism (0 or 1) |
| 6 | `Handcap` | int | Disability / handicap level (0–4) |
| 7 | `SMS_received` | int | SMS reminder received (0 or 1) |
| 8 | `Neighbourhood` | str | District/neighbourhood name (handled via OneHotEncoder) |
| 9 | `waiting_time_days` | float | Days between scheduling and appointment |
| 10 | `appointment_day_of_week` | int | Day of week (0=Mon, 6=Sun) |
| 11 | `appointment_month` | int | Appointment month (1–12) |
| 12 | `scheduled_hour` | int | Hour appointment was booked (0–23) |
| 13 | `previous_appointments` | int | Total historical visits scheduled |
| 14 | `previous_no_shows` | int | Historical missed visits |
| 15 | `previous_attendance_rate` | float | Historical attendance rate (0.0–1.0) |
| 16 | `days_since_previous_appointment` | float | Days since prior appointment |

**Note:** `distance_km`, `treatment_duration_months`, and `appointment_frequency_days` (the PS-01 contextual fields, still accepted by `PredictionRequest` and used by `RuleBasedAdapter`) are **not** among these 17 columns - the trained model never sees them. `TrainedModelAdapter.feature_contributions` deliberately excludes them from its output so a trained-model prediction's `reasons[]` never claims one of them influenced a score it couldn't have.

