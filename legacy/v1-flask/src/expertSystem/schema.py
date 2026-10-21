# File: expertSystem/schema.py
# Role: Shared data models used by normalization and rules.

# Exports:
# - CLASSES: ordered list of diagnosis labels (HAM10000 common classes)
# - Facts: inputs from forms/intake (sex, age, site, ABCDE flags)
# - ExpertOutput: outputs of rules (hard filters, class bonuses, reasons)

# Linked to:
# - Imported by normalize.py and rules.py
# - Can be used by any module that needs typed containers


from dataclasses import dataclass, field
from typing import Optional, Dict, List

# Full HAM10000 / common labels
CLASSES = ["akiec","bcc","bkl","df","mel","nv","vasc"]

@dataclass
class Facts:
    sex: Optional[str] = None                 # "male" | "female" | "unknown"
    age: Optional[int] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    localization: Optional[str] = None
    # ABCDE / flags:
    asymmetry: Optional[bool] = None
    border_irregular: Optional[bool] = None
    color_variegated: Optional[bool] = None
    diameter_mm: Optional[float] = None
    evolving_change: Optional[bool] = None
    bleeding_ulceration: Optional[bool] = None
    sun_exposure_high: Optional[bool] = None

@dataclass
class ExpertOutput:
    # hard filters (None = do not filter)
    filter_sex: Optional[str] = None
    filter_localization: Optional[str] = None
    filter_age_min: Optional[int] = None
    filter_age_max: Optional[int] = None

    # soft bonuses per diagnosis label (additive to similarity)
    class_bonus: Dict[str, float] = field(default_factory=lambda: {c: 0.0 for c in CLASSES})

    # explanations to show in UI
    reasons: List[str] = field(default_factory=list)
