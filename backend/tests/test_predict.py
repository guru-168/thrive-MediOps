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


def test_sms_reason_value_matches_the_submitted_sms_flag(client):
    """Regression: the no_sms reason value was a hardcoded "SMS reminder
    not received" string that never read request.sms_received, so a
    patient who DID get a reminder was told they had not - a claim
    contradicted by their own submitted input."""
    received = client.post("/predict", json=make_patient(sms_received=1)).json()
    values = [r["value"] for r in received["reasons"]]
    assert "SMS reminder not received" not in values
    # An SMS that was received is not a risk factor, so it should not be
    # cited as a reason for this patient's score at all.
    assert "no_sms" not in [r["factor"] for r in received["reasons"]]


def test_missing_sms_is_still_reported_when_genuinely_absent(client):
    """Guards the opposite direction of the fix above: suppressing the
    false 'not received' claim must not suppress the true one."""
    body = client.post("/predict", json=make_patient(sms_received=0)).json()
    sms_reason = next(r for r in body["reasons"] if r["factor"] == "no_sms")
    assert sms_reason["value"] == "SMS reminder not received"
    assert sms_reason["contribution_percent"] > 0


def test_absent_conditions_are_never_cited_as_reasons(client):
    """Regression: inactive factors were weighted at `importance * 0.02`
    rather than zero, which was enough to clear the explanation service's
    contribution cutoff - so conditions the patient does NOT have were
    listed as drivers of their risk, rendered as e.g.
    "Hypertension diagnosis: None"."""
    payload = make_patient(
        hipertension=0, diabetes=0, alcoholism=0, scholarship=0, handcap=0,
        previous_appointments=10, previous_no_shows=6,
    )
    body = client.post("/predict", json=payload).json()
    factors = [r["factor"] for r in body["reasons"]]
    for absent in ("hipertension", "diabetes", "alcoholism", "scholarship", "handcap"):
        assert absent not in factors, f"absent condition {absent!r} cited as a reason"
    # No reason may report an empty/negative value as if it were a driver.
    assert all(r["value"] != "None" for r in body["reasons"])
    # The factor the patient genuinely has must still be reported.
    assert "missed_appointments" in factors


def test_patient_with_no_elevated_factors_gets_baseline_not_rule_based_reasons(client):
    """Regression: zeroing inactive factors makes the total contribution
    zero for a genuinely clean patient. Returning None in that case would
    make build_reasons fall back to the RULE-BASED weights, which cite
    distance/treatment_duration/appointment_frequency - features this
    trained model was never fitted on. The correct result is the baseline
    reason, not a fabricated rule-based explanation."""
    payload = make_patient(
        age=45, waiting_time_days=0, sms_received=1,
        previous_appointments=10, previous_no_shows=0,
        hipertension=0, diabetes=0, alcoholism=0, handcap=0, scholarship=0,
        distance_km=999, treatment_duration_months=200,
    )
    body = client.post("/predict", json=payload).json()
    assert body["model_type"] == "trained_model"
    factors = [r["factor"] for r in body["reasons"]]
    assert factors == ["baseline"]
    for leaked in ("distance", "treatment_duration", "appointment_frequency"):
        assert leaked not in factors


def test_every_reason_has_a_non_empty_value(client):
    """A reason with an empty value string is not a grounded explanation."""
    body = client.post("/predict", json=make_patient(previous_no_shows=5, sms_received=0)).json()
    for reason in body["reasons"]:
        assert reason["value"].strip(), f"reason {reason['factor']!r} has an empty value"


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
