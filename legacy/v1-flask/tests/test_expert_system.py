"""
Unit tests for disease_prediction.py:
- expert_rule_logits() — clinical heuristic logits for all 7 diseases
- build_expert_fusion_output() — model + expert fusion pipeline
"""
import pytest
from disease_prediction import (
    expert_rule_logits,
    build_expert_fusion_output,
    ExpertConfig,
    HAM10000_CLASSES,
)


# ---------------------------------------------------------------------------
# Shared disease symptom scenarios
# ---------------------------------------------------------------------------
MEL_SYMPTOMS = {
    "bleeding": True,
    "rapid_change": True,
    "width_mm": 12.0,
    "border_0_10": 8.5,
    "num_colors": 4,
    "elevation": "raised",
    "itching_0_10": 4,
    "pain_0_10": 2,
    "patient_age": 55,
    "body_site": "back",
}

BCC_SYMPTOMS = {
    "bleeding": True,
    "rapid_change": False,
    "width_mm": 8.0,
    "border_0_10": 5.0,
    "num_colors": 1,
    "elevation": "nodular",
    "ulceration": True,
    "patient_age": 70,
    "body_site": "face",
}

AKIEC_SYMPTOMS = {
    "bleeding": False,
    "rapid_change": False,
    "evolution_speed": "slow",
    "width_mm": 5.0,
    "border_0_10": 3.0,
    "num_colors": 2,
    "elevation": "flat",
    "itching_0_10": 8,
    "crusting": True,
    "patient_age": 65,
    "body_site": "face",
}

NV_SYMPTOMS = {
    "bleeding": False,
    "rapid_change": False,
    "evolution_speed": "stable",
    "width_mm": 4.0,
    "border_0_10": 2.0,
    "num_colors": 1,
    "elevation": "flat",
    "itching_0_10": 0,
    "pain_0_10": 0,
    "patient_age": 28,
}

BKL_SYMPTOMS = {
    "bleeding": False,
    "rapid_change": False,
    "width_mm": 9.0,
    "border_0_10": 5.0,
    "num_colors": 3,
    "elevation": "raised",
    "itching_0_10": 7,
    "patient_age": 58,
    "body_site": "trunk",
}

DF_SYMPTOMS = {
    "bleeding": False,
    "rapid_change": False,
    "evolution_speed": "stable",
    "width_mm": 3.5,
    "border_0_10": 2.0,
    "num_colors": 1,
    "elevation": "nodular",
    "itching_0_10": 3,
    "pain_0_10": 3,
    "patient_age": 35,
    "body_site": "leg",
}

VASC_SYMPTOMS = {
    "bleeding": False,
    "rapid_change": False,
    "width_mm": 3.0,
    "border_0_10": 1.0,
    "num_colors": 1,
    "elevation": "flat",
    "itching_0_10": 0,
    "pain_0_10": 0,
    "body_site": "trunk",
}


# ---------------------------------------------------------------------------
# TestExpertRuleLogitsStructure
# ---------------------------------------------------------------------------
class TestExpertRuleLogitsStructure:
    def test_returns_tuple_of_logits_and_reasons(self):
        logits, reasons = expert_rule_logits({})
        assert isinstance(logits, dict)
        assert isinstance(reasons, dict)

    def test_logits_have_all_seven_classes(self):
        logits, _ = expert_rule_logits({})
        for cls in HAM10000_CLASSES:
            assert cls in logits

    def test_empty_symptoms_all_zero_logits(self):
        logits, _ = expert_rule_logits({})
        for v in logits.values():
            assert v == pytest.approx(0.0)

    def test_reasons_keys_are_ham_classes(self):
        _, reasons = expert_rule_logits(MEL_SYMPTOMS)
        for k in reasons:
            assert k in HAM10000_CLASSES


