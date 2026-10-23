"""
Flask test client tests for POST /analyze_skin.
run_expert_pipeline is patched at its source module so no model loads.
"""
import io
import os
import sys
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from PIL import Image as _PILImage

TEST_IMAGE_DIR = Path(__file__).parent / "test_images"
TESTS_DIR = str(Path(__file__).parent)
if TESTS_DIR not in sys.path:
    sys.path.insert(0, TESTS_DIR)

VALID_RESULTS = {"high_risk", "moderate_risk", "low_risk", "clinician_review"}

FAKE_PIPELINE_RESULT = {
    "intake": {"age": 45, "sex_at_birth": "F", "location": "back",
               "rapid_change": False, "bleeding": False, "itching": False, "pain": False},
    "ml": {"topK": [
        {"label": "mel",  "prob": 0.72},
        {"label": "nv",   "prob": 0.18},
        {"label": "bkl",  "prob": 0.10},
    ]},
    "reasoning": {
        "primary_result": "high_risk",
        "facts": {"high_risk_flag": 0.55, "low_risk_flag": 0.10},
        "trace": [],
    },
    "medical_facts": {},
    "explanation_seed": {
        "primary_result": "high_risk",
        "top_prediction": {"label": "mel", "prob": 0.72},
        "key_indicators": {"high_risk_flag": 0.55},
        "intake_signals": {"rapid_change": False, "bleeding": False,
                           "itching": False, "pain": False},
        "label_facts": {},
        "disclaimer": "This tool does not provide a medical diagnosis.",
    },
}

# Inline symptom dicts (mirrors test_expert_system.py scenarios)
SYMPTOM_MAP = {
    "mel":   {"bleeding": True,  "rapid_change": True,  "patient_age": 55, "body_site": "back",
              "itching_0_10": 4, "pain_0_10": 2},
    "bcc":   {"bleeding": True,  "rapid_change": False, "patient_age": 70, "body_site": "face",
              "itching_0_10": 0, "pain_0_10": 0},
    "akiec": {"bleeding": False, "rapid_change": False, "patient_age": 65, "body_site": "face",
              "itching_0_10": 8, "pain_0_10": 0},
    "nv":    {"bleeding": False, "rapid_change": False, "patient_age": 28,
              "itching_0_10": 0, "pain_0_10": 0},
    "bkl":   {"bleeding": False, "rapid_change": False, "patient_age": 58, "body_site": "trunk",
              "itching_0_10": 7, "pain_0_10": 0},
    "df":    {"bleeding": False, "rapid_change": False, "patient_age": 35, "body_site": "leg",
              "itching_0_10": 3, "pain_0_10": 3},
    "vasc":  {"bleeding": False, "rapid_change": False,
              "itching_0_10": 0, "pain_0_10": 0, "body_site": "trunk"},
}


def make_image_bytes(rgb=(120, 80, 60), size=(224, 224)) -> bytes:
    img = _PILImage.new("RGB", size, color=rgb)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def load_image(filename: str) -> bytes:
    path = TEST_IMAGE_DIR / filename
    if not path.exists():
        pytest.skip(f"Test image not found: {filename}")
    return path.read_bytes()


def _multipart(image_bytes=None, **fields):
    data = {}
    data["image"] = (io.BytesIO(image_bytes or make_image_bytes()), "test.jpg", "image/jpeg")
    data.update(fields)
    return data


# ---------------------------------------------------------------------------
# Flask client fixture — patches at the source module level
# ---------------------------------------------------------------------------
@pytest.fixture(scope="module")
def client():
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key", "MONGODB_URI": ""}):
        with patch("expert_pipeline.run_expert_pipeline", return_value=FAKE_PIPELINE_RESULT):
            import importlib
            import expertSystem.app as app_module
            importlib.reload(app_module)
            flask_app = app_module.app
            flask_app.config["TESTING"] = True
            with flask_app.test_client() as c:
                yield c


