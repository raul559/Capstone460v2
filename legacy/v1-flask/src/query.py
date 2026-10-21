# src/query.py
from __future__ import annotations
import os, json
from typing import Any, Dict, List, Tuple, Optional

import numpy as np
import pandas as pd
from PIL import Image

import torch, faiss
from torchvision import models, transforms

# ---------------------------
# Paths & basic configuration
# ---------------------------
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(ROOT, "data")
IDX_DIR  = os.path.join(DATA_DIR, "index")

FAISS_PATH = os.path.join(IDX_DIR, "faiss.index")
IDS_JSON   = os.path.join(IDX_DIR, "image_ids.json")
META_JSON  = os.path.join(IDX_DIR, "meta.json")

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# Fetch more than we need, then filter by metadata (sex/site/age)
FETCH_K = 100

# ---------------------------
# Lazy globals
# ---------------------------
_index: Optional[faiss.Index] = None
_IMAGE_IDS: Optional[List[str]] = None
META: Optional[Dict[str, Dict[str, Any]]] = None
_EMBED: Optional[torch.nn.Module] = None
_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    # normalize per ImageNet stats for ResNet50
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# ---------------------------
# Utilities
# ---------------------------
def _load_index() -> faiss.Index:
    global _index
    if _index is None:
        if not os.path.exists(FAISS_PATH):
            raise FileNotFoundError(
                f"FAISS index not found at {FAISS_PATH}. "
                f"Build it first (data/index/faiss.index)."
            )
        _index = faiss.read_index(FAISS_PATH)
    return _index

def _load_image_ids() -> List[str]:
    global _IMAGE_IDS
    if _IMAGE_IDS is None:
        if not os.path.exists(IDS_JSON):
            raise FileNotFoundError(
                f"image_ids.json not found at {IDS_JSON}. "
                f"Expected alongside the FAISS index."
            )
        with open(IDS_JSON, "r", encoding="utf-8") as f:
            _IMAGE_IDS = json.load(f)
    return _IMAGE_IDS

def _load_meta() -> Dict[str, Dict[str, Any]]:
    global META
    if META is None:
        if not os.path.exists(META_JSON):
            raise FileNotFoundError(
                f"meta.json not found at {META_JSON}. "
                f"Expected alongside the FAISS index."
            )
        with open(META_JSON, "r", encoding="utf-8") as f:
            meta_list = json.load(f)  # can be list of dicts or dict keyed by image_id
        # Normalize to dict keyed by image_id
        if isinstance(meta_list, list):
            META = {m.get("image_id") or m.get("id") or m.get("name"): m for m in meta_list}
        elif isinstance(meta_list, dict):
            META = meta_list
        else:
            raise ValueError("meta.json is neither list nor dict; cannot parse.")
    return META

def _embedder() -> torch.nn.Module:
    """
    ResNet50 (ImageNet) backbone with global avg pooling → 2048-d feature.
    """
    global _EMBED
    if _EMBED is None:
        model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        model.fc = torch.nn.Identity()
        model.eval().to(DEVICE)
        _EMBED = model
    return _EMBED

def _to_tensor(img: Image.Image) -> torch.Tensor:
    if img.mode != "RGB":
        img = img.convert("RGB")
    return _TRANSFORM(img).unsqueeze(0).to(DEVICE)

@torch.inference_mode()
def _embed(img: Image.Image) -> np.ndarray:
    """
    Returns a L2-normalized float32 vector of shape (1, D).
    """
    model = _embedder()
    x = _to_tensor(img)
    vec = model(x).detach().cpu().numpy().astype("float32")
    # Normalize for cosine similarity (FAISS inner-product trick)
    faiss.normalize_L2(vec)
    return vec  # (1, 2048)

def _nearest(vec: np.ndarray, k: int) -> Tuple[np.ndarray, np.ndarray]:
    """
    Inner-product search → cosine similarity if vectors are L2-normalized.
    Returns (scores, indices).
    """
    index = _load_index()
    if index.d != vec.shape[1]:
        raise ValueError(
            f"Index dim {index.d} != embedding dim {vec.shape[1]}. "
            f"You likely need to rebuild the index with the same backbone."
        )
    scores, idxs = index.search(vec, k)
    return scores[0], idxs[0]

# ---------------------------
# Filtering / reasoning
# ---------------------------
def _as_int(v) -> Optional[int]:
    try:
        if v is None: return None
        if isinstance(v, str) and v.strip() == "": return None
        i = int(float(v))
        return i
    except Exception:
        return None

def _clean_site(site: Optional[str]) -> Optional[str]:
    if not site: return None
    return str(site).strip().lower()

def _clean_sex(sex: Optional[str]) -> Optional[str]:
    if not sex: return None
    s = str(sex).strip().lower()
    if s in {"m", "male"}: return "male"
    if s in {"f", "female"}: return "female"
    return None

def _age_bucket(age: Optional[int]) -> Optional[str]:
    if age is None: return None
    if age < 20: return "<20"
    if age < 30: return "20s"
    if age < 40: return "30s"
    if age < 50: return "40s"
    if age < 60: return "50s"
    if age < 70: return "60s"
    return "70+"

class Explanation:
    def __init__(self):
        self.reasons: List[str] = []

    def add(self, msg: str):
        if msg: self.reasons.append(msg)

