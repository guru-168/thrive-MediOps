from __future__ import annotations

from app.schemas import PredictionRequest
from app.services import explanation_service
from app.services.features import build_features
from app.services.model_adapter import RuleBasedAdapter


def _request(**overrides) -> PredictionRequest:
    payload = dict(
        patient_id="P001",
        patient_name="Test Patient",
        age=45,
        distance_km=18,
        treatment_duration_months=6,
        appointment_frequency_days=14,
        previous_appointments=8,
        previous_no_shows=3,
    )
    payload.update(overrides)
    return PredictionRequest(**payload)


def test_reasons_reference_only_known_input_factors():
    request = _request()
    features = build_features(request)
    adapter = RuleBasedAdapter()
    risk_score = adapter.predict_proba(features)
    reasons = explanation_service.build_reasons(request, features, adapter, risk_score)

    allowed_factors = set(explanation_service._FACTOR_GROUPS) | {"baseline"}
    for reason in reasons:
        assert reason.factor in allowed_factors


def test_reasons_are_sorted_by_contribution_descending():
    request = _request(previous_appointments=10, previous_no_shows=9, distance_km=45)
    features = build_features(request)
    adapter = RuleBasedAdapter()
    risk_score = adapter.predict_proba(features)
    reasons = explanation_service.build_reasons(request, features, adapter, risk_score)

    contributions = [r.contribution_percent for r in reasons]
    assert contributions == sorted(contributions, reverse=True)


def test_zero_risk_patient_gets_baseline_reason():
    request = _request(
        previous_appointments=10,
        previous_no_shows=0,
        distance_km=0,
        treatment_duration_months=0,
        appointment_frequency_days=60,
        age=50,
    )
    features = build_features(request)
    adapter = RuleBasedAdapter()
    risk_score = adapter.predict_proba(features)
    reasons = explanation_service.build_reasons(request, features, adapter, risk_score)

    assert risk_score == 0.0
    assert reasons[0].factor == "baseline"


def test_summary_mentions_top_reason_label():
    request = _request(previous_appointments=10, previous_no_shows=9, distance_km=45)
    features = build_features(request)
    adapter = RuleBasedAdapter()
    risk_score = adapter.predict_proba(features)
    reasons = explanation_service.build_reasons(request, features, adapter, risk_score)

    summary = explanation_service.build_summary("high", True, reasons)
    assert reasons[0].label.lower() in summary.lower()


def test_recommended_action_varies_by_score_and_intervention():
    no_intervention = explanation_service.build_recommended_action(0.10, False)
    preventive = explanation_service.build_recommended_action(0.50, True)
    priority = explanation_service.build_recommended_action(0.85, True)
    assert len({no_intervention, preventive, priority}) == 3


def test_recommended_action_never_contradicts_intervention_required():
    """Regression: recommended_action used to be derived from risk_level
    alone, so a 'low' band score that still cleared the intervention
    threshold got a "no additional outreach required" message while
    intervention_required was True in the same response."""
    action = explanation_service.build_recommended_action(0.30, True)
    assert "no additional outreach" not in action.lower()


def test_summary_flags_intervention_even_in_low_band():
    summary = explanation_service.build_summary("low", True, [])
    assert "intervention" in summary.lower() or "preventive" in summary.lower()


def test_trained_model_adapter_explanations():
    from app.core.config import get_settings
    from app.services.model_adapter import load_model_adapter

    adapter = load_model_adapter(get_settings())
    request = _request(previous_appointments=15, previous_no_shows=12, hipertension=1, waiting_time_days=30)
    features = build_features(request)
    risk_score = adapter.predict_proba(features)
    reasons = explanation_service.build_reasons(request, features, adapter, risk_score)

    assert len(reasons) > 0
    factors = [r.factor for r in reasons]
    assert "missed_appointments" in factors
    assert all(0 <= r.contribution_percent <= 100 for r in reasons)

    # Regression: distance/treatment_duration/appointment_frequency are
    # not features the trained model was fitted on (see FEATURE_ORDER) -
    # they must never appear as a trained-model reason, since that would
    # claim the model used a feature it never actually saw.
    assert "distance" not in factors
    assert "treatment_duration" not in factors
    assert "appointment_frequency" not in factors

