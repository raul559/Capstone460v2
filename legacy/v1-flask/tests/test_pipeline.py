"""
Integration tests for expert_pipeline.py — run_expert_pipeline() with MockPredictor.
The real Keras model is never loaded.
"""
import json
import os
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

from expert_pipeline import (
    run_expert_pipeline,
    normalize_intake,
    normalize_topk,
    choose_primary_result,
    load_medical_facts,
    PipelineConfig,
)


class MockPredictor:
    def __init__(self, topk):
        self._topk = topk

    def predict_topk(self, image_bytes, k=3):
        return self._topk[:k]

# ---------------------------------------------------------------------------
# Shared topk fixtures
# ---------------------------------------------------------------------------
MEL_TOPK   = [{"label": "mel",   "prob": 0.72}, {"label": "nv",    "prob": 0.18}, {"label": "bkl",  "prob": 0.10}]
NV_TOPK    = [{"label": "nv",    "prob": 0.85}, {"label": "bkl",   "prob": 0.09}, {"label": "df",   "prob": 0.06}]
BCC_TOPK   = [{"label": "bcc",   "prob": 0.60}, {"label": "akiec", "prob": 0.25}, {"label": "mel",  "prob": 0.15}]
AKIEC_TOPK = [{"label": "akiec", "prob": 0.55}, {"label": "bcc",   "prob": 0.30}, {"label": "mel",  "prob": 0.15}]
BKL_TOPK   = [{"label": "bkl",   "prob": 0.70}, {"label": "nv",    "prob": 0.18}, {"label": "df",   "prob": 0.12}]
DF_TOPK    = [{"label": "df",    "prob": 0.75}, {"label": "nv",    "prob": 0.15}, {"label": "bkl",  "prob": 0.10}]
VASC_TOPK  = [{"label": "vasc",  "prob": 0.80}, {"label": "df",    "prob": 0.12}, {"label": "nv",   "prob": 0.08}]

FAKE_IMAGE = b"fake-image-bytes"
VALID_UPLOAD = {"age": "45", "sex_at_birth": "F", "location": "back", "duration_days": "30"}

VALID_RESULTS = {"high_risk", "moderate_risk", "low_risk", "clinician_review"}


# ---------------------------------------------------------------------------
# TestNormalizeIntake
# ---------------------------------------------------------------------------
class TestNormalizeIntake:
    def test_rapid_change_true_string_normalizes(self):
        result = normalize_intake({}, {"rapid_change": "true"})
        assert result["rapid_change"] is True

    def test_rapid_change_false_string_normalizes(self):
        result = normalize_intake({}, {"rapid_change": "false"})
        assert result["rapid_change"] is False

    def test_bleeding_bool_passthrough(self):
        result = normalize_intake({}, {"bleeding": True})
        assert result["bleeding"] is True

    def test_missing_chat_flags_default_false(self):
        result = normalize_intake({})
        assert result["rapid_change"] is False
        assert result["bleeding"] is False
        assert result["itching"] is False
        assert result["pain"] is False

    def test_duration_days_string_converts_to_int(self):
        result = normalize_intake({"duration_days": "30"})
        assert result["duration_days"] == 30

    def test_age_string_converts_to_int(self):
        result = normalize_intake({"age": "45"})
        assert result["age"] == 45

    def test_chat_flags_override_upload(self):
        result = normalize_intake(
            {"rapid_change": False},
            {"rapid_change": True}
        )
        assert result["rapid_change"] is True

    def test_extra_upload_fields_preserved(self):
        result = normalize_intake({"location": "face", "sex_at_birth": "M"})
        assert result["location"] == "face"
        assert result["sex_at_birth"] == "M"


# ---------------------------------------------------------------------------
# TestNormalizeTopk
# ---------------------------------------------------------------------------
class TestNormalizeTopk:
    def test_valid_items_returned(self):
        result = normalize_topk(MEL_TOPK)
        assert len(result) == 3

    def test_prob_above_one_clamped(self):
        result = normalize_topk([{"label": "mel", "prob": 1.5}])
        assert result[0]["prob"] <= 1.0

    def test_prob_below_zero_clamped(self):
        result = normalize_topk([{"label": "mel", "prob": -0.2}])
        assert result[0]["prob"] >= 0.0

    def test_empty_label_filtered(self):
        result = normalize_topk([{"label": "", "prob": 0.5}])
        assert result == []

    def test_empty_list_returns_empty(self):
        assert normalize_topk([]) == []

    def test_string_prob_converted_to_float(self):
        result = normalize_topk([{"label": "mel", "prob": "0.72"}])
        assert isinstance(result[0]["prob"], float)


