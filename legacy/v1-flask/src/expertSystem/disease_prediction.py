from __future__ import annotations

from dataclasses import dataclass
from math import exp
from typing import Any, Dict, List, Tuple
import os


# HAM10000 class keys used in the current backend model
HAM10000_CLASSES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

# Accept both short keys and full disease names
LABEL_ALIASES = {
    "mel": "mel",
    "melanoma": "mel",
    "nv": "nv",
    "melanocytic_nevus": "nv",
    "melanocytic nevus": "nv",
    "bcc": "bcc",
    "basal_cell_carcinoma": "bcc",
    "basal cell carcinoma": "bcc",
    "akiec": "akiec",
    "actinic_keratosis": "akiec",
    "actinic keratosis": "akiec",
    "bkl": "bkl",
    "benign_keratosis": "bkl",
    "benign keratosis": "bkl",
    "df": "df",
    "dermatofibroma": "df",
    "vasc": "vasc",
    "vascular_lesion": "vasc",
    "vascular lesion": "vasc",
}

# Human-friendly names for output
CLASS_DISPLAY = {
    "mel": "melanoma",
    "nv": "melanocytic nevus",
    "bcc": "basal cell carcinoma",
    "akiec": "actinic keratosis",
    "bkl": "benign keratosis",
    "df": "dermatofibroma",
    "vasc": "vascular lesion",
}


@dataclass
class ExpertConfig:
    softmax_temperature: float = 1.0
    # Keep image model dominant by default; increase expert influence only when symptoms are strongly suspicious.
    model_weight: float = 0.90
    expert_weight: float = 0.10
    max_expert_weight: float = 0.25
    min_model_weight: float = 0.75
    epsilon: float = 1e-9


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _to_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if value is None:
        return None
    t = str(value).strip().lower()
    if t in {"true", "1", "yes", "y", "on"}:
        return True
    if t in {"false", "0", "no", "n", "off"}:
        return False
    return None


def _to_float(value: Any) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(value)
    except Exception:
        return None


def _to_int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    try:
        v = float(value)
    except Exception:
        return None
    if not v.is_integer():
        return None
    return int(v)


def _normalize_elevation(value: Any) -> str | None:
    if value is None:
        return None
    t = str(value).strip().lower()

    if any(token in t for token in ["nodular", "nodule", "lump", "nodul"]):
        return "nodular"
    if any(
        token in t
        for token in [
            "raised",
            "elevated",
            "bump",
            "bumpy",
            "slightly raised",
            "a little raised",
            "kinda raised",
            "kind of raised",
        ]
    ):
        return "raised"
    if any(token in t for token in ["flat", "flush", "level", "smooth"]):
        return "flat"
    return None


def _canonical_label(label: str) -> str | None:
    t = str(label or "").strip().lower()
    return LABEL_ALIASES.get(t)


def _softmax(scores: Dict[str, float], temperature: float = 1.0) -> Dict[str, float]:
    temp = max(1e-6, float(temperature))
    max_score = max(scores.values()) if scores else 0.0
    exp_vals = {k: exp((v - max_score) / temp) for k, v in scores.items()}
    total = sum(exp_vals.values()) or 1.0
    return {k: exp_vals[k] / total for k in scores}


def _normalize_distribution(dist: Dict[str, float]) -> Dict[str, float]:
    clean = {c: max(0.0, float(dist.get(c, 0.0) or 0.0)) for c in HAM10000_CLASSES}
    total = sum(clean.values())
    if total <= 0:
        return {c: 1.0 / len(HAM10000_CLASSES) for c in HAM10000_CLASSES}
    return {c: clean[c] / total for c in HAM10000_CLASSES}


def _prob_debug_enabled() -> bool:
    # Enabled by default for auditability; set SKINDERELLA_PROB_DEBUG=0 to silence.
    return str(os.getenv("SKINDERELLA_PROB_DEBUG", "1")).strip().lower() not in {"0", "false", "off", "no"}


def _prob_debug(label: str, payload: Any) -> None:
    if _prob_debug_enabled():
        print(f"{label} {payload}")


