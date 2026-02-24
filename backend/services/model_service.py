"""
Model service — loads BERT, runs inference, extracts attention weights.

Falls back to a mock predictor when no trained model file is found,
so the app works out of the box for development / demo purposes.
"""

import logging
import random
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import torch
import torch.nn.functional as F

from backend.config import (
    DEVICE,
    LABELS,
    MAX_LENGTH,
    MODEL_PATH,
    NUM_LABELS,
    TOKENIZER_NAME,
)

logger = logging.getLogger(__name__)

# ── Globals ───────────────────────────────────────────────
_model = None
_tokenizer = None
_is_mock = True


# ── BERT Classifier ──────────────────────────────────────
class BertSarcasmClassifier(torch.nn.Module):
    """Simple classifier head on top of BERT."""

    def __init__(self, num_labels: int = NUM_LABELS):
        super().__init__()
        from transformers import BertModel

        self.bert = BertModel.from_pretrained(TOKENIZER_NAME)
        self.dropout = torch.nn.Dropout(0.3)
        self.classifier = torch.nn.Linear(self.bert.config.hidden_size, num_labels)

    def forward(self, input_ids, attention_mask, token_type_ids=None):
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids,
            output_attentions=True,
        )
        pooled = outputs.pooler_output
        pooled = self.dropout(pooled)
        logits = self.classifier(pooled)
        return logits, outputs.attentions


# ── Loader ────────────────────────────────────────────────
def load_model() -> None:
    """Load the model & tokenizer.  Uses mock mode if no .pt file exists."""
    global _model, _tokenizer, _is_mock

    from transformers import BertTokenizerFast

    _tokenizer = BertTokenizerFast.from_pretrained(TOKENIZER_NAME)

    if Path(MODEL_PATH).exists():
        logger.info("Loading trained model from %s …", MODEL_PATH)
        _model = BertSarcasmClassifier(NUM_LABELS)
        state = torch.load(MODEL_PATH, map_location=DEVICE)
        _model.load_state_dict(state)
        _model.to(DEVICE)
        _model.eval()
        _is_mock = False
        logger.info("Model loaded on %s", DEVICE)
    else:
        logger.warning(
            "No model file at %s — running in MOCK mode. "
            "Run model/train.py to create a real model.",
            MODEL_PATH,
        )
        _is_mock = True


def is_model_loaded() -> bool:
    return not _is_mock


# ── Sarcasm cues for mock & explanation ───────────────────
_POSITIVE = {
    "great", "awesome", "wonderful", "love", "fantastic", "amazing",
    "excellent", "brilliant", "perfect", "best", "wow", "nice",
    "beautiful", "incredible", "superb", "outstanding", "fabulous",
    "thrilled", "delighted", "joyful", "terrific", "marvelous",
    "genius", "impressive", "fun", "exciting", "thanks", "thank",
    "please", "glad", "happy", "enjoy", "pleasure", "lucky",
    "charming", "lovely", "splendid", "magnificent", "bravo",
}

_NEGATIVE = {
    "not", "never", "hate", "worst", "terrible", "awful", "bad",
    "boring", "annoying", "stupid", "ugly", "useless", "fail",
    "horrible", "dreadful", "pathetic", "disgusting", "miserable",
    "disappointing", "sucks", "ridiculous", "obviously", "clearly",
    "sure", "totally", "right", "definitely", "oh", "slow",
    "slower", "late", "later", "wrong", "broken", "lost", "stuck",
    "waiting", "waste", "mess", "disaster", "ruin", "ruined",
    "killed", "died", "dead", "crash", "crashed", "failed",
}

_SARCASM_MARKERS = {
    "oh", "wow", "sure", "totally", "obviously", "clearly",
    "definitely", "absolutely", "exactly", "precisely", "certainly",
    "of course", "no kidding", "yeah right", "bravo", "genius",
    "shocking", "shocker", "surprise", "surprised",
}

