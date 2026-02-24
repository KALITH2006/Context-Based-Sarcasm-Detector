"""
Explainer service — attention-weight visualization & optional SHAP.
"""

import logging
from typing import Dict, List, Optional

from backend.config import SHAP_ENABLED

logger = logging.getLogger(__name__)


def get_attention_explanation(
    attention_scores: Optional[Dict[str, float]],
    prediction: str,
    confidence: float,
) -> str:
    """Build a human-readable explanation from attention scores."""
    if not attention_scores:
        return "No attention data available for this prediction."

    sorted_words = sorted(attention_scores.items(), key=lambda x: x[1], reverse=True)
    top_words = [w for w, _ in sorted_words[:5]]

    if prediction == "Sarcastic":
        base = (
            f"The model is {confidence * 100:.1f}% confident this text is sarcastic. "
            f"Key words driving this prediction: {', '.join(top_words)}. "
            "These words received the highest attention weights, suggesting the model "
            "detected an ironic or contradictory tone."
        )
    else:
        base = (
            f"The model is {confidence * 100:.1f}% confident this is not sarcastic. "
            f"The words '{', '.join(top_words[:3])}' received the most attention, "
            "but no strong sarcastic patterns were detected."
        )
    return base


def get_shap_explanation(text: str) -> Optional[Dict]:
    """
    Generate SHAP-based explanations.
    Only runs when SHAP_ENABLED is True and the real model is loaded.
    Returns token-level SHAP values or None.
    """
    if not SHAP_ENABLED:
        return None

    try:
        import shap
        from backend.services.model_service import _model, _tokenizer, _is_mock

        if _is_mock or _model is None:
            logger.info("SHAP explanation skipped — no real model loaded.")
            return None

        def model_predict(texts: List[str]):
            import torch
            import torch.nn.functional as F
            from backend.config import MAX_LENGTH, DEVICE

            results = []
            for t in texts:
                enc = _tokenizer(
                    t,
                    max_length=MAX_LENGTH,
                    padding="max_length",
                    truncation=True,
                    return_tensors="pt",
                )
                with torch.no_grad():
                    logits, _ = _model(
                        enc["input_ids"].to(DEVICE),
                        enc["attention_mask"].to(DEVICE),
                    )
                    probs = F.softmax(logits, dim=1)
                results.append(probs.cpu().numpy()[0])
            import numpy as np
            return np.array(results)

        explainer = shap.Explainer(model_predict, _tokenizer)
        shap_values = explainer([text])

        tokens = shap_values.data[0]
        values = shap_values.values[0]

        token_shap = {}
        for token, val in zip(tokens, values):
            if token not in ("[CLS]", "[SEP]", "[PAD]", ""):
                token_shap[token] = round(float(val[1]), 4)  # class 1 = sarcastic

        return token_shap

    except Exception as e:
        logger.error("SHAP explanation failed: %s", e)
        return None
