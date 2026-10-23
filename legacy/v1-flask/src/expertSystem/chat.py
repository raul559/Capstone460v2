# File: expertSystem/chat.py
# Role: Gemini-powered dermatology intake assistant (NOT a diagnosis system).

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from difflib import get_close_matches, SequenceMatcher

import os, json, time, re
from collections.abc import Mapping

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv(usecwd=True), override=True)
print("[load] chat.py from:", __file__)
print("[dotenv] file:", find_dotenv(usecwd=True))
print("[env] GOOGLE_API_KEY?", bool(os.getenv("GOOGLE_API_KEY")))

import google.generativeai as genai
from expertSystem.disease_prediction import build_expert_fusion_output
from expertSystem.disease_facts import get_facts_for


# ---------------------------
# Helpers
# ---------------------------

def _coerce_call_args(raw) -> Dict[str, Any]:
    """
    Accepts SDK variants of function_call.args/arguments:
    - str/bytes (older SDK) -> json.loads
    - Mapping/MapComposite (newer SDK) -> plain dict
    Falls back safely to {}.
    """
    if raw is None:
        return {}
    if isinstance(raw, (str, bytes, bytearray)):
        try:
            return json.loads(raw or "{}")
        except Exception:
            return {}
    if isinstance(raw, Mapping):
        try:
            return dict(raw)
        except Exception:
            try:
                return {k: raw[k] for k in raw.keys()}
            except Exception:
                return {}
    try:
        return json.loads(str(raw))
    except Exception:
        return {}


def _resp_text(resp) -> str:
    try:
        cand = (resp.candidates or [None])[0]
        parts = getattr(getattr(cand, "content", None), "parts", []) or []
        pieces = [getattr(p, "text", "") for p in parts if getattr(p, "text", None)]
        txt = "".join(pieces).strip()
        if txt:
            return txt
    except Exception:
        pass
    return (getattr(resp, "text", None) or "").strip()


def _is_rate_limit_error(message: str) -> bool:
    msg = (message or "").lower()
    return any(
        token in msg
        for token in (
            "429",
            "resource exhausted",
            "rate limit",
            "quota exceeded",
            "exceeded your current quota",
            "generativelanguage.googleapis.com",
            "free_tier",
        )
    )


def _retry_api_call(fn, *args, max_retries: int = 4, base_delay: float = 1.0):
    """
    Call `fn(*args)` with exponential backoff retry for transient rate-limit/resource errors.
    Retries when exception message contains 429 / Resource exhausted / rate limit.
    """
    last_err = None
    for attempt in range(1, max_retries + 1):
        try:
            return fn(*args)
        except Exception as e:
            last_err = e
            msg = str(e) or ""
            is_rate = _is_rate_limit_error(msg)
            if not is_rate:
                raise
            if attempt == max_retries:
                raise
            delay = base_delay * (2 ** (attempt - 1))
            print(f"[retry] attempt {attempt} failed: {msg[:180]} -- sleeping {delay}s")
            time.sleep(delay)
    raise last_err