def _coerce_model_probabilities(model_probs: Any) -> Dict[str, float]:
    _prob_debug("RAW_MODEL_PROBS:", model_probs)

    if isinstance(model_probs, list):
        merged: Dict[str, float] = {}
        for item in model_probs:
            if not isinstance(item, dict):
                continue
            key = _canonical_label(str(item.get("label") or item.get("class") or ""))
            if not key:
                continue
            value = item.get("prob", item.get("confidence", item.get("score", 0.0)))
            try:
                merged[key] = float(value)
            except Exception:
                continue
        mapped = _normalize_distribution(merged)
        _prob_debug("MAPPED_MODEL_PROBS:", mapped)
        return mapped

    if isinstance(model_probs, dict):
        merged = {}
        for raw_key, raw_value in model_probs.items():
            key = _canonical_label(str(raw_key))
            if not key:
                continue
            try:
                merged[key] = float(raw_value)
            except Exception:
                continue
        mapped = _normalize_distribution(merged)
        _prob_debug("MAPPED_MODEL_PROBS:", mapped)
        return mapped

    fallback = {c: 1.0 / len(HAM10000_CLASSES) for c in HAM10000_CLASSES}
    _prob_debug("MAPPED_MODEL_PROBS:", fallback)
    return fallback


def _init_scores() -> Dict[str, float]:
    # Neutral baseline so missing symptom fields do not imply suspicion by default.
    return {c: 0.0 for c in HAM10000_CLASSES}


def _add(
    contrib: Dict[str, float],
    disease: str,
    value: float,
    reason: str,
    reasons: Dict[str, List[str]],
) -> None:
    contrib[disease] = contrib.get(disease, 0.0) + value
    reasons.setdefault(disease, []).append(f"{reason} ({value:+.2f})")


def _extract_border_0_10(symptoms: Dict[str, Any]) -> float | None:
    """
    Accept either:
    - border_0_10 already on 0..10
    - border_irregularity on 0..1 or 0..10
    """
    direct = _to_float(symptoms.get("border_0_10"))
    if direct is not None:
        return _clamp(direct, 0.0, 10.0)

    raw = _to_float(symptoms.get("border_irregularity"))
    if raw is None:
        return None

    if raw <= 1.0:
        return _clamp(raw * 10.0, 0.0, 10.0)
    return _clamp(raw, 0.0, 10.0)


def _extract_rapid_change(symptoms: Dict[str, Any]) -> bool | None:
    rapid_change = _to_bool(symptoms.get("rapid_change"))
    if rapid_change is not None:
        return rapid_change

    evolution_speed = str(symptoms.get("evolution_speed") or "").strip().lower()
    if evolution_speed in {"rapid", "moderate", "fast", "a lot"}:
        return True
    if evolution_speed in {"stable", "slow", "none", "no", "not at all", "a little"}:
        return False
    return None


def _extract_body_site(symptoms: Dict[str, Any]) -> str:
    return str(symptoms.get("body_site", symptoms.get("location")) or "").strip().lower()


def _top_items(dist: Dict[str, float], n: int = 3) -> List[Tuple[str, float]]:
    return sorted(dist.items(), key=lambda x: x[1], reverse=True)[:n]


def _suspicion_strength(symptoms: Dict[str, Any]) -> float:
    """
    Estimate symptom-based suspicion strength in [0, 1].
    Higher values should allow expert rules to influence fusion more.
    """
    score = 0.0

    if _to_bool(symptoms.get("bleeding")) is True:
        score += 0.30
    if _to_bool(symptoms.get("ulceration")) is True:
        score += 0.30
    if _to_bool(symptoms.get("crusting")) is True:
        score += 0.15

    rapid = _extract_rapid_change(symptoms)
    if rapid is True:
        score += 0.25

    border_0_10 = _extract_border_0_10(symptoms)
    if border_0_10 is not None:
        if border_0_10 >= 7:
            score += 0.20
        elif border_0_10 >= 4:
            score += 0.08

    num_colors = _to_int(symptoms.get("num_colors", symptoms.get("number_of_colors")))
    if num_colors is not None:
        if num_colors >= 3:
            score += 0.20
        elif num_colors == 2:
            score += 0.08

    width_mm = _to_float(symptoms.get("width_mm", symptoms.get("diameter_mm")))
    if width_mm is not None:
        if width_mm >= 10:
            score += 0.15
        elif width_mm >= 6:
            score += 0.08

    return _clamp(score, 0.0, 1.0)


