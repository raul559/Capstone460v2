"""
expert_pipeline.py

Orchestrates the SkinAI "expert system" pipeline:

1) Intake: structured fields from Upload page and/or extracted from chat
2) Image Prediction: calls a pluggable predictor (real model or stub)
3) Reasoning: calls MYCIN-style Certainty Factor reasoning (skinai_analyzer)
4) Medical Facts: adds label descriptions / next steps (optional)
5) Explanation: returns a structured payload for Gemini to format (Gemini is NOT used here)

This file should NOT contain model training code or Gemini prompt logic.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Protocol, Tuple
import json
import os


# ----------------------------
# Types / Interfaces
# ----------------------------

TopK = List[Dict[str, Any]]  # [{"label": "mel", "prob": 0.62}, ...]


class ImagePredictor(Protocol):
    """Adapter interface for image prediction."""
    def predict_topk(self, image_bytes: bytes, k: int = 3) -> TopK:
        ...


@dataclass
class PipelineConfig:
    topk: int = 3
    clinician_review_threshold: float = 0.5
    # optionally point to a JSON file with facts keyed by label like "mel", "nv", etc.
    facts_path: Optional[str] = None


# ----------------------------
# Default predictor (stub)
# ----------------------------

class StubHamPredictor:
    """
    Default stub predictor so the pipeline works even without the real model.
    Replace with a real predictor later without changing pipeline code.
    """
    def predict_topk(self, image_bytes: bytes, k: int = 3) -> TopK:
        # Return a stable demo output. You can randomize if you want, but stable is better for demos.
        demo = [
            {"label": "mel", "prob": 0.62},
            {"label": "nv", "prob": 0.27},
            {"label": "bkl", "prob": 0.11},
        ]
        return demo[:k]


# ----------------------------
# Facts loading (optional)
# ----------------------------

def load_medical_facts(facts_path: Optional[str]) -> Dict[str, Any]:
    """
    Load medical facts from a JSON file (optional).

    Expected structure (example):
    {
      "mel": {"summary": "...", "next_steps": ["..."], "urgency": "high"},
      "nv":  {"summary": "...", "next_steps": ["..."], "urgency": "low"}
    }
    """
    if not facts_path:
        return {}

    if not os.path.exists(facts_path):
        raise FileNotFoundError(f"facts_path not found: {facts_path}")

    with open(facts_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ----------------------------
# Normalization helpers
# ----------------------------

def _to_bool(v: Any) -> bool:
    """Convert common incoming values to bool safely."""
    if isinstance(v, bool):
        return v
    if v is None:
        return False
    if isinstance(v, (int, float)):
        return bool(v)
    s = str(v).strip().lower()
    return s in ("true", "1", "yes", "y", "on", "checked")


def normalize_intake(upload_fields: Dict[str, Any], chat_flags: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Merge and normalize intake inputs.
    - upload_fields: from Upload page (age, sex, duration_days, location, etc.)
    - chat_flags: extracted signals from Gemini chat (rapid_change, bleeding, itching, pain)
    """
    chat_flags = chat_flags or {}

    # Normalize symptom flags (defaults False)
    symptoms = {
        "rapid_change": _to_bool(chat_flags.get("rapid_change", False)),
        "bleeding": _to_bool(chat_flags.get("bleeding", False)),
        "itching": _to_bool(chat_flags.get("itching", False)),
        "pain": _to_bool(chat_flags.get("pain", False)),
    }

    # Keep upload fields as-is but ensure common keys exist
    normalized = dict(upload_fields or {})
    normalized.update(symptoms)

    # Optional: normalize duration if present as string
    if "duration_days" in normalized:
        try:
            normalized["duration_days"] = int(normalized["duration_days"])
        except Exception:
            # leave it as-is if conversion fails
            pass

    if "age" in normalized:
        try:
            normalized["age"] = int(normalized["age"])
        except Exception:
            pass

    return normalized


def normalize_topk(topk: TopK) -> TopK:
    """
    Ensure topk contains {label:str, prob:float} with prob clamped to [0,1].
    """
    norm: TopK = []
    for item in topk or []:
        label = str(item.get("label", "")).strip()
        try:
            prob = float(item.get("prob", 0.0))
        except Exception:
            prob = 0.0
        if prob < 0.0:
            prob = 0.0
        if prob > 1.0:
            prob = 1.0
        if label:
            norm.append({"label": label, "prob": prob})
    return norm


# ----------------------------
# Reasoning layer (CF)
# ----------------------------