# ---------------------------------------------------------------------------
# TestExpertRuleLogitsByDisease — one scenario per disease
# ---------------------------------------------------------------------------
class TestExpertRuleLogitsByDisease:
    def test_mel_scenario_mel_logit_is_highest(self):
        logits, _ = expert_rule_logits(MEL_SYMPTOMS)
        assert logits["mel"] == max(logits.values())

    def test_bcc_scenario_bcc_logit_is_highest(self):
        logits, _ = expert_rule_logits(BCC_SYMPTOMS)
        assert logits["bcc"] == max(logits.values())

    def test_akiec_scenario_akiec_in_top_two(self):
        logits, _ = expert_rule_logits(AKIEC_SYMPTOMS)
        sorted_classes = sorted(logits, key=logits.get, reverse=True)
        assert "akiec" in sorted_classes[:2]

    def test_nv_scenario_nv_logit_is_highest(self):
        logits, _ = expert_rule_logits(NV_SYMPTOMS)
        assert logits["nv"] == max(logits.values())

    def test_bkl_scenario_bkl_in_top_two(self):
        logits, _ = expert_rule_logits(BKL_SYMPTOMS)
        sorted_classes = sorted(logits, key=logits.get, reverse=True)
        assert "bkl" in sorted_classes[:2]

    def test_df_scenario_df_in_top_two(self):
        logits, _ = expert_rule_logits(DF_SYMPTOMS)
        sorted_classes = sorted(logits, key=logits.get, reverse=True)
        assert "df" in sorted_classes[:2]

    def test_vasc_scenario_vasc_beats_mel_and_bcc(self):
        logits, _ = expert_rule_logits(VASC_SYMPTOMS)
        assert logits["vasc"] > logits["mel"]
        assert logits["vasc"] > logits["bcc"]


# ---------------------------------------------------------------------------
# TestExpertRuleLogitsEdgeCases
# ---------------------------------------------------------------------------
class TestExpertRuleLogitsEdgeCases:
    def test_bleeding_true_increases_mel_logit(self):
        with_bleeding, _ = expert_rule_logits({"bleeding": True})
        without_bleeding, _ = expert_rule_logits({"bleeding": False})
        assert with_bleeding["mel"] > without_bleeding["mel"]

    def test_bleeding_false_increases_nv_logit(self):
        no_bleed, _ = expert_rule_logits({"bleeding": False})
        bleed, _ = expert_rule_logits({"bleeding": True})
        assert no_bleed["nv"] > bleed["nv"]

    def test_rapid_change_true_increases_mel(self):
        r, _ = expert_rule_logits({"rapid_change": True})
        s, _ = expert_rule_logits({"rapid_change": False})
        assert r["mel"] > s["mel"]

    def test_stable_evolution_increases_nv(self):
        stable, _ = expert_rule_logits({"evolution_speed": "stable"})
        rapid, _ = expert_rule_logits({"evolution_speed": "rapid"})
        assert stable["nv"] > rapid["nv"]

    def test_nodular_elevation_increases_bcc(self):
        nod, _ = expert_rule_logits({"elevation": "nodular"})
        flat, _ = expert_rule_logits({"elevation": "flat"})
        assert nod["bcc"] > flat["bcc"]

    def test_crusting_true_increases_akiec(self):
        c, _ = expert_rule_logits({"crusting": True})
        nc, _ = expert_rule_logits({"crusting": False})
        assert c["akiec"] > nc.get("akiec", 0.0)

    def test_ulceration_true_increases_bcc(self):
        u, _ = expert_rule_logits({"ulceration": True})
        nu, _ = expert_rule_logits({})
        assert u["bcc"] > nu["bcc"]

    def test_age_over_60_increases_bcc_and_akiec(self):
        old, _ = expert_rule_logits({"patient_age": 70})
        young, _ = expert_rule_logits({"patient_age": 25})
        assert old["bcc"] > young["bcc"]
        assert old["akiec"] > young["akiec"]

    def test_age_under_40_increases_nv(self):
        young, _ = expert_rule_logits({"patient_age": 25})
        old, _ = expert_rule_logits({"patient_age": 70})
        assert young["nv"] > old["nv"]

    def test_face_body_site_increases_bcc_and_akiec(self):
        face, _ = expert_rule_logits({"body_site": "face"})
        leg, _ = expert_rule_logits({"body_site": "leg"})
        assert face["bcc"] > leg["bcc"]
        assert face["akiec"] > leg["akiec"]

    def test_trunk_body_site_increases_bkl_and_vasc(self):
        trunk, _ = expert_rule_logits({"body_site": "trunk"})
        face, _ = expert_rule_logits({"body_site": "face"})
        assert trunk["bkl"] > face["bkl"]
        assert trunk["vasc"] > face["vasc"]

    def test_high_itching_increases_bkl(self):
        hi, _ = expert_rule_logits({"itching_0_10": 8})
        lo, _ = expert_rule_logits({"itching_0_10": 1})
        assert hi["bkl"] > lo["bkl"]

    def test_large_border_irregularity_increases_mel(self):
        irr, _ = expert_rule_logits({"border_0_10": 9})
        reg, _ = expert_rule_logits({"border_0_10": 1})
        assert irr["mel"] > reg["mel"]

    def test_multicolor_increases_mel(self):
        mc, _ = expert_rule_logits({"num_colors": 4})
        sc, _ = expert_rule_logits({"num_colors": 1})
        assert mc["mel"] > sc["mel"]