def expert_rule_logits(symptoms: Dict[str, Any]) -> Tuple[Dict[str, float], Dict[str, List[str]]]:
    """
    Build disease logits using explicit rule-based clinical heuristics.

    Supported inputs:
      bleeding, rapid_change, evolution_speed, width_mm, diameter_mm,
      border_0_10, border_irregularity, num_colors, number_of_colors,
      elevation, itching_0_10, itching, pain_0_10, pain,
      crusting, ulceration, patient_age, age, body_site, location
    """
    logits = _init_scores()
    reasons: Dict[str, List[str]] = {c: [] for c in HAM10000_CLASSES}

    bleeding = _to_bool(symptoms.get("bleeding"))
    rapid_change = _extract_rapid_change(symptoms)
    width_mm = _to_float(symptoms.get("width_mm", symptoms.get("diameter_mm")))
    border_0_10 = _extract_border_0_10(symptoms)
    num_colors = _to_int(symptoms.get("num_colors", symptoms.get("number_of_colors")))
    elevation = _normalize_elevation(symptoms.get("elevation"))
    itching_0_10 = _to_float(symptoms.get("itching_0_10", symptoms.get("itching")))
    pain_0_10 = _to_float(symptoms.get("pain_0_10", symptoms.get("pain")))
    crusting = _to_bool(symptoms.get("crusting"))
    ulceration = _to_bool(symptoms.get("ulceration"))
    age = _to_float(symptoms.get("patient_age", symptoms.get("age")))
    body_site = _extract_body_site(symptoms)

    # Bleeding
    if bleeding is True:
        _add(logits, "mel", 1.05, "Bleeding present", reasons)
        _add(logits, "bcc", 0.85, "Bleeding present", reasons)
        _add(logits, "vasc", 0.55, "Bleeding present", reasons)
        _add(logits, "nv", -0.45, "Bleeding less typical", reasons)
    elif bleeding is False:
        _add(logits, "nv", 0.12, "No bleeding", reasons)
        _add(logits, "df", 0.08, "No bleeding", reasons)

    # Evolution / change
    if rapid_change is True:
        _add(logits, "mel", 0.95, "Rapid or notable change", reasons)
        _add(logits, "akiec", 0.45, "Rapid or notable change", reasons)
        _add(logits, "bcc", 0.35, "Rapid or notable change", reasons)
        _add(logits, "nv", -0.35, "Rapid change less typical", reasons)
    elif rapid_change is False:
        _add(logits, "nv", 0.40, "Stable lesion", reasons)
        _add(logits, "df", 0.20, "Stable lesion", reasons)

    # Diameter
    if width_mm is not None:
        w = max(0.0, width_mm)
        if w >= 10:
            _add(logits, "mel", 0.90, "Large diameter (>=10 mm)", reasons)
            _add(logits, "bcc", 0.45, "Large diameter (>=10 mm)", reasons)
            _add(logits, "nv", -0.25, "Large diameter less typical", reasons)
        elif w >= 6:
            _add(logits, "mel", 0.60, "Diameter >=6 mm (ABCDE)", reasons)
            _add(logits, "bkl", 0.20, "Moderate diameter", reasons)
            _add(logits, "bcc", 0.10, "Moderate diameter", reasons)
        else:
            _add(logits, "nv", 0.25, "Smaller diameter", reasons)
            _add(logits, "df", 0.20, "Smaller diameter", reasons)
            _add(logits, "vasc", 0.10, "Smaller diameter", reasons)

    # Border irregularity
    if border_0_10 is not None:
        b = _clamp(border_0_10, 0.0, 10.0)
        if b >= 7:
            _add(logits, "mel", 0.95, "Irregular border", reasons)
            _add(logits, "bcc", 0.35, "Irregular border", reasons)
        elif b >= 4:
            _add(logits, "mel", 0.35, "Some border irregularity", reasons)
            _add(logits, "bkl", 0.15, "Some border irregularity", reasons)
        elif b <= 3:
            _add(logits, "nv", 0.35, "Regular border", reasons)
            _add(logits, "df", 0.25, "Regular border", reasons)
            _add(logits, "vasc", 0.10, "Regular border", reasons)

    # Number of colors
    if num_colors is not None:
        n = max(1, num_colors)
        if n >= 3:
            _add(logits, "mel", 1.00, "Multiple colors (>=3)", reasons)
            _add(logits, "bkl", 0.40, "Multiple colors", reasons)
        elif n == 2:
            _add(logits, "mel", 0.35, "Two colors", reasons)
            _add(logits, "bkl", 0.30, "Two colors", reasons)
        else:
            _add(logits, "nv", 0.45, "Single color", reasons)
            _add(logits, "df", 0.20, "Single color", reasons)

    # Elevation
    if elevation == "nodular":
        _add(logits, "bcc", 0.80, "Nodular elevation", reasons)
        _add(logits, "df", 0.55, "Nodular elevation", reasons)
        _add(logits, "mel", 0.30, "Nodular elevation", reasons)
        _add(logits, "vasc", 0.15, "Nodular elevation", reasons)
    elif elevation == "raised":
        _add(logits, "bcc", 0.40, "Raised lesion", reasons)
        _add(logits, "bkl", 0.40, "Raised lesion", reasons)
        _add(logits, "df", 0.30, "Raised lesion", reasons)
        _add(logits, "nv", 0.15, "Raised lesion", reasons)
    elif elevation == "flat":
        _add(logits, "nv", 0.25, "Flat lesion", reasons)
        _add(logits, "akiec", 0.20, "Flat lesion", reasons)
        _add(logits, "mel", 0.10, "Flat lesion", reasons)

    # Itching
    if itching_0_10 is not None:
        itch = _clamp(itching_0_10, 0.0, 10.0)
        if itch >= 7:
            _add(logits, "bkl", 0.40, "High itching", reasons)
            _add(logits, "akiec", 0.35, "High itching", reasons)
            _add(logits, "bcc", 0.20, "High itching", reasons)
        elif itch >= 3:
            _add(logits, "df", 0.15, "Mild/moderate itching", reasons)
        elif itch <= 2:
            _add(logits, "nv", 0.12, "Low itching", reasons)

    # Pain
    if pain_0_10 is not None:
        pain = _clamp(pain_0_10, 0.0, 10.0)
        if pain >= 7:
            _add(logits, "bcc", 0.55, "High pain", reasons)
            _add(logits, "akiec", 0.35, "High pain", reasons)
            _add(logits, "mel", 0.30, "High pain", reasons)
        elif pain >= 3:
            _add(logits, "df", 0.15, "Mild/moderate pain", reasons)
        elif pain <= 2:
            _add(logits, "nv", 0.10, "Low pain", reasons)

    # Crusting / scabbing
    if crusting is True:
        _add(logits, "akiec", 0.70, "Crusting or scabbing", reasons)
        _add(logits, "bcc", 0.45, "Crusting or scabbing", reasons)
        _add(logits, "mel", 0.20, "Crusting or scabbing", reasons)

    # Ulceration
    if ulceration is True:
        _add(logits, "bcc", 0.80, "Ulceration", reasons)
        _add(logits, "mel", 0.55, "Ulceration", reasons)
        _add(logits, "akiec", 0.35, "Ulceration", reasons)

    # Age
    if age is not None:
        if age >= 60:
            _add(logits, "bcc", 0.30, "Older age", reasons)
            _add(logits, "akiec", 0.35, "Older age", reasons)
            _add(logits, "mel", 0.20, "Older age", reasons)
            _add(logits, "bkl", 0.20, "Older age", reasons)
        elif age < 40:
            _add(logits, "nv", 0.25, "Younger age", reasons)
            _add(logits, "df", 0.18, "Younger age", reasons)

    # Body site
    if body_site:
        if any(site in body_site for site in ["face", "ear", "ears", "neck", "scalp"]):
            _add(logits, "bcc", 0.35, "Common sun-exposed location", reasons)
            _add(logits, "akiec", 0.30, "Common sun-exposed location", reasons)
            _add(logits, "mel", 0.10, "Sun-exposed location", reasons)

        if any(site in body_site for site in ["arm", "arms", "leg", "legs", "forearm", "forearms"]):
            _add(logits, "df", 0.20, "Common extremity location", reasons)
            _add(logits, "mel", 0.10, "Possible extremity location", reasons)

        if any(site in body_site for site in ["trunk", "chest", "back", "abdomen", "torso"]):
            _add(logits, "bkl", 0.15, "Common trunk location", reasons)
            _add(logits, "vasc", 0.18, "Common trunk location", reasons)
            _add(logits, "mel", 0.12, "Possible trunk location", reasons)

    reasons = {k: v for k, v in reasons.items() if v}
    return logits, reasons


