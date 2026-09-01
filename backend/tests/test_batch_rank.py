from __future__ import annotations

from tests.conftest import make_patient


def test_batch_ranking_sorted_descending_by_risk(client):
    patients = [
        make_patient(patient_id="LOW1", previous_appointments=10, previous_no_shows=0, distance_km=1),
        make_patient(patient_id="HIGH1", previous_appointments=10, previous_no_shows=9, distance_km=45),
        make_patient(patient_id="MED1", previous_appointments=10, previous_no_shows=3, distance_km=15),
    ]
    response = client.post("/patients/rank", json={"patients": patients})
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 3

    scores = [row["risk_score"] for row in body]
    assert scores == sorted(scores, reverse=True)
    assert body[0]["patient_id"] == "HIGH1"


def test_batch_ranking_is_deterministic(client):
    patients = [
        make_patient(patient_id="A", previous_appointments=10, previous_no_shows=2),
        make_patient(patient_id="B", previous_appointments=10, previous_no_shows=2),
        make_patient(patient_id="C", previous_appointments=10, previous_no_shows=2),
    ]
    payload = {"patients": patients}

    first = client.post("/patients/rank", json=payload).json()
    second = client.post("/patients/rank", json=payload).json()
    assert [r["patient_id"] for r in first] == [r["patient_id"] for r in second]

    # Equal risk scores tie-break deterministically on patient_id ascending.
    ids = [r["patient_id"] for r in first]
    assert ids == sorted(ids)


def test_batch_ranking_reorders_patients_regardless_of_input_order(client):
    patients = [
        make_patient(patient_id="LOW1", previous_appointments=10, previous_no_shows=0, distance_km=1),
        make_patient(patient_id="HIGH1", previous_appointments=10, previous_no_shows=9, distance_km=45),
    ]
    response = client.post("/patients/rank", json={"patients": patients})
    body = response.json()
    assert [row["patient_id"] for row in body] == ["HIGH1", "LOW1"]


def test_empty_batch_is_rejected(client):
    response = client.post("/patients/rank", json={"patients": []})
    assert response.status_code == 422


def test_batch_with_one_invalid_patient_rejects_whole_request(client):
    patients = [make_patient(patient_id="OK1"), make_patient(patient_id="BAD1", age=-1)]
    response = client.post("/patients/rank", json={"patients": patients})
    assert response.status_code == 422


def test_conflicting_legacy_and_new_history_fields_are_rejected(client):
    """Regression: previously, providing BOTH previous_appointments/
    previous_no_shows AND the legacy total_appointments/missed_appointments
    with different values silently discarded one side instead of erroring -
    meaning the model could be scored on appointment-history numbers that
    didn't match what was actually requested."""
    payload = make_patient(previous_appointments=8, previous_no_shows=3, total_appointments=10, missed_appointments=0)
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
