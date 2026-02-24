"""
Standalone model evaluation script.

Usage:
    python -m model.evaluate
    python -m model.evaluate --model_path model/sarcasm_model.pt
"""

import argparse
import json
import logging
import sys
from pathlib import Path

import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from torch.utils.data import DataLoader
from transformers import BertTokenizerFast

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.services.model_service import BertSarcasmClassifier
from model.train import SarcasmDataset, load_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s │ %(levelname)s │ %(message)s")
logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).resolve().parent


def evaluate(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_path = Path(args.model_path)

    if not model_path.exists():
        logger.error("Model file not found: %s", model_path)
        logger.info("Run `python -m model.train` first to train a model.")
        sys.exit(1)

    tokenizer = BertTokenizerFast.from_pretrained("bert-base-uncased")

    model = BertSarcasmClassifier(num_labels=2)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()

    all_texts, all_labels = load_data()
    split = int(0.8 * len(all_texts))
    val_texts = all_texts[split:]
    val_labels = all_labels[split:]

    val_ds = SarcasmDataset(val_texts, val_labels, tokenizer, max_len=128)
    val_loader = DataLoader(val_ds, batch_size=32)

    all_preds, all_true = [], []
    with torch.no_grad():
        for batch in val_loader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["label"].to(device)
            logits, _ = model(input_ids, attention_mask)
            preds = torch.argmax(logits, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_true.extend(labels.cpu().numpy())

    print("\n" + "=" * 60)
    print("  MODEL EVALUATION RESULTS")
    print("=" * 60)
    print(f"\n  Model:     {model_path}")
    print(f"  Samples:   {len(all_true)}")
    print(f"  Accuracy:  {accuracy_score(all_true, all_preds):.4f}")
    print(f"  F1 Score:  {f1_score(all_true, all_preds, average='weighted'):.4f}")
    print(f"  Precision: {precision_score(all_true, all_preds, average='weighted'):.4f}")
    print(f"  Recall:    {recall_score(all_true, all_preds, average='weighted'):.4f}")
    print(f"\n  Classification Report:")
    print(
        classification_report(
            all_true, all_preds, target_names=["Not Sarcastic", "Sarcastic"]
        )
    )
    print(f"  Confusion Matrix:")
    cm = confusion_matrix(all_true, all_preds)
    print(f"    {cm}")
    print("=" * 60)

    # Save metrics to JSON
    metrics = {
        "accuracy": round(accuracy_score(all_true, all_preds), 4),
        "f1_score": round(f1_score(all_true, all_preds, average="weighted"), 4),
        "precision": round(precision_score(all_true, all_preds, average="weighted"), 4),
        "recall": round(recall_score(all_true, all_preds, average="weighted"), 4),
        "total_samples": len(all_true),
    }
    metrics_path = MODEL_DIR / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"\n  Metrics saved → {metrics_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate sarcasm model")
    parser.add_argument(
        "--model_path",
        type=str,
        default=str(MODEL_DIR / "sarcasm_model.pt"),
    )
    args = parser.parse_args()
    evaluate(args)
