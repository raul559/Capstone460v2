"""
Unit tests for MYCIN-style certainty factor logic in certainty_factors.py.
Covers: clamp_cf, cf_and, cf_or, apply_rule, cf_combine, build_evidence_from_model,
build_evidence_from_intake, get_skinai_rules, evaluate_rules, and SkinAI integration
scenarios for all 7 disease types.
"""
import pytest
from certainty_factors import (
    clamp_cf,
    cf_and,
    cf_or,
    apply_rule,
    cf_combine,
    build_evidence_from_model,
    build_evidence_from_intake,
    get_skinai_rules,
    evaluate_rules,
    Rule,
)


# ---------------------------------------------------------------------------
# clamp_cf
# ---------------------------------------------------------------------------
class TestClampCf:
    def test_below_minus_one_returns_minus_one(self):
        assert clamp_cf(-2.0) == -1.0

    def test_above_one_returns_one(self):
        assert clamp_cf(1.5) == 1.0

    def test_exactly_minus_one_unchanged(self):
        assert clamp_cf(-1.0) == -1.0

    def test_exactly_one_unchanged(self):
        assert clamp_cf(1.0) == 1.0

    def test_zero_unchanged(self):
        assert clamp_cf(0.0) == 0.0

    def test_midrange_unchanged(self):
        assert clamp_cf(0.6) == pytest.approx(0.6)


# ---------------------------------------------------------------------------
# cf_and
# ---------------------------------------------------------------------------
class TestCfAnd:
    def test_empty_list_returns_zero(self):
        assert cf_and([]) == 0.0

    def test_single_value_returns_that_value(self):
        assert cf_and([0.7]) == pytest.approx(0.7)

    def test_returns_minimum(self):
        assert cf_and([0.8, 0.5, 0.9]) == pytest.approx(0.5)

    def test_with_negative_values(self):
        assert cf_and([-0.8, 0.6]) == pytest.approx(-0.8)


# ---------------------------------------------------------------------------
# cf_or
# ---------------------------------------------------------------------------
class TestCfOr:
    def test_empty_list_returns_zero(self):
        assert cf_or([]) == 0.0

    def test_single_value_returns_that_value(self):
        assert cf_or([0.4]) == pytest.approx(0.4)

    def test_returns_maximum(self):
        assert cf_or([0.3, 0.9, 0.5]) == pytest.approx(0.9)

    def test_with_mixed_signs(self):
        assert cf_or([-0.5, 0.3]) == pytest.approx(0.3)


# ---------------------------------------------------------------------------
# apply_rule
# ---------------------------------------------------------------------------
class TestApplyRule:
    def test_multiplies_evidence_by_rule_cf(self):
        assert apply_rule(0.8, 0.5) == pytest.approx(0.4)

    def test_result_clamped_to_one(self):
        assert apply_rule(1.0, 1.0) == pytest.approx(1.0)

    def test_result_clamped_below_minus_one(self):
        assert apply_rule(-1.0, 1.0) == pytest.approx(-1.0)

    def test_raises_value_error_if_rule_cf_above_one(self):
        with pytest.raises(ValueError):
            apply_rule(0.5, 1.1)

    def test_raises_value_error_if_rule_cf_negative(self):
        with pytest.raises(ValueError):
            apply_rule(0.5, -0.1)

    def test_zero_rule_cf_returns_zero(self):
        assert apply_rule(0.9, 0.0) == pytest.approx(0.0)

    def test_zero_evidence_returns_zero(self):
        assert apply_rule(0.0, 0.8) == pytest.approx(0.0)


# ---------------------------------------------------------------------------
# cf_combine
# ---------------------------------------------------------------------------
class TestCfCombine:
    def test_both_positive(self):
        # cf1 + cf2*(1-cf1) = 0.6 + 0.5*0.4 = 0.80
        assert cf_combine(0.6, 0.5) == pytest.approx(0.80)

    def test_both_negative(self):
        # cf1 + cf2*(1+cf1) = -0.6 + (-0.5)*0.4 = -0.80
        assert cf_combine(-0.6, -0.5) == pytest.approx(-0.80)

    def test_mixed_signs(self):
        # (0.6 + (-0.3)) / (1 - min(0.6, 0.3)) = 0.3 / 0.7 ≈ 0.4286
        result = cf_combine(0.6, -0.3)
        assert result == pytest.approx(0.3 / 0.7, abs=1e-6)

    def test_result_clamped_to_one(self):
        assert cf_combine(0.9, 0.9) <= 1.0

    def test_result_clamped_to_minus_one(self):
        assert cf_combine(-0.9, -0.9) >= -1.0

    def test_zero_with_positive(self):
        # 0 + cf2*(1-0) = cf2
        assert cf_combine(0.0, 0.7) == pytest.approx(0.7)

    def test_symmetry_both_positive(self):
        assert cf_combine(0.4, 0.6) == pytest.approx(cf_combine(0.6, 0.4))


