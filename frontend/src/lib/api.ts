import {
    PredictResponse,
    BatchPredictResponse,
    ModelStats,
    HealthResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

export async function predict(text: string): Promise<PredictResponse> {
    return request<PredictResponse>("/api/predict", {
        method: "POST",
        body: JSON.stringify({ text }),
    });
}

export async function predictBatch(
    texts: string[]
): Promise<BatchPredictResponse> {
    return request<BatchPredictResponse>("/api/predict/batch", {
        method: "POST",
        body: JSON.stringify({ texts }),
    });
}

export async function getStats(): Promise<ModelStats> {
    return request<ModelStats>("/api/stats");
}

export async function getHealth(): Promise<HealthResponse> {
    return request<HealthResponse>("/api/health");
}
