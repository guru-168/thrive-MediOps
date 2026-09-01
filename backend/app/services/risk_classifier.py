"""Centralized risk-level classification and intervention decisioning.

The only place these two cutoffs are defined. Nothing else in the
codebase hard-codes either threshold - everything reads
`Settings.risk_threshold_low` / `risk_threshold_high` /
`intervention_threshold` through this module.

These are two DELIBERATELY SEPARATE concepts, matching the source model
project (D:\\Thrive Ml\\src\\api.py):

- `classify()` - the low/moderate/high triage band shown as a badge.
  Operational categories for staff prioritization, not a medical
  diagnosis.
- `intervention_required()` - whether this patient's score clears the
  model's own locked decision threshold (calibrated on validation F1),
  independent of which risk band it falls in.

Conflating these was a real bug: a score can be "low" risk (below the
0.40 moderate band) while still tripping `intervention_required=True`
(above the 0.22 decision threshold) - e.g. score 0.30. Deriving
intervention_required from risk_level instead of the score directly
silently loses that case.
"""

from __future__ import annotations

from app.core.config import Settings
from app.schemas import RiskLevel


def classify(risk_score: float, settings: Settings) -> RiskLevel:
    if risk_score >= settings.risk_threshold_high:
        return "high"
    if risk_score >= settings.risk_threshold_low:
        return "moderate"
    return "low"


def intervention_required(risk_score: float, settings: Settings) -> bool:
    """Staff-facing flag: does this score clear the model's own locked
    decision threshold? Based on the score directly, NOT on risk_level -
    see module docstring for why those must stay independent."""
    return risk_score >= settings.intervention_threshold