# ---------------------------------------------------------------------------
# build_evidence_from_model
# ---------------------------------------------------------------------------
class TestBuildEvidenceFromModel:
    def test_returns_img_prefixed_facts(self):
        result = build_evidence_from_model([{"label": "mel", "prob": 0.62}])
        assert "img_mel" in result

    def test_empty_list_returns_empty_dict(self):
        assert build_evidence_from_model([]) == {}

    def test_prob_above_one_clamped(self):
        result = build_evidence_from_model([{"label": "mel", "prob": 1.5}])
        assert result["img_mel"] <= 1.0

    def test_prob_below_zero_clamped(self):
        result = build_evidence_from_model([{"label": "mel", "prob": -0.2}])
        assert result["img_mel"] >= 0.0

    def test_missing_prob_defaults_to_zero(self):
        result = build_evidence_from_model([{"label": "mel"}])
        assert result["img_mel"] == pytest.approx(0.0)

    def test_multiple_labels(self):
        topk = [
            {"label": "mel", "prob": 0.62},
            {"label": "nv",  "prob": 0.27},
            {"label": "bkl", "prob": 0.11},
        ]
        result = build_evidence_from_model(topk)
        assert "img_mel" in result
        assert "img_nv" in result
        assert "img_bkl" in result


# ---------------------------------------------------------------------------
# build_evidence_from_intake
# ---------------------------------------------------------------------------
class TestBuildEvidenceFromIntake:
    def test_rapid_change_true_maps_to_0_7(self):
        result = build_evidence_from_intake({"rapid_change": True})
        assert result["rapid_change"] == pytest.approx(0.7)

    def test_bleeding_true_maps_to_0_6(self):
        result = build_evidence_from_intake({"bleeding": True})
        assert result["bleeding"] == pytest.approx(0.6)

    def test_itching_true_maps_to_0_3(self):
        result = build_evidence_from_intake({"itching": True})
        assert result["itching"] == pytest.approx(0.3)

    def test_pain_true_maps_to_0_4(self):
        result = build_evidence_from_intake({"pain": True})
        assert result["pain"] == pytest.approx(0.4)

    def test_false_symptoms_map_to_zero(self):
        result = build_evidence_from_intake({
            "rapid_change": False, "bleeding": False,
            "itching": False, "pain": False,
        })
        for v in result.values():
            assert v == pytest.approx(0.0)

    def test_missing_symptoms_default_to_zero(self):
        result = build_evidence_from_intake({})
        assert all(v == pytest.approx(0.0) for v in result.values())

    def test_all_true_returns_four_facts(self):
        result = build_evidence_from_intake({
            "rapid_change": True, "bleeding": True,
            "itching": True, "pain": True,
        })
        assert len(result) == 4


# ---------------------------------------------------------------------------
# get_skinai_rules
# ---------------------------------------------------------------------------
class TestGetSkinaiRules:
    def test_returns_13_rules(self):
        rules = get_skinai_rules()
        assert len(rules) == 13

    def test_all_rule_ids_unique(self):
        rules = get_skinai_rules()
        ids = [r.id for r in rules]
        assert len(ids) == len(set(ids))

    def test_all_rule_cfs_in_zero_one(self):
        rules = get_skinai_rules()
        for r in rules:
            assert 0.0 <= r.rule_cf <= 1.0, f"Rule {r.id} has invalid rule_cf {r.rule_cf}"

    def test_all_operators_valid(self):
        rules = get_skinai_rules()
        for r in rules:
            assert r.operator in ("AND", "OR"), f"Rule {r.id} has invalid operator"

    def test_r_mel_rapid_premises(self):
        rules = {r.id: r for r in get_skinai_rules()}
        r = rules["R_MEL_RAPID"]
        assert "img_mel" in r.premises
        assert "rapid_change" in r.premises

    def test_r_mel_bleed_premises(self):
        rules = {r.id: r for r in get_skinai_rules()}
        r = rules["R_MEL_BLEED"]
        assert "img_mel" in r.premises
        assert "bleeding" in r.premises

    def test_r_needs_review_uses_or(self):
        rules = {r.id: r for r in get_skinai_rules()}
        r = rules["R_NEEDS_REVIEW"]
        assert r.operator == "OR"
        assert r.conclusion == "needs_clinician_review"


