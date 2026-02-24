"""Unit tests for the backend API endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient

from backend.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ── Health ────────────────────────────────────────────────
@pytest.mark.anyio
async def test_health(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "model_loaded" in data
    assert "device" in data


# ── Single predict ────────────────────────────────────────
@pytest.mark.anyio
async def test_predict_success(client):
    resp = await client.post("/api/predict", json={"text": "Oh great, another Monday!"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["prediction"] in ("Sarcastic", "Not Sarcastic")
    assert 0 <= data["confidence"] <= 1
    assert isinstance(data["highlighted_words"], list)
    assert isinstance(data["explanation"], str)


@pytest.mark.anyio
async def test_predict_empty_text(client):
    resp = await client.post("/api/predict", json={"text": ""})
    assert resp.status_code == 422  # validation error


@pytest.mark.anyio
async def test_predict_missing_field(client):
    resp = await client.post("/api/predict", json={})
    assert resp.status_code == 422


@pytest.mark.anyio
async def test_predict_too_long(client):
    resp = await client.post("/api/predict", json={"text": "x" * 1001})
    assert resp.status_code == 422


# ── Batch predict ─────────────────────────────────────────
@pytest.mark.anyio
async def test_batch_predict_success(client):
    resp = await client.post(
        "/api/predict/batch",
        json={"texts": ["I love Mondays", "Wow so exciting"]},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["results"]) == 2
    for r in data["results"]:
        assert r["prediction"] in ("Sarcastic", "Not Sarcastic")


@pytest.mark.anyio
async def test_batch_predict_empty_list(client):
    resp = await client.post("/api/predict/batch", json={"texts": []})
    assert resp.status_code == 422


# ── Stats ─────────────────────────────────────────────────
@pytest.mark.anyio
async def test_stats(client):
    resp = await client.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "accuracy" in data
    assert "f1_score" in data
    assert "confusion_matrix" in data
