

# File: expertSystem/normalize.py
# Role: Map raw form fields to canonical types/values and assemble a Facts object.

# Linked to:
# - Uses expertSystem/schema.py (Facts dataclass)
# - Called by any code that wants to convert web form inputs → Facts
# - Often used before applying rules or building queries

# Notes:
# - Normalizes sex/site/age and ABCDE-like flags (booleans, ints, floats)
# - LOCALIZATION_CANON maps common site strings to canonical values


from .schema import Facts

LOCALIZATION_CANON = {
    "back": "back",
    "lower extremity": "lower extremity",
    "trunk": "trunk",
    "upper extremity": "upper extremity",
    "abdomen": "abdomen",
}

def _to_bool(v):
    if v is None: return None
    s = str(v).strip().lower()
    if s in {"1","true","yes","on"}: return True
    if s in {"0","false","no","off"}: return False
    return None

def _to_int(v):
    try: return int(v) if v not in (None, "") else None
    except: return None

def _to_float(v):
    try: return float(v) if v not in (None, "") else None
    except: return None

def facts_from_form(d: dict) -> Facts:
    sex = d.get("sex")
    sex = sex.strip().lower() if isinstance(sex,str) and sex else None
    loc = d.get("localization")
    loc = LOCALIZATION_CANON.get(str(loc).strip().lower(), None) if loc else None
    return Facts(
        sex=sex,
        age=_to_int(d.get("age")),
        age_min=_to_int(d.get("age_min")),
        age_max=_to_int(d.get("age_max")),
        localization=loc,
        asymmetry=_to_bool(d.get("asymmetry")),
        border_irregular=_to_bool(d.get("border_irregular")),
        color_variegated=_to_bool(d.get("color_variegated")),
        diameter_mm=_to_float(d.get("diameter_mm")),
        evolving_change=_to_bool(d.get("evolving_change")),
        bleeding_ulceration=_to_bool(d.get("bleeding_ulceration")),
        sun_exposure_high=_to_bool(d.get("sun_exposure_high")),
    )
