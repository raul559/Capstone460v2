# SkinAI master dataset: committed summaries

File: `models/datasets/skinai-master/README.md`

Small, aggregate outputs of the dataset build described in
[`docs/v2/DATASETS.md`](../../../docs/v2/DATASETS.md). Nothing here has one row
per image or patient. Row-level manifests are rebuilt locally into the
git-ignored `manifests/` folder and checked against the pins below.

## Pins

| What | SHA-256 |
|---|---|
| `master.parquet` (68,614 rows) | `73b6996b079f58e3404042b256111b67ac50f0ea14f929500318c52979facb87` (also in `master.parquet.sha256`) |
| Source metadata CSVs | per file in `metadata_inputs.csv` |
| Image archives | per ZIP in `audit_73b6996b079f_v1/split_config.json` (`archive_metadata_signatures`) |
| `near_duplicate_rejections.csv` | `56310e1c…` in `split_config.json`, computed over the file with Windows (CRLF) line endings |

## Files

| File | Contents |
|---|---|
| `expected_counts.csv` | Per-source row-count baseline every build is checked against |
| `metadata_inputs.csv` | Source metadata filenames, sizes, and SHA-256 |
| `master.parquet.sha256` | Content pin for the master manifest |
| `mra_midas_site_mapping_review.csv` | One row per distinct MRA-MIDAS raw location: normalized text, mapped site, status, rule, and count |
| `validation/` | Build reports: row counts, label/tone/Fitzpatrick/image-type coverage, missingness per column, `validation_summary.json` |
| `audit_73b6996b079f_v1/class_mapping.json` | 8-class label to index mapping (MEL, NV, BCC, AK, BKL, DF, VASC, SCC). **Not** the deployed model's mapping; see ADR 0001 |
| `audit_73b6996b079f_v1/split_config.json` | Audit run config: master hash, seed, pHash threshold, split policy, row counts, package versions, limitations |
| `audit_73b6996b079f_v1/split_counts.csv` | Rows by split × source × class × image type × tone group |
| `audit_73b6996b079f_v1/near_duplicate_rejections.csv` | Reviewed near-duplicate pairs judged to be different lesions (public dataset image IDs only). An input to the audit |

The audit folder name is the first 12 characters of the master hash plus the
audit version, matching the local `manifests/image_audit/` layout.

## Known follow-ups

- `near_duplicate_rejections.csv` lists 8 rows for what the process notes
  describe as 4 rejected pairs; two pairs appear twice with different reasons
  and a leading space. Confirm this is intended.
- `validation_summary.json` reports
  `passed_requested_checks_not_training_readiness`: the build checks passed,
  but the data is not certified ready for training.