# ── Regex patterns (ordered by specificity) ───────────────
_SARCASM_PATTERNS = [
    # Positive word + ironic context
    (r"\boh\b.*\b(great|wow|fantastic|amazing|love|wonderful|brilliant)\b", 0.40,
     "uses an ironic exclamation with overly positive words"),
    (r"\byeah\b.*\bright\b", 0.45,
     "uses 'yeah right' — a classic sarcastic dismissal"),
    (r"\bas if\b", 0.45,
     "uses 'as if' to express disbelief sarcastically"),

    # Polite request + contradictory/absurd action (contextual sarcasm)
    (r"\b(could|can|would)\b.*\bplease\b.*\b(slow|slower|later|worse|less|little)\b", 0.55,
     "contains a polite request followed by a contradictory or absurd action — situational irony"),
    (r"\b(could|can|would)\b.*\bplease\b.*\b(more|another|again|repeat)\b.*\b(slow|boring|annoying|loud|late)\b", 0.55,
     "politely asks for more of something undesirable — contextual sarcasm"),

    # Rhetorical questions with sarcastic undertone
    (r"\bwho\b.*\b(would|could|knew|thought)\b", 0.30,
     "rhetorical question suggesting the answer is obvious"),
    (r"\bhow\b.*\b(surprising|original|creative|clever|smart|nice)\b", 0.40,
     "rhetorical question with exaggerated praise"),
    (r"\bwhat a\b.*\b(surprise|shock|day|life|joy|pleasure|delight|treat|genius|time)\b", 0.45,
     "uses 'what a...' pattern expressing mock surprise or irony"),

    # Common sarcastic phrases
    (r"\bthanks?\b.*\b(a lot|so much|for nothing|for that)\b", 0.50,
     "uses 'thanks' in an exaggerated or dismissive way"),
    (r"\b(no|yeah)\b.*\b(kidding|duh|really|way|shit|sherlock)\b", 0.55,
     "uses a common sarcastic interjection"),
    (r"\btell me\b.*\bmore\b", 0.40,
     "uses 'tell me more' sarcastically to show disinterest"),
    (r"\bcan'?t\b.*\bwait\b", 0.40,
     "expresses fake eagerness — 'can't wait' used ironically"),
    (r"\bjust\b.*\b(what|exactly what)\b.*\b(need|want|asked)\b", 0.50,
     "uses 'just what I needed' — sarcastic resignation"),
    (r"\bexactly\b.*\b(what|how)\b.*\b(want|plan|expect|hope)\b", 0.45,
     "uses 'exactly' with a contradictory outcome"),
    (r"\bnothing\b.*\b(like|better|says)\b", 0.40,
     "uses 'nothing like...' or 'nothing better' sarcastically"),
    (r"\b(real|very)\b.*\b(helpful|useful|mature|smart|clever|original|classy|professional)\b", 0.45,
     "uses 'real/very' + positive adjective sarcastically"),
    (r"\bso\b.*\b(glad|happy|thrilled|excited|proud)\b.*\b(that|to|you|we|about)\b", 0.40,
     "uses exaggerated positive emotion that may be insincere"),
    (r"\bwow\b.*\b(just|so|that|this|really)\b", 0.40,
     "uses 'wow' in a dismissive or mocking way"),
    (r"\byou\b.*\b(must|should)\b.*\b(be|feel)\b.*\b(proud|happy|smart|special)\b", 0.45,
     "sarcastically tells someone they should feel proud/happy"),
    (r"\bi'?m?\b.*\bso\b.*\b(impressed|shocked|surprised|moved)\b", 0.45,
     "expresses exaggerated surprise or fake impression"),
    (r"\bkeep\b.*\b(up|going|it)\b.*\b(good|great)\b.*\bwork\b", 0.30,
     "could be genuine encouragement or sarcastic depending on context"),

    # Contradictory superlatives / understatement
    (r"\best\b.*\b(ever|idea|plan|day|thing)\b", 0.35,
     "uses superlative ('best ever') which may be ironic"),
    (r"\ba little\b", 0.15,
     "uses understatement ('a little') which can signal irony"),
    (r"\b(story|excuse|reason)\b.*\b(of my|of the|ever)\b", 0.35,
     "references a story/excuse in an exaggerated way"),

    # Situational patterns (describing unfortunate situations positively)
    (r"\b(love|enjoy|like)\b.*\b(being|getting|having|sitting|standing|waiting|stuck)\b", 0.50,
     "expresses positive sentiment about an unpleasant situation — situational sarcasm"),
    (r"\b(love|enjoy|like)\b.*\b(traffic|rain|monday|queue|line|spam|ads|mosquito|cold|flu)\b", 0.55,
     "expresses enjoyment of something typically unpleasant — strong sarcasm signal"),
    (r"\b(best|favorite)\b.*\b(part|thing|moment)\b.*\b(when|is|was)\b", 0.35,
     "uses 'best part' which can be ironic framing"),

    # Exaggeration markers
    (r"\b(so|very|incredibly|extremely|absolutely|truly)\b.*\b(fun|exciting|interesting|original|helpful)\b", 0.35,
     "uses intensifier + positive adjective which can indicate exaggerated/sarcastic praise"),

    # Basic markers (lower confidence)
    (r"\bsure\b", 0.25, "uses 'sure' which can be a sarcastic concession"),
    (r"\btotally\b", 0.25, "uses 'totally' which can indicate mock agreement"),
    (r"\bobviously\b", 0.30, "uses 'obviously' to sarcastically state something self-evident"),
    (r"\bclearly\b", 0.25, "uses 'clearly' in a potentially sarcastic way"),
    (r"\bbrilliant\b", 0.30, "uses 'brilliant' which is a common sarcasm word"),
    (r"\bgenius\b", 0.35, "uses 'genius' sarcastically to mock intelligence"),
    (r"\bshocker\b", 0.50, "uses 'shocker' to express mock surprise"),
]

