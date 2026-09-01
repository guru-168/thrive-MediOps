"""FastAPI application entrypoint.

Run with:  uvicorn app.main:app --reload --port 8000   (from backend/)
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routes import health, predictions

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Predicts which patients are likely to miss their next follow-up "
        "appointment and explains why, so staff can prioritize outreach. "
        "See /docs for interactive request/response schemas."
    ),
)

# Configurable via ALLOWED_ORIGINS (comma-separated). Defaults cover the
# Vite dev server only - never widen this to "*" for a deployment that
# handles patient data.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(predictions.router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Pydantic gives very implementation-detail-y error objects; return a
    clean, frontend-friendly shape instead of leaking internals."""
    errors = [
        {"field": ".".join(str(part) for part in err["loc"] if part != "body"), "message": err["msg"]}
        for err in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": "Invalid request data.", "errors": errors})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Never leak stack traces, file paths, or internal exception text to
    the client - this is a healthcare-themed app; log the detail
    server-side (no patient identifiers beyond the synthetic patient_id
    already in the request) and return a generic message."""
    logger.exception("Unhandled error while processing %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})
