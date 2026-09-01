from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.schemas import HealthResponse
from app.services.prediction_service import get_model_adapter

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    adapter = get_model_adapter()
    return HealthResponse(
        app_name=settings.app_name,
        app_version=settings.app_version,
        model_type=adapter.model_type,
        model_loaded=Path(settings.model_path).exists(),
    )
