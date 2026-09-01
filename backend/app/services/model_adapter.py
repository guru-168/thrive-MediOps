"""Model adapter abstraction - THE integration point for the trained model.

`PredictionService` (services/prediction_service.py) only ever talks to a
`ModelAdapter`. When a model file exists at `Settings.model_path`,
`load_model_adapter()` instantiates `TrainedModelAdapter` with the loaded
calibrated model pipeline. Otherwise it falls back to `RuleBasedAdapter`.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Protocol

from app.core.config import Settings
from app.services.features import FEATURE_ORDER, FeatureSet

logger = logging.getLogger(__name__)


class ModelAdapter(ABC):
    """Common interface every scoring backend (rule-based or trained)
    implements, so the rest of the service layer never branches on which
    one is active."""

    model_type: str

    @abstractmethod
    def predict_proba(self, features: FeatureSet) -> float:
        """Return a risk probability in [0, 1]."""
        raise NotImplementedError

    def feature_contributions(self, features: FeatureSet, risk_score: float) -> dict[str, float] | None:
        """Optional: each factor's share (0-100) of `risk_score`, used by
        the explanation service to genuinely tie reasons to this specific
        prediction. Return None if the adapter can't produce this (the
        explanation service falls back to a coarser explanation in that case).
        """
        return None


class RuleBasedAdapter(ModelAdapter):
    """Transparent, deterministic weighted-sum baseline used automatically
    whenever no trained model file is present at `Settings.model_path`.
    """

    model_type = "rule_based"

    WEIGHTS: dict[str, float] = {
        "missed_rate": 0.35,
        "missed_count": 0.10,
        "distance": 0.20,
        "frequency": 0.15,
        "treatment_duration": 0.10,
        "age": 0.10,
    }

    def predict_proba(self, features: FeatureSet) -> float:
        score = sum(self.WEIGHTS[key] * features.normalized.get(key, 0.0) for key in self.WEIGHTS)
        return max(0.0, min(1.0, score))

    def feature_contributions(self, features: FeatureSet, risk_score: float) -> dict[str, float] | None:
        raw_contribs = {key: self.WEIGHTS[key] * features.normalized.get(key, 0.0) for key in self.WEIGHTS}
        total = sum(raw_contribs.values())
        if total <= 0:
            return dict.fromkeys(raw_contribs, 0.0)
        return {key: (value / total) * 100 for key, value in raw_contribs.items()}


class _SklearnLikeModel(Protocol):
    """Minimal shape a dropped-in model must satisfy."""

    def predict_proba(self, X: Any) -> Any: ...  # noqa: N803


class TrainedModelAdapter(ModelAdapter):
    """Loads and serves the trained calibrated XGBoost classifier.

    Expects a model implementing `.predict_proba(df)` where `df` is a
    DataFrame with columns matching `FEATURE_ORDER`. Column 1 of the returned
    array is P(no-show).
    """

    model_type = "trained_model"

    def __init__(self, model: _SklearnLikeModel):
        self._model = model

    def predict_proba(self, features: FeatureSet) -> float:
        import numpy as np

        df = features.as_dataframe()
        try:
            proba = self._model.predict_proba(df)
        except Exception:
            # Fallback for models expecting 2D array / matrix
            vector = np.array([features.as_vector()])
            proba = self._model.predict_proba(vector)

        return float(proba[0][1])

    def feature_contributions(self, features: FeatureSet, risk_score: float) -> dict[str, float] | None:
        try:
            base_estimator = None
            if hasattr(self._model, "calibrated_classifiers_") and len(self._model.calibrated_classifiers_) > 0:
                base_estimator = self._model.calibrated_classifiers_[0].estimator
            elif hasattr(self._model, "named_steps"):
                base_estimator = self._model
            elif hasattr(self._model, "estimator"):
                base_estimator = self._model.estimator

            importances_by_feature: dict[str, float] = {}
            if base_estimator is not None and hasattr(base_estimator, "named_steps"):
                preprocessor = base_estimator.named_steps.get("preprocessor")
                classifier = base_estimator.named_steps.get("classifier")
                if classifier is not None and hasattr(classifier, "feature_importances_") and preprocessor is not None:
                    raw_importances = classifier.feature_importances_
                    feature_names = preprocessor.get_feature_names_out()
                    for col_name, imp in zip(feature_names, raw_importances):
                        clean_col = col_name.split("__")[-1]
                        base_feature = clean_col.split("_")[0] if any(clean_col.startswith(c) for c in ["Gender", "Neighbourhood"]) else clean_col
                        importances_by_feature[base_feature] = importances_by_feature.get(base_feature, 0.0) + float(imp)

            # Only factors the trained model's FEATURE_ORDER actually
            # contains - distance_km, treatment_duration_months, and
            # appointment_frequency_days are NOT columns this model was
            # trained on (they're PS-01 context fields the rule-based
            # baseline uses, not this model). Including them here would
            # present a fabricated "contribution" the model never
            # produced, which is exactly what PS-01 prohibits ("do not
            # claim a feature influenced the prediction unless the
            # model/input logic actually supports that claim").
            patient_values = {
                "missed_rate": features.normalized.get("missed_rate", 0.0),
                "missed_count": features.normalized.get("missed_count", 0.0),
                "previous_attendance_rate": max(0.0, 1.0 - float(features.model_dict.get("previous_attendance_rate", 1.0))),
                "waiting_time": features.normalized.get("waiting_time", 0.0),
                "age": features.normalized.get("age", 0.0),
                "hipertension": float(features.model_dict.get("Hipertension", 0)),
                "diabetes": float(features.model_dict.get("Diabetes", 0)),
                "alcoholism": float(features.model_dict.get("Alcoholism", 0)),
                "handcap": min(1.0, float(features.model_dict.get("Handcap", 0)) / 2.0),
                "scholarship": float(features.model_dict.get("Scholarship", 0)),
                "no_sms": features.normalized.get("no_sms", 0.0),
            }

            weighted: dict[str, float] = {}
            for key, val in patient_values.items():
                imp = importances_by_feature.get(key, 0.05)
                # Active patient risk factors get full importance weighting
                w = imp * (0.15 + 0.85 * val) if val > 0 else imp * 0.02
                weighted[key] = w

            total = sum(weighted.values())
            if total <= 0:
                return None
            return {k: (v / total) * 100 for k, v in weighted.items()}
        except Exception:
            logger.exception("Failed to calculate trained model feature contributions.")
            return None


def load_model_adapter(settings: Settings) -> ModelAdapter:
    """Chooses RuleBasedAdapter or TrainedModelAdapter based purely on
    whether a model artifact exists at `settings.model_path`. Any failure
    to load a present-but-invalid file is logged and falls back to the
    rule-based adapter rather than crashing the API."""

    model_file = Path(settings.model_path)
    if not model_file.exists():
        logger.info("No trained model found at %s - using RuleBasedAdapter.", model_file)
        return RuleBasedAdapter()

    try:
        import joblib

        model = joblib.load(model_file)
        if not hasattr(model, "predict_proba"):
            raise TypeError(f"{model_file} does not expose predict_proba()")
        logger.info("Loaded trained model from %s.", model_file)
        return TrainedModelAdapter(model)
    except Exception:
        logger.exception("Failed to load trained model from %s - falling back to RuleBasedAdapter.", model_file)
        return RuleBasedAdapter()