def _apply_metadata_filters(
    candidates: List[Tuple[str, float]],
    sex: Optional[str],
    age: Optional[int],
    site: Optional[str],
    strict: bool,
) -> Tuple[List[Tuple[str, float]], Dict[str, int], Explanation]:
    """
    Filter/soft-rank neighbors by (sex, age, localization).
    Returns (filtered, tally, explanation).
    """
    meta = _load_meta()
    expl = Explanation()
    tally = {"kept": 0, "dropped_sex": 0, "dropped_site": 0, "dropped_age": 0}

    user_sex  = _clean_sex(sex)
    user_site = _clean_site(site)
    user_age  = _as_int(age)
    user_age_bucket = _age_bucket(user_age)

    if user_sex:  expl.add(f"Prefer matches with sex = {user_sex}")
    if user_site: expl.add(f"Prefer matches with site = {user_site}")
    if user_age is not None: expl.add(f"Prefer matches in age bucket ≈ {user_age_bucket}")

    filtered: List[Tuple[str, float]] = []
    for iid, score in candidates:
        m = meta.get(iid, {})
        m_sex  = _clean_sex(m.get("sex"))
        m_site = _clean_site(m.get("localization"))
        m_age  = _as_int(m.get("age"))
        m_age_bucket = _age_bucket(m_age)

        ok = True
        if strict:
            if user_sex  and m_sex  and m_sex  != user_sex:  ok = False; tally["dropped_sex"] += 1
            if user_site and m_site and m_site != user_site: ok = False; tally["dropped_site"] += 1
            if user_age  and m_age_bucket and m_age_bucket != user_age_bucket:
                ok = False; tally["dropped_age"] += 1

        if ok:
            filtered.append((iid, score))
            tally["kept"] += 1

    # soft preference: if not strict, boost items that match more fields
    if not strict and (user_sex or user_site or user_age is not None):
        def _boost(tup):
            iid, score = tup
            m = meta.get(iid, {})
            hit = 0
            if user_sex  and _clean_sex(m.get("sex")) == user_sex: hit += 1
            if user_site and _clean_site(m.get("localization")) == user_site: hit += 1
            if user_age is not None and _age_bucket(_as_int(m.get("age"))) == user_age_bucket: hit += 1
            return score + 0.01 * hit  # small tie-break boost
        filtered.sort(key=_boost, reverse=True)
    else:
        filtered.sort(key=lambda t: t[1], reverse=True)

    return filtered, tally, expl

# ---------------------------
# Public API
# ---------------------------
def search(img: Image.Image, form_dict: Dict[str, Any] | None = None, top_k: int = 5) -> Dict[str, Any]:
    """
    Run kNN search in the HAM10000 index for an input PIL image.
    Optionally uses metadata in form_dict to filter/rank results:
      form_dict keys (optional):
        - sex: "male"/"female"
        - age: integer
        - localization: body site (e.g., "trunk", "lower extremity", "face")
        - strict: "1" for hard filters, else soft preference (default)
        - top_k: override (int)
    Returns:
      {
        "reasons": [str, ...],     # textual trace of what we did
        "results": [
            {"image_id": str, "dx": str|None, "similarity": float,
             "sex": str|None, "age": int|None, "localization": str|None},
            ...
        ],
        "tally": {...}            # kept/dropped counters for transparency
      }
    """
    # 1) embed query image
    q_vec = _embed(img)  # (1, D) L2-normalized
    reasons: List[str] = [f"Embedded query with ResNet50 ({q_vec.shape[1]} dims), normalized for cosine similarity."]

    # 2) nearest neighbors (FETCH_K to allow filtering)
    fetch_k = int(form_dict.get("top_k", FETCH_K)) if form_dict else FETCH_K
    fetch_k = max(fetch_k, top_k)
    scores, idxs = _nearest(q_vec, fetch_k)

    image_ids = _load_image_ids()
    meta = _load_meta()

    # 3) build candidate list
    cands: List[Tuple[str, float]] = []
    for s, idx in zip(scores, idxs):
        if idx < 0 or idx >= len(image_ids):  # FAISS can return -1 when not enough items
            continue
        iid = image_ids[idx]
        cands.append((iid, float(s)))

    # 4) optional metadata filtering
    sex  = (form_dict or {}).get("sex")
    age  = (form_dict or {}).get("age")
    site = (form_dict or {}).get("localization")
    strict = str((form_dict or {}).get("strict", "0")).strip() in {"1", "true", "True"}

    filtered, tally, expl = _apply_metadata_filters(cands, sex, age, site, strict)
    reasons.extend(expl.reasons)
    if strict:
        reasons.append("Strict filtering enabled (non-matching sex/site/age removed).")
    else:
        reasons.append("Soft preferences enabled (matching sex/site/age slightly boosted).")

    # 5) materialize top_k with metadata
    results: List[Dict[str, Any]] = []
    for iid, sc in filtered[:top_k]:
        m = meta.get(iid, {})
        age_val = _as_int(m.get("age"))
        results.append({
            "image_id": iid,
            "dx": m.get("dx"),
            "similarity": float(sc),
            "sex": _clean_sex(m.get("sex")),
            "age": age_val,
            "localization": _clean_site(m.get("localization")),
        })

    # 6) friendly reason if nothing made it through strict filters
    if not results and strict:
        reasons.append("No neighbors satisfied strict metadata filters; try relaxing 'strict' or omitting filters.")

    return {
        "reasons": reasons,
        "results": results,
        "tally": tally
    }