# ---------------------------------------------------------------------------
# TestAnalyzeSkinEndpoint
# ---------------------------------------------------------------------------
class TestAnalyzeSkinEndpoint:

    def _post(self, client, image_bytes=None, **fields):
        data = _multipart(image_bytes, **fields)
        with patch("expert_pipeline.run_expert_pipeline", return_value=FAKE_PIPELINE_RESULT):
            return client.post("/analyze_skin", data=data,
                               content_type="multipart/form-data")

    def test_returns_400_if_no_image_field(self, client):
        with patch("expert_pipeline.run_expert_pipeline", return_value=FAKE_PIPELINE_RESULT):
            resp = client.post("/analyze_skin", data={},
                               content_type="multipart/form-data")
        assert resp.status_code == 400

    def test_returns_400_if_empty_filename(self, client):
        data = {"image": (io.BytesIO(make_image_bytes()), "", "image/jpeg")}
        with patch("expert_pipeline.run_expert_pipeline", return_value=FAKE_PIPELINE_RESULT):
            resp = client.post("/analyze_skin", data=data,
                               content_type="multipart/form-data")
        assert resp.status_code == 400

    def test_returns_200_with_valid_image(self, client):
        assert self._post(client).status_code == 200

    def test_returns_200_with_all_intake_fields(self, client):
        resp = self._post(client, age="45", sex_at_birth="F", location="back",
                          duration_days="30", rapid_change="true", bleeding="false",
                          itching="true", pain="false")
        assert resp.status_code == 200

    def test_response_contains_top_predictions(self, client):
        assert "top_predictions" in self._post(client).get_json()

    def test_response_contains_risk_score(self, client):
        assert "risk_score" in self._post(client).get_json()

    def test_response_contains_explanation_summary(self, client):
        assert "explanation_summary" in self._post(client).get_json()

    def test_risk_score_is_valid_value(self, client):
        assert self._post(client).get_json()["risk_score"] in VALID_RESULTS

    def test_top_predictions_is_list(self, client):
        assert isinstance(self._post(client).get_json()["top_predictions"], list)

    def test_top_predictions_items_have_label_and_confidence(self, client):
        for item in self._post(client).get_json()["top_predictions"]:
            assert "label" in item
            assert "confidence" in item


# ---------------------------------------------------------------------------
# Parametrized real-image tests (skipped until images are placed)
# ---------------------------------------------------------------------------
DISEASE_VARIANTS = [
    (d, v)
    for d in ["Mel", "Bcc", "Bkl", "Df", "Nv", "Akiec", "Vasc"]
    for v in ["Mild", "Sever"]
]


@pytest.mark.parametrize("disease,variant", DISEASE_VARIANTS)
def test_analyze_skin_with_real_image(disease, variant, client):
    img_bytes = load_image(f"{variant}_{disease}.png")
    symptoms = SYMPTOM_MAP[disease.lower()]

    form_fields = {
        "age":          str(symptoms.get("patient_age", "")),
        "location":     str(symptoms.get("body_site", "")),
        "rapid_change": str(symptoms.get("rapid_change", False)).lower(),
        "bleeding":     str(symptoms.get("bleeding", False)).lower(),
        "itching":      "true" if (symptoms.get("itching_0_10", 0) or 0) >= 3 else "false",
        "pain":         "true" if (symptoms.get("pain_0_10",   0) or 0) >= 3 else "false",
    }

    data = _multipart(img_bytes, **form_fields)
    with patch("expert_pipeline.run_expert_pipeline", return_value=FAKE_PIPELINE_RESULT):
        resp = client.post("/analyze_skin", data=data, content_type="multipart/form-data")

    assert resp.status_code == 200
    body = resp.get_json()
    assert "top_predictions" in body
    assert "risk_score" in body
    assert body["risk_score"] in VALID_RESULTS
    assert len(body["top_predictions"]) > 0
