"""
Unit tests for keras_predictor.py — KerasResNetPredictor.
The real 217MB Keras model is never loaded; tf.keras.models.load_model is patched.
Image-specific tests use static files from tests/test_images/ and are skipped
gracefully if the files are not yet present.
"""
import io
import pytest
import numpy as np
from pathlib import Path
from unittest.mock import MagicMock, patch

from pathlib import Path

TEST_IMAGE_DIR = Path(__file__).parent / "test_images"


def make_image_bytes(rgb=(120, 80, 60), size=(224, 224)) -> bytes:
    from PIL import Image as _PIL
    buf = io.BytesIO()
    _PIL.new("RGB", size, color=rgb).save(buf, format="JPEG")
    return buf.getvalue()


def load_image(filename: str) -> bytes:
    path = TEST_IMAGE_DIR / filename
    if not path.exists():
        pytest.skip(f"Test image not found: {filename}")
    return path.read_bytes()

# CLASS_NAMES as ordered in keras_predictor.py
EXPECTED_CLASS_NAMES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]


@pytest.fixture
def mock_model():
    m = MagicMock()
    # Return uniform probabilities for a single image (shape: 1 × 7)
    m.predict.return_value = np.array([[1 / 7] * 7], dtype=np.float32)
    return m


@pytest.fixture
def predictor(mock_model):
    with patch("keras_predictor.tf") as mock_tf:
        mock_tf.keras.models.load_model.return_value = mock_model
        from keras_predictor import KerasResNetPredictor
        pred = KerasResNetPredictor()
    return pred, mock_model


# ---------------------------------------------------------------------------
# Preprocessing
# ---------------------------------------------------------------------------
class TestPreprocessing:
    def test_preprocess_one_returns_float32_shape(self, predictor):
        pred, _ = predictor
        arr = pred._preprocess_one(make_image_bytes())
        assert arr.shape == (224, 224, 3)
        assert arr.dtype == np.float32

    def test_preprocess_one_accepts_jpeg(self, predictor):
        pred, _ = predictor
        arr = pred._preprocess_one(make_image_bytes(rgb=(100, 50, 80)))
        assert arr is not None

    def test_preprocess_one_accepts_png(self, predictor):
        pred, _ = predictor
        from PIL import Image
        buf = io.BytesIO()
        Image.new("RGB", (300, 300), (120, 80, 40)).save(buf, format="PNG")
        arr = pred._preprocess_one(buf.getvalue())
        assert arr.shape == (224, 224, 3)

    def test_preprocess_batch_returns_correct_shape(self, predictor):
        pred, _ = predictor
        imgs = [make_image_bytes() for _ in range(3)]
        batch = pred._preprocess_batch(imgs)
        assert batch.shape == (3, 224, 224, 3)

    def test_preprocess_batch_single_image(self, predictor):
        pred, _ = predictor
        batch = pred._preprocess_batch([make_image_bytes()])
        assert batch.shape == (1, 224, 224, 3)


