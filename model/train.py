"""
BERT Sarcasm Model — Training Script

Fine-tunes bert-base-uncased on the Twitter Sarcasm Dataset.

Usage:
    python -m model.train                   # uses defaults
    python -m model.train --epochs 5 --lr 2e-5 --batch_size 32

Requirements:
    pip install -r requirements.txt
    A CUDA GPU is strongly recommended.
"""

import argparse
import json
import logging
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from torch.utils.data import DataLoader, Dataset
from transformers import BertTokenizerFast

# Add project root to path so we can import the model class
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.services.model_service import BertSarcasmClassifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s │ %(levelname)s │ %(message)s")
logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).resolve().parent
SAVE_PATH = MODEL_DIR / "sarcasm_model.pt"


# ── Dataset ───────────────────────────────────────────────
class SarcasmDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            str(self.texts[idx]),
            max_length=self.max_len,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        return {
            "input_ids": encoding["input_ids"].squeeze(),
            "attention_mask": encoding["attention_mask"].squeeze(),
            "label": torch.tensor(self.labels[idx], dtype=torch.long),
        }


# ── Data Loading ──────────────────────────────────────────
def load_data():
    """Load the Twitter sarcasm dataset from HuggingFace or a local JSON."""
    local_path = MODEL_DIR / "sarcasm_data.json"

    if local_path.exists():
        logger.info("Loading data from %s", local_path)
        with open(local_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        df = pd.DataFrame(data)
        if "headline" in df.columns:
            df = df.rename(columns={"headline": "text", "is_sarcastic": "label"})
        return df["text"].tolist(), df["label"].tolist()

    try:
        from datasets import load_dataset

        logger.info("Downloading Twitter sarcasm dataset from HuggingFace …")
        ds = load_dataset("tweet_eval", "irony", trust_remote_code=True)
        train_texts = ds["train"]["text"]
        train_labels = ds["train"]["label"]
        val_texts = ds["validation"]["text"] if "validation" in ds else []
        val_labels = ds["validation"]["label"] if "validation" in ds else []
        all_texts = list(train_texts) + list(val_texts)
        all_labels = list(train_labels) + list(val_labels)
        return all_texts, all_labels
    except Exception as e:
        logger.error("Failed to load dataset: %s", e)
        logger.info("Generating synthetic data for demo …")
        texts = [
            "Oh great, another Monday morning meeting",
            "I love being stuck in traffic for hours",
            "What a wonderful time to be alive",
            "The weather is beautiful today",
            "I had a great meal at the new restaurant",
            "Sure, because that's exactly what I wanted",
            "Wow, this is the best day ever said no one",
            "Thank you so much for the helpful feedback",
            "I really enjoy working overtime without pay",
            "The sunset looks absolutely stunning tonight",
        ] * 100
        labels = [1, 1, 1, 0, 0, 1, 1, 1, 1, 0] * 100
        return texts, labels


# ── Training ──────────────────────────────────────────────
def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("Using device: %s", device)

    tokenizer = BertTokenizerFast.from_pretrained("bert-base-uncased")

    all_texts, all_labels = load_data()
    logger.info("Total samples: %d", len(all_texts))

    # Split 80/20
    split = int(0.8 * len(all_texts))
    train_ds = SarcasmDataset(all_texts[:split], all_labels[:split], tokenizer, args.max_len)
    val_ds = SarcasmDataset(all_texts[split:], all_labels[split:], tokenizer, args.max_len)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size)

    model = BertSarcasmClassifier(num_labels=2).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=0.01)
    criterion = nn.CrossEntropyLoss()
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    best_f1 = 0.0

    for epoch in range(args.epochs):
        # Train
        model.train()
        total_loss = 0
        for batch in train_loader:
            optimizer.zero_grad()
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["label"].to(device)

            logits, _ = model(input_ids, attention_mask)
            loss = criterion(logits, labels)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            total_loss += loss.item()

        scheduler.step()
        avg_loss = total_loss / len(train_loader)

        # Validate
        model.eval()
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

        acc = accuracy_score(all_true, all_preds)
        f1 = f1_score(all_true, all_preds, average="weighted")

        logger.info(
            "Epoch %d/%d │ Loss: %.4f │ Acc: %.4f │ F1: %.4f",
            epoch + 1, args.epochs, avg_loss, acc, f1,
        )

        if f1 > best_f1:
            best_f1 = f1
            torch.save(model.state_dict(), SAVE_PATH)
            logger.info("✓ Best model saved → %s (F1=%.4f)", SAVE_PATH, f1)

    # Final evaluation
    logger.info("\n" + "=" * 50)
    logger.info("FINAL EVALUATION")
    logger.info("=" * 50)
    logger.info("\nClassification Report:\n%s", classification_report(all_true, all_preds, target_names=["Not Sarcastic", "Sarcastic"]))
    logger.info("\nConfusion Matrix:\n%s", confusion_matrix(all_true, all_preds))
    logger.info("\nBest F1: %.4f", best_f1)
    logger.info("Model saved to: %s", SAVE_PATH)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train BERT sarcasm detector")
    parser.add_argument("--epochs", type=int, default=4)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=2e-5)
    parser.add_argument("--max_len", type=int, default=128)
    args = parser.parse_args()
    train(args)
