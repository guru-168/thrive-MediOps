"""Centralized application configuration.

Every operational constant that would otherwise be scattered/duplicated
across the codebase (CORS origins, risk thresholds, the trained-model file
location) lives here and is read once at startup. All of it is overridable
via environment variables (or a `.env` file - see `.env.example`) so the
same code runs in local dev, CI, and a real deployment without edits.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Patient Follow-up Risk Predictor API"
    app_version: str = "0.1.0"

    # Comma-separated list of origins allowed to call this API (Vite dev
    # server origins by default). Configure via ALLOWED_ORIGINS for other
    # environments rather than widening this in code.
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175"


    # Where the trained model artifact will be dropped in. See
    # app/ml/README.md and services/model_adapter.py for the exact
    # interface the file at this path must implement. The file is not
    # expected to exist yet - the API falls back to a documented,
    # transparent rule-based scorer (see services/model_adapter.py:
    # RuleBasedAdapter) until it does.
    model_path: str = str(BACKEND_ROOT / "app" / "ml" / "model.joblib")

    # Operational risk-BAND cutoffs applied to the 0-1 risk_score, purely
    # for the low/moderate/high badge shown to staff. These match
    # get_risk_category() in the source model project
    # (D:\Thrive Ml\src\api.py) exactly: >=0.70 high, >=0.40 moderate,
    # else low.
    #
    # This is a DIFFERENT concept from `intervention_threshold` below -
    # do not conflate them. A patient can be labeled "low" risk here and
    # still have intervention_required=True (e.g. score 0.30: below the
    # 0.40 "moderate" band, but above the 0.22 intervention cutoff) -
    # that is the source model's own intended behavior, not a bug.
    risk_threshold_low: float = 0.40
    risk_threshold_high: float = 0.70

    # The model's locked decision threshold - selected on validation F1
    # in D:\Thrive Ml\src\calibrate_model.py and persisted at
    # D:\Thrive Ml\outputs\calibrated_threshold_config.json
    # ("selected_threshold": 0.22). Drives ONLY `intervention_required`;
    # never used for risk-level banding.
    intervention_threshold: float = 0.22


    # Maximum number of patients accepted in one /patients/rank call, to
    # keep the endpoint bounded and responsive.
    max_batch_size: int = 500

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
