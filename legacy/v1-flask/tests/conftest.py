import sys
import os
import io
from pathlib import Path
from unittest.mock import MagicMock

import numpy as np
import pytest

# Must be first — inserts src paths before any local imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src", "expertSystem"))

from PIL import Image

TEST_IMAGE_DIR = Path(__file__).parent / "test_images"

DISEASES = ["mel", "bcc", "bkl", "df", "nv", "akiec", "vasc"]
VARIANTS = ["mild", "severe"]


def make_image_bytes(rgb=(120, 80, 60), size=(224, 224)) -> bytes:
    img = Image.new("RGB", size, color=rgb)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def load_image(filename: str) -> bytes:
    path = TEST_IMAGE_DIR / filename
    if not path.exists():
        pytest.skip(f"Test image not found: {filename} — place it in tests/test_images/")
    return path.read_bytes()


@pytest.fixture
def image_bytes():
    return make_image_bytes()


class MockPredictor:
    def __init__(self, topk):
        self._topk = topk

    def predict_topk(self, image_bytes, k=3):
        return self._topk[:k]


@pytest.fixture
def mock_mel_predictor():
    return MockPredictor([
        {"label": "mel", "prob": 0.72},
        {"label": "nv",  "prob": 0.18},
        {"label": "bkl", "prob": 0.10},
    ])


@pytest.fixture
def mock_nv_predictor():
    return MockPredictor([
        {"label": "nv",  "prob": 0.85},
        {"label": "bkl", "prob": 0.09},
        {"label": "df",  "prob": 0.06},
    ])


@pytest.fixture
def mock_bcc_predictor():
    return MockPredictor([
        {"label": "bcc",   "prob": 0.60},
        {"label": "akiec", "prob": 0.25},
        {"label": "mel",   "prob": 0.15},
    ])


@pytest.fixture
def mock_akiec_predictor():
    return MockPredictor([
        {"label": "akiec", "prob": 0.55},
        {"label": "bcc",   "prob": 0.30},
        {"label": "mel",   "prob": 0.15},
    ])


@pytest.fixture
def mock_bkl_predictor():
    return MockPredictor([
        {"label": "bkl", "prob": 0.70},
        {"label": "nv",  "prob": 0.18},
        {"label": "df",  "prob": 0.12},
    ])


@pytest.fixture
def mock_df_predictor():
    return MockPredictor([
        {"label": "df",  "prob": 0.75},
        {"label": "nv",  "prob": 0.15},
        {"label": "bkl", "prob": 0.10},
    ])


@pytest.fixture
def mock_vasc_predictor():
    return MockPredictor([
        {"label": "vasc", "prob": 0.80},
        {"label": "df",   "prob": 0.12},
        {"label": "nv",   "prob": 0.08},
    ])