def run_reasoning(topk: TopK, intake: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls your MYCIN-style certainty factor reasoning.

    Preferred: use `skinai_analyzer.analyze_skin_lesion(topk, intake)`
    Fallback: raise a clear error if not available.
    """
    try:
        # Your file created earlier: skinai_analyzer.py
        from skinai_analyzer import analyze_skin_lesion  # type: ignore
    except Exception as e:
        raise ImportError(
            "Could not import analyze_skin_lesion from skinai_analyzer.py. "
            "Make sure skinai_analyzer.py is in the same directory/PYTHONPATH."
        ) from e

    return analyze_skin_lesion(topk, intake)


# ----------------------------
# Primary result selection
# ----------------------------

def choose_primary_result(facts: Dict[str, float], clinician_review_threshold: float = 0.5) -> str:
    """
    Derive the final risk classification from CF facts.
    """
    needs = float(facts.get("needs_clinician_review", 0.0) or 0.0)
    high = float(facts.get("high_risk_flag", 0.0) or 0.0)
    moderate = float(facts.get("moderate_risk_flag", 0.0) or 0.0)
    low = float(facts.get("low_risk_flag", 0.0) or 0.0)

    if needs > clinician_review_threshold:
        return "clinician_review"
    if high > moderate and high > 0.0:
        return "high_risk"
    if moderate > low and moderate > 0.0:
        return "moderate_risk"
    return "low_risk"


# ----------------------------
# Pipeline entrypoint
# ----------------------------

def run_expert_pipeline(
    image_bytes: bytes,
    upload_fields: Dict[str, Any],
    chat_flags: Optional[Dict[str, Any]] = None,
    predictor: Optional[ImagePredictor] = None,
    config: Optional[PipelineConfig] = None,
) -> Dict[str, Any]:
    """
    Single entry point for the full expert system pipeline.

    Returns a structured payload:
    - intake (normalized)
    - ml.topK
    - reasoning (facts + trace + primary_result)
    - medical_facts (optional)
    - explanation_seed (a compact summary you can send to Gemini)
    """
    cfg = config or PipelineConfig()
    predictor = predictor or StubHamPredictor()

    intake = normalize_intake(upload_fields, chat_flags)

    topk = predictor.predict_topk(image_bytes, k=cfg.topk)
    topk = normalize_topk(topk)

    reasoning = run_reasoning(topk, intake)

    # reasoning is expected to include at least: primary_result, facts, trace
    facts = reasoning.get("facts", {}) or {}
    trace = reasoning.get("trace", []) or []

    # If analyzer doesn't set primary_result, compute it here
    primary = reasoning.get("primary_result")
    if not primary:
        primary = choose_primary_result(facts, cfg.clinician_review_threshold)

    # Optional: attach label-based facts (from top prediction)
    medical_facts = load_medical_facts(cfg.facts_path)
    top_label = topk[0]["label"] if topk else None
    label_facts = medical_facts.get(top_label, {}) if top_label else {}

    explanation_seed = {
        "primary_result": primary,
        "top_prediction": topk[0] if topk else None,
        "key_indicators": {
            "needs_clinician_review": facts.get("needs_clinician_review"),
            "high_risk_flag": facts.get("high_risk_flag"),
            "moderate_risk_flag": facts.get("moderate_risk_flag"),
            "low_risk_flag": facts.get("low_risk_flag"),
        },
        "intake_signals": {
            "rapid_change": intake.get("rapid_change", False),
            "bleeding": intake.get("bleeding", False),
            "itching": intake.get("itching", False),
            "pain": intake.get("pain", False),
        },
        "label_facts": label_facts,
        "disclaimer": "This tool does not provide a medical diagnosis. If you are concerned, consult a licensed clinician.",
    }

    return {
        "intake": intake,
        "ml": {"topK": topk},
        "reasoning": {
            "primary_result": primary,
            "facts": facts,
            "trace": trace,
        },
        "medical_facts": label_facts,
        "explanation_seed": explanation_seed,
    }


# ----------------------------
# Minimal manual test
# ----------------------------

if __name__ == "__main__":
    # This test does not require a real image model.
    # It only verifies that the pipeline calls predictor -> analyzer -> returns a payload.
    fake_image = b"fake-image-bytes"
    upload = {"age": 22, "sex_at_birth": "M", "location": "arm", "duration_days": 10}
    chat = {"rapid_change": True, "itching": True, "bleeding": False, "pain": False}

    out = run_expert_pipeline(fake_image, upload, chat_flags=chat)
    print(json.dumps(out["explanation_seed"], indent=2))
