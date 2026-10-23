from pathlib import Path
import io
import hashlib
import numpy as np
from PIL import Image
import tensorflow as tf

# MUST match training order exactly
CLASS_NAMES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

MODEL_PATH = Path(__file__).parent / "models" / "resnet50_skin_disease_finetuned_v4.keras"


class KerasResNetPredictor:
    def __init__(self):
        print("MODEL_PATH:", MODEL_PATH)
        print("MODEL EXISTS:", MODEL_PATH.exists())
        self.model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print("MODEL LOADED OK")

    def _preprocess_one(self, image_bytes: bytes) -> np.ndarray:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize((224, 224))

        # Match your training pipeline: raw float32 pixels in 0..255
        x = np.array(img, dtype=np.float32)
        return x

    def _preprocess_batch(self, image_bytes_list: list[bytes]) -> np.ndarray:
        batch = [self._preprocess_one(image_bytes) for image_bytes in image_bytes_list]
        x = np.stack(batch, axis=0)  # shape: (N, 224, 224, 3)
        return x

    def predict_topk(self, image_bytes: bytes, k: int = 3):
        print("\n--- DEBUG SINGLE ---")
        print("bytes length:", len(image_bytes))
        print("hash:", hashlib.sha256(image_bytes).hexdigest()[:16])

        x = self._preprocess_batch([image_bytes])
        print("input shape:", x.shape)
        print("tensor mean:", float(x.mean()))

        preds = self.model.predict(x, verbose=0)[0]
        print("sum preds:", float(np.sum(preds)))

        top_idx = np.argsort(preds)[-k:][::-1]
        result = [
            {"label": CLASS_NAMES[i], "prob": float(preds[i])}
            for i in top_idx
        ]

        print("topk:", result)
        print("--------------------\n")
        return result

    def predict_topk_batch(self, image_bytes_list: list[bytes], k: int = 3):
        if not image_bytes_list:
            return []

        print("\n=== DEBUG BATCH ===")
        print("num images:", len(image_bytes_list))

        for idx, image_bytes in enumerate(image_bytes_list):
            print(
                f"image {idx}: bytes={len(image_bytes)}, "
                f"hash={hashlib.sha256(image_bytes).hexdigest()[:16]}"
            )

        x = self._preprocess_batch(image_bytes_list)
        print("batch shape:", x.shape)
        print("batch mean:", float(x.mean()))

        preds_batch = self.model.predict(x, verbose=0)
        print("pred batch shape:", preds_batch.shape)

        all_results = []
        for img_idx, preds in enumerate(preds_batch):
            print(f"\nimage {img_idx} sum preds:", float(np.sum(preds)))

            top_idx = np.argsort(preds)[-k:][::-1]
            result = [
                {"label": CLASS_NAMES[i], "prob": float(preds[i])}
                for i in top_idx
            ]

            print(f"image {img_idx} topk:", result)
            all_results.append(result)

        print("===================\n")
        return all_results