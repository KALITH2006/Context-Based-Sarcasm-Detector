"""Application configuration."""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "model"
MODEL_PATH = MODEL_DIR / "sarcasm_model.pt"
TOKENIZER_NAME = "bert-base-uncased"

# Device
DEVICE = os.getenv("DEVICE", "cpu")  # "cuda" if GPU available

# Model
MAX_LENGTH = 128
NUM_LABELS = 2
LABELS = ["Not Sarcastic", "Sarcastic"]

# SHAP
SHAP_ENABLED = os.getenv("SHAP_ENABLED", "false").lower() == "true"
SHAP_MAX_SAMPLES = 50

# Server
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Mock model metrics (used when no real model is loaded)
MOCK_METRICS = {
    "accuracy": 0.892,
    "f1_score": 0.887,
    "precision": 0.901,
    "recall": 0.874,
    "total_samples": 26709,
    "training_epochs": 4,
    "model_name": "bert-base-uncased",
    "dataset": "Twitter Sarcasm Dataset",
    "confusion_matrix": {
        "true_positive": 5842,
        "true_negative": 5976,
        "false_positive": 645,
        "false_negative": 860,
    },
}
