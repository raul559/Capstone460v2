# models/

File: `models/README.md`

Metadata, manifests, and checksums for models and the datasets used to train
them. Large binaries (trained weights, images, row-level manifests) never go in
normal Git history; they live in approved external storage and are referenced
here by checksum. See
[`docs/architecture/REPOSITORY_STRUCTURE.md`](../docs/architecture/REPOSITORY_STRUCTURE.md).

| Folder | Contents |
|---|---|
| `datasets/skinai-master/` | Summaries and pins for the seven-source master dataset ([`docs/v2/DATASETS.md`](../docs/v2/DATASETS.md)) |

The model manifest (`manifest.json`) for the deployed model is added with the
Milestone 2 model migration.
