# File: expertSystem/fetch_ham.py
# Role: Helper to fetch HAM10000 dataset via KaggleHub.

# What it does:
# - Downloads metadata CSV and the two image zip parts.
# - Unzips into:
#     data/HAM10000_images_part_1/
#     data/HAM10000_images_part_2/
# - Writes:
#     data/HAM10000_metadata.csv

# Linked to:
# - Called automatically by build_index.py if the expected data files/folders are absent.

# Prereqs:
# - `pip install "kagglehub[pandas-datasets]"` and have network access.





import os, zipfile
import kagglehub as kh
from kagglehub import KaggleDatasetAdapter as KDA

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")
os.makedirs(DATA, exist_ok=True)

def unzip(src, dst):
    os.makedirs(dst, exist_ok=True)
    with zipfile.ZipFile(src) as z:
        z.extractall(dst)

def main():
    # metadata CSV -> DataFrame -> save
    meta_df = kh.dataset_load(KDA.PANDAS,
                              "kmader/skin-cancer-mnist-ham10000",
                              "HAM10000_metadata.csv")
    meta_csv_path = os.path.join(DATA, "HAM10000_metadata.csv")
    meta_df.to_csv(meta_csv_path, index=False)
    print("Saved:", meta_csv_path)

    # download zips, then unzip to expected folders
    z1 = kh.dataset_download("kmader/skin-cancer-mnist-ham10000", path="HAM10000_images_part_1.zip")
    z2 = kh.dataset_download("kmader/skin-cancer-mnist-ham10000", path="HAM10000_images_part_2.zip")
    d1 = os.path.join(DATA, "HAM10000_images_part_1")
    d2 = os.path.join(DATA, "HAM10000_images_part_2")
    unzip(z1, d1); print("Unzipped:", d1)
    unzip(z2, d2); print("Unzipped:", d2)

if __name__ == "__main__":
    main()