# ---------------------------------------------------------------------------
# TestBuildExpertFusionOutput
# ---------------------------------------------------------------------------
FLAT_MODEL_PROBS = {c: 1.0 / 7 for c in HAM10000_CLASSES}

MEL_MODEL_PROBS = [
    {"label": "mel", "prob": 0.72},
    {"label": "nv",  "prob": 0.18},
    {"label": "bkl", "prob": 0.10},
]

NV_MODEL_PROBS = [
    {"label": "nv",  "prob": 0.85},
    {"label": "bkl", "prob": 0.09},
    {"label": "df",  "prob": 0.06},
]


class TestBuildExpertFusionOutput:
    def test_returns_required_top_level_keys(self):
        result = build_expert_fusion_output({}, FLAT_MODEL_PROBS)
        for key in ("model_probabilities", "expert_probabilities",
                    "final_combined_probabilities", "most_likely_disease",
                    "top_3_diseases", "medical_reasoning"):
            assert key in result, f"Missing key: {key}"

    def test_model_probabilities_sum_to_one(self):
        result = build_expert_fusion_output({}, FLAT_MODEL_PROBS)
        total = sum(result["model_probabilities"].values())
        assert total == pytest.approx(1.0, abs=1e-5)

    def test_expert_probabilities_sum_to_one(self):
        result = build_expert_fusion_output(MEL_SYMPTOMS, FLAT_MODEL_PROBS)
        total = sum(result["expert_probabilities"].values())
        assert total == pytest.approx(1.0, abs=1e-5)

    def test_final_combined_probabilities_sum_to_one(self):
        result = build_expert_fusion_output(MEL_SYMPTOMS, MEL_MODEL_PROBS)
        total = sum(result["final_combined_probabilities"].values())
        assert total == pytest.approx(1.0, abs=1e-5)

    def test_top_3_diseases_has_three_items(self):
        result = build_expert_fusion_output({}, FLAT_MODEL_PROBS)
        assert len(result["top_3_diseases"]) == 3

    def test_most_likely_disease_has_required_fields(self):
        result = build_expert_fusion_output(MEL_SYMPTOMS, MEL_MODEL_PROBS)
        mld = result["most_likely_disease"]
        assert "code" in mld
        assert "name" in mld
        assert "probability" in mld

    def test_most_likely_code_is_valid_ham_class(self):
        result = build_expert_fusion_output(MEL_SYMPTOMS, MEL_MODEL_PROBS)
        assert result["most_likely_disease"]["code"] in HAM10000_CLASSES

    def test_mel_model_and_mel_symptoms_predicts_mel(self):
        result = build_expert_fusion_output(MEL_SYMPTOMS, MEL_MODEL_PROBS)
        assert result["most_likely_disease"]["code"] == "mel"

    def test_nv_model_no_symptoms_predicts_nv(self):
        result = build_expert_fusion_output(NV_SYMPTOMS, NV_MODEL_PROBS)
        assert result["most_likely_disease"]["code"] == "nv"

    def test_high_suspicion_increases_expert_weight(self):
        high_sus_symptoms = {
            "bleeding": True, "ulceration": True, "rapid_change": True,
            "border_0_10": 9, "num_colors": 4, "width_mm": 12,
        }
        low_sus_symptoms = {}

        high = build_expert_fusion_output(high_sus_symptoms, FLAT_MODEL_PROBS)
        low = build_expert_fusion_output(low_sus_symptoms, FLAT_MODEL_PROBS)

        high_ew = high["medical_reasoning"]["fusion_weights"]["expert_weight"]
        low_ew = low["medical_reasoning"]["fusion_weights"]["expert_weight"]
        assert high_ew > low_ew

    def test_dict_format_model_probs_accepted(self):
        result = build_expert_fusion_output({}, FLAT_MODEL_PROBS)
        assert "final_combined_probabilities" in result

    def test_list_format_model_probs_accepted(self):
        result = build_expert_fusion_output({}, MEL_MODEL_PROBS)
        assert "final_combined_probabilities" in result

    def test_empty_model_probs_falls_back_gracefully(self):
        result = build_expert_fusion_output({}, {})
        total = sum(result["final_combined_probabilities"].values())
        assert total == pytest.approx(1.0, abs=1e-5)

    def test_medical_reasoning_has_fusion_weights(self):
        result = build_expert_fusion_output(MEL_SYMPTOMS, MEL_MODEL_PROBS)
        fw = result["medical_reasoning"]["fusion_weights"]
        assert "model_weight" in fw
        assert "expert_weight" in fw
        assert "suspicion_strength" in fw
