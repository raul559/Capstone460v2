# Anatomical Site Mapping

File: `docs/v2/ANATOMICAL_SITE_MAPPING.md`

How lesion locations from seven datasets are harmonized for the SkinAI master
dataset. Converted from Emma Lytle's "SkinAI Anatomical Site Mapping Guide"
(originally a .docx). Overview of the full pipeline:
[`DATASETS.md`](DATASETS.md).

Use PAD-UFES-20-like detail where the source supports it, not as a forced
level of precision for every row. A source value of head/neck cannot determine
face vs nose vs scalp; an upper-extremity label cannot determine arm vs forearm
vs hand. Harmonization can aggregate detail but cannot recreate missing detail.

The mapper is a proposed project convention, not an official anatomical
ontology or a clinically reviewed coding standard. Its source mappings and
MRA-MIDAS rules are visible and versioned. Review the generated audit CSV
before using the mapping in analyses.

## Store broad location and detail separately

| Column | Purpose | Example |
|---|---|---|
| `anatomical_site_raw` | Exact source value | l dorsal hand |
| `anatomical_site` | Shared broad grouping | upper_extremity |
| `anatomical_site_detail` | More precise region, only when supported | hand |
| `site_mapping_status` | mapped, missing, unknown, or needs_review | mapped |

The mapping audit also holds normalized text, the matching rule, notes, and
proposed candidates for review. Those can stay in the audit CSV instead of
enlarging the master.

Examples:

| Raw source label | Broad site | Detail |
|---|---|---|
| head/neck | head_neck | NA |
| upper extremity | upper_extremity | NA |
| FOREARM | upper_extremity | forearm |
| ARM | upper_extremity | arm_unspecified |
| l dorsal hand | upper_extremity | hand |
| left posterior calf | lower_extremity | lower_leg |
| l posterior shoulder | upper_extremity | shoulder |
| anterior torso | torso | NA |
| central upper abdomen | torso | abdomen |
| palms/soles | palms_soles_unspecified | NA |
| oral/genital | oral_genital_unspecified | NA |

The last two are combined source categories, not resolved body regions. Keep
them separate instead of guessing which component applies. Do not treat all
hand or foot images as palms/soles: the location could be dorsal. A future
surface column can distinguish palmar, plantar, and dorsal locations where
documented.

Anterior/posterior/lateral torso orientation stays in the raw text; it is
intentionally not forced into chest/back/abdomen detail. It can become an
independent orientation field later.

## Source mappings

### ISIC 2019 and HIBA

Both ISIC lists are covered by the same map; the second list is a subset
lacking lateral torso.

| Original value | anatomical_site | anatomical_site_detail |
|---|---|---|
| anterior torso | torso | NA |
| posterior torso | torso | NA |
| lateral torso | torso | NA |
| head/neck | head_neck | NA |
| upper extremity | upper_extremity | NA |
| lower extremity | lower_extremity | NA |
| oral/genital | oral_genital_unspecified | NA |
| palms/soles | palms_soles_unspecified | NA |

### MILK10k

| Original value | anatomical_site | anatomical_site_detail |
|---|---|---|
| head/neck | head_neck | NA |
| lower extremity | lower_extremity | NA |
| oral/genital | oral_genital_unspecified | NA |
| upper extremity | upper_extremity | NA |

The MILK10k list has no torso category. Check raw source counts and
missingness to confirm that reflects the actual file rather than an earlier
filtering or column-choice mistake. Do not manufacture torso values because
another dataset has them.

### PAD-UFES-20

| Original value | anatomical_site | anatomical_site_detail |
|---|---|---|
| ABDOMEN | torso | abdomen |
| ARM | upper_extremity | arm_unspecified |
| BACK | torso | back |
| CHEST | torso | chest |
| EAR | head_neck | ear |
| FACE | head_neck | face |
| FOOT | lower_extremity | foot |
| FOREARM | upper_extremity | forearm |
| HAND | upper_extremity | hand |
| LIP | head_neck | lip |
| NECK | head_neck | neck |
| NOSE | head_neck | nose |
| SCALP | head_neck | scalp |
| THIGH | lower_extremity | thigh |