def _norm_meta(metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Frontend keys -> backend canonical keys.
    This lets Gemini + the tool see consistent field names.
    """
    m = dict(metadata or {})

    # Upload.jsx sends "location" and "skinType"
    if m.get("location") and not m.get("body_site"):
        m["body_site"] = m["location"]
    if m.get("skinType") and not m.get("fitzpatrick"):
        m["fitzpatrick"] = m["skinType"]

    # Accept either "age" or "patient_age"
    if m.get("age") is not None and m.get("patient_age") is None:
        m["patient_age"] = m["age"]

    # Coerce numerics when safe
    for k in ("age", "patient_age", "duration_days", "duration_weeks", "diameter_mm"):
        if k in m and m[k] not in (None, ""):
            try:
                m[k] = float(m[k])
            except Exception:
                pass

    return m


def _coerce_prob(value: Any) -> Optional[float]:
    try:
        num = float(value)
    except Exception:
        return None

    if num < 0:
        num = 0.0
    # Accept either 0..1 probabilities or 0..100 percentages.
    if num > 1.0 and num <= 100.0:
        num = num / 100.0
    return min(num, 1.0)


def _canonical_label_key(label: Any) -> Optional[str]:
    if label is None:
        return None

    raw = str(label).strip().lower()
    if not raw:
        return None

    compact = re.sub(r"[^a-z0-9]+", "", raw)
    aliases = {
        "mel": "mel",
        "melanoma": "mel",
        "nv": "nv",
        "nevus": "nv",
        "melanocyticnevus": "nv",
        "melanocyticnaevus": "nv",
        "bcc": "bcc",
        "basalcellcarcinoma": "bcc",
        "scc": "scc",
        "squamouscellcarcinoma": "scc",
        "bkl": "bkl",
        "benignkeratosis": "bkl",
        "seborrheickeratosis": "bkl",
        "df": "df",
        "dermatofibroma": "df",
        "vasc": "vasc",
        "vascularlesion": "vasc",
        "akiec": "akiec",
        "actinickeratosesandintraepithelialcarcinoma": "akiec",
    }
    return aliases.get(compact)


def _extract_classifier_probs(metadata: Dict[str, Any]) -> Dict[str, float]:
    # Prefer explicit classifier_probs if provided.
    direct = metadata.get("classifier_probs")
    if isinstance(direct, str):
        try:
            direct = json.loads(direct)
        except Exception:
            direct = {}

    out: Dict[str, float] = {}
    if isinstance(direct, dict):
        for key, value in direct.items():
            prob = _coerce_prob(value)
            if prob is None:
                continue
            out[str(key).strip().lower()] = prob
        if out:
            return out

    # Fallback: derive from top-k arrays sent by upload page.
    seq = (
        metadata.get("model_topk")
        or metadata.get("top_predictions")
        or metadata.get("predictions")
        or []
    )
    if isinstance(seq, str):
        try:
            seq = json.loads(seq)
        except Exception:
            seq = []

    if not isinstance(seq, list):
        return {}

    for item in seq:
        if not isinstance(item, dict):
            continue
        key = _canonical_label_key(item.get("label") or item.get("name"))
        if not key:
            continue
        prob = _coerce_prob(item.get("confidence", item.get("prob", item.get("probability", item.get("score")))))
        if prob is None:
            continue
        out[key] = prob

    return out


def _parse_yes_no(s: str) -> Optional[bool]:
    t = re.sub(r"[^a-z\s]", " ", (s or "").strip().lower())
    t = re.sub(r"\s+", " ", t).strip()

    yes_words = {"yes", "y", "yeah", "yep", "true", "affirmative", "sure", "ok", "okay"}
    no_words = {"no", "n", "nope", "nah", "false", "negative"}

    if t in yes_words:
        return True
    if t in no_words:
        return False

    # Accept common misspellings such as "yees" or "noo".
    fuzzy = _fuzzy_match_token(t, sorted(yes_words | no_words), cutoff=0.86)
    if fuzzy in yes_words:
        return True
    if fuzzy in no_words:
        return False
    return None


def _parse_asymmetry_answer(text: str) -> Optional[float]:
    low = re.sub(r"[^a-z\s]", " ", str(text or "").lower())
    low = re.sub(r"\s+", " ", low).strip()
    if not low:
        return None

    # Common direct forms first.
    if re.search(r"\bnot\s+(asymmetrical|asymmetric|asymmetry)\b", low):
        return 0.0
    if re.search(r"\bnot\s+(symmetrical|symmetric|symmetry)\b", low):
        return 1.0

    if re.search(r"\b(symmetrical|symmetric|even|same)\b", low):
        return 0.0
    if re.search(r"\b(asymmetrical|asymmetric|uneven|different)\b", low):
        return 1.0

    # Fuzzy typo support (e.g., "symtrcial", "aystrmetrical").
    sym_words = ["symmetrical", "symmetric", "symmetry"]
    asym_words = ["asymmetrical", "asymmetric", "asymmetry"]

    probes = low.split() + [low]

    def _best_similarity(cands: List[str]) -> float:
        best = 0.0
        for probe in probes:
            for cand in cands:
                best = max(best, SequenceMatcher(None, probe, cand).ratio())
        return best

    sym_score = _best_similarity(sym_words)
    asym_score = _best_similarity(asym_words)

    if max(sym_score, asym_score) >= 0.74:
        return 1.0 if asym_score > sym_score else 0.0

    return None


def _fuzzy_match_token(text: str, candidates: List[str], cutoff: float = 0.82) -> Optional[str]:
    cleaned = re.sub(r"[^a-z\s]", " ", str(text or "").lower())
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if not cleaned:
        return None

    tokens = cleaned.split()
    probes = tokens + [cleaned]

    for probe in probes:
        if probe in candidates:
            return probe

        # Normalize repeated letters (e.g., "yeees" -> "yes", "noo" -> "no").
        squeezed = re.sub(r"(.)\1+", r"\1", probe)
        if squeezed in candidates:
            return squeezed

        # Handle simple transpositions/anagram-like typos for short words (e.g., "fiev" -> "five").
        if 3 <= len(probe) <= 7:
            sorted_probe = "".join(sorted(probe))
            for candidate in candidates:
                if len(candidate) == len(probe) and "".join(sorted(candidate)) == sorted_probe:
                    return candidate

        hit = get_close_matches(probe, candidates, n=1, cutoff=cutoff)
        if hit:
            return hit[0]

    return None


def _parse_number_word_0_10(text: str) -> Optional[float]:
    low = (text or "").strip().lower().replace("-", " ")
    low = re.sub(r"[^a-z\s]", " ", low)
    low = re.sub(r"\s+", " ", low).strip()

    word_to_num = {
        "zero": 0,
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
    }

    if low in word_to_num:
        return float(word_to_num[low])

    for w, n in word_to_num.items():
        if re.search(rf"\b{re.escape(w)}\b", low):
            return float(n)

    # Common shorthand/typos seen in intake responses.
    alias_words = {
        "zer": 0,
        "won": 1,
    }
    for w, n in alias_words.items():
        if re.search(rf"\b{re.escape(w)}\b", low):
            return float(n)

    fuzzy = _fuzzy_match_token(low, list(word_to_num.keys()), cutoff=0.78)
    if fuzzy:
        return float(word_to_num[fuzzy])

    return None


def _parse_symptom_scale(s: str) -> Optional[float]:
    t = (s or "").strip().lower()

    # Border descriptors commonly used by users.
    if t in {"regular", "smooth", "even"}:
        return 0.0

    # Negative symptom phrases should map to 0 in 0-10 contexts.
    if _is_negative_or_none_phrase(t):
        return 0.0

    # direct number
    try:
        n = float(t)
        return max(0.0, min(10.0, n))
    except Exception:
        pass

    # 3/10 style
    m = re.match(r"^\s*(\d+(?:\.\d+)?)\s*/\s*10\s*$", t)
    if m:
        try:
            n = float(m.group(1))
            return max(0.0, min(10.0, n))
        except Exception:
            pass

    # number embedded in free text, e.g. "it's around 5"
    m_any = re.search(r"\b(\d+(?:\.\d+)?)\b", t)
    if m_any:
        try:
            n = float(m_any.group(1))
            return max(0.0, min(10.0, n))
        except Exception:
            pass

    # word-number support, e.g. "five"
    n_word = _parse_number_word_0_10(t)
    if n_word is not None:
        return n_word

    if t == "none":
        return 0.0
    if t == "mild":
        return 2.0
    if t == "moderate":
        return 5.0
    if t == "severe":
        return 8.0
    return None


def _parse_positive_number_from_text(text: str) -> Optional[float]:
    t = (text or "").strip().lower()
    if not t:
        return None

    # Direct numeric value, e.g. "5" or "12.5"
    try:
        n = float(t)
        return n if n > 0 else None
    except Exception:
        pass

    # Numeric value embedded in free text, e.g. "about 5 mm"
    m = re.search(r"\b(\d{1,3}(?:\.\d+)?)\b", t)
    if m:
        try:
            n = float(m.group(1))
            return n if n > 0 else None
        except Exception:
            pass

    # Word/typo word support for 0..10 words, e.g. "five" or "fiv"
    n_word = _parse_number_word_0_10(t)
    if n_word is not None and n_word > 0:
        return float(n_word)

    return None


def _normalize_top_prediction_confidences(preds: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    top = list(preds or [])[:3]
    if not top:
        return []

    vals: List[float] = []
    for p in top:
        try:
            vals.append(max(0.0, float(p.get("confidence", 0.0) or 0.0)))
        except Exception:
            vals.append(0.0)

    total = sum(vals)
    if total <= 0:
        even = 1.0 / len(top)
        norm_vals = [even] * len(top)
    else:
        norm_vals = [v / total for v in vals]

    # Keep numerical stability so values sum to exactly 1.0
    if len(norm_vals) >= 2:
        partial = sum(norm_vals[:-1])
        norm_vals[-1] = max(0.0, 1.0 - partial)

    out: List[Dict[str, Any]] = []
    for i, p in enumerate(top):
        item = dict(p)
        item["confidence"] = norm_vals[i]
        out.append(item)
    return out


def _sanitize_assistant_text(text: str) -> str:
    raw = str(text or "").strip()
    if not raw:
        return ""
    raw = re.sub(r"```(?:json)?", "", raw, flags=re.IGNORECASE)
    raw = raw.replace("```", "")
    raw = re.sub(r"\s+", " ", raw).strip()
    return raw


def _slot_prompt(slot: Optional[str]) -> str:
    prompts = {
        "bleeding": "Has the lesion bled? (yes/no/not sure)",
        "itching": "How itchy is it on a 0-10 scale?",
        "diameter_mm": "What is the lesion width at the largest point (in mm)?",
        "border_irregularity": "How irregular are the borders on a 0-10 scale?",
        "number_of_colors": "How many colors do you see? (integer, e.g., 1, 2, 3)",
        "elevation": "What is the elevation? (flat/raised/nodular/not sure)",
        "pain": "How painful is it on a 0-10 scale?",
        "crusting": "Has it formed a crust or scab? (yes/no/not sure)",
        "asymmetry": "Does one half look different from the other? (yes/no/not sure)",
    }
    return prompts.get(str(slot or ""), "Please continue with the previous question.")


def _is_explanation_request(text: str) -> bool:
    low = str(text or "").strip().lower()
    if not low:
        return False

    patterns = [
        r"\bwhat does\b",
        r"\bwhat do you mean\b",
        r"\bwhat do u mean\b",
        r"\bwhat is\b",
        r"\bmeaning\b",
        r"\bdefine\b",
        r"\bexplain\b",
        r"\bexample\b",
        r"\bnot sure what\b",
        r"\bwhat mean\b",
        r"^\s*what\s+(nodular|raised|flat|asymmetry|asymmetric|symmetry|border|irregular|itch|itching|pain|crusting|bleeding|diameter|mm)\b",
    ]
    return any(re.search(p, low) for p in patterns)


def _is_confused_reply(text: str) -> bool:
    low = str(text or "").strip().lower()
    return low in {
        "what do you mean",
        "what mean",
        "huh",
        "what?",
        "i dont understand",
        "i don't understand",
        "confused",
    }


def _is_unsure(text: str) -> bool:
    low = str(text or "").strip().lower()
    return low in {
        "idk",
        "i dont know",
        "i don't know",
        "dont know",
        "don't know",
        "not sure",
        "unsure",
        "unknown",
        "maybe",
    }


def _is_negative_or_none_phrase(text: str) -> bool:
    low = re.sub(r"[^a-z\s]", " ", str(text or "").lower())
    low = re.sub(r"\s+", " ", low).strip()
    if not low:
        return False

    negatives = {
        "no",
        "nope",
        "nah",
        "none",
        "nothing",
        "not at all",
        "no symptom",
        "no symptoms",
        "no pain",
        "no itch",
    }
    if low in negatives:
        return True

    # Allow slight misspellings like "nopr".
    fuzzy = _fuzzy_match_token(low, sorted(negatives), cutoff=0.74)
    return fuzzy is not None


def _build_slot_help(slot: str, user_text: str) -> str:
    help_map = {
        "bleeding": "Bleeding means the spot leaks blood on its own or with light rubbing.",
        "itching": "Itchy means it makes you want to scratch it. Use 0 for no itch and 10 for the worst itch.",
        "diameter_mm": "This means the widest distance across the spot in millimeters.",
        "border_irregularity": "0 means smooth and even edges. 10 means very uneven or jagged edges.",
        "number_of_colors": "Count how many clearly different colors you see in the same spot, like brown, black, red, pink, or tan.",
        "elevation": "Flat means level with the skin. Raised means slightly above the skin. Nodular means more bump-like and rounded.",
        "pain": "Use 0 for no pain and 10 for the worst pain.",
        "crusting": "Crusting means a scab-like or dried layer has formed on the spot.",
        "asymmetry": "Asymmetry means one half of the spot looks different from the other half.",
    }
    return f"{help_map.get(slot, 'Please answer in the expected format.')} {_slot_prompt(slot)}".strip()


def _build_invalid_guidance_with_ai(slot: str, user_text: str) -> str:
    prompt = _slot_prompt(slot)
    slot_rules = {
        "bleeding": "Accept only yes, no, or not sure.",
        "itching": "Accept a number from 0 to 10.",
        "diameter_mm": "Accept a positive number in mm, like 6 or 12.5.",
        "border_irregularity": "Accept a number from 0 to 10.",
        "number_of_colors": "Accept an integer of 1 or higher.",
        "elevation": "Accept one of: flat, raised, nodular, or not sure.",
        "pain": "Accept a number from 0 to 10.",
        "crusting": "Accept only yes, no, or not sure.",
        "asymmetry": "Accept only yes, no, or not sure.",
    }
    fallback = f"Please use the expected format. {slot_rules.get(slot, '')}".strip()

    llm_input = (
        "You are assisting with form validation for dermatology intake. "
        "In one short sentence, gently tell the user the accepted answer format and give one valid example. "
        "No diagnosis, no treatment, no JSON, no markdown fences.\n"
        f"Current field: {slot}\n"
        f"Expected rule: {slot_rules.get(slot, '')}\n"
        f"User input: {user_text}\n"
    )
    try:
        resp = _retry_api_call(_get_model().generate_content, llm_input)
        ai_line = _sanitize_assistant_text(_resp_text(resp)) or fallback
    except Exception as e:
        print(f"[help] AI invalid-input fallback: {e}")
        ai_line = fallback

    return f"{ai_line} {prompt}".strip()


def _normalize_choice(text: str, choices: List[str]) -> Optional[str]:
    low = str(text or "").strip().lower()

    aliases = {
        "flat": {"flat", "flaat"},
        "raised": {"raised", "raise", "rasied", "raized"},
        "nodular": {"nodular", "nodule", "bumpy", "bump-like", "bump", "rounded bump"},
    }

    for canonical, vals in aliases.items():
        if low in vals and canonical in choices:
            return canonical
        if canonical in choices and any(re.search(rf"\b{re.escape(v)}\b", low) for v in vals):
            return canonical

        if canonical in choices:
            fuzzy = _fuzzy_match_token(low, list(vals), cutoff=0.80)
            if fuzzy is not None:
                return canonical

    return low if low in choices else None


def _parse_evolution_speed(text: str) -> Optional[str]:
    low = re.sub(r"[^a-z\s]", " ", str(text or "").lower())
    low = re.sub(r"\s+", " ", low).strip()
    if not low:
        return None

    if _is_unsure(low):
        return None

    # Strong stable/no-change signals.
    stable_patterns = [
        r"\bno\s+change\b",
        r"\bnot\s+changing\b",
        r"\bunchanged\b",
        r"\bthe\s+same\b",
        r"\bsame\b",
        r"\bstable\b",
        r"\bnone\b",
        r"\bnothing\b",
        r"\bno\b",
    ]
    if any(re.search(p, low) for p in stable_patterns):
        return "stable"

    # "nope" / "nah" also mean no meaningful change in this slot context.
    yn = _parse_yes_no(low)
    if yn is False:
        return "stable"

    slow_patterns = [
        r"\ba\s+little\b",
        r"\blittle\b",
        r"\bslight\b",
        r"\bslightly\b",
        r"\bslow\b",
        r"\bminor\b",
    ]
    if any(re.search(p, low) for p in slow_patterns):
        return "slow"

    rapid_patterns = [
        r"\ba\s+lot\b",
        r"\blot\b",
        r"\brapid\b",
        r"\bfast\b",
        r"\bquick\b",
        r"\bquickly\b",
        r"\bmajor\b",
    ]
    if any(re.search(p, low) for p in rapid_patterns):
        return "rapid"

    fuzzy = _fuzzy_match_token(
        low,
        ["stable", "unchanged", "same", "slight", "slow", "rapid", "quick", "none"],
        cutoff=0.78,
    )
    if fuzzy in {"stable", "unchanged", "same", "none"}:
        return "stable"
    if fuzzy in {"slight", "slow"}:
        return "slow"
    if fuzzy in {"rapid", "quick"}:
        return "rapid"

    return None


def _infer_pending_from_last_bot(state: "ConvState") -> None:
    if not state.history:
        return
    last = state.history[-1]
    if last.get("role") != "model":
        return
    txt = (last.get("parts") or [{}])[0].get("text", "")
    t = txt.lower()

    if "changing recently" in t or "changed noticeably" in t or "past few weeks or months" in t:
        if state.slots.get("evolution_speed") is None and state.slots.get("rapid_change") is None:
            state.pending_slot = "evolution_speed"
    elif "has it bled" in t or ("bled" in t and "crust" not in t):
        state.pending_slot = "bleeding"
    elif "crust" in t or "scab" in t:
        state.pending_slot = "crusting"
    elif "itch" in t:
        state.pending_slot = "itching"
    elif "pain" in t:
        state.pending_slot = "pain"
    elif "elevation" in t or ("flat" in t and "raised" in t and "nodular" in t):
        state.pending_slot = "elevation"
    elif "how irregular" in t or ("edges" in t and ("smooth" in t or "uneven" in t)):
        state.pending_slot = "border_irregularity"
    elif "one half look different" in t or "asymmetry" in t:
        state.pending_slot = "asymmetry"
    elif "how many colors" in t:
        state.pending_slot = "number_of_colors"
    elif "how wide" in t or "diameter" in t or "mm" in t:
        state.pending_slot = "diameter_mm"


def _apply_pending_slot(state: "ConvState", user_text: Optional[str]) -> bool:
    """
    Turn the user's last answer into structured slots.
    """
    if not user_text:
        return False

    slot = state.pending_slot
    if not slot:
        return False

    ut = user_text.strip()
    low = ut.lower()

    # evolution speed
    if slot == "evolution_speed":
        if _is_unsure(ut):
            state.slots["evolution_speed"] = None
            state.slots["rapid_change"] = None
            state.pending_slot = None
            return True

        evo = _parse_evolution_speed(ut)
        if evo is not None:
            state.slots["evolution_speed"] = evo
            # Canonical boolean mirror used by downstream checks/fusion.
            if evo == "rapid":
                state.slots["rapid_change"] = True
            else:
                state.slots["rapid_change"] = False
            state.pending_slot = None
            return True

        return False

    # yes/no slots
    if slot in {"bleeding", "crusting"}:
        if _is_unsure(ut):
            state.slots[slot] = None
            state.pending_slot = None
            return True

        yn = _parse_yes_no(ut)
        if yn is not None:
            state.slots[slot] = yn
            state.pending_slot = None
            return True
        return False

    # symptoms
    if slot == "itching":
        if _is_unsure(ut):
            state.slots["itching_0_10"] = None
            state.pending_slot = None
            return True
        if _is_negative_or_none_phrase(ut):
            state.slots["itching_0_10"] = 0.0
            state.pending_slot = None
            return True
        v = _parse_symptom_scale(ut)
        if v is not None:
            state.slots["itching_0_10"] = v
            state.pending_slot = None
            return True
        return False

    if slot == "pain":
        if _is_unsure(ut):
            state.slots["pain_0_10"] = None
            state.pending_slot = None
            return True
        if _is_negative_or_none_phrase(ut):
            state.slots["pain_0_10"] = 0.0
            state.pending_slot = None
            return True
        v = _parse_symptom_scale(ut)
        if v is not None:
            state.slots["pain_0_10"] = v
            state.pending_slot = None
            return True
        return False

    # elevation
    if slot == "elevation":
        if _is_unsure(ut):
            state.slots["elevation"] = None
            state.pending_slot = None
            return True

        val = _normalize_choice(ut, ["flat", "raised", "nodular"])
        if val is not None:
            state.slots["elevation"] = val
            state.pending_slot = None
            return True
        return False

    # border_irregularity as 0-10 numeric
    if slot == "border_irregularity":
        if _is_unsure(ut):
            state.slots["border_irregularity"] = None
            state.pending_slot = None
            return True

        v = _parse_symptom_scale(ut)
        if v is not None:
            state.slots["border_irregularity"] = v / 10.0
            state.pending_slot = None
            return True
        return False

    # asymmetry mapping
    if slot == "asymmetry":
        if _is_unsure(ut):
            state.slots["asymmetry"] = None
            state.pending_slot = None
            return True

        asym = _parse_asymmetry_answer(ut)
        if asym is not None:
            state.slots["asymmetry"] = asym
            state.pending_slot = None
            return True

        yn = _parse_yes_no(ut)
        if yn is not None:
            state.slots["asymmetry"] = 1.0 if yn else 0.0
            state.pending_slot = None
            return True
        return False

    # number_of_colors mapping
    if slot == "number_of_colors":
        if _is_unsure(ut):
            state.slots["number_of_colors"] = None
            state.slots["color_variegation"] = None
            state.pending_slot = None
            return True

        word_to_num = {
            "one": 1,
            "two": 2,
            "three": 3,
            "four": 4,
            "five": 5,
            "six": 6,
            "seven": 7,
            "eight": 8,
            "nine": 9,
            "ten": 10,
        }

        n = None
        if low in word_to_num:
            n = word_to_num[low]
        elif low in {"three+", "3+", "three or more", "3 or more", "more than three"}:
            n = 3
        elif re.search(r"\bjust\s+one\b", low):
            n = 1
        elif low in {"to", "too"}:
            n = 2
        else:
            m = re.search(r"\b\d+\b", low)
            if m:
                n = int(m.group(0))
            else:
                for w, v in word_to_num.items():
                    if re.search(rf"\b{re.escape(w)}\b", low):
                        n = v
                        break
                if n is None:
                    fuzzy = _fuzzy_match_token(low, list(word_to_num.keys()) + ["won", "zer", "to", "too"], cutoff=0.74)
                    if fuzzy == "won":
                        n = 1
                    elif fuzzy == "zer":
                        n = 0
                    elif fuzzy in {"to", "too", "two"}:
                        n = 2
                    elif fuzzy in word_to_num:
                        n = word_to_num[fuzzy]

        if n is not None and n >= 1:
            state.slots["number_of_colors"] = float(n)
            if n == 1:
                state.slots["color_variegation"] = 0.0
            elif n == 2:
                state.slots["color_variegation"] = 0.5
            else:
                state.slots["color_variegation"] = 1.0
            state.pending_slot = None
            return True

        return False

    # diameter parsing (mm)
    if slot == "diameter_mm":
        if _is_unsure(ut):
            state.slots["diameter_mm"] = None
            state.pending_slot = None
            return True

        n = _parse_positive_number_from_text(low)
        if n is not None:
            state.slots["diameter_mm"] = n
            state.pending_slot = None
            return True
        return False

    return False


# ---------------------------
# API key & model
# ---------------------------

API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("No API key found. Set GOOGLE_API_KEY or GEMINI_API_KEY in .env/environment.")
genai.configure(api_key=API_KEY)

ENV_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
print(f"[Gemini] Env model: {ENV_MODEL_NAME}")


# ---------------------------
# Conversation state
# ---------------------------

@dataclass
class ConvState:
    history: List[Dict[str, Any]] = field(default_factory=list)

    # structured memory
    slots: Dict[str, Any] = field(default_factory=dict)
    pending_slot: Optional[str] = None

    def trim_history(self, max_turns: int = 10):
        max_messages = max_turns * 2
        if len(self.history) > max_messages:
            self.history = self.history[-max_messages:]


# ---------------------------
# Tool declaration
# ---------------------------

FUNCTIONS = [{
    "name": "expert_derm_consult",
    "description": "Combine history/ABCDE and optional classifier probabilities into a likely skin-condition prediction summary.",
    "parameters": {
        "type": "object",
        "properties": {
            "body_site": {"type": "string", "description": "e.g., left forearm"},
            "diameter_mm": {"type": "number", "description": "Largest diameter in millimeters"},
            "duration_weeks": {"type": "number", "description": "How long the lesion has been noticeable"},
            "evolution_weeks": {"type": "number", "description": "Weeks of noticeable change"},
            "evolution_speed": {"type": "string", "description": "stable|slow|moderate|rapid"},
            "elevation": {"type": "string", "description": "flat|raised|nodular"},
            "itching_0_10": {"type": "number"},
            "pain_0_10": {"type": "number"},
            "bleeding": {"type": "boolean"},
            "crusting": {"type": "boolean"},
            "ulceration": {"type": "boolean"},
            "asymmetry": {"type": "number", "description": "0..1"},
            "border_irregularity": {"type": "number", "description": "0..1"},
            "color_variegation": {"type": "number", "description": "0..1"},
            "number_of_colors": {"type": "number"},
            "patient_age": {"type": "number"},
            "fitzpatrick_type": {"type": "string", "description": "I|II|III|IV|V|VI"},
            "sunburn_history": {"type": "string", "description": "none|some|frequent"},
            "tanning_bed_use": {"type": "boolean"},
            "sunscreen_use": {"type": "string", "description": "never|sometimes|regular"},
            "personal_melanoma_history": {"type": "boolean"},
            "family_melanoma_history": {"type": "boolean"},
            "immunosuppressed": {"type": "boolean"},
            "prior_biopsies_here": {"type": "boolean"},
            "classifier_probs": {
                "type": "object",
                "description": "Optional posterior probabilities (0..1) from your CNN.",
                "properties": {
                    "melanoma": {"type": "number"},
                    "nevus": {"type": "number"},
                    "bcc": {"type": "number"},
                    "scc": {"type": "number"},
                    "bkl": {"type": "number"},
                    "df": {"type": "number"},
                    "vasc": {"type": "number"}
                }
            }
        },
        "required": ["body_site", "patient_age"]
    }
}]


# ---------------------------
# System instruction
# ---------------------------

SYSTEM_INSTRUCTION = (
  "You are Skinderella, a patient-friendly dermatologist intake assistant in a research prototype. "
  "Your job is to collect structured skin-lesion information in plain English and support a rule-based expert system. "

  "CONVERSATION RULES:\n"
  "• Ask one focused question at a time.\n"
  "• Each question should be its own chat bubble only containing the question.\n"
  "• NEVER repeat questions the user has already answered in this conversation.\n"
  "• Track what information you already have (body site, size, changes, colors, symptoms, age, skin type).\n"
  "• Build naturally on previous answers; reference what they told you.\n"
  "• Focus on likely skin-condition predictions, not risk scoring.\n"
  "• Do not use terms like 'risk', 'high risk', 'low risk', 'moderate risk', or 'estimated risk signal'.\n"
  "• When enough information is available, output only the prediction summary in its own message\n"
  "• Do not provide a prediction summary until enough intake information has been collected.\n"
  "• If more information is needed, output only one follow-up question and nothing else.\n"
  "• Do not switch into triage or recommendation mode unless the user directly asks what they should do next.\n"
  "• Accept medical terms simply when the user seems confused or asks what something means.\n"
  "• If the user gives expressive language, infer the safest reasonable structure value when possible, otherwise ask a short clarifying question.\n"
  "• Do NOT say 'I am an AI' or 'I cannot provide medical advice' more than once per conversation.\n\n"

  "QUESTION STYLE (patient-friendly):\n"
  "• Use simple language.\n"
  "• Ask 1 question per turn.\n"
  "• Offer short answer foramts like yes/no/not sure, 0-10, or flat/raised/nodular.\n"
  "• If the user asks for a definition, explain it briefly and then re-ask the same question.\n\n"

  "TERM EXPLANANTIONS:\n"
  "• irregular border = edges look uneven, jagged, blurry, or oddly shaped\n"
  "• flat = level with the skin\n"
  "• raised = slightly above the skin\n"
  "• nodular = more rounded, bump-like, and sticks up more clearly\n"
  "• color variation = more than one clearly different color in the same spot\n"
  "• bleeding = blood coming from the spot on its own or with light rubbing\n\n"

  "AUTO-MAPPING for tool calls (convert plain answers):\n"
  "• asymmetry: Yes→1, No→0, Not sure→null\n"
  "• border_irregularity: 0-10 scale from user should be normalized to 0..1\n"
  "• color_variegation: One→0, Two→0.5, Three+→1, Not sure→null; number_of_colors: One→1, Two→2, Three+→3\n"
  "• pain_0_10: none→0, mild→2, moderate→5, severe→8\n"
  "• itching_0_10: none→0, mild→2, moderate→5, severe→8\n"
  ""
  "• evolution_speed: No/Stable→'stable', A little→'slow', A lot→'rapid'\n\n"

  "TOOL USE:\n"
  "• When you have body_site + age + change status + at least some ABCDE/symptoms, call expert_derm_consult. "
  "Otherwise ask the single most important MISSING question.\n\n"
  "• Interpret expressive phrases( e.g., 'on fire', 'really hurts', 'kinda bumpy') into the closest structured value when reasonable.\n"
  "STYLE:\n"
  "• Be concise and natural; avoid repetition. Use brief bullets for findings/next steps.\n"
)


# ---------------------------
# Model init with fallbacks
# ---------------------------

PREFERRED = ENV_MODEL_NAME
CANDIDATES = [PREFERRED, "gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-1.5-pro"]

MODEL = None
MODEL_NAME = PREFERRED

def _make_model(name: str):
    return genai.GenerativeModel(
        model_name=name,
        tools=[{"function_declarations": FUNCTIONS}],
        system_instruction=SYSTEM_INSTRUCTION,
    )

def _get_model():
    global MODEL, MODEL_NAME
    if MODEL is not None:
        return MODEL
    last_err = None
    for name in [n for n in CANDIDATES if n]:
        try:
            m = _make_model(name)
            m.start_chat()
            MODEL, MODEL_NAME = m, name
            print(f"[Gemini] Using model: {name}")
            return MODEL
        except Exception as e:
            print(f"[Gemini] '{name}' failed at init: {e}")
            last_err = e
    raise RuntimeError(f"No working Gemini model from {CANDIDATES}. Last error: {last_err}")


def _get_prob(clf: Dict[str, Any], *keys: str) -> float:
    for key in keys:
        try:
            if key in clf and clf[key] is not None:
                return float(clf[key])
        except Exception:
            pass
    return 0.0


# ---------------------------
# Rule engine
# ---------------------------
def _run_rules(payload: Dict[str, Any]) -> Dict[str, Any]:
    clf = payload.get("classifier_probs") or {}
    fusion_out: Dict[str, Any] = {}
    top_preds: List[Dict[str, Any]] = []
    most_likely: Dict[str, Any] = {}
    disease_fact: Dict[str, Any] = {}

    try:
        fusion_out = build_expert_fusion_output(payload, clf)
        top_preds = [
            {
                "label": str(item.get("name") or item.get("code") or "unknown"),
                "confidence": float(item.get("probability", 0.0) or 0.0),
                "code": str(item.get("code") or "").strip().lower(),
            }
            for item in (fusion_out.get("top_3_diseases") or [])
        ]
        most_likely = dict(fusion_out.get("most_likely_disease") or {})
        top_code = str(most_likely.get("code") or "").strip().lower()
        disease_fact = get_facts_for(top_code) if top_code else {}
    except Exception as e:
        print(f"[chat][rules] fusion fallback: {e}")

    if not top_preds:
        preds = [
            {"label": "Melanoma", "confidence": round(_get_prob(clf, "melanoma", "mel"), 4), "code": "mel"},
            {"label": "Melanocytic nevus", "confidence": round(_get_prob(clf, "nevus", "nv"), 4), "code": "nv"},
            {"label": "Basal cell carcinoma", "confidence": round(_get_prob(clf, "bcc"), 4), "code": "bcc"},
            {"label": "Squamous cell carcinoma", "confidence": round(_get_prob(clf, "scc"), 4), "code": "scc"},
            {"label": "Benign keratosis", "confidence": round(_get_prob(clf, "bkl"), 4), "code": "bkl"},
            {"label": "Dermatofibroma", "confidence": round(_get_prob(clf, "df"), 4), "code": "df"},
            {"label": "Vascular lesion", "confidence": round(_get_prob(clf, "vasc"), 4), "code": "vasc"},
        ]

        preds.sort(key=lambda x: x["confidence"], reverse=True)
        top_preds = preds[:3]
        if top_preds:
            top = top_preds[0]
            most_likely = {
                "code": top.get("code"),
                "name": top.get("label"),
                "probability": float(top.get("confidence", 0.0) or 0.0),
            }
            disease_fact = get_facts_for(str(top.get("code") or ""))

    if top_preds:
        top = top_preds[0]
        if not most_likely:
            most_likely = {
                "code": top.get("code"),
                "name": top.get("label"),
                "probability": float(top.get("confidence", 0.0) or 0.0),
            }
        elif most_likely.get("probability") is None:
            most_likely["probability"] = float(top.get("confidence", 0.0) or 0.0)

    needed = []
    if payload.get("body_site") in (None, ""):
        needed.append("Where on the body is the spot located?")
    elif payload.get("diameter_mm") is None:
        needed.append("About how wide is it at the largest point (in mm)? A pencil eraser is about 6 mm.")
    elif payload.get("evolution_speed") is None and payload.get("rapid_change") is None:
        needed.append("Has it been changing recently? (No / A little / A lot / Not sure)")
    elif payload.get("number_of_colors") is None:
        needed.append("How many colors do you see in the spot? (1, 2, 3+)")
    elif payload.get("border_irregularity") is None:
        needed.append("How uneven do the edges look on a 0 to 10 scale?")
    elif payload.get("elevation") is None:
        needed.append("Does it look flat, raised, or more bump-like?")

    return {
        "top_predictions": top_preds,
        "most_likely_disease": most_likely,
        "disease_fact": disease_fact,
        "medical_reasoning": fusion_out.get("medical_reasoning", {}),
        "prediction_basis": "image classifier probabilities with intake refinement",
        "next_questions": needed[:1],
        "safety_flags": ["not_a_diagnosis"],
        "audit": {"source": "prediction_mode"},
    }

def _format_report_bubble(payload: Dict[str, Any]) -> str:
    preds = (
        payload.get("top_predictions")
        or payload.get("model_topk")
        or payload.get("predictions")
        or []
    )

    lines = []
    for p in preds[:3]:
        label = str(p.get("label", "unknown")).strip()
        prob = p.get("confidence", p.get("prob", 0)) or 0
        try:
            prob = float(prob)
        except Exception:
            prob = 0.0
        lines.append(f"- {label}: {prob:.2%}")

    if not lines:
        return "I have enough information to continue, but I do not have a prediction summary yet."

    most = payload.get("most_likely_disease") or {}
    guess_name = str(most.get("name") or "").strip()
    guess_prob = most.get("probability")
    guess_line = ""
    if guess_name:
        try:
            guess_line = f"Most likely guess: {guess_name} ({float(guess_prob):.2%})\n"
        except Exception:
            guess_line = f"Most likely guess: {guess_name}\n"

    fact = payload.get("disease_fact") or {}
    fact_desc = str(fact.get("description") or "").strip()
    fact_line = f"About this condition: {fact_desc}\n" if fact_desc else ""

    return (
        f"{guess_line}"
        "Prediction summary:\n"
        + "\n".join(lines)
        + ("\n\n" + fact_line.strip() if fact_line else "")
    )


def _has_enough_info_for_report(slots: Dict[str, Any]) -> bool:
    required_core = [
        "body_site",
        "patient_age",
        "evolution_speed",
    ]

    for key in required_core:
        if slots.get(key) in (None, ""):
            return False

    detail_count = 0
    detail_fields = [
        "diameter_mm",
        "number_of_colors",
        "border_irregularity",
        "elevation",
        "bleeding",
        "crusting",
        "itching_0_10",
        "pain_0_10",
        "asymmetry",
    ]

    for key in detail_fields:
        if slots.get(key) is not None:
            detail_count += 1

    return detail_count >= 3


def _question_only_reply(tool_payload: Dict[str, Any]) -> str:
    nxt = tool_payload.get("next_questions") or []
    if nxt:
        return str(nxt[0]).strip()
    return "Can you tell me a little more about the spot?"
# ---------------------------
# Main step
# ---------------------------

def step(state: ConvState, user_text: Optional[str], img, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    metadata = _norm_meta(metadata)

    _infer_pending_from_last_bot(state)
    pending_before = state.pending_slot
    incoming_text = str(user_text or "").strip()

    # help / explanation branch
    if pending_before and incoming_text and (
        _is_explanation_request(incoming_text) or _is_confused_reply(incoming_text)
    ):
        reply_text = _build_slot_help(str(pending_before), incoming_text)
        state.history.append({"role": "user", "parts": [{"text": incoming_text}]})
        state.history.append({"role": "model", "parts": [{"text": reply_text}]})
        return {
            "reply": reply_text,
            "message": reply_text,
            "assistant": reply_text,
            "text": reply_text,
            "slots": state.slots,
            "pending_slot": state.pending_slot,
        }

    accepted = _apply_pending_slot(state, user_text)

    if pending_before and incoming_text and not accepted:
        reply_text = _build_invalid_guidance_with_ai(str(pending_before), incoming_text)
        state.history.append({"role": "user", "parts": [{"text": incoming_text}]})
        state.history.append({"role": "model", "parts": [{"text": reply_text}]})
        return {
            "reply": reply_text,
            "message": reply_text,
            "assistant": reply_text,
            "text": reply_text,
            "slots": state.slots,
            "pending_slot": state.pending_slot,
        }

    if metadata:
        metadata["classifier_probs"] = _extract_classifier_probs(metadata)

    if metadata:
        if metadata.get("body_site"):
            state.slots["body_site"] = metadata.get("body_site")
        if metadata.get("patient_age") is not None:
            state.slots["patient_age"] = metadata.get("patient_age")
        if metadata.get("fitzpatrick"):
            state.slots["fitzpatrick_type"] = metadata.get("fitzpatrick")
        if metadata.get("duration_days") is not None:
            state.slots["duration_days"] = metadata.get("duration_days")
        if metadata.get("classifier_probs"):
            state.slots["classifier_probs"] = metadata.get("classifier_probs")

    summary_text = ""
    if metadata:
        parts = []
        if metadata.get("name"):
            parts.append(f"Patient: {metadata['name']}")
        if metadata.get("patient_age") is not None:
            parts.append(f"Age: {metadata['patient_age']}")
        if metadata.get("fitzpatrick"):
            parts.append(f"Skin type: {metadata['fitzpatrick']}")
        if metadata.get("body_site"):
            parts.append(f"Lesion location: {metadata['body_site']}")
        if metadata.get("duration_days") is not None:
            parts.append(f"Duration: {metadata['duration_days']} day(s)")
        summary_text = " • ".join(parts)

        if user_text:
            user_text = summary_text + "\n\nUser notes: " + user_text
        else:
            user_text = summary_text

    initial_history_size = len(state.history)
    state.trim_history(max_turns=10)
    print(f"[step] History trimmed: {initial_history_size} → {len(state.history)} messages")

    chat = _get_model().start_chat(history=state.history)

    try:
        initial = _retry_api_call(chat.send_message, user_text or "")
    except Exception as e:
        msg = str(e)
        is_rate_limit = _is_rate_limit_error(msg)
        if is_rate_limit:
            print(f"[step] 429 Rate limit detected after retries: {msg[:200]}")
            user_reply = (
                "The AI service is temporarily busy due to usage limits. "
                "Please try again in a minute, or reset chat to continue with a shorter context."
            )
            assistant_hint = "[Service busy - try again soon]"
        else:
            user_reply = (
                "The assistant is temporarily unavailable. "
                "Please try again shortly."
            )
            assistant_hint = "[Service unavailable]"
        return {
            "reply": user_reply,
            "message": "Service overloaded (429)" if is_rate_limit else "Model service error",
            "assistant": assistant_hint,
            "text": user_reply,
            "error": "RATE_LIMIT" if is_rate_limit else "MODEL_ERROR",
            "error_code": "RATE_LIMIT" if is_rate_limit else "MODEL_ERROR",
        }

    reply_text = None
    tool_payload = None
    bubble_type = "question"
    
    cand = (initial.candidates or [None])[0]
    parts = getattr(getattr(cand, "content", None), "parts", []) if cand else []

    for part in parts:
        fc = getattr(part, "function_call", None)
        if fc and getattr(fc, "name", None) == "expert_derm_consult":
            raw_args = getattr(fc, "args", None) or getattr(fc, "arguments", None)
            args = _coerce_call_args(raw_args)

            args.update({k: v for k, v in state.slots.items() if v is not None})

            if "patient_age" not in args and state.slots.get("patient_age") is not None:
                args["patient_age"] = state.slots["patient_age"]
            if "body_site" not in args and state.slots.get("body_site"):
                args["body_site"] = state.slots["body_site"]

            tool_payload = _run_rules(args)

            nxt = (tool_payload.get("next_questions") or [])
            if nxt:
                q = nxt[0].lower()
                if "changing recently" in q or "changed noticeably" in q or "past few weeks or months" in q:
                    state.pending_slot = "evolution_speed"
                elif "bled" in q:
                    state.pending_slot = "bleeding"
                elif "crust" in q or "scab" in q:
                    state.pending_slot = "crusting"
                elif "itch" in q:
                    state.pending_slot = "itching"
                elif "pain" in q:
                    state.pending_slot = "pain"
                elif "how many colors" in q:
                    state.pending_slot = "number_of_colors"
                elif "how wide" in q or "diameter" in q:
                    state.pending_slot = "diameter_mm"
                elif "elevation" in q or ("flat" in q and "raised" in q and "nodular" in q):
                    state.pending_slot = "elevation"
                elif "edges" in q or "0 to 10 scale" in q:
                    state.pending_slot = "border_irregularity"

            if not _has_enough_info_for_report(args):
                reply_text = _question_only_reply(tool_payload)
                bubble_type = "question"
            else:
                reply_text = _format_report_bubble(tool_payload)
                bubble_type = "report"

            break
    if not reply_text:
        reply_text = _resp_text(initial)

    if not reply_text:
        reply_text = "I’m here. Share diameter, color changes, evolution (weeks), age, and body site."

    state.history.append({"role": "user", "parts": [{"text": user_text or ""}]})
    state.history.append({"role": "model", "parts": [{"text": reply_text}]})

    
    out: Dict[str, Any] = {
        "reply": reply_text,
        "message": reply_text,
        "assistant": reply_text,
        "text": reply_text,
        "slots": state.slots,
        "pending_slot": state.pending_slot,
        "bubble_type": bubble_type if tool_payload else "question",
    }
    if tool_payload:
        out["top_predictions"] = tool_payload.get("top_predictions", [])
        out["most_likely_disease"] = tool_payload.get("most_likely_disease", {})
        out["disease_fact"] = tool_payload.get("disease_fact", {})
        out["medical_reasoning"] = tool_payload.get("medical_reasoning", {})
        out["next_questions"] = tool_payload.get("next_questions", [])
        out["safety_flags"] = tool_payload.get("safety_flags", [])
        out["audit"] = tool_payload.get("audit", {})
    return out