# ---------------------------------------------------------------------------
# evaluate_rules
# ---------------------------------------------------------------------------
class TestEvaluateRules:
    def test_empty_rules_returns_evidence_unchanged(self):
        evidence = {"img_mel": 0.5}
        facts, trace = evaluate_rules(evidence, [])
        assert facts["img_mel"] == pytest.approx(0.5)
        assert trace == []

    def test_empty_evidence_no_rules_fire(self):
        rules = get_skinai_rules()
        facts, trace = evaluate_rules({}, rules)
        assert trace == []

    def test_rule_with_missing_premise_is_skipped(self):
        rule = Rule(id="R_TEST", premises=["missing_fact"], operator="AND",
                    rule_cf=0.9, conclusion="test_conclusion")
        facts, trace = evaluate_rules({"other_fact": 0.8}, [rule])
        assert "test_conclusion" not in facts
        assert trace == []

    def test_trace_has_entry_per_fired_rule(self):
        evidence = {"img_mel": 0.7, "rapid_change": 0.7,
                    "bleeding": 0.0, "itching": 0.0, "pain": 0.0}
        _, trace = evaluate_rules(evidence, get_skinai_rules())
        assert len(trace) >= 1

    def test_trace_entry_contains_required_keys(self):
        evidence = {"img_mel": 0.7, "rapid_change": 0.7,
                    "bleeding": 0.0, "itching": 0.0, "pain": 0.0}
        _, trace = evaluate_rules(evidence, get_skinai_rules())
        for entry in trace:
            for key in ("rule_id", "operator", "premises", "premise_cfs",
                        "rule_cf", "conclusion", "contrib_cf", "new_conclusion_cf"):
                assert key in entry

    def test_chained_rule_fires_needs_review(self):
        # R_NEEDS_REVIEW requires BOTH high_risk_flag AND moderate_risk_flag present.
        # img_mel triggers high_risk; img_bcc triggers moderate_risk.
        evidence = {"img_mel": 0.80, "img_bcc": 0.40,
                    "rapid_change": 0.7, "bleeding": 0.6,
                    "itching": 0.0, "pain": 0.0}
        facts, _ = evaluate_rules(evidence, get_skinai_rules())
        assert facts.get("needs_clinician_review", 0.0) > 0.5

    def test_invalid_operator_raises_value_error(self):
        rule = Rule(id="R_BAD", premises=["img_mel"], operator="XOR",
                    rule_cf=0.5, conclusion="x")
        with pytest.raises(ValueError):
            evaluate_rules({"img_mel": 0.5}, [rule])


# ---------------------------------------------------------------------------
# SkinAI Rules Integration — one scenario per disease
# ---------------------------------------------------------------------------
class TestSkinAIRulesIntegration:

    def _run(self, evidence):
        return evaluate_rules(evidence, get_skinai_rules())

    def _base_intake(self, **overrides):
        base = {"rapid_change": 0.0, "bleeding": 0.0, "itching": 0.0, "pain": 0.0}
        base.update(overrides)
        return base

    # mel — high risk
    def test_mel_high_risk_with_rapid_change_and_bleeding(self):
        evidence = {
            "img_mel": 0.72, **self._base_intake(rapid_change=0.7, bleeding=0.6)
        }
        facts, _ = self._run(evidence)
        assert facts.get("high_risk_flag", 0) > 0
        assert facts.get("high_risk_flag", 0) > facts.get("low_risk_flag", 0)

    def test_mel_triggers_clinician_review(self):
        # R_NEEDS_REVIEW fires only when both high_risk_flag AND moderate_risk_flag are present.
        evidence = {
            "img_mel": 0.72, "img_bcc": 0.35,
            **self._base_intake(rapid_change=0.7, bleeding=0.6)
        }
        facts, _ = self._run(evidence)
        assert facts.get("needs_clinician_review", 0) > 0.5

    # bcc — moderate risk
    def test_bcc_alone_triggers_moderate_risk(self):
        evidence = {"img_bcc": 0.60, **self._base_intake()}
        facts, _ = self._run(evidence)
        assert facts.get("moderate_risk_flag", 0) > 0

    # akiec — moderate risk
    def test_akiec_alone_triggers_moderate_risk(self):
        evidence = {"img_akiec": 0.55, **self._base_intake()}
        facts, _ = self._run(evidence)
        assert facts.get("moderate_risk_flag", 0) > 0

    # nv stable — low risk
    def test_nv_stable_triggers_low_risk(self):
        evidence = {"img_nv": 0.85, **self._base_intake()}
        facts, _ = self._run(evidence)
        assert facts.get("low_risk_flag", 0) > 0
        assert facts.get("low_risk_flag", 0) > facts.get("moderate_risk_flag", 0)

    # nv with rapid change — bumped to moderate
    def test_nv_with_rapid_change_triggers_moderate(self):
        evidence = {"img_nv": 0.70, **self._base_intake(rapid_change=0.7)}
        facts, _ = self._run(evidence)
        assert facts.get("moderate_risk_flag", 0) > 0

    # bkl — low risk
    def test_bkl_triggers_low_risk(self):
        evidence = {"img_bkl": 0.70, **self._base_intake()}
        facts, _ = self._run(evidence)
        assert facts.get("low_risk_flag", 0) > 0

    # df — low risk
    def test_df_triggers_low_risk(self):
        evidence = {"img_df": 0.75, **self._base_intake()}
        facts, _ = self._run(evidence)
        assert facts.get("low_risk_flag", 0) > 0

    # vasc — low risk
    def test_vasc_triggers_low_risk(self):
        evidence = {"img_vasc": 0.80, **self._base_intake()}
        facts, _ = self._run(evidence)
        assert facts.get("low_risk_flag", 0) > 0