ARM is deliberately not assumed to mean upper arm. If source documentation
establishes that definition, revise the mapping with a recorded justification.

### MRA-MIDAS

Detailed free text is classified into these proposed groups:

| Detail | Terms recognized | Broad site |
|---|---|---|
| scalp | scalp, occiput, vertex, hairline | head_neck |
| lip | lip, vermilion, philtrum | head_neck |
| nose | nasal, nose, alar | head_neck |
| periauricular | pre-/post-/retro-/infra-auricular | head_neck |
| ear | ear, helix, antihelix, antitragus, scapha, conchal bowl | head_neck |
| face | cheek, forehead, eyelid, eyebrow, chin, jaw, mandible, temple, sideburn, canthus | head_neck |
| neck | neck, including posterior neck | head_neck |
| hand | hand, fingers, thumb, pinky | upper_extremity |
| wrist | wrist | upper_extremity |
| forearm | forearm | upper_extremity |
| elbow | elbow | upper_extremity |
| shoulder | shoulder, including posterior shoulder | upper_extremity |
| axilla | axilla | upper_extremity |
| upper_arm | upper arm, deltoid | upper_extremity |
| arm_unspecified | arm without a more precise term | upper_extremity |
| foot | foot, toe, heel, plantar, intertarsal | lower_extremity |
| ankle | ankle, malleolus | lower_extremity |
| knee | knee, popliteal | lower_extremity |
| lower_leg | lower leg, calf, shin | lower_extremity |
| thigh | thigh | lower_extremity |
| NA | leg without a more precise term | lower_extremity |
| abdomen | abdomen, hypogastric, umbilicus | torso |
| back | back, scapula | torso |
| flank | flank | torso |
| chest | chest, breast, inframammary | torso |
| chest_wall | ribcage | torso |
| clavicular_region | clavicle | torso |
| hip | hip | pelvic_region |
| buttock | buttock, source typo "buttox" | pelvic_region |
| groin | groin, inguinal | pelvic_region |
| pubic_region | suprapubic, mons pubis, pubic | pelvic_region |

These boundaries need team review, especially axilla/shoulder, clavicle,
periauricular skin, hip, and pubic skin. They are explicit choices, not
universally agreed anatomical boundaries. `pelvic_region` avoids forcing those
locations into PAD categories that do not cover them. Pubic or groin skin does
not by itself establish a genital or mucosal location.

The mapper uses only location terms. It does not turn a clinical annotation
that mentions a scar or diagnosis into a diagnosis label.

Held for review instead of silently accepted:

| Raw value | Why |
|---|---|
| r4 digit | Finger vs toe not specified |
| r infirmary breast | Likely transcription problem; chest candidate shown but not assigned |
| l melolabia fold | Face candidate needs review of the source wording |
| rt inferior parietal / rt superior parietal | Scalp candidate; confirm intended location |
| l upper back (this is mislabeled on epic as r upper back) | Source discrepancy preserved and flagged |
| unclear | Explicitly unknown, not mapped to a body region |

The code normalizes non-breaking spaces, casing, and a stray `Â` encoding
artifact. Original text stays in `anatomical_site_raw`. Left/right is kept in
the raw text; a separate laterality field can be derived and reviewed later.

The reviewed MRA-MIDAS audit (one row per distinct raw location, with counts)
is committed at
[`models/datasets/skinai-master/mra_midas_site_mapping_review.csv`](../../models/datasets/skinai-master/mra_midas_site_mapping_review.csv).

## Generate the audit before changing the master

With `anatomical_site_mapping.py` on the notebook's import path:

