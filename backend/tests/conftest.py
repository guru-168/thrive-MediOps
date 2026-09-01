from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def make_patient(**overrides) -> dict:
    """A valid PredictionRequest payload, with any field overridden."""
    payload = {
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
        "waiting_time_days": 7.0,
        "appointment_day_of_week": 2,
        "appointment_month": 9,
        "scheduled_hour": 10,
        "previous_appointments": 8,
        "previous_no_shows": 3,
        "days_since_previous_appointment": 14.0,
        "distance_km": 18.0,
        "treatment_duration_months": 6.0,
        "appointment_frequency_days": 14.0,
    }
    payload.update(overrides)
    return payload

