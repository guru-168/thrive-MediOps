"""Turns a risk score into reasons a nurse can act on.

Hard rule (PS-01): "every prediction must carry the reasons that produced
it... explanations must genuinely follow from the input factors." This
module never invents a reason - every `Reason` is built from (a) the
adapter's actual per-feature contribution to *this* risk_score (see
ModelAdapter.feature_contributions) and (b) the patient's actual input
value for that feature. If an adapter can't supply contributions, this
falls back to the same rule-based weighting share rather than fabricating
one - see `_fallback_contributions`.

This is also the documented integration point for real SHAP-style,
model-grounded explanations: once TrainedModelAdapter.feature_contributions
returns genuine per-instance attributions (see the TODO in
model_adapter.py), this module needs no changes - it already consumes
"factor -> contribution %" generically.
"""

from __future__ import annotations

from app.schemas import PredictionRequest, Reason
from app.services.features import FeatureSet
from app.services.model_adapter import ModelAdapter, RuleBasedAdapter

# Groups fine-grained factors into staff-facing risk reason categories.
_FACTOR_GROUPS: dict[str, tuple[str, ...]] = {
    "missed_appointments": ("missed_rate", "missed_count", "previous_attendance_rate"),
    "waiting_time": ("waiting_time", "waiting_time_days"),
    "no_sms": ("no_sms", "SMS_received"),
    "hipertension": ("hipertension", "Hipertension"),
    "diabetes": ("diabetes", "Diabetes"),
    "handcap": ("handcap", "Handcap"),
    "alcoholism": ("alcoholism", "Alcoholism"),
    "scholarship": ("scholarship", "Scholarship"),
    "distance": ("distance",),
    "appointment_frequency": ("frequency",),
    "treatment_duration": ("treatment_duration",),
    "age": ("age", "age_clean"),
}

_LABELS: dict[str, str] = {
    "missed_appointments": "Previous missed appointments",
    "waiting_time": "Long scheduling lead time",
    "no_sms": "No SMS reminder sent",
    "hipertension": "Hypertension diagnosis",
    "diabetes": "Diabetes diagnosis",
    "handcap": "Disability / mobility restriction",
    "alcoholism": "History of alcoholism",
    "scholarship": "Social welfare recipient",
    "distance": "Distance from hospital",
    "appointment_frequency": "Appointment frequency",
    "treatment_duration": "Treatment duration",
    "age": "Patient age",
}


def _format_value(factor: str, request: PredictionRequest, features: FeatureSet) -> str:
    if factor == "missed_appointments":
        total = request.previous_appointments
        missed = request.previous_no_shows
        rate = (missed / total * 100) if total > 0 else 0
        return f"{missed} of {total} missed ({rate:.0f}% no-show rate)"
    if factor == "waiting_time":
        return f"{request.waiting_time_days:g} days wait"
    if factor == "no_sms":
        return "SMS reminder not received"
    if factor == "hipertension":
        return "Positive" if request.hipertension == 1 else "None"
    if factor == "diabetes":
        return "Positive" if request.diabetes == 1 else "None"
    if factor == "handcap":
        return f"Level {request.handcap}" if request.handcap > 0 else "None"
    if factor == "alcoholism":
        return "Positive" if request.alcoholism == 1 else "None"
    if factor == "scholarship":
        return "Enrolled" if request.scholarship == 1 else "None"
    if factor == "distance":
        return f"{request.distance_km:g} km"
    if factor == "appointment_frequency":
        return f"every {request.appointment_frequency_days:g} days"
    if factor == "treatment_duration":
        return f"{request.treatment_duration_months:g} months"
    if factor == "age":
        return f"{request.age:g} years"
    return ""



def _impact_tier(contribution_percent: float) -> str:
    if contribution_percent >= 30:
        return "high"
    if contribution_percent >= 15:
        return "medium"
    return "low"


def _fallback_contributions(features: FeatureSet) -> dict[str, float]:
    """Used only if the active adapter can't supply real contributions
    (see ModelAdapter.feature_contributions docstring). Falls back to the
    same transparent weighting the rule-based adapter itself uses, so a
    reason is never shown without a traceable numeric basis."""
    return RuleBasedAdapter().feature_contributions(features, risk_score=0.0) or {}


def build_reasons(
    request: PredictionRequest,
    features: FeatureSet,
    adapter: ModelAdapter,
    risk_score: float,
    max_reasons: int = 5,
) -> list[Reason]:
    contributions = adapter.feature_contributions(features, risk_score) or _fallback_contributions(features)

    grouped: list[tuple[str, float]] = []
    for factor, members in _FACTOR_GROUPS.items():
        pct = sum(contributions.get(member, 0.0) for member in members)
        grouped.append((factor, pct))

    grouped.sort(key=lambda item: item[1], reverse=True)

    reasons: list[Reason] = []
    for factor, pct in grouped[:max_reasons]:
        if pct <= 0.5:
            continue
        reasons.append(
            Reason(
                factor=factor,
                label=_LABELS[factor],
                value=_format_value(factor, request, features),
                impact=_impact_tier(pct),
                contribution_percent=round(pct, 1),
            )
        )

    if not reasons:
        reasons.append(
            Reason(
                factor="baseline",
                label="No elevated risk factors",
                value="All inputs within typical ranges",
                impact="low",
                contribution_percent=0.0,
            )
        )
    return reasons


def build_summary(risk_level: str, intervention_required: bool, reasons: list[Reason]) -> str:
    """Must never contradict `intervention_required` - risk_level (the
    triage band) and intervention_required (the locked-threshold flag)
    are independent (see risk_classifier.py), so a "low" band score can
    still require intervention. Regression: this used to be driven by
    risk_level alone, so a low-band/intervention-required patient got a
    summary implying no action was needed."""
    top = reasons[0] if reasons and reasons[0].factor != "baseline" else None
    if risk_level == "high" and top:
        band_sentence = (
            f"This patient is at HIGH risk of missing their next follow-up, "
            f"driven mainly by {top.label.lower()} ({top.value})."
        )
    elif risk_level == "moderate" and top:
        band_sentence = (
            f"This patient is at MODERATE risk of missing their next follow-up, "
            f"with {top.label.lower()} ({top.value}) as the leading factor."
        )
    elif risk_level in ("high", "moderate"):
        band_sentence = f"This patient is at {risk_level.upper()} risk of missing their next follow-up."
    else:
        band_sentence = "This patient is at LOW risk of missing their next follow-up based on current inputs."

    if risk_level == "low" and intervention_required:
        band_sentence += (
            " Their score still clears the model's intervention threshold, so a preventive "
            "reminder is still recommended."
        )
    return band_sentence


def build_recommended_action(risk_score: float, intervention_required: bool) -> str:
    """Driven by `intervention_required` and the raw score directly -
    matching the source model's own get_recommendation() logic
    (D:\\Thrive Ml\\src\\api.py) - NOT by risk_level, which is a separate
    triage band (see risk_classifier.py). This is what keeps this text
    from ever contradicting the `intervention_required` field in the
    same response."""
    if not intervention_required:
        return "Continue the standard reminder schedule; no additional outreach required at this time."
    if risk_score >= 0.70:
        return (
            "Priority intervention recommended: call to confirm attendance and offer transport "
            "assistance or a telehealth alternative before the next visit."
        )
    return "Preventive intervention recommended: send a reminder and confirm attendance by phone or message."