```python
import importlib
import sys

if str(PROJECT_ROOT / "scripts" / "models" / "dataset") not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT / "scripts" / "models" / "dataset"))

import anatomical_site_mapping as site_map
site_map = importlib.reload(site_map)

site_report_dir = OUTPUT_DIR / "site_mapping_review"
site_report_dir.mkdir(parents=True, exist_ok=True)

# Set the filename to your actual MRA-MIDAS CSV.
mra = pd.read_csv(META_DIR / "mra-midas.csv")

audit = site_map.mapping_audit(mra["midas_location"], "mra_midas")
audit.to_csv(
    site_report_dir / "mra_midas_site_mapping.csv",
    index=False,
    encoding="utf-8-sig",
)

display(audit.groupby("site_mapping_status")["rows"].sum())
display(audit.loc[audit["site_mapping_status"].eq("needs_review")])
```

This gives one row per distinct raw label, with frequencies. It maps every
label actually present in the CSV rather than a hand-transcribed list. New or
unmatched locations fail safely into `needs_review`, with no guessed site.

Generate the other source audits the same way, using the original source
column:

```python
# Use actual filenames and source column names.
pad = pd.read_csv(META_DIR / "PAD-UFES-20.csv")
site_map.mapping_audit(pad["region"], "pad_ufes_20").to_csv(
    site_report_dir / "pad_site_mapping.csv", index=False
)

hiba = pd.read_csv(META_DIR / "hiba-skin-lesions.csv")
site_map.mapping_audit(hiba["anatom_site_general"], "hiba").to_csv(
    site_report_dir / "hiba_site_mapping.csv", index=False
)
```

For ISIC train/test files use source `isic2019`; for MILK10k use `milk10k`. No
location should be inferred for DDI or Fitzpatrick17k when their metadata lack
it.

Review the full audit, not just `needs_review` rows: rule precedence and the
chosen boundaries are also decisions. When accepting a manual case, add a
narrow explicit override in the mapper and a test; do not globally replace
ambiguous tokens such as "digit".

## Integrate after reviewing

Inside each loader, after reading the original metadata:

```python
# PAD example; choose the original location column for each source.
sites = site_map.map_series(df["region"], "pad_ufes_20")
```

Then include these fields in that loader's returned DataFrame:

```python
"anatomical_site": sites["anatomical_site"],
"anatomical_site_raw": sites["anatomical_site_raw"],
"anatomical_site_detail": sites["anatomical_site_detail"],
"site_mapping_status": sites["site_mapping_status"],
```

Do not map an already harmonized `anatomical_site` a second time. For
MRA-MIDAS use the original `midas_location`; for ISIC, MILK10k, and HIBA use
the original `anatom_site_general`.

In `build_master.py`, add the three new fields to `CANONICAL`:

```python
"anatomical_site_raw",
"anatomical_site_detail",
"site_mapping_status",
```

`anatomical_site` is already the broad column, so do not add it twice. The
builder rejects unexpected column names, so this update is required. Sources
may omit the new optional fields; the builder fills them with NA.

To avoid enlarging the master for now, return only `anatomical_site` and keep
the other fields in the audit CSVs. The recommended end state keeps both broad
and detailed columns in the master.

Rerun the shared helper cells, the modified loaders, and the bridge cell, then
`run_master_build()`. Row counts should not change: this recodes fields, not
eligibility.

## Verify the transformation

Compare source counts before and after, and inspect broad, detail, and status
frequencies by source:

```python
master = pd.read_parquet(OUTPUT_DIR / "master.parquet")

for column in ["anatomical_site", "anatomical_site_detail", "site_mapping_status"]:
    display(
        master.groupby(["dataset_source", column], dropna=False)
        .size()
        .rename("rows")
        .reset_index()
    )
```

A missing detailed site for head/neck or upper extremity is expected, not a
reason to impute. Do not compare detailed-site results across sources as
though every source had equally detailed annotation. Missing location in DDI
and Fitzpatrick17k stays missing.

## Context

ISIC also uses hierarchical anatomic-site metadata, but these bins are
customized to the project's files, not a reproduction of ISIC's current
dictionary. Do not replace frozen source metadata with a newer download just
to get new column names.
