from __future__ import annotations

from app.core.config import Settings
from app.services.risk_classifier import classify, intervention_required


def _settings(low=0.40, high=0.70, intervention=0.22) -> Settings:
    return Settings(risk_threshold_low=low, risk_threshold_high=high, intervention_threshold=intervention)


def test_classify_low_boundary():
    settings = _settings()
    assert classify(0.0, settings) == "low"
    assert classify(0.39, settings) == "low"


def test_classify_moderate_range():
    settings = _settings()
    assert classify(0.40, settings) == "moderate"
    assert classify(0.55, settings) == "moderate"
    assert classify(0.69, settings) == "moderate"


def test_classify_high_boundary():
    settings = _settings()
    assert classify(0.70, settings) == "high"
    assert classify(1.0, settings) == "high"


def test_thresholds_are_configurable():
    settings = _settings(low=0.5, high=0.9)
    assert classify(0.4, settings) == "low"
    assert classify(0.6, settings) == "moderate"
    assert classify(0.95, settings) == "high"


def test_intervention_required_uses_the_locked_decision_threshold():
    settings = _settings()
    assert intervention_required(0.10, settings) is False
    assert intervention_required(0.21, settings) is False
    assert intervention_required(0.22, settings) is True
    assert intervention_required(0.99, settings) is True


def test_intervention_and_risk_level_are_independent():
    """Regression: intervention_required used to be derived from
    risk_level (risk_level != "low"), which silently loses the real
    model's intended behavior - a score can sit in the "low" risk band
    (< 0.40) while still clearing the 0.22 intervention threshold, e.g.
    0.30. The two must be computed independently from the raw score."""
    settings = _settings()
    score = 0.30
    assert classify(score, settings) == "low"
    assert intervention_required(score, settings) is True
