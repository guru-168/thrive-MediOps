"""Feature preparation: turns a validated `PredictionRequest` into the
fixed-order feature vector / DataFrame consumed by the calibrated ML model
or the fallback rule-based adapter.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import pandas as pd

from app.schemas import PredictionRequest

# Authoritative feature order matching D:\Thrive Ml\src\api.py and the
# ColumnTransformer preprocessor inside model.joblib.
FEATURE_ORDER: tuple[str, ...] = (
    "Gender",
    "age_clean",
    "Scholarship",
    "Hipertension",
    "Diabetes",
    "Alcoholism",
    "Handcap",
    "SMS_received",
    "Neighbourhood",
    "waiting_time_days",
    "appointment_day_of_week",
    "appointment_month",
    "scheduled_hour",
    "previous_appointments",
    "previous_no_shows",
    "previous_attendance_rate",
    "days_since_previous_appointment",
)


@dataclass(frozen=True)
class FeatureSet:
    """Raw, model-shaped, and normalized features for one patient."""

    model_dict: dict[str, Any]
    raw: dict[str, float]
    normalized: dict[str, float]
    missed_rate: float

    def as_dataframe(self) -> pd.DataFrame:
        """Constructs a single-row DataFrame formatted for the sklearn Pipeline."""
        return pd.DataFrame([self.model_dict], columns=FEATURE_ORDER)

    def as_vector(self) -> list[Any]:
        """Raw features in FEATURE_ORDER."""
        return [self.model_dict[name] for name in FEATURE_ORDER]


def _clip01(value: float) -> float:
    return max(0.0, min(1.0, value))


def build_features(request: PredictionRequest) -> FeatureSet:
    total = request.previous_appointments
    missed = request.previous_no_shows
    missed_rate = (missed / total) if total > 0 else 0.0
    attendance_rate = (
        request.previous_attendance_rate
        if request.previous_attendance_rate is not None
        else (1.0 - missed_rate if total > 0 else 1.0)
    )

    model_dict: dict[str, Any] = {
        "Gender": request.gender,
        "age_clean": float(request.age),
        "Scholarship": int(request.scholarship),
        "Hipertension": int(request.hipertension),
        "Diabetes": int(request.diabetes),
        "Alcoholism": int(request.alcoholism),
        "Handcap": int(request.handcap),
        "SMS_received": int(request.sms_received),
        "Neighbourhood": str(request.neighbourhood),
        "waiting_time_days": float(request.waiting_time_days),
        "appointment_day_of_week": int(request.appointment_day_of_week),
        "appointment_month": int(request.appointment_month),
        "scheduled_hour": int(request.scheduled_hour),
        "previous_appointments": int(total),
        "previous_no_shows": int(missed),
        "previous_attendance_rate": float(attendance_rate),
        "days_since_previous_appointment": float(request.days_since_previous_appointment),
    }

    raw: dict[str, float] = {
        "age": float(request.age),
        "distance_km": float(request.distance_km),
        "missed_appointments": float(missed),
        "total_appointments": float(total),
        "treatment_duration_months": float(request.treatment_duration_months),
        "appointment_frequency_days": float(request.appointment_frequency_days),
        "waiting_time_days": float(request.waiting_time_days),
        "sms_received": float(request.sms_received),
        "hipertension": float(request.hipertension),
        "diabetes": float(request.diabetes),
        "previous_attendance_rate": float(attendance_rate),
        "days_since_previous_appointment": float(request.days_since_previous_appointment),
    }

    normalized: dict[str, float] = {
        "missed_rate": _clip01(missed_rate),
        "missed_count": _clip01(missed / 10),
        "distance": _clip01(request.distance_km / 50),
        "frequency": _clip01(1 - (request.appointment_frequency_days / 60)),
        "treatment_duration": _clip01(request.treatment_duration_months / 24),
        "age": _clip01(
            (35 - request.age) / 35 if request.age < 35 else (request.age - 65) / 35 if request.age > 65 else 0.0
        ),
        "waiting_time": _clip01(request.waiting_time_days / 30),
        "hipertension": float(request.hipertension),
        "diabetes": float(request.diabetes),
        "no_sms": 1.0 if request.sms_received == 0 else 0.0,
    }

    return FeatureSet(
        model_dict=model_dict,
        raw=raw,
        normalized=normalized,
        missed_rate=missed_rate,
    )

