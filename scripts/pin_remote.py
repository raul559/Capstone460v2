#!/usr/bin/env python3
"""
Pin the dataset state using ONLY remote metadata from the HF bucket
(no local zips, no downloads).

Reads every file in the repo, records its server-side sha256 and size,
and writes archives_manifest.csv. This is "dataset v1".

Usage:
    export HF_TOKEN=hf_xxx    # read token
    python scripts/pin_remote.py --repo-id YOUR_ORG/skinai-master-dataset
"""

import argparse
import csv
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT = REPO_ROOT / "data" / "archives" / "archives_manifest.csv"


def list_remote(repo_id: str) -> list:
    from huggingface_hub import HfApi  # pip install huggingface_hub

    api = HfApi()
    entries = []
    for item in api.list_repo_tree(repo_id, repo_type="dataset",
                                   recursive=True, expand=True):
        if item.path.endswith(".zip"):          # only the image archives
            lfs = getattr(item, "lfs", None)
            if lfs is None or not getattr(lfs, "sha256", None):
                print(f"  [warn] {item.path}: no LFS hash recorded, skipping")
                continue
            entries.append({
                "archive": item.path,
                "bytes": lfs.size,
                "sha256": lfs.sha256,
                "pinned_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            })
    return entries


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo-id", required=True)
    args = ap.parse_args()

    print(f"listing {args.repo_id} ...")
    rows = list_remote(args.repo_id)
    if not rows:
        sys.exit("No zip archives with LFS hashes found in the repo.")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    total = sum(r["bytes"] for r in rows)
    print(f"wrote {OUT}")
    for r in rows:
        print(f"  {r['archive']:40s} {r['bytes'] / 1e6:9.1f} MB  {r['sha256'][:16]}...")
    print(f"total: {len(rows)} archives, {total / 1e9:.1f} GB")
    print("Next: git add + commit — this is dataset v1.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
