"""Pydantic request/response contracts for the API.

Defines the authoritative 17-feature contract for the calibrated XGBoost model
as well as response schemas, reason breakdowns, and health status.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, model_validator

RiskLevel = Literal["low", "moderate", "high"]
ImpactLevel = Literal["low", "medium", "high"]
ModelType = Literal["rule_based", "trained_model"]


class PredictionRequest(BaseModel):
    """One patient's data as collected by the Risk Assessment form / a
    batch-ranking row. Contains all 17 clinical and temporal features expected
    by the calibrated XGBoost model, with sensible defaults for scheduling
    metadata."""

    model_config = {"extra": "ignore"}

    patient_id: str = Field(..., min_length=1, max_length=40, description="Demo/synthetic patient identifier.")
    patient_name: str | None = Field(default=None, max_length=120)

    # Demographics & Location
    gender: str = Field(default="F", description="Patient gender: 'M' or 'F'.")
    age: float = Field(..., ge=0, le=120, description="Patient age in years (age_clean).")
    neighbourhood: str = Field(
        default="JARDIM DA PENHA", description="Patient neighbourhood/district name."
    )

    # Clinical Conditions & Social Support
    scholarship: int = Field(
        default=0, ge=0, le=1, description="Welfare assistance / social benefit (Bolsa Família): 0 or 1."
    )
    hipertension: int = Field(
        default=0, ge=0, le=1, description="Hypertension diagnosis: 0 or 1."
    )
    diabetes: int = Field(
        default=0, ge=0, le=1, description="Diabetes diagnosis: 0 or 1."
    )
    alcoholism: int = Field(
        default=0, ge=0, le=1, description="Alcoholism history: 0 or 1."
    )
    handcap: int = Field(
        default=0, ge=0, le=4, description="Handicap / disability severity: 0 to 4."
    )

    # Appointment Logistics
    sms_received: int = Field(
        default=0, ge=0, le=1, description="SMS appointment reminder received: 0 or 1."
    )
    waiting_time_days: float = Field(
        default=7.0, ge=0, le=365, description="Days between scheduling date and appointment date."
    )
    appointment_day_of_week: int = Field(
        default=2, ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)."
    )
    appointment_month: int = Field(
        default=9, ge=1, le=12, description="Appointment month (1-12)."
    )
    scheduled_hour: int = Field(
        default=10, ge=0, le=23, description="Hour of the day scheduled (0-23)."
    )

    # Historical Attendance
    previous_appointments: int = Field(
        default=0, ge=0, le=10_000, description="Total historical appointments scheduled."
    )
    previous_no_shows: int = Field(
        default=0, ge=0, le=10_000, description="Total historical no-shows / missed visits."
    )
    previous_attendance_rate: float | None = Field(
        default=None, ge=0, le=1, description="Historical attendance rate (0.0 to 1.0). Auto-calculated if omitted."
    )
    days_since_previous_appointment: float = Field(
        default=30.0, ge=0, le=3650, description="Days elapsed since previous appointment."
    )

    # Legacy / PS-01 Contextual Fields (Accepted for backward compatibility and triage context)
    distance_km: float = Field(
        default=10.0, ge=0, le=2000, description="Distance from hospital in kilometers."
    )
    treatment_duration_months: float = Field(
        default=6.0, ge=0, le=240, description="Treatment duration in months."
    )
    appointment_frequency_days: float = Field(
        default=14.0, gt=0, le=365, description="Average days between appointments."
    )
    total_appointments: int | None = Field(default=None, ge=0, le=10_000)
    missed_appointments: int | None = Field(default=None, ge=0, le=10_000)

    @model_validator(mode="after")
    def sync_and_validate_history(self) -> "PredictionRequest":
        # Normalize gender string
        g = str(self.gender).strip().upper()
        object.__setattr__(self, "gender", "M" if g.startswith("M") else "F")

        # Synchronize legacy total_appointments/missed_appointments with
        # previous_appointments/previous_no_shows. Uses model_fields_set
        # (which side was actually present in the request) rather than
        # "== 0" as the "was this provided" check - checking against 0
        # is wrong whenever a field's genuine value happens to be 0, and
        # silently ignores one side entirely when BOTH are explicitly
        # provided with different values instead of catching the
        # inconsistency (this was a real bug: a caller could send
        # previous_appointments=8 and total_appointments=10 together and
        # the mismatch would pass validation while total_appointments was
        # silently discarded).
        fields_set = self.model_fields_set

        if "previous_appointments" in fields_set and "total_appointments" in fields_set:
            if self.previous_appointments != self.total_appointments:
                raise ValueError(
                    "previous_appointments and total_appointments were both provided but disagree "
                    f"({self.previous_appointments} != {self.total_appointments}) - send matching "
                    "values or omit one."
                )
        elif "total_appointments" in fields_set and self.total_appointments is not None:
            object.__setattr__(self, "previous_appointments", self.total_appointments)
        elif self.total_appointments is None:
            object.__setattr__(self, "total_appointments", self.previous_appointments)

        if "previous_no_shows" in fields_set and "missed_appointments" in fields_set:
            if self.previous_no_shows != self.missed_appointments:
                raise ValueError(
                    "previous_no_shows and missed_appointments were both provided but disagree "
                    f"({self.previous_no_shows} != {self.missed_appointments}) - send matching "
                    "values or omit one."
                )
        elif "missed_appointments" in fields_set and self.missed_appointments is not None:
            object.__setattr__(self, "previous_no_shows", self.missed_appointments)
        elif self.missed_appointments is None:
            object.__setattr__(self, "missed_appointments", self.previous_no_shows)

        # Validation: missed appointments cannot exceed total
        if self.previous_no_shows > self.previous_appointments:
            raise ValueError("previous_no_shows cannot exceed previous_appointments")

        if self.missed_appointments > self.total_appointments:
            raise ValueError("missed_appointments cannot exceed total_appointments")

        # Auto-calculate attendance rate if not explicitly supplied
        if self.previous_attendance_rate is None:
            if self.previous_appointments > 0:
                rate = 1.0 - (self.previous_no_shows / self.previous_appointments)
            else:
                rate = 1.0
            object.__setattr__(self, "previous_attendance_rate", max(0.0, min(1.0, float(rate))))

        return self


class BatchPredictionRequest(BaseModel):
    patients: list[PredictionRequest] = Field(..., min_length=1, max_length=500)


class Reason(BaseModel):
    """One factor behind a prediction, always traceable to an actual
    input field - never a free-floating claim."""

    factor: str = Field(..., description="Machine-stable key, matches a PredictionRequest field name.")
    label: str = Field(..., description="Human-readable factor name for display.")
    value: str = Field(..., description="The patient's actual value for this factor, formatted for display.")
    impact: ImpactLevel
    contribution_percent: float = Field(..., ge=0, le=100, description="This factor's share of the total risk score.")


class PredictionResponse(BaseModel):
    patient_id: str
    patient_name: str | None = None

    risk_score: float = Field(..., ge=0, le=1, description="Probability-like risk score in [0, 1].")
    risk_percent: int = Field(..., ge=0, le=100, description="risk_score expressed as a rounded 0-100 percentage, for display.")
    risk_level: RiskLevel
    intervention_required: bool

    reasons: list[Reason]
    summary: str = Field(..., description="One-sentence, factor-grounded interpretation of the score.")
    recommended_action: str

    model_type: ModelType = Field(..., description="Whether this came from the trained model or the interim rule-based baseline.")
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    app_name: str
    app_version: str
    model_type: ModelType
    model_loaded: bool

