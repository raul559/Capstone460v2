"""Build SkinAI's manifest. Run --help for usage; does not train a model."""
import argparse
import hashlib
import importlib
import json
from pathlib import Path
import zipfile

import pandas as pd

CLASSES = {"MEL", "NV", "BCC", "AK", "BKL", "DF", "VASC", "SCC"}
LOADERS = {
    "isic2019": "load_isic2019",
    "milk10k": "load_milk10k",
    "fitzpatrick17k": "load_fitzpatrick17k",
    "pad_ufes_20": "load_pad_ufes_20",
    "hiba": "load_hiba",
    "mra_midas": "load_mra_midas",
    "ddi": "load_ddi",
}
CANONICAL = [
    "image_ref", "hash_code", "image_type", "file_name", "image_id",
    "patient_id", "lesion_id", "dataset_source", "split", "fitzpatrick",
    "fitzpatrick_group", "skin_tone", "tone_provenance", "sex", "age",
    "anatomical_site", "size", "disease_label", "label_class",
    "disease_classification", "pathology_confirmation", "pathology", "race",
    "ethnicity", "family_history", "personal_history", "cancer_history",
    "smoke", "drink", "background_mother", "background_father", "pesticide",
    "has_piped_water", "has_sewage_system", "itch", "grew", "hurt",
    "changed", "bleed", "elevation",
]
# Adapters must explicitly supply these. Other absent canonical fields become NA.
REQUIRED = {
    "image_ref", "image_id", "dataset_source", "split", "label_class",
    "disease_label", "image_type", "tone_provenance",
}
# Preserve values verbatim as strings when representations differ across sources.
NUMERIC = {"size", "skin_tone"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def load_all(module_name):
    module = (importlib.import_module(module_name)
        if isinstance(module_name, str)
        else module_name )
    frames = []
    counts = []
    for source, function in LOADERS.items():
        print(f"Loading {source} ...")
        frame = getattr(module, function)()
        require(isinstance(frame, pd.DataFrame), f"{function} must return a DataFrame")
        require(frame.columns.is_unique, f"{source}: duplicate column names")
        require(not frame.empty, f"{source}: no rows returned")
        require(not (REQUIRED - set(frame)), f"{source}: missing {REQUIRED - set(frame)}")
        extra = set(frame) - set(CANONICAL)
        require(not extra, f"{source}: unexpected columns {extra}; fix typos or update CANONICAL")
        frame = frame.reindex(columns=CANONICAL).copy()
        # Normalize only the known source naming variants used in earlier drafts.
        frame["dataset_source"] = frame["dataset_source"].replace({"pad-ufes-20": "pad_ufes_20"})
        require(frame["dataset_source"].eq(source).all(), f"{source}: incorrect dataset_source")
        for column in CANONICAL:
            if column in NUMERIC:
                frame[column] = pd.to_numeric(frame[column], errors="raise").astype("Float64")
            else:
                frame[column] = frame[column].astype("string")
                frame[column] = frame[column].mask(frame[column].str.fullmatch(r"\s*", na=False))
        frames.append(frame)
        counts.append({"dataset_source": source, "rows": len(frame)})
    master = pd.concat(frames, ignore_index=True)
    return master, pd.DataFrame(counts)


def write_reports(master, counts, out):
    counts.to_csv(out / "row_counts.csv", index=False)
    for field, name in [
        ("label_class", "label_coverage.csv"),
        ("disease_label", "raw_label_coverage.csv"),
        ("fitzpatrick", "fitzpatrick_coverage.csv"),
        ("fitzpatrick_group", "tone_group_coverage.csv"),
        ("tone_provenance", "tone_provenance_coverage.csv"),
        ("split", "split_counts.csv"),
        ("image_type", "image_type_counts.csv"),
    ]:
        table = master.groupby(["dataset_source", field], dropna=False).size()
        table.rename("rows").reset_index().to_csv(out / name, index=False)
        summary = master.groupby("dataset_source").agg(
        rows=("image_ref", "size"),
        labeled_rows=("label_class", "count"),
        individual_fitzpatrick_rows=("fitzpatrick", "count"),
        grouped_fitzpatrick_rows=("fitzpatrick_group", "count"),
        estimated_tone_rows=("skin_tone", "count"),
        hash_rows=("hash_code", "count"),
    )
    summary["label_coverage_pct"] = 100 * summary["labeled_rows"] / summary["rows"]
    summary.to_csv(out / "coverage_summary.csv")
    missing = master.groupby("dataset_source")[
        [c for c in CANONICAL if c != "dataset_source"]
    ].agg(lambda s: s.isna().sum())
    missing.to_csv(out / "missingness_counts.csv")
    master.loc[master["label_class"].isna(), [
        "dataset_source", "image_id", "disease_label", "image_ref"
    ]].to_csv(out / "unmapped_rows.csv", index=False)


def validate(master, out):
    errors = []
    for column in ["image_ref", "image_id", "dataset_source", "split", "image_type", "tone_provenance"]:
        n = int(master[column].isna().sum())
        if n:
            errors.append(f"{column}: {n} missing values")
    bad_labels = set(master["label_class"].dropna()) - CLASSES
    if bad_labels:
        errors.append(f"Invalid label_class values: {sorted(bad_labels)}")
    expected_split = master["dataset_source"].map(
        lambda source: {"external_test"} if source in {"ddi", "mra_midas"} else {"train", "val"}
    )
    wrong = [
        i for i, allowed in expected_split.items()
        if pd.isna(master.at[i, "split"]) or master.at[i, "split"] not in allowed
    ]
    if wrong:
        errors.append(f"{len(wrong)} rows have incorrect split/source assignments")
    duplicate = master.duplicated("image_ref", keep=False)
    master.loc[duplicate].to_csv(out / "duplicate_image_refs.csv", index=False)
    if duplicate.any():
        errors.append("Duplicate image_ref rows; see duplicate_image_refs.csv")
    invalid = ~master["image_ref"].str.fullmatch(r"[^:]+\.zip::.+", case=False, na=False)
    master.loc[invalid].to_csv(out / "invalid_image_refs.csv", index=False)
    if invalid.any():
        errors.append("Malformed image_ref values; see invalid_image_refs.csv")
    # Keep recorded Fitzpatrick types distinct from paired group labels.
    invalid_fst = master["fitzpatrick"].notna() & ~master["fitzpatrick"].isin(
        ["1", "2", "3", "4", "5", "6", "1.0", "2.0", "3.0", "4.0", "5.0", "6.0"]
    )
    if invalid_fst.any():
        errors.append("fitzpatrick must contain numeric individual types 1-6 or NA; normalize in adapters")
    groups = set(master["fitzpatrick_group"].dropna()) - {"I-II", "III-IV", "V-VI"}
    if groups:
        errors.append(f"Invalid Fitzpatrick groups: {sorted(groups)}")
    # Existing MD5s only. Missing hashes are NOT evidence of no duplicates.
    hashed = master.dropna(subset=["hash_code"]).copy()
    hashed["hash_code"] = hashed["hash_code"].str.strip().str.lower()
    duplicates = hashed[hashed.duplicated("hash_code", keep=False)]
    duplicates.to_csv(out / "duplicate_hashes.csv", index=False)
    crossed = any(
        "external_test" in set(group["split"].dropna())
        and bool({"train", "val"} & set(group["split"].dropna()))
        for _, group in hashed.groupby("hash_code")
    )
    if crossed:
        errors.append("Content hash shared across development/external test; see duplicate_hashes.csv")
    return errors


def check_images(master, bucket, zip_mode, local_root, out):
    """Check archives against bucket listing; optionally inspect ZIP member names."""
    from huggingface_hub import list_bucket_tree
    remote = {
        item.path: item.size
        for item in list_bucket_tree(bucket, recursive=True)
        if item.type == "file"
    }
    refs = master["image_ref"].str.split("::", n=1, expand=True)
    refs.columns = ["archive", "member"]
    refs["image_ref"] = master["image_ref"]
    rows, errors = [], []
    fs = None
    if zip_mode == "remote":
        from huggingface_hub import HfFileSystem
        fs = HfFileSystem()
    for archive, group in refs.groupby("archive"):
        exists = archive in remote
        member_set = None
        directory_error = None
        if not exists:
            errors.append(f"Missing bucket archive: {archive}")
        elif zip_mode != "skip":
            try:
                # Read central directory only: no extraction and no image decoding.
                # Remote I/O behavior depends on the installed backend.
                stream = (fs.open(f"buckets/{bucket}/{archive}", "rb")
                          if fs is not None else (local_root / archive).open("rb"))
                with stream:
                    with zipfile.ZipFile(stream) as z:
                        names = [i.filename for i in z.infolist() if not i.is_dir()]
                        require(len(names) == len(set(names)), f"{archive}: duplicate ZIP member names")
                        member_set = set(names)
            except Exception as exc:
                directory_error = str(exc)
                errors.append(f"{archive}: ZIP directory check failed: {exc}")
        for record in group.itertuples(index=False):
            status = ("archive_missing" if not exists else
                      "directory_check_failed" if directory_error else
                      "archive_only_not_member_checked" if member_set is None else
                      "ok" if record.member in member_set else "member_missing")
            rows.append({"image_ref": record.image_ref, "status": status})
    checks = pd.DataFrame(rows)
    checks.to_csv(out / "image_ref_checks.csv", index=False)
    n = int(checks["status"].eq("member_missing").sum())
    if n:
        errors.append(f"{n} inner ZIP paths missing; see image_ref_checks.csv")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--loaders", default="dataset_loaders", help="Importable module holding seven loaders")
    parser.add_argument("--out", type=Path, default=Path("manifests"))
    parser.add_argument("--expected-counts", type=Path, help="Reviewed CSV: dataset_source,rows")
    parser.add_argument("--bucket", help="Example: sarcolemma/SkinAI; read-only checks")
    parser.add_argument("--zip-check", choices=["skip", "remote", "local"], default="skip")
    parser.add_argument("--local-archive-root", type=Path, help="Contains Images/... when using local ZIP checks")
    args = parser.parse_args()
    require(args.zip_check == "skip" or args.bucket, "--zip-check requires --bucket")
    require(args.zip_check != "local" or args.local_archive_root, "Local checks need --local-archive-root")
    args.out.mkdir(parents=True, exist_ok=True)
    report = args.out / "validation"
    report.mkdir(exist_ok=True)
    master, counts = load_all(args.loaders)
    errors = validate(master, report)
    write_reports(master, counts, report)
    if args.expected_counts:
        expected = pd.read_csv(args.expected_counts)
        require(set(expected.columns) == {"dataset_source", "rows"}, "Invalid expected-counts columns")
        require(expected["dataset_source"].is_unique, "Duplicate sources in expected counts")
        require(set(expected["dataset_source"]) == set(LOADERS), "Expected counts must cover all seven sources")
        comparison = counts.merge(expected, on="dataset_source", suffixes=("_actual", "_expected"))
        comparison.to_csv(report / "row_count_comparison.csv", index=False)
        if comparison["rows_actual"].ne(comparison["rows_expected"]).any():
            errors.append("Row count mismatch; see row_count_comparison.csv")
    if args.bucket and not master["image_ref"].isna().any():
        # Skip malformed refs so a clear validation error precedes any remote I/O.
        if master["image_ref"].str.fullmatch(r"[^:]+\.zip::.+", case=False, na=False).all():
            errors.extend(check_images(master, args.bucket, args.zip_check, args.local_archive_root, report))
    summary = {
        "rows": len(master), "errors": errors,
        "expected_counts_checked": bool(args.expected_counts),
        "bucket": args.bucket,
        "zip_check": args.zip_check,
        "deduplication": "partial: supplied exact hashes only; perceptual/group review still required",
        "status": "failed" if errors else "passed_requested_checks_not_training_readiness",
    }
    (report / "validation_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    require(not errors, "Validation failed:\n- " + "\n- ".join(errors))
    master["has_8class_label"] = master["label_class"].notna()
    # Write atomically so an unsuccessful build does not truncate a previous master.
    target = args.out / "master.parquet"
    temporary = args.out / "master.parquet.tmp"
    master.to_parquet(temporary, index=False, engine="pyarrow")
    temporary.replace(target)
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    (args.out / "master.parquet.sha256").write_text(digest + "\n", encoding="utf-8")
    print(f"Wrote {target}: {len(master):,} rows")
    print(f"Reports: {report}")
    if not args.bucket or args.zip_check == "skip":
        print("NOTE: inner ZIP paths have NOT been verified.")


if __name__ == "__main__":
    main()
