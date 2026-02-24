"""Pydantic request/response models."""

from pydantic import BaseModel, Field
from typing import List, Optional


# ── Requests ──────────────────────────────────────────────

class PredictRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="The text to analyse for sarcasm.",
        examples=["Oh great, another Monday morning!"],
    )


class BatchPredictRequest(BaseModel):
    texts: List[str] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of texts to analyse (max 50).",
    )


# ── Responses ─────────────────────────────────────────────

class PredictResponse(BaseModel):
    prediction: str = Field(..., description="Sarcastic or Not Sarcastic")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    highlighted_words: List[str] = Field(
        default_factory=list,
        description="Words with highest attention / sarcasm signals",
    )
    explanation: str = Field(..., description="Human-readable explanation")
    attention_scores: Optional[dict] = Field(
        default=None,
        description="Word-level attention scores for visualization",
    )


class BatchPredictResponse(BaseModel):
    results: List[PredictResponse]


class ModelStatsResponse(BaseModel):
    accuracy: float
    f1_score: float
    precision: float
    recall: float
    total_samples: int
    training_epochs: int
    model_name: str
    dataset: str
    confusion_matrix: dict


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str


class ErrorResponse(BaseModel):
    detail: str