def compute_expert_probabilities(symptoms: Dict[str, Any], temperature: float = 1.0) -> Dict[str, Any]:
    logits, reasons = expert_rule_logits(symptoms)
    probs = _softmax(logits, temperature=temperature)
    return {
        "logits": {k: round(v, 6) for k, v in logits.items()},
        "probabilities": {k: round(v, 6) for k, v in probs.items()},
        "reasons_by_disease": reasons,
    }


def combine_probabilities(
    model_probabilities: Dict[str, float],
    expert_probabilities: Dict[str, float],
    cfg: ExpertConfig | None = None,
) -> Dict[str, float]:
    """
    Weighted-average fusion:
      combined = model_weight * model + expert_weight * expert
    Then normalized to sum=1.
    """
    config = cfg or ExpertConfig()
    mw = max(0.0, float(config.model_weight))
    ew = max(0.0, float(config.expert_weight))
    norm = mw + ew
    if norm <= 0:
        mw, ew, norm = 0.9, 0.1, 1.0

    combined_raw: Dict[str, float] = {}
    for cls in HAM10000_CLASSES:
        m = max(0.0, float(model_probabilities.get(cls, 0.0) or 0.0))
        e = max(0.0, float(expert_probabilities.get(cls, 0.0) or 0.0))
        combined_raw[cls] = ((mw * m) + (ew * e)) / norm

    _prob_debug("FUSED_BEFORE_NORMALIZE:", combined_raw)
    final_probs = _normalize_distribution(combined_raw)
    _prob_debug("FINAL_FULL_DISTRIBUTION:", final_probs)
    _prob_debug("FINAL_SUM:", sum(final_probs.values()))
    return final_probs


