from __future__ import annotations

from tests.conftest import make_patient


def test_valid_prediction_request_returns_full_shape(client):
    response = client.post("/predict", json=make_patient())
    assert response.status_code == 200
    body = response.json()

    assert body["patient_id"] == "P001"
    assert 0 <= body["risk_score"] <= 1
    assert 0 <= body["risk_percent"] <= 100
    assert body["risk_level"] in ("low", "moderate", "high")
    assert isinstance(body["intervention_required"], bool)
    assert isinstance(body["reasons"], list) and len(body["reasons"]) > 0
    assert body["summary"]
    assert body["recommended_action"]
    assert body["model_type"] == "trained_model"

    for reason in body["reasons"]:
        assert set(reason) >= {"factor", "label", "value", "impact", "contribution_percent"}
        assert reason["impact"] in ("low", "medium", "high")


def test_high_missed_rate_and_distance_scores_high_risk(client):
    payload = make_patient(
        previous_appointments=15,
        previous_no_shows=14,
        waiting_time_days=60,
        sms_received=0,
        scholarship=1,
        hipertension=1,
        diabetes=1,
    )
    response = client.post("/predict", json=payload)
    body = response.json()
    assert body["risk_level"] in ("moderate", "high")
    assert body["intervention_required"] is True
    factors = [r["factor"] for r in body["reasons"]]
    assert "missed_appointments" in factors


def test_clean_history_scores_low_risk(client):
    payload = make_patient(
        previous_appointments=10,
        previous_no_shows=0,
        waiting_time_days=0,
        sms_received=1,
        scholarship=0,
        hipertension=0,
        diabetes=0,
        alcoholism=0,
        handcap=0,
        age=45,
    )
    response = client.post("/predict", json=payload)
    body = response.json()
    assert body["risk_level"] == "low"
    assert body["intervention_required"] is False



def test_reasons_are_grounded_in_actual_input_values(client):
    payload = make_patient(previous_appointments=8, previous_no_shows=3, distance_km=18)
    body = client.post("/predict", json=payload).json()
    missed_reason = next(r for r in body["reasons"] if r["factor"] == "missed_appointments")
    assert "3" in missed_reason["value"]
    assert "8" in missed_reason["value"]


def test_trained_model_reasons_never_cite_context_only_fields(client):
    """Regression: distance_km/treatment_duration_months/appointment_frequency_days
    are not columns the trained model was fitted on (see FEATURE_ORDER in
    app/services/features.py) - the explanation must never present them as
    a reason for a trained-model prediction, since the model never actually
    saw them."""
    payload = make_patient(distance_km=999, treatment_duration_months=200, appointment_frequency_days=1)
    body = client.post("/predict", json=payload).json()
    assert body["model_type"] == "trained_model"
    factors = [r["factor"] for r in body["reasons"]]
    assert "distance" not in factors
    assert "treatment_duration" not in factors
    assert "appointment_frequency" not in factors


def test_missing_required_field_returns_422(client):
    payload = make_patient()
    del payload["age"]
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    body = response.json()
    assert body["detail"] == "Invalid request data."
    assert any(err["field"] == "age" for err in body["errors"])


def test_missed_exceeding_total_is_rejected(client):
    payload = make_patient(previous_appointments=5, previous_no_shows=20)
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_out_of_range_values_are_rejected(client):
    response = client.post("/predict", json=make_patient(age=-5))
    assert response.status_code == 422

    response = client.post("/predict", json=make_patient(appointment_frequency_days=0))
    assert response.status_code == 422


def test_arbitrary_unvalidated_dict_is_rejected(client):
    response = client.post("/predict", json={"foo": "bar"})
    assert response.status_code == 422


def test_error_response_does_not_leak_internals(client):
    response = client.post("/predict", json={"foo": "bar"})
    text = response.text.lower()
    assert "traceback" not in text
    assert "c:\\" not in text and "/users/" not in text
