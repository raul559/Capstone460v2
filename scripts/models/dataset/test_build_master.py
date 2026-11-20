"""Synthetic tests only.

Run: python -m unittest discover -s scripts/models/dataset -p "test_*.py"
"""

import json
import sys
import tempfile
import types
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

import build_master as build
import pandas as pd

# Register pandas Arrow types once, before tests mock sys.modules.
import pandas.core.arrays.arrow.extension_types


def fake_loader(source):
    return pd.DataFrame(
        {
            "image_ref": [f"Images/{source}.zip::{source}.jpg"],
            "image_id": [source],
            "dataset_source": [source],
            "split": ["external_test" if source in {"ddi", "mra_midas"} else "train"],
            "label_class": ["NV"],
            "disease_label": ["source-specific nevus"],
            "image_type": ["clinical"],
            "tone_provenance": ["none"],
            "age": [34 if source == "ddi" else "30-40"],
            "itch": [True if source == "pad_ufes_20" else pd.NA],
        }
    )


def fake_module():
    module = types.ModuleType("synthetic_loaders")
    for source, function in build.LOADERS.items():
        setattr(module, function, lambda source=source: fake_loader(source))
    return module


class BuildTests(unittest.TestCase):
    def load(self):
        with patch.dict(sys.modules, {"synthetic_loaders": fake_module()}):
            return build.load_all("synthetic_loaders")

    def test_successful_build_and_parquet_roundtrip(self):
        with tempfile.TemporaryDirectory() as folder:
            with (
                patch.dict(sys.modules, {"synthetic_loaders": fake_module()}),
                patch.object(
                    sys,
                    "argv",
                    [
                        "build_master.py",
                        "--loaders",
                        "synthetic_loaders",
                        "--out",
                        folder,
                    ],
                ),
            ):
                build.main()
            frame = pd.read_parquet(Path(folder) / "master.parquet")
            self.assertEqual(len(frame), 7)
            self.assertTrue(frame["has_8class_label"].all())
            self.assertTrue((Path(folder) / "master.parquet.sha256").exists())
            summary = json.loads(
                (Path(folder) / "validation/validation_summary.json").read_text()
            )
            self.assertFalse(summary["errors"])

    def test_unmapped_rows_retained(self):
        master, counts = self.load()
        master.loc[0, "label_class"] = pd.NA
        with tempfile.TemporaryDirectory() as folder:
            out = Path(folder)
            self.assertEqual(build.validate(master, out), [])
            build.write_reports(master, counts, out)
            self.assertEqual(len(pd.read_csv(out / "unmapped_rows.csv")), 1)

    def test_missing_split_and_duplicate_ref_reported(self):
        master, _ = self.load()
        master.loc[0, "split"] = pd.NA
        master.loc[1, "image_ref"] = master.loc[0, "image_ref"]
        with tempfile.TemporaryDirectory() as folder:
            errors = build.validate(master, Path(folder))
            self.assertTrue(any("split" in text for text in errors))
            self.assertTrue(any("Duplicate image_ref" in text for text in errors))

    def test_cross_split_hash_collision_reported(self):
        master, _ = self.load()
        master.loc[0, "hash_code"] = "a" * 32
        master.loc[6, "hash_code"] = "a" * 32
        with tempfile.TemporaryDirectory() as folder:
            errors = build.validate(master, Path(folder))
            self.assertTrue(any("Content hash" in text for text in errors))

    def test_local_zip_directory_checks(self):
        master, _ = self.load()
        master = master.iloc[:1]
        fake_hub = types.ModuleType("huggingface_hub")
        fake_hub.list_bucket_tree = lambda *a, **k: [
            types.SimpleNamespace(path="Images/isic2019.zip", size=100, type="file")
        ]
        with (
            tempfile.TemporaryDirectory() as folder,
            patch.dict(sys.modules, {"huggingface_hub": fake_hub}),
        ):
            root = Path(folder)
            (root / "Images").mkdir()
            archive = root / "Images/isic2019.zip"
            with zipfile.ZipFile(archive, "w") as z:
                z.writestr("isic2019.jpg", b"not an image: directory-only test")
            self.assertEqual(
                build.check_images(master, "test/bucket", "local", root, root), []
            )
            master = master.copy()
            master["image_ref"] = "Images/isic2019.zip::wrong_folder/isic2019.jpg"
            errors = build.check_images(master, "test/bucket", "local", root, root)
            self.assertTrue(any("inner ZIP paths missing" in text for text in errors))

    def test_archive_only_not_marked_full_success(self):
        master, _ = self.load()
        master = master.iloc[:1]
        fake_hub = types.ModuleType("huggingface_hub")
        fake_hub.list_bucket_tree = lambda *a, **k: [
            types.SimpleNamespace(path="Images/isic2019.zip", size=100, type="file")
        ]
        with (
            tempfile.TemporaryDirectory() as folder,
            patch.dict(sys.modules, {"huggingface_hub": fake_hub}),
        ):
            root = Path(folder)
            self.assertEqual(
                build.check_images(master, "test/bucket", "skip", None, root), []
            )
            report = pd.read_csv(root / "image_ref_checks.csv")
            self.assertEqual(
                report.iloc[0]["status"], "archive_only_not_member_checked"
            )

    def test_invalid_refs_and_individual_fitzpatrick(self):
        master, _ = self.load()
        master.loc[0, "image_ref"] = "no_archive_here"
        master.loc[6, "fitzpatrick"] = "12"
        with tempfile.TemporaryDirectory() as folder:
            errors = build.validate(master, Path(folder))
            self.assertTrue(any("Malformed" in text for text in errors))
            self.assertTrue(any("fitzpatrick must" in text for text in errors))


if __name__ == "__main__":
    unittest.main()