def _normalize_top3_for_display(top3: List[Tuple[str, float]]) -> List[Dict[str, float]]:
    total = sum(max(0.0, float(prob or 0.0)) for _, prob in top3)
    if total <= 0:
        return [{"code": cls, "share": 0.0} for cls, _ in top3]
    return [{"code": cls, "share": max(0.0, float(prob or 0.0)) / total} for cls, prob in top3]


def _top_reasoning_text(
    reasons_by_disease: Dict[str, List[str]],
    top_class: str,
    max_items: int = 4,
) -> str:
    reasons = reasons_by_disease.get(top_class, [])
    if not reasons:
        return "No strong rule-based symptom evidence was triggered for the top class."
    return "; ".join(reasons[:max_items])


def build_expert_fusion_output(
    symptoms: Dict[str, Any],
    model_probs: Any,
    cfg: ExpertConfig | None = None,
) -> Dict[str, Any]:
    """
    Main integration entrypoint for Flask backend.

    Args:
      symptoms: chatbot/intake symptoms dict
      model_probs: list or dict from CNN output
      cfg: fusion/softmax configuration

    Returns payload with:
      - model probabilities
      - expert probabilities
      - final combined probabilities
      - most likely disease
      - top 3 diseases
      - medical reasoning explanation
    """
    config = cfg or ExpertConfig()
    model_distribution = _coerce_model_probabilities(model_probs)
    model_top_conf = max(model_distribution.values()) if model_distribution else 0.0

    expert_out = compute_expert_probabilities(
        symptoms,
        temperature=config.softmax_temperature,
    )
    expert_distribution = _normalize_distribution(expert_out["probabilities"])
    _prob_debug("EXPERT_PROBS:", expert_distribution)

    suspicion = _suspicion_strength(symptoms)
    effective_expert_weight = config.expert_weight + (config.max_expert_weight - config.expert_weight) * suspicion
    effective_model_weight = config.model_weight - (config.model_weight - config.min_model_weight) * suspicion

    # If image confidence is very high and symptoms are low-risk/neutral, keep image dominance stronger.
    if model_top_conf >= 0.90 and suspicion <= 0.20:
        effective_model_weight = max(effective_model_weight, 0.92)
        effective_expert_weight = min(effective_expert_weight, 0.08)

    fuse_cfg = ExpertConfig(
        softmax_temperature=config.softmax_temperature,
        model_weight=effective_model_weight,
        expert_weight=effective_expert_weight,
        max_expert_weight=config.max_expert_weight,
        min_model_weight=config.min_model_weight,
        epsilon=config.epsilon,
    )

    final_distribution = combine_probabilities(
        model_distribution,
        expert_distribution,
        cfg=fuse_cfg,
    )

    best_class = max(final_distribution, key=final_distribution.get)
    top3 = _top_items(final_distribution, n=3)
    display_top3 = _normalize_top3_for_display(top3)
    _prob_debug("TOP3_RAW:", top3)
    _prob_debug("TOP3_DISPLAY:", display_top3)

    explanation = {
        "method": (
            "Rule-based symptom scoring -> softmax expert probabilities -> "
            "weighted-average fusion with CNN probabilities"
        ),
        "fusion_weights": {
            "model_weight": round(effective_model_weight, 4),
            "expert_weight": round(effective_expert_weight, 4),
            "suspicion_strength": round(suspicion, 4),
            "model_top_confidence": round(model_top_conf, 4),
        },
        "top_class_reasons": _top_reasoning_text(
            expert_out["reasons_by_disease"],
            best_class,
        ),
        "notes": (
            "This is a triage-oriented probability estimate for educational/research use, "
            "not a diagnosis. Clinical examination and dermoscopy are required for diagnosis."
        ),
    }

    return {
        "model_probabilities": {k: round(v, 6) for k, v in model_distribution.items()},
        "expert_probabilities": {k: round(v, 6) for k, v in expert_distribution.items()},
        "final_combined_probabilities": {k: round(v, 6) for k, v in final_distribution.items()},
        # Explicitly expose top-3 display shares to avoid mixing presentation with model logic.
        "top_3_display_shares": [
            {"code": item["code"], "share": round(item["share"], 6)} for item in display_top3
        ],
        "most_likely_disease": {
            "code": best_class,
            "name": CLASS_DISPLAY.get(best_class, best_class),
            "probability": round(final_distribution[best_class], 6),
        },
        "top_3_diseases": [
            {
                "code": cls,
                "name": CLASS_DISPLAY.get(cls, cls),
                "probability": round(prob, 6),
            }
            for cls, prob in top3
        ],
        "medical_reasoning": explanation,
        "reasoning_by_disease": expert_out["reasons_by_disease"],
    }


if __name__ == "__main__":
    example_symptoms = {
        "bleeding": True,
        "evolution_speed": "rapid",
        "diameter_mm": 8,
        "border_irregularity": 0.8,   # can be 0..1
        "number_of_colors": 3,
        "elevation": "raised",
        "itching_0_10": 4,
        "pain_0_10": 2,
        "patient_age": 67,
        "body_site": "left forearm",
        "crusting": False,
        "ulceration": False,
    }

    example_model = {
        "mel": 0.772,
        "nv": 0.226,
        "vasc": 0.003,
    }

    payload = build_expert_fusion_output(example_symptoms, example_model)

    from pprint import pprint
    pprint(payload)