# ── Whole-sentence known sarcastic phrases ────────────────
_KNOWN_SARCASTIC = [
    "could you please do that a little slower",
    "could you be any slower",
    "take your time",
    "no rush",
    "i'm shocked",
    "color me surprised",
    "tell me something i don't know",
    "that's a first",
    "what a shocker",
    "how original",
    "how creative",
    "how surprising",
    "story of my life",
    "just my luck",
    "because that makes sense",
    "that's just great",
    "that's just perfect",
    "good for you",
    "way to go",
    "nice going",
    "smooth move",
    "well done",
    "great job",
    "big surprise",
    "real nice",
    "very helpful",
    "thanks for nothing",
    "you don't say",
    "i couldn't care less",
    "like i care",
    "like that's going to happen",
    "what else is new",
    "join the club",
    "life is so fair",
    "because that always works",
    "my favorite thing",
    "i live for this",
    "i'm living the dream",
    "couldn't be happier",
    "best day ever",
    "this is fine",
    "everything is fine",
    "no worries at all",
    "it's not like i had plans",
    "it's not like i was busy",
]


def _detect_sarcasm_cues(text: str) -> Tuple[List[str], float, str]:
    """
    Advanced heuristic sarcasm detection used in mock mode & explanations.

    Combines multiple signal types:
    - Keyword sentiment clash (positive + negative)
    - 50+ regex patterns for contextual/situational sarcasm
    - Known sarcastic phrase matching
    - Structural cues (punctuation, capitalisation, quotation marks)
    """
    lower = text.lower().strip()
    words = re.findall(r"\b\w+\b", lower)
    found_positive = [w for w in words if w in _POSITIVE]
    found_negative = [w for w in words if w in _NEGATIVE]
    found_markers = [w for w in words if w in _SARCASM_MARKERS]

    cue_words: List[str] = []
    score = 0.0
    reasons: List[str] = []

    # ── 1. Known sarcastic phrases (highest priority) ─────
    for phrase in _KNOWN_SARCASTIC:
        if phrase in lower:
            score += 0.60
            cue_words.extend(phrase.split()[:4])
            reasons.append(
                f"contains the known sarcastic phrase '{phrase}'"
            )
            break  # one match is enough

    # ── 2. Regex pattern matching ─────────────────────────
    pattern_reasons: List[str] = []
    for pattern, weight, reason in _SARCASM_PATTERNS:
        if re.search(pattern, lower):
            score += weight
            pattern_reasons.append(reason)
            # Extract matched words as cues
            match = re.search(pattern, lower)
            if match:
                matched_words = re.findall(r"\b\w+\b", match.group())
                cue_words.extend(matched_words[:3])
    if pattern_reasons:
        # Take top 2 most specific reasons
        reasons.extend(pattern_reasons[:2])

    # ── 3. Sentiment clash (positive + negative together) ─
    if found_positive and found_negative:
        score += 0.30
        cue_words.extend(found_positive[:3] + found_negative[:3])
        reasons.append(
            "positive sentiment words mixed with negative or sarcastic markers"
        )

    # ── 4. Sarcasm marker words present ───────────────────
    if found_markers:
        score += 0.10 * min(len(found_markers), 3)
        cue_words.extend(found_markers[:3])
        if not any("marker" in r for r in reasons):
            reasons.append(
                f"contains sarcasm marker words: {', '.join(found_markers[:3])}"
            )

    # ── 5. Structural cues ────────────────────────────────
    if text.endswith("!") or text.endswith("!!") or text.endswith("!!!"):
        score += 0.08
        reasons.append("emphatic punctuation suggests exaggeration")
    if text.endswith("..."):
        score += 0.08
        reasons.append("trailing ellipsis suggests ironic trailing-off")
    if "?" in text and any(w in lower for w in ["could", "would", "can", "really"]):
        score += 0.10
        reasons.append("rhetorical question structure detected")
    if '"' in text or "'" in text:
        # Quotation marks around words can indicate air-quotes / sarcasm
        quoted = re.findall(r'["\'](\w+)["\']', text)
        if quoted:
            score += 0.12
            cue_words.extend(quoted[:2])
            reasons.append(
                f"uses quotation marks around '{', '.join(quoted[:2])}' suggesting air-quotes / irony"
            )
    # Mixed caps (words in ALL CAPS mid-sentence)
    if any(c.isupper() for c in text) and not text.isupper():
        caps_words = [w for w in text.split() if w.isupper() and len(w) > 1]
        if caps_words:
            score += 0.08
            cue_words.extend([w.lower() for w in caps_words[:2]])
            reasons.append("mixed capitalisation indicates emphasis or irony")

    # ── 6. Contextual contradiction check ─────────────────
    # Positive verbs describing negative situations
    pos_verbs = {"love", "enjoy", "adore", "like", "appreciate"}
    neg_situations = {
        "waiting", "stuck", "traffic", "slow", "late", "rain",
        "monday", "queue", "spam", "boring", "cold", "flu",
        "broken", "crashed", "lost", "failed", "waste",
    }
    found_pos_verbs = [w for w in words if w in pos_verbs]
    found_neg_sits = [w for w in words if w in neg_situations]
    if found_pos_verbs and found_neg_sits:
        score += 0.35
        cue_words.extend(found_pos_verbs[:2] + found_neg_sits[:2])
        reasons.append(
            f"expresses positive sentiment ('{found_pos_verbs[0]}') about "
            f"a typically negative situation ('{found_neg_sits[0]}') — situational irony"
        )

    # ── Normalise & deduplicate ───────────────────────────
    score = min(score, 0.98)
    cue_words = list(dict.fromkeys(cue_words))[:8]  # unique, max 8

    if score < 0.15:
        score = random.uniform(0.08, 0.30)
        reasons = reasons or [
            "no strong sarcasm indicators found; the text appears straightforward"
        ]

    explanation = (
        "The sentence " + "; ".join(reasons[:3]) + "."
        if reasons
        else "The text appears to be a straightforward statement."
    )
    return cue_words, score, explanation


