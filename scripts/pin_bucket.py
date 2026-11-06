#!/usr/bin/env python3
"""
Pin the dataset state from an HF Storage Bucket (no downloads).

Lists every zip in the bucket, records its Xet content hash and size,
and writes archives_manifest.csv — your "dataset v1" record.

Usage (PowerShell):
    $env:HF_TOKEN = "hf_xxx"
    python scripts/pin_bucket.py                            # lists your buckets
    python scripts/pin_bucket.py --bucket username/my-bucket  # pin one

The Xet hash is HF's server-side content identifier: any change to a file
changes its hash, so re-running this script after edits shows exactly
which files differ from the pinned version.
"""

import argparse
import csv
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT = REPO_ROOT / "data" / "archives" / "archives_manifest.csv"


def discover() -> None:
    from huggingface_hub import list_buckets  # pip install -U huggingface_hub

    print("Buckets visible to your token:")
    found = False
    for bucket in list_buckets():
        print(f"  {bucket.id}  ({bucket.total_files} files, "
              f"{(bucket.size or 0) / 1e9:.1f} GB)")
        found = True
    if not found:
        print("  (none)")
    print("\nRe-run with:  python scripts/pin_bucket.py --bucket <id from above>")


def pin(bucket_id: str) -> int:
    from huggingface_hub import list_bucket_tree, get_bucket_paths_info

    print(f"listing {bucket_id} ...")
    zips = [item.path for item in list_bucket_tree(bucket_id, recursive=True)
            if item.path.lower().endswith(".zip")]
    if not zips:
        sys.exit("No .zip files found in that bucket.")

    # fetch content hashes (batched, 100 paths per call)
    infos = []
    for i in range(0, len(zips), 100):
        infos.extend(get_bucket_paths_info(bucket_id, zips[i:i + 100]))

    rows = []
    for info in infos:
        rows.append({
            "archive": info.path,
            "bytes": info.size,
            "xet_hash": getattr(info, "xet_hash", ""),
            "pinned_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    total = sum(r["bytes"] or 0 for r in rows)
    print(f"wrote {OUT}")
    for r in rows:
        print(f"  {r['archive']:40s} {(r['bytes'] or 0) / 1e6:9.1f} MB")
    print(f"total: {len(rows)} archives, {total / 1e9:.1f} GB")
    print("\nNext: git add + commit — this is dataset v1.")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bucket", help="bucket id, e.g. username/my-bucket")
    args = ap.parse_args()

    if not args.bucket:
        discover()
        return 0
    return pin(args.bucket)


if __name__ == "__main__":
    sys.exit(main())
