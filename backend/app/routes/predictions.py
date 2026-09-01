from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas import BatchPredictionRequest, PredictionRequest, PredictionResponse
from app.services.prediction_service import PredictionService

router = APIRouter(tags=["predictions"])


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    """Score a single patient. Powers the Risk Assessment form."""
    return PredictionService().predict(request)


@router.post("/patients/rank", response_model=list[PredictionResponse])
def rank_patients(batch: BatchPredictionRequest) -> list[PredictionResponse]:
    """Score and rank multiple patients, highest risk first.

    Powers the Patients directory and Follow-ups prioritization views:
    "which patients should I intervene with first?" Ranking is
    deterministic - see PredictionService.predict_batch.
    """
    settings = get_settings()
    if len(batch.patients) > settings.max_batch_size:
        # FastAPI/Pydantic already bounds this via BatchPredictionRequest's
        # max_length, but this gives a clearer message than the generic
        # 422 if that ever changes.
        from fastapi import HTTPException

        raise HTTPException(status_code=422, detail=f"Batch exceeds max_batch_size ({settings.max_batch_size}).")
    return PredictionService().predict_batch(batch.patients)
