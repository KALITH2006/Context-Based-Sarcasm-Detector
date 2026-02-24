"""
Context-Based Sarcasm Detector — FastAPI Backend

Run with:  uvicorn backend.main:app --reload --port 8000
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api.predict import router as predict_router
from backend.api.stats import router as stats_router
from backend.config import CORS_ORIGINS, DEVICE, LOG_LEVEL
from backend.schemas import HealthResponse
from backend.services.model_service import is_model_loaded, load_model

# ── Logging ───────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s │ %(levelname)-8s │ %(name)s │ %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting sarcasm detector backend …")
    load_model()
    yield
    logger.info("Shutting down …")


# ── App ───────────────────────────────────────────────────
app = FastAPI(
    title="Context-Based Sarcasm Detector API",
    description=(
        "Detects sarcasm in text using a fine-tuned BERT model with "
        "attention-based explainability."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(predict_router)
app.include_router(stats_router)


# ── Global exception handler ────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error at %s", request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )


# ── Health ────────────────────────────────────────────────
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health():
    return HealthResponse(
        status="ok",
        model_loaded=is_model_loaded(),
        device=DEVICE,
    )
