# ADR 0001: Master dataset and 8-class retraining

File: `docs/architecture/decisions/0001-master-dataset-and-8-class-retraining.md`

- **Status:** Proposed. Needs team decision before any training or model change.
- **Date:** 2026-11-20
- **Dataset work:** Emma Lytle ([`docs/v2/DATASETS.md`](../../v2/DATASETS.md))

## Context

V2 currently plans to migrate the existing V1 ResNet50 (seven HAM10000 classes
in alphabetical order: akiec, bcc, bkl, df, mel, nv, vasc) into
`intelligence/ml` unchanged (Milestone 2).

A seven-source master dataset now exists (68,510 audited rows, leakage-grouped
80/10/10 splits, DDI and MRA-MIDAS held out as an external test set). Its
training subset uses an **8-class mapping in a different order**: MEL, NV, BCC,
AK, BKL, DF, VASC, SCC (indices 0-7), adding SCC.

`CLAUDE.md` lists replacing the trained model and changing the seven-class
label ordering as changes that need explicit approval.

## Decision

Accepted now:

- Commit the dataset build code, aggregate summaries, and checksums. Keep
  images and row-level manifests out of Git (see `DATASETS.md`).

Not yet decided, and blocked on this ADR:

1. Whether V2 trains a new model on this dataset, and whether that happens in
   this capstone year or after the Milestone 2 migration.
2. Whether a new model uses the 8-class mapping above, including SCC.
3. How the expert system's rules, written for seven classes, change for eight.
4. The acceptance bar for replacing V1's model: metrics on the internal and
   external test sets, per skin-tone group, compared with V1 on the same data.
5. Whether each source dataset's license allows the planned use and
   redistribution of derived metadata.

## Consequences

- Until accepted, `class_mapping.json` in `models/datasets/skinai-master/` is
  training-data metadata only. The API, expert system, and mobile app keep the
  V1 seven-class order.
- If accepted, the change follows the CLAUDE.md sequence for ML changes:
  inspect V1 behavior, add regression tests, document, and bump the model,
  preprocessing, and rule-set version identifiers.
