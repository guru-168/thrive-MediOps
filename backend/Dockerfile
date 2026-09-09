# Patient Follow-up Risk Predictor API - production image.
#
# Containerised deliberately rather than relying on a platform's default
# Python: model.joblib is a pickled scikit-learn/XGBoost pipeline, and
# requirements.txt pins the EXACT library versions it was created with
# (scikit-learn 1.8.0, numpy 2.5.2, pandas 3.0.5, xgboost 3.2.0). Letting
# a host pick its own interpreter risks unpickling the model against
# versions it was never validated on, which scikit-learn's own docs warn
# "might lead to breaking code or invalid results". Pinning the base image
# makes the serving environment identical everywhere it runs.
#
# numpy 2.5.2 requires Python >= 3.12, so 3.12 is the floor for this stack.
FROM python:3.12-slim

# PYTHONUNBUFFERED: keep uvicorn/exception logs streaming to the platform's
# log collector instead of sitting in a buffer.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Copy requirements first so dependency installation is cached and only
# re-runs when the pins actually change - not on every source edit.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Application code, including app/ml/model.joblib. The model is committed
# to the repository, so it ships inside the image - there is no runtime
# download step that could fail or drift.
COPY app ./app

# Run as a non-root user: nothing here needs write access to the image.
RUN useradd --create-home --uid 10001 appuser && chown -R appuser:appuser /app
USER appuser

# Fail the build if the model cannot actually be loaded and scored in this
# image. Catching a bad pickle/version combination here is far better than
# discovering it from a 500 in production.
RUN python -c "\
from app.core.config import Settings; \
from app.services.model_adapter import load_model_adapter; \
from app.services.features import build_features; \
from app.schemas import PredictionRequest; \
a = load_model_adapter(Settings()); \
assert a.model_type == 'trained_model', f'expected trained model, got {a.model_type}'; \
p = a.predict_proba(build_features(PredictionRequest(patient_id='build-check', age=45))); \
assert 0.0 <= p <= 1.0, f'implausible probability {p}'; \
print(f'model self-check OK: {a.model_type}, p={p:.4f}')"

# Most PaaS hosts inject $PORT and route to it; default to 8000 for a
# plain `docker run`. Shell form so ${PORT} is expanded at runtime.
# 0.0.0.0 is required - uvicorn's 127.0.0.1 default is unreachable from
# outside the container.
ENV PORT=8000
EXPOSE 8000
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
