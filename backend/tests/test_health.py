from __future__ import annotations


def test_health_reports_trained_model(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["model_type"] == "trained_model"
    assert body["model_loaded"] is True

