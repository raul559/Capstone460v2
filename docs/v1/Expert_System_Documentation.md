# Expert System Documentation

## Table of Contents

- [Overview](#overview)
- [Disease Classes](#disease-classes)
- [Analysis Pipeline](#analysis-pipeline)
- [Image Prediction — Keras ResNet50](#image-prediction--keras-resnet50)
- [Certainty Factor Engine](#certainty-factor-engine)
  - [Core Functions](#core-functions)
  - [Rule Definition](#rule-definition)
  - [Rule Evaluation](#rule-evaluation)
  - [SkinAI Rules](#skinai-rules)
- [SkinAI Analyzer](#skinai-analyzer)
- [Pipeline Orchestration](#pipeline-orchestration)
- [Disease Facts Reference](#disease-facts-reference)
- [FAISS Image Similarity Search](#faiss-image-similarity-search)
- [Gemini Chatbot Integration](#gemini-chatbot-integration)

---

## Overview

The SkinAI expert system combines three layers of intelligence to assess skin lesions:

1. **Deep Learning (ResNet50)** — A fine-tuned convolutional neural network classifies the image into one of seven HAM10000 disease categories and returns confidence scores.

2. **MYCIN-Style Certainty Factor (CF) Reasoning** — A rule-based expert system merges the model's image predictions with the patient's clinical symptoms (bleeding, rapid change, itching, pain) using MYCIN's uncertainty algebra to compute risk flags.

3. **Gemini LLM Chatbot** — The analysis results seed a Gemini conversation session so the chatbot can explain the findings to the patient and ask intelligent follow-up questions.

> **Disclaimer:** SkinAI is an educational/demonstration tool and does not provide medical diagnoses. Users should consult a licensed clinician for any medical concerns.

**Data flow:**

```
Patient uploads image + intake form
            │
            ▼
  KerasResNetPredictor.predict_topk()
    └── Top-K disease probabilities
            │
            ▼
  skinai_analyzer.analyze_skin_lesion()
    ├── build_evidence_from_model()   ← image predictions → CF facts
    ├── build_evidence_from_intake()  ← symptom flags → CF facts
    └── evaluate_rules()             ← MYCIN reasoning → risk flags
            │
            ▼
  run_expert_pipeline() assembles payload
            │
            ▼
  Flask /analyze_skin seeds Gemini session
            │
            ▼
  Patient chats with Skinderella chatbot
```

---

## Disease Classes

The model is trained on the **HAM10000** (Human Against Machine with 10,000 training images) dataset. It recognizes seven lesion types:

| Label | Full Name | Risk Level | Notes |
|-------|-----------|------------|-------|
| `mel` | Melanoma | High | Malignant; potentially fatal. ABCDE criteria apply. |
| `bcc` | Basal Cell Carcinoma | Moderate–High | Most common skin cancer; locally destructive. |
| `akiec` | Actinic Keratosis / Intraepithelial Carcinoma | Moderate | Precancerous; can progress to squamous cell carcinoma. |
| `bkl` | Benign Keratosis (Seborrheic Keratosis) | Low | Benign; harmless stuck-on growth. |
| `nv` | Melanocytic Nevus | Low–Moderate | Common moles; low risk unless changing. |
| `df` | Dermatofibroma | Low | Benign fibrous nodule. |
| `vasc` | Vascular Lesion | Low | Benign; hemangiomas, angiomas, pyogenic granulomas. |

---

## Analysis Pipeline

**File:** `legacy/v1-flask/src/expert_pipeline.py`

`run_expert_pipeline()` is the single entry point called by the Flask `/analyze_skin` route. It accepts raw image bytes and intake form fields and returns a fully structured payload.

### Function signature

```python
def run_expert_pipeline(
    image_bytes: bytes,
    upload_fields: Dict[str, Any],
    chat_flags: Optional[Dict[str, Any]] = None,
    predictor: Optional[ImagePredictor] = None,
    config: Optional[PipelineConfig] = None,
) -> Dict[str, Any]:
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `image_bytes` | `bytes` | Raw bytes of the uploaded image |
| `upload_fields` | `dict` | Fields from the patient intake form (`age`, `sex_at_birth`, `location`, `duration_days`) |
| `chat_flags` | `dict` | Boolean symptom signals (`rapid_change`, `bleeding`, `itching`, `pain`) |
| `predictor` | `ImagePredictor` | Pluggable predictor. Defaults to `StubHamPredictor` (demo output) if `None`. Pass `KerasResNetPredictor()` for live inference. |
| `config` | `PipelineConfig` | Optional configuration: `topk` (default 3), `clinician_review_threshold` (default 0.5), `facts_path` |

### Pipeline Steps

1. **Normalize intake** — `normalize_intake()` merges `upload_fields` and `chat_flags`, casting types (`age` → int, `rapid_change` → bool, etc.).
2. **Image prediction** — `predictor.predict_topk(image_bytes, k=config.topk)` returns the top-K class/probability pairs.
3. **CF reasoning** — `run_reasoning(topk, intake)` → calls `skinai_analyzer.analyze_skin_lesion()`.
4. **Primary result selection** — `choose_primary_result(facts)` reads CF values for `high_risk_flag`, `moderate_risk_flag`, `low_risk_flag`, and `needs_clinician_review`.
5. **Medical facts** — Optional label-specific facts loaded from a JSON file if `config.facts_path` is set.
6. **Explanation seed** — A compact JSON payload summarizing the result, ready to be forwarded to Gemini.

### Return value

```python
{
    "intake": { "age": 45, "rapid_change": True, ... },
    "ml": {
        "topK": [
            { "label": "mel", "prob": 0.62 },
            { "label": "nv",  "prob": 0.27 },
            { "label": "bkl", "prob": 0.11 },
        ]
    },
    "reasoning": {
        "primary_result": "high_risk",
        "facts": { "img_mel": 0.62, "high_risk_flag": 0.75, ... },
        "trace": [ { "rule_id": "R_MEL_ALONE", ... }, ... ]
    },
    "medical_facts": { ... },
    "explanation_seed": {
        "primary_result": "high_risk",
        "top_prediction": { "label": "mel", "prob": 0.62 },
        "key_indicators": { "needs_clinician_review": 0.82, ... },
        "intake_signals": { "rapid_change": True, ... },
        "disclaimer": "This tool does not provide a medical diagnosis..."
    }
}
```

---

## Image Prediction — Keras ResNet50

**File:** `legacy/v1-flask/src/keras_predictor.py`

`KerasResNetPredictor` wraps the pre-trained Keras model and exposes a clean `predict_topk` interface.

### Model

- **Architecture:** ResNet50 fine-tuned on HAM10000
- **Weights file:** `legacy/v1-flask/src/models/resnet50_skin_disease_finetuned_v4.keras` (217 MB)
- **Input shape:** `(224, 224, 3)` float32, pixel values in range `[0, 255]` (no normalization applied)
- **Output:** Softmax probability vector over 7 classes

### Class order (must match training order)

```python
CLASS_NAMES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
```

### Key methods

#### `predict_topk(image_bytes, k=3)`

Preprocesses a single image and returns the top-K predictions.

```python
def predict_topk(self, image_bytes: bytes, k: int = 3) -> list[dict]:
    x = self._preprocess_batch([image_bytes])   # shape: (1, 224, 224, 3)
    preds = self.model.predict(x, verbose=0)[0]  # shape: (7,)
    top_idx = np.argsort(preds)[-k:][::-1]
    return [{"label": CLASS_NAMES[i], "prob": float(preds[i])} for i in top_idx]
```

**Example return value:**
```python
[
    {"label": "mel", "prob": 0.6203},
    {"label": "nv",  "prob": 0.2715},
    {"label": "bkl", "prob": 0.1082},
]
```

#### `predict_topk_batch(image_bytes_list, k=3)`

Batch inference for multiple images in a single forward pass. Returns a list of top-K results per image. Used by the frontend when multiple images are uploaded simultaneously.

### Preprocessing

```python
def _preprocess_one(self, image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    return np.array(img, dtype=np.float32)   # raw float32, no scaling
```

---

## Certainty Factor Engine

**File:** `legacy/v1-flask/src/certainty_factors.py`

Implements MYCIN's uncertainty algebra for combining evidence from multiple sources (image model + clinical symptoms) using certainty factors (CFs). CFs are real values in `[-1, 1]`:
- `1.0` — definitely true
- `0.0` — unknown
- `-1.0` — definitely false

---

### Core Functions

#### `cf_combine(cf1, cf2)`

Combines two CFs for the same hypothesis using MYCIN's parallel combination rule:

```python
def cf_combine(cf1: float, cf2: float) -> float:
    if cf1 > 0 and cf2 > 0:
        result = cf1 + cf2 * (1 - cf1)          # both positive
    elif cf1 < 0 and cf2 < 0:
        result = cf1 + cf2 * (1 + cf1)          # both negative
    else:
        denominator = 1.0 - min(abs(cf1), abs(cf2))
        result = (cf1 + cf2) / denominator       # mixed signs
    return clamp_cf(result)
```

#### `cf_and(cfs)`

AND combination — returns the minimum CF from a list (weakest evidence governs):

```python
def cf_and(cfs: list[float]) -> float:
    return min(cfs) if cfs else 0.0
```

#### `cf_or(cfs)`

OR combination — returns the maximum CF from a list (strongest evidence governs):

```python
def cf_or(cfs: list[float]) -> float:
    return max(cfs) if cfs else 0.0
```

#### `apply_rule(evidence_cf, rule_cf)`

Applies a rule's intrinsic certainty to an evidence CF:

```python
def apply_rule(evidence_cf: float, rule_cf: float) -> float:
    # rule_cf must be in [0, 1]
    return clamp_cf(evidence_cf * rule_cf)
```

---

### Rule Definition

Rules are defined using the `Rule` dataclass:

```python
@dataclass
class Rule:
    id: str          # unique rule identifier (e.g., "R_MEL_BLEED")
    premises: list[str]   # fact names that must exist
    operator: str    # "AND" or "OR"
    rule_cf: float   # intrinsic rule certainty (0..1)
    conclusion: str  # fact name to derive
```

---

### Rule Evaluation

`evaluate_rules(evidence, rules)` processes all rules in order against the current fact dictionary and returns `(final_facts, trace)`:

```python
def evaluate_rules(
    evidence: dict[str, float],
    rules: list[Rule]
) -> tuple[dict[str, float], list[dict]]:
```

For each rule:
1. Checks that all `premises` exist in the current facts.
2. Computes premise CF using `cf_and` or `cf_or` depending on `operator`.
3. Applies `apply_rule(premise_cf, rule.rule_cf)` to get the contribution CF.
4. If the `conclusion` fact already exists, combines existing and contribution CFs with `cf_combine`.
5. Records a trace entry with all intermediate values.

**Trace entry structure:**
```python
{
    "rule_id": "R_MEL_BLEED",
    "operator": "AND",
    "premises": ["img_mel", "bleeding"],
    "premise_cfs": [0.62, 0.60],
    "premise_cf": 0.60,         # min (AND)
    "rule_cf": 0.90,
    "conclusion": "high_risk_flag",
    "contrib_cf": 0.54,
    "previous_conclusion_cf": 0.75,
    "new_conclusion_cf": 0.89,
}
```

---

### SkinAI Rules

The clinical rules defined in `get_skinai_rules()` cover three risk categories:

#### High-Risk Rules

| Rule ID | Premises (AND/OR) | Conclusion | Rule CF |
|---------|-------------------|------------|---------|
| `R_MEL_ALONE` | `img_mel` | `high_risk_flag` | 0.75 |
| `R_MEL_RAPID` | `img_mel` AND `rapid_change` | `high_risk_flag` | 0.85 |
| `R_MEL_BLEED` | `img_mel` AND `bleeding` | `high_risk_flag` | 0.90 |

#### Moderate-Risk Rules

| Rule ID | Premises (AND/OR) | Conclusion | Rule CF |
|---------|-------------------|------------|---------|
| `R_BCC_ALONE` | `img_bcc` | `moderate_risk_flag` | 0.60 |
| `R_AKIEC_ALONE` | `img_akiec` | `moderate_risk_flag` | 0.58 |
| `R_BCC_AKIEC` | `img_bcc` OR `img_akiec` | `moderate_risk_flag` | 0.65 |
| `R_NV_RAPID` | `img_nv` AND `rapid_change` | `moderate_risk_flag` | 0.55 |
| `R_NV_BLEED` | `img_nv` AND `bleeding` | `moderate_risk_flag` | 0.65 |

#### Low-Risk Rules

| Rule ID | Premises (AND/OR) | Conclusion | Rule CF |
|---------|-------------------|------------|---------|
| `R_NV_STABLE` | `img_nv` | `low_risk_flag` | 0.60 |
| `R_BKL_ALONE` | `img_bkl` | `low_risk_flag` | 0.65 |
| `R_VASC_ALONE` | `img_vasc` | `low_risk_flag` | 0.70 |
| `R_DF_ALONE` | `img_df` | `low_risk_flag` | 0.75 |

#### Clinician Review Trigger

| Rule ID | Premises (AND/OR) | Conclusion | Rule CF |
|---------|-------------------|------------|---------|
| `R_NEEDS_REVIEW` | `high_risk_flag` OR `moderate_risk_flag` | `needs_clinician_review` | 0.75 |

---

### Symptom-to-CF Mapping

User intake symptoms are converted to CF values before entering the rule engine:

| Symptom | CF if present | CF if absent/unknown |
|---------|--------------|---------------------|
| `rapid_change` | 0.7 | 0.0 |
| `bleeding` | 0.6 | 0.0 |
| `pain` | 0.4 | 0.0 |
| `itching` | 0.3 | 0.0 |

Image predictions are mapped as: `img_<label>` = model probability (clamped to `[0, 1]`).

---

## SkinAI Analyzer

**File:** `legacy/v1-flask/src/skinai_analyzer.py`

`analyze_skin_lesion()` is the high-level function that combines model predictions and clinical intake to produce a risk assessment.

```python
def analyze_skin_lesion(topk: list[dict], intake: dict) -> dict:
    model_evidence  = build_evidence_from_model(topk)    # img_mel=0.62, img_nv=0.27, ...
    intake_evidence = build_evidence_from_intake(intake)  # rapid_change=0.7, bleeding=0.0, ...
    evidence = {**model_evidence, **intake_evidence}

    final_facts, trace = evaluate_rules(evidence, get_skinai_rules())

    needs_review_cf = final_facts.get("needs_clinician_review", 0.0)
    high_risk_cf    = final_facts.get("high_risk_flag", 0.0)
    moderate_risk_cf = final_facts.get("moderate_risk_flag", 0.0)
    low_risk_cf     = final_facts.get("low_risk_flag", 0.0)

    if needs_review_cf > 0.5:
        primary_result = "clinician_review"
    elif high_risk_cf > moderate_risk_cf:
        primary_result = "high_risk"
    elif moderate_risk_cf > low_risk_cf:
        primary_result = "moderate_risk"
    else:
        primary_result = "low_risk"

    return {
        "primary_result": primary_result,
        "facts": final_facts,
        "trace": trace,
    }
```

### Primary result decision logic

| Condition | Result |
|-----------|--------|
| `needs_clinician_review` CF > 0.5 | `clinician_review` |
| `high_risk_flag` CF > `moderate_risk_flag` CF | `high_risk` |
| `moderate_risk_flag` CF > `low_risk_flag` CF | `moderate_risk` |
| Default | `low_risk` |

---

## Disease Facts Reference

**File:** `legacy/v1-flask/src/expertSystem/disease_facts.py`

The `DISEASE_FACTS` dictionary provides patient-readable clinical information for each label. The Gemini chatbot can look up entries via tool calls.

| Label | Name | Common Age | Common Locations | Key Risk Factors |
|-------|------|-----------|-----------------|-----------------|
| `akiec` | Actinic Keratosis / Intraepithelial Carcinoma | >50 years | Face, scalp, dorsal hands, forearms | UV exposure, fair skin, older age, immunosuppression |
| `bcc` | Basal Cell Carcinoma | >50 years | Face, neck, trunk, ears | Chronic UV, fair skin, radiation exposure |
| `bkl` | Benign Keratosis | Middle-aged to elderly | Trunk, face, neck, extremities | Age, genetics |
| `df` | Dermatofibroma | Young adults | Legs, arms, trunk | Minor skin trauma, insect bites |
| `mel` | Melanoma | 20–70 years | Back, legs, arms, face | UV, fair skin, family history, atypical nevi |
| `nv` | Melanocytic Nevus | Any age | Any location | Genetic, UV exposure |
| `vasc` | Vascular Lesion | Any age | Any location | Trauma, sun damage, aging |

Each entry includes:
- `name` — full clinical name
- `description` — clinical description
- `common_age` — typical patient age range
- `common_locations` — list of body sites
- `risk_factors` — list of known risk factors
- `notes` — treatment notes and monitoring recommendations

---

## FAISS Image Similarity Search

**File:** `legacy/v1-flask/src/query.py`

The optional `search()` function finds visually similar images in the HAM10000 dataset using a prebuilt FAISS index.

### Index files (must be built with `build_index.py`)

| File | Contents |
|------|----------|
| `data/index/faiss.index` | FAISS L2 index of ResNet50 embeddings |
| `data/index/image_ids.json` | Ordered list of HAM10000 image IDs |
| `data/index/meta.json` | Per-image metadata (diagnosis, sex, age, localization) |

### Usage

```python
from query import search
from PIL import Image

img = Image.open("lesion.jpg").convert("RGB")
filters = {"sex": "male", "localization": "back"}
results = search(img, filters, top_k=5)
```

### Filter behavior

- Queries the index for the top 100 nearest neighbors.
- Filters results by `sex` and/or `localization` if provided.
- Returns the first `top_k` results after filtering.
- Returns an empty list if the FAISS index does not exist (graceful fallback).

### Return value

```python
{
  "results": [
    {
      "image_id": "ISIC_0024306",
      "dx": "mel",
      "age": 65,
      "sex": "male",
      "localization": "back"
    }
  ]
}
```

---

## Gemini Chatbot Integration

**File:** `legacy/v1-flask/src/expertSystem/chat.py`

The chatbot is powered by Google Gemini (`gemini-2.0-flash` by default). It serves as an intake assistant to gather clinical details from the patient, explain analysis results, and answer general dermatology questions.

### Session Management

`ConvState` stores the conversation state for one session:

```python
@dataclass
class ConvState:
    history: list      # Gemini-format message history
    slots: dict        # extracted intake fields (body_site, patient_age, classifier_probs, ...)
```

Sessions are stored in an in-memory dictionary `_SESS` keyed by `sid` (session ID). Each browser tab generates a unique `sid` persisted in localStorage and sent with every request.

### `step(state, user_text, image, metadata)`

The main chat function. It:
1. Normalizes the incoming metadata (maps form field names to canonical slot keys).
2. Seeds `state.slots` with any newly provided intake fields or classifier probabilities.
3. Constructs a Gemini `GenerativeModel.send_message()` call with the full conversation history.
4. Extracts text fields from tool calls if the model invokes the disease-fact lookup tool.
5. Returns a response dict with `reply`, `text`, `message`, and optional `results`.

### Rate limiting

The rate-limit logic lives in `app.py` (Flask route level) rather than in `chat.py`:
- **Debounce:** `CHAT_MIN_INTERVAL` seconds minimum between requests (default 1.0s).
- **Sliding window:** At most `CHAT_MAX_PER_MINUTE` requests per 60-second window (default 20).
- Both limits are configurable via environment variables.

### Retry logic

`_retry_api_call()` wraps Gemini API calls with exponential backoff (up to 4 retries) to handle transient 429 errors. If all retries fail, the chatbot returns a user-friendly "service is busy" message rather than crashing.

### Analysis seeding

After `/analyze_skin` runs the full pipeline, the Flask route injects the analysis summary into the session:

```python
st.history.append({
    "role": "model",
    "parts": [{"text": chat_message}]
})
st.slots["classifier_probs"] = { "mel": 0.62, "nv": 0.27, ... }
st.slots["body_site"] = "back"
st.slots["patient_age"] = 45.0
```

Subsequent `/chat` calls from the patient pick up this seeded context automatically, allowing the chatbot to give analysis-aware answers without re-running the model.
