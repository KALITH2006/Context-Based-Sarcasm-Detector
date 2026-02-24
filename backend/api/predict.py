"""Prediction API routes."""

import logging

from fastapi import APIRouter, HTTPException

from backend.schemas import (
    BatchPredictRequest,
    BatchPredictResponse,
    PredictRequest,
    PredictResponse,
)
from backend.services.explainer import get_attention_explanation, get_shap_explanation
from backend.services.model_service import predict, predict_batch

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Prediction"])


@router.post("/predict", response_model=PredictResponse)
async def predict_endpoint(req: PredictRequest):
    """Analyse a single text for sarcasm."""
    try:
        result = predict(req.text)

        # Enrich explanation with attention details
        result["explanation"] = get_attention_explanation(
            result.get("attention_scores"),
            result["prediction"],
            result["confidence"],
        )

        # Optional SHAP
        shap_data = get_shap_explanation(req.text)
        if shap_data:
            result["attention_scores"] = {
                **(result.get("attention_scores") or {}),
                "_shap": shap_data,
            }

        return PredictResponse(**result)

    except Exception as e:
        logger.exception("Prediction error")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/batch", response_model=BatchPredictResponse)
async def batch_predict_endpoint(req: BatchPredictRequest):
    """Analyse multiple texts for sarcasm (max 50)."""
    try:
        results = predict_batch(req.texts)

        enriched = []
        for text, r in zip(req.texts, results):
            r["explanation"] = get_attention_explanation(
                r.get("attention_scores"),
                r["prediction"],
                r["confidence"],
            )
            enriched.append(PredictResponse(**r))

        return BatchPredictResponse(results=enriched)

    except Exception as e:
        logger.exception("Batch prediction error")
        raise HTTPException(status_code=500, detail=str(e))
