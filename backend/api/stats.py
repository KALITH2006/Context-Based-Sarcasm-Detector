"""Model statistics / admin dashboard route."""

from fastapi import APIRouter

from backend.config import MOCK_METRICS
from backend.schemas import ModelStatsResponse
from backend.services.model_service import is_model_loaded

router = APIRouter(prefix="/api", tags=["Stats"])


@router.get("/stats", response_model=ModelStatsResponse)
async def get_stats():
    """Return model performance metrics."""
    return ModelStatsResponse(**MOCK_METRICS)
