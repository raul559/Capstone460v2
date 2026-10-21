# File: expertSystem/rules.py
# Role: Lightweight expert-logic layer that derives filters/bonuses/reasons
#       from normalized Facts (ABCDE + demographics).

# Linked to:
# - Uses expertSystem/schema.py (Facts, ExpertOutput)
# - Can be invoked before/after kNN search to bias rankings

# What it does:
# - Sets hard filters (sex, site, age bounds) when available
# - Computes a simple ABCDE score to set soft bonuses for classes
# - Adds human-readable reasons for transparency in the UI

from .schema import Facts, ExpertOutput

def _abcde_score(f: Facts) -> int:
    s = 0
    if f.asymmetry: s += 1
    if f.border_irregular: s += 1
    if f.color_variegated: s += 1
    if (f.diameter_mm or 0) >= 6: s += 1
    if f.evolving_change: s += 1
    return s

def _age_bounds(f: Facts):
    if f.age_min is not None or f.age_max is not None:
        return f.age_min, f.age_max
    if f.age is not None:
        return max(0, f.age-5), min(120, f.age+5)
    return None, None

def infer(f: Facts) -> ExpertOutput:
    out = ExpertOutput()

    # --- hard filters ---
    if f.sex in {"male","female","unknown"}:
        out.filter_sex = f.sex
    if f.localization:
        out.filter_localization = f.localization
    out.filter_age_min, out.filter_age_max = _age_bounds(f)

    # --- soft bonuses ---
    abcde = _abcde_score(f)

    # melanoma
    if abcde >= 3 or (f.evolving_change and (f.diameter_mm or 0) >= 6):
        out.class_bonus["mel"] += 0.05
        out.reasons.append("Boost melanoma: ABCDE concerning/evolving + large diameter.")

    # nevus
    if (f.age is not None and f.age < 30) and ((f.diameter_mm or 0) < 6) and (f.evolving_change is False):
        out.class_bonus["nv"] += 0.03
        out.reasons.append("Boost nevus: young, small, stable.")

    # bcc
    if ((f.age or 0) >= 50) and (f.bleeding_ulceration or f.sun_exposure_high):
        out.class_bonus["bcc"] += 0.04
        out.reasons.append("Boost BCC: age≥50 with bleeding/UV.")

    # akiec
    if ((f.age or 0) >= 50) and (f.sun_exposure_high or f.localization in {"back","trunk","upper extremity","lower extremity","abdomen"}):
        out.class_bonus["akiec"] += 0.04
        out.reasons.append("Boost AKIEC: chronic sun exposure cues.")

    # bkl
    if ((f.age or 0) >= 50) and (f.border_irregular is False) and (f.color_variegated is False):
        out.class_bonus["bkl"] += 0.03
        out.reasons.append("Boost BKL: older with regular borders/colors.")

    return out
