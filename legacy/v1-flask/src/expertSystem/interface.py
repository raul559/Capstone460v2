# File: expertSystem/interface.py
# Role: Minimal interface helper for reading simple form inputs and producing a
#       lightweight ExpertOutput (sex/site/age + reasons), without hard filters
#       or rule bonuses.

# Linked to:
# - Can be used by UI handlers that only need basic metadata extraction
# - Independent of the heavier rules.Facts/ExpertOutput if you want a tiny path


from dataclasses import dataclass, field
from typing import Optional, Dict, Mapping

@dataclass
class ExpertOutput:
    # Keep only HAM attributes; no hard filters, no rule bonuses by default
    sex: Optional[str] = None           # 'male' | 'female' | None
    localization: Optional[str] = None  # canonicalized site or None
    age: Optional[int] = None           # single age if provided
    reasons: list[str] = field(default_factory=list)

def _canon_sex(v: Optional[str]) -> Optional[str]:
    if not v: return None
    v = str(v).strip().lower()
    return {"m":"male","male":"male","f":"female","female":"female"}.get(v)

def _canon_site(v: Optional[str]) -> Optional[str]:
    if not v: return None
    s = str(v).strip().lower()
    return s or None

def _to_int(v: Optional[str]) -> Optional[int]:
    try: return int(float(v)) if v not in (None,"") else None
    except: return None

def infer_from_form(form: Mapping[str, str]) -> ExpertOutput:
    sex = _canon_sex(form.get("sex") or form.get("gender"))
    site = _canon_site(form.get("localization") or form.get("site"))
    age  = _to_int(form.get("age") or form.get("age_approx"))
    ex = ExpertOutput(sex=sex, localization=site, age=age)
    # Reasons are purely informative; no risk wording
    if sex: ex.reasons.append(f"User provided sex={sex}.")
    if site: ex.reasons.append(f"User provided site={site}.")
    if age is not None: ex.reasons.append(f"User provided age={age}.")
    if not ex.reasons: ex.reasons.append("No metadata provided; ranking by visual similarity.")
    return ex