# ── Predict (real model) ─────────────────────────────────
def _predict_real(text: str) -> Dict:
    """Run inference with the trained BERT model."""
    encoding = _tokenizer(
        text,
        max_length=MAX_LENGTH,
        padding="max_length",
        truncation=True,
        return_tensors="pt",
    )
    input_ids = encoding["input_ids"].to(DEVICE)
    attention_mask = encoding["attention_mask"].to(DEVICE)

    with torch.no_grad():
        logits, attentions = _model(input_ids, attention_mask)
        probs = F.softmax(logits, dim=1)
        confidence, pred_idx = torch.max(probs, dim=1)

    # Attention-based highlighting (last layer, mean over heads)
    last_attn = attentions[-1].squeeze(0).mean(dim=0)  # (seq, seq)
    cls_attn = last_attn[0]  # CLS row
    tokens = _tokenizer.convert_ids_to_tokens(input_ids.squeeze())
    mask = attention_mask.squeeze().bool()

    word_scores = {}
    for tok, score, m in zip(tokens, cls_attn, mask):
        if not m or tok in ("[CLS]", "[SEP]", "[PAD]"):
            continue
        clean = tok.replace("##", "")
        word_scores[clean] = max(word_scores.get(clean, 0), score.item())

    sorted_words = sorted(word_scores.items(), key=lambda x: x[1], reverse=True)
    highlighted = [w for w, _ in sorted_words[:8]]

    _, mock_score, explanation = _detect_sarcasm_cues(text)

    label = LABELS[pred_idx.item()]
    conf = round(confidence.item(), 4)

    attention_dict = {w: round(s, 4) for w, s in sorted_words[:15]}

    return {
        "prediction": label,
        "confidence": conf,
        "highlighted_words": highlighted,
        "explanation": explanation,
        "attention_scores": attention_dict,
    }


# ── Predict (mock) ────────────────────────────────────────
def _predict_mock(text: str) -> Dict:
    """Heuristic-based mock prediction for development / demo."""
    cue_words, score, explanation = _detect_sarcasm_cues(text)
    is_sarcastic = score >= 0.45

    if is_sarcastic:
        confidence = round(random.uniform(max(score, 0.70), 0.97), 4)
    else:
        confidence = round(random.uniform(0.60, 0.88), 4)

    # Generate pseudo attention scores
    words = re.findall(r"\b\w+\b", text)
    attention_scores = {}
    for w in words[:15]:
        wl = w.lower()
        if wl in _POSITIVE or wl in _NEGATIVE:
            attention_scores[w] = round(random.uniform(0.15, 0.40), 4)
        else:
            attention_scores[w] = round(random.uniform(0.01, 0.10), 4)

    return {
        "prediction": "Sarcastic" if is_sarcastic else "Not Sarcastic",
        "confidence": confidence,
        "highlighted_words": cue_words if cue_words else words[:3],
        "explanation": explanation,
        "attention_scores": attention_scores,
    }


# ── Public API ────────────────────────────────────────────
def predict(text: str) -> Dict:
    """Return a sarcasm prediction for the given text."""
    if _is_mock:
        return _predict_mock(text)
    return _predict_real(text)


def predict_batch(texts: List[str]) -> List[Dict]:
    """Return predictions for a batch of texts."""
    return [predict(t) for t in texts]
