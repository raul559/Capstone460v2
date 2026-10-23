# File: expertSystem/build_index.py
# Role: Build the FAISS index used by the (optional) image search feature.

# What it does:
# - Loads HAM10000 metadata and images (auto-fetches with expertSystem/fetch_ham.py if missing).
# - Extracts 2048-D ResNet50 (ImageNet) embeddings in batches.
# - L2-normalizes embeddings and builds a FAISS inner-product index (cosine similarity).
# - Saves:
#     data/index/faiss.index
#     data/index/image_ids.json
#     data/index/meta.json  (compact metadata: dx, sex, age, localization)

# Linked to:
# - Used offline to prepare the artifacts consumed by src/query.py
# - expertSystem/app.py → /query endpoint will read these files via src/query.py

# Run:
# - `python -m expertSystem.build_index` (adjust batch size inside main() if needed)

# Notes:
# - Uses torchvision’s ResNet50_Weights.IMAGENET1K_V2 and its default transforms.
# - Device auto-select (CPU/GPU) via torch.cuda.is_available().
# """





import os, json, math
import numpy as np
import pandas as pd
import faiss
import torch
from PIL import Image, UnidentifiedImageError
from torch.utils.data import Dataset, DataLoader
from torchvision import models

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")
P1   = os.path.join(DATA, "HAM10000_images_part_1")
P2   = os.path.join(DATA, "HAM10000_images_part_2")
META_CSV = os.path.join(DATA, "HAM10000_metadata.csv")

# Auto-fetch if missing (adjust import depending on location of this file)
if not (os.path.isdir(P1) and os.path.isdir(P2) and os.path.isfile(META_CSV)):
    print("HAM10000 not found locally — fetching via KaggleHub...")
    from expertSystem.fetch_ham import main as fetch_main  # <-- if this file is under scripts/, use: from scripts.fetch_ham import main as fetch_main
    fetch_main()

OUT = os.path.join(DATA, "index")
os.makedirs(OUT, exist_ok=True)
FAISS_PATH = os.path.join(OUT, "faiss.index")
IDS_JSON   = os.path.join(OUT, "image_ids.json")
META_JSON  = os.path.join(OUT, "meta.json")

# ----- Model: ResNet50 penultimate features (2048-D) -----
device  = "cuda" if torch.cuda.is_available() else "cpu"
weights = models.ResNet50_Weights.IMAGENET1K_V2
backbone = models.resnet50(weights=weights)
backbone.fc = torch.nn.Identity()            # 2048-D features
backbone.eval().to(device)
pre = weights.transforms()

# ----- Helpers -----
def img_path(image_id: str) -> str | None:
    fn = f"{image_id}.jpg"
    p = os.path.join(P1, fn)
    if os.path.exists(p): return p
    p = os.path.join(P2, fn)
    return p if os.path.exists(p) else None

class HamDataset(Dataset):
    def __init__(self, ids: list[str]):
        self.ids = ids
        self.paths = [img_path(i) for i in ids]
    def __len__(self): return len(self.ids)
    def __getitem__(self, i):
        iid = self.ids[i]
        p = self.paths[i]
        try:
            img = Image.open(p).convert("RGB")
        except (UnidentifiedImageError, OSError) as e:
            # return a tiny black image if unreadable; caller will skip it
            img = Image.new("RGB", (224, 224))
        x = pre(img)  # 3x224x224 tensor
        return iid, x

@torch.inference_mode()
def embed_batch(x: torch.Tensor) -> np.ndarray:
    v = backbone(x.to(device))               # (bs, 2048)
    return v.cpu().numpy().astype("float32")

def main(batch_size: int = 32):
    # ----- Load and normalize metadata -----
    meta = pd.read_csv(META_CSV)
    if "age" not in meta.columns and "age_approx" in meta.columns:
        meta["age"] = meta["age_approx"]
    meta["sex"] = meta["sex"].astype(str).str.lower().replace({"nan": "unknown"})
    meta["localization"] = meta["localization"].astype(str).str.lower()

    all_ids = [iid for iid in meta["image_id"].tolist() if img_path(iid)]
    print(f"Found {len(all_ids)} images to index.")

    # ----- DataLoader (batched for speed) -----
    ds = HamDataset(all_ids)
    dl = DataLoader(ds, batch_size=batch_size, shuffle=False, num_workers=0)

    # ----- Embed -----
    embs_list: list[np.ndarray] = []
    done_ids: list[str] = []
    count = 0
    for ids, x in dl:
        v = embed_batch(x)                   # (bs, 2048)
        embs_list.append(v)
        done_ids.extend(list(ids))
        count += len(ids)
        if count % (batch_size * 10) == 0:
            print(f"embedded {count}/{len(all_ids)}")

    if not embs_list:
        raise RuntimeError("No embeddings produced. Check image paths and PIL loading.")
    E = np.concatenate(embs_list, axis=0).astype("float32")  # (N, 2048)

    # ----- Build FAISS index (cosine similarities via inner product) -----
    faiss.normalize_L2(E)
    base = faiss.IndexFlatIP(E.shape[1])
    idmap = faiss.IndexIDMap2(base)
    idmap.add_with_ids(E, np.arange(E.shape[0], dtype=np.int64))
    faiss.write_index(idmap, FAISS_PATH)

    # ----- Save ID list and compact metadata -----
    keep = meta.set_index("image_id").loc[done_ids, ["dx", "sex", "age", "localization"]].to_dict(orient="index")
    with open(IDS_JSON, "w") as f: json.dump(done_ids, f)
    with open(META_JSON, "w") as f: json.dump(keep, f)
    print(f"✅ index built at {OUT} (images indexed: {len(done_ids)})")

if __name__ == "__main__":
    main()