# ---------------------------------------------------------------------------
# TestChoosePrimaryResult
# ---------------------------------------------------------------------------
class TestChoosePrimaryResult:
    def test_needs_review_above_threshold_returns_clinician_review(self):
        assert choose_primary_result({"needs_clinician_review": 0.7}) == "clinician_review"

    def test_needs_review_below_threshold_falls_through(self):
        result = choose_primary_result({"needs_clinician_review": 0.3, "high_risk_flag": 0.6})
        assert result == "high_risk"

    def test_high_risk_above_moderate_returns_high_risk(self):
        result = choose_primary_result({"high_risk_flag": 0.6, "moderate_risk_flag": 0.3})
        assert result == "high_risk"

    def test_moderate_above_low_returns_moderate(self):
        result = choose_primary_result({"moderate_risk_flag": 0.5, "low_risk_flag": 0.2})
        assert result == "moderate_risk"

    def test_all_zero_returns_low_risk(self):
        assert choose_primary_result({}) == "low_risk"

    def test_custom_threshold_changes_boundary(self):
        result = choose_primary_result({"needs_clinician_review": 0.4}, clinician_review_threshold=0.3)
        assert result == "clinician_review"


# ---------------------------------------------------------------------------
# TestLoadMedicalFacts
# ---------------------------------------------------------------------------
class TestLoadMedicalFacts:
    def test_none_path_returns_empty_dict(self):
        assert load_medical_facts(None) == {}

    def test_missing_file_raises_file_not_found(self):
        with pytest.raises(FileNotFoundError):
            load_medical_facts("/nonexistent/path/facts.json")

    def test_parses_valid_json(self, tmp_path):
        data = {"mel": {"summary": "melanoma", "urgency": "high"}}
        p = tmp_path / "facts.json"
        p.write_text(json.dumps(data))
        result = load_medical_facts(str(p))
        assert result["mel"]["urgency"] == "high"


# ---------------------------------------------------------------------------
# TestRunExpertPipeline — full pipeline with MockPredictor
# ---------------------------------------------------------------------------
class TestRunExpertPipeline:
    def _run(self, topk, upload=None, chat=None):
        predictor = MockPredictor(topk)
        return run_expert_pipeline(
            FAKE_IMAGE,
            upload or dict(VALID_UPLOAD),
            chat_flags=chat or {},
            predictor=predictor,
        )

    def test_returns_all_required_keys(self):
        result = self._run(MEL_TOPK)
        for key in ("intake", "ml", "reasoning", "medical_facts", "explanation_seed"):
            assert key in result

    def test_ml_topk_has_label_and_prob(self):
        result = self._run(MEL_TOPK)
        for item in result["ml"]["topK"]:
            assert "label" in item
            assert "prob" in item

    def test_reasoning_has_primary_result(self):
        result = self._run(MEL_TOPK)
        assert "primary_result" in result["reasoning"]

    def test_primary_result_is_valid_value(self):
        result = self._run(MEL_TOPK)
        assert result["reasoning"]["primary_result"] in VALID_RESULTS

    def test_explanation_seed_has_disclaimer(self):
        result = self._run(MEL_TOPK)
        assert "disclaimer" in result["explanation_seed"]
        assert len(result["explanation_seed"]["disclaimer"]) > 0

    def test_explanation_seed_intake_signals_match(self):
        result = self._run(MEL_TOPK, chat={"rapid_change": True, "bleeding": True})
        signals = result["explanation_seed"]["intake_signals"]
        assert signals["rapid_change"] is True
        assert signals["bleeding"] is True

    def test_mock_predictor_called_with_image_bytes(self):
        from unittest.mock import MagicMock
        mock_pred = MagicMock()
        mock_pred.predict_topk.return_value = MEL_TOPK
        run_expert_pipeline(FAKE_IMAGE, {}, predictor=mock_pred)
        mock_pred.predict_topk.assert_called_once()
        call_args = mock_pred.predict_topk.call_args
        assert call_args[0][0] == FAKE_IMAGE

    # Disease-specific risk outcome tests
    def test_mel_with_bleeding_rapid_gives_high_or_clinician(self):
        result = self._run(
            MEL_TOPK,
            chat={"rapid_change": True, "bleeding": True}
        )
        assert result["reasoning"]["primary_result"] in {"high_risk", "clinician_review"}

    def test_nv_stable_gives_low_risk(self):
        result = self._run(NV_TOPK, chat={})
        assert result["reasoning"]["primary_result"] == "low_risk"

    def test_bcc_with_bleeding_gives_moderate_or_higher(self):
        result = self._run(BCC_TOPK, chat={"bleeding": True})
        assert result["reasoning"]["primary_result"] in {"moderate_risk", "high_risk", "clinician_review"}

    def test_akiec_gives_moderate_or_higher(self):
        result = self._run(AKIEC_TOPK, chat={"itching": True})
        assert result["reasoning"]["primary_result"] in {"moderate_risk", "high_risk", "clinician_review"}

    def test_bkl_gives_low_or_moderate(self):
        result = self._run(BKL_TOPK)
        assert result["reasoning"]["primary_result"] in {"low_risk", "moderate_risk"}

    def test_df_stable_gives_low_risk(self):
        result = self._run(DF_TOPK)
        assert result["reasoning"]["primary_result"] == "low_risk"

    def test_vasc_gives_low_risk(self):
        result = self._run(VASC_TOPK)
        assert result["reasoning"]["primary_result"] == "low_risk"
