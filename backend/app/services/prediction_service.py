"""PredictionService: the single orchestration point between the API
layer and the model layer.

    Frontend -> POST /predict -> Pydantic validation -> PredictionService
    -> feature preparation -> ML model -> risk probability
    -> explanation service -> JSON response

Routes never touch feature preparation, the model adapter, or the risk
classifier directly - they call `PredictionService.predict` /
`.predict_batch`, so swapping in the trained model (services/model_adapter.py)
never requires touching routes/predictions.py.
"""

from __future__ import annotations

from functools import lru_cache

from app.core.config import Settings, get_settings
from app.schemas import PredictionRequest, PredictionResponse
from app.services import explanation_service, risk_classifier
from app.services.features import build_features
from app.services.model_adapter import ModelAdapter, load_model_adapter


@lru_cache
def get_model_adapter() -> ModelAdapter:
    """Loaded once per process. Cache is keyed on nothing (single
    settings instance in practice) - restart the process to pick up a
    newly dropped-in model file, same as any other app config."""
    return load_model_adapter(get_settings())


class PredictionService:
    def __init__(self, adapter: ModelAdapter | None = None, settings: Settings | None = None):
        self._adapter = adapter or get_model_adapter()
        self._settings = settings or get_settings()

    @property
    def model_type(self) -> str:
        return self._adapter.model_type

    def predict(self, request: PredictionRequest) -> PredictionResponse:
        features = build_features(request)
        risk_score = self._adapter.predict_proba(features)
        risk_level = risk_classifier.classify(risk_score, self._settings)
        intervention_required = risk_classifier.intervention_required(risk_score, self._settings)
        reasons = explanation_service.build_reasons(request, features, self._adapter, risk_score)

        return PredictionResponse(
            patient_id=request.patient_id,
            patient_name=request.patient_name,
            risk_score=round(risk_score, 4),
            risk_percent=round(risk_score * 100),
            risk_level=risk_level,
            intervention_required=intervention_required,
            reasons=reasons,
            summary=explanation_service.build_summary(risk_level, intervention_required, reasons),
            recommended_action=explanation_service.build_recommended_action(risk_score, intervention_required),
            model_type=self._adapter.model_type,
        )

    def predict_batch(self, requests: list[PredictionRequest]) -> list[PredictionResponse]:
        results = [self.predict(request) for request in requests]
        # Deterministic ranking: risk_score descending, patient_id
        # ascending as a stable tiebreak so equal-risk patients always
        # come back in the same order regardless of input order.
        results.sort(key=lambda r: (-r.risk_score, r.patient_id))
        return results