# ---------------------------------------------------------------------------
# predict_topk
# ---------------------------------------------------------------------------
class TestPredictTopk:
    def test_returns_k_items_default(self, predictor):
        pred, _ = predictor
        result = pred.predict_topk(make_image_bytes())
        assert len(result) == 3

    def test_returns_k_items_custom(self, predictor):
        pred, _ = predictor
        result = pred.predict_topk(make_image_bytes(), k=5)
        assert len(result) == 5

    def test_items_have_label_and_prob(self, predictor):
        pred, _ = predictor
        for item in pred.predict_topk(make_image_bytes()):
            assert "label" in item
            assert "prob" in item

    def test_labels_from_class_names(self, predictor):
        pred, _ = predictor
        for item in pred.predict_topk(make_image_bytes()):
            assert item["label"] in EXPECTED_CLASS_NAMES

    def test_probs_are_floats(self, predictor):
        pred, _ = predictor
        for item in pred.predict_topk(make_image_bytes()):
            assert isinstance(item["prob"], float)

    def test_probs_between_zero_and_one(self, predictor):
        pred, _ = predictor
        for item in pred.predict_topk(make_image_bytes()):
            assert 0.0 <= item["prob"] <= 1.0

    def test_probs_sorted_descending(self, predictor):
        pred, _ = predictor
        result = pred.predict_topk(make_image_bytes(), k=7)
        probs = [item["prob"] for item in result]
        assert probs == sorted(probs, reverse=True)

    def test_one_hot_mel_returns_mel_first(self, predictor):
        pred, mock_model = predictor
        # mel is index 4 in CLASS_NAMES order ["akiec","bcc","bkl","df","mel","nv","vasc"]
        one_hot = np.zeros((1, 7), dtype=np.float32)
        one_hot[0, 4] = 1.0
        mock_model.predict.return_value = one_hot
        result = pred.predict_topk(make_image_bytes(), k=1)
        assert result[0]["label"] == "mel"

    def test_one_hot_nv_returns_nv_first(self, predictor):
        pred, mock_model = predictor
        # nv is index 5
        one_hot = np.zeros((1, 7), dtype=np.float32)
        one_hot[0, 5] = 1.0
        mock_model.predict.return_value = one_hot
        result = pred.predict_topk(make_image_bytes(), k=1)
        assert result[0]["label"] == "nv"

    def test_one_hot_bcc_returns_bcc_first(self, predictor):
        pred, mock_model = predictor
        # bcc is index 1
        one_hot = np.zeros((1, 7), dtype=np.float32)
        one_hot[0, 1] = 1.0
        mock_model.predict.return_value = one_hot
        result = pred.predict_topk(make_image_bytes(), k=1)
        assert result[0]["label"] == "bcc"


# ---------------------------------------------------------------------------
# predict_topk_batch
# ---------------------------------------------------------------------------
class TestPredictTopkBatch:
    def test_empty_list_returns_empty(self, predictor):
        pred, mock_model = predictor
        mock_model.predict.return_value = np.zeros((0, 7), dtype=np.float32)
        result = pred.predict_topk_batch([])
        assert result == []

    def test_multiple_images_returns_list_of_lists(self, predictor):
        pred, mock_model = predictor
        mock_model.predict.return_value = np.array([[1 / 7] * 7, [1 / 7] * 7], dtype=np.float32)
        images = [make_image_bytes(), make_image_bytes()]
        result = pred.predict_topk_batch(images)
        assert len(result) == 2
        assert all(isinstance(r, list) for r in result)


# ---------------------------------------------------------------------------
# Parametrized tests over real static images (skipped if not present)
# ---------------------------------------------------------------------------
DISEASE_VARIANTS = [
    (d, v)
    for d in ["Mel", "Bcc", "Bkl", "Df", "Nv", "Akiec", "Vasc"]
    for v in ["Mild", "Sever"]
]


@pytest.mark.parametrize("disease,variant", DISEASE_VARIANTS)
def test_predict_topk_with_real_image_pipeline(disease, variant, predictor):
    """
    Loads a real dermoscopy image from test_images/ and verifies the full
    preprocessing + mocked model pipeline runs without errors.
    Skips automatically if the image file is not present.
    """
    pred, _ = predictor
    img_bytes = load_image(f"{variant}_{disease}.png")
    result = pred.predict_topk(img_bytes, k=3)
    assert len(result) == 3
    assert all("label" in r and "prob" in r for r in result)
    assert all(r["label"] in EXPECTED_CLASS_NAMES for r in result)
    assert all(0.0 <= r["prob"] <= 1.0 for r in result)


@pytest.mark.parametrize("disease,variant", DISEASE_VARIANTS)
def test_preprocess_real_image_shape(disease, variant, predictor):
    """
    Verifies preprocessing of each real image produces correct (224,224,3) float32 shape.
    """
    pred, _ = predictor
    img_bytes = load_image(f"{variant}_{disease}.png")
    arr = pred._preprocess_one(img_bytes)
    assert arr.shape == (224, 224, 3)
    assert arr.dtype == np.float32
