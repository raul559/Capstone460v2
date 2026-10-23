"""
SkinAI Analyzer: High-level interface for skin lesion analysis using MYCIN-style CF reasoning.

Integrates model predictions and clinical intake data to provide risk assessment
and clinician review recommendations.
"""

from certainty_factors import (
    build_evidence_from_model,
    build_evidence_from_intake,
    get_skinai_rules,
    evaluate_rules,
)


def analyze_skin_lesion(topk: list[dict], intake: dict) -> dict:
    """
    Analyze a skin lesion using model predictions and clinical intake.
    
    Combines image classification results with clinical history to determine
    risk level and whether clinician review is needed.
    
    Args:
        topk: List of model predictions, e.g.,
              [{"label": "mel", "prob": 0.62}, {"label": "nv", "prob": 0.27}]
        intake: Dict of user intake responses, e.g.,
                {"rapid_change": True, "bleeding": False, "itching": True, "pain": False}
    
    Returns:
        Dict with:
        - primary_result: "clinician_review", "high_risk", "moderate_risk", or "low_risk"
        - facts: Dict of all derived certainty factors
        - trace: List of rule evaluation steps
    """
    # Build evidence from model and intake
    model_evidence = build_evidence_from_model(topk)
    intake_evidence = build_evidence_from_intake(intake)
    evidence = {**model_evidence, **intake_evidence}
    
    # Evaluate rules
    final_facts, trace = evaluate_rules(evidence, get_skinai_rules())
    
    # Determine primary result based on CF thresholds
    needs_review_cf = final_facts.get("needs_clinician_review", 0.0)
    high_risk_cf = final_facts.get("high_risk_flag", 0.0)
    moderate_risk_cf = final_facts.get("moderate_risk_flag", 0.0)
    low_risk_cf = final_facts.get("low_risk_flag", 0.0)
    
    if needs_review_cf > 0.5:
        primary_result = "clinician_review"
    elif high_risk_cf > moderate_risk_cf:
        primary_result = "high_risk"
    elif moderate_risk_cf > low_risk_cf:
        primary_result = "moderate_risk"
    else:
        primary_result = "low_risk"
    
    return {
        "primary_result": primary_result,
        "facts": final_facts,
        "trace": trace,
    }


def _print_result(result: dict) -> None:
    """Pretty-print analysis result."""
    print("\n" + "=" * 70)
    print("ANALYSIS RESULT")
    print("=" * 70)
    
    primary = result["primary_result"]
    print(f"\nPrimary Result: {primary.upper()}")
    
    # Print key facts
    print("\nKey Clinical Indicators:")
    key_facts = [
        "needs_clinician_review",
        "high_risk_flag",
        "moderate_risk_flag",
        "low_risk_flag",
    ]
    for fact in key_facts:
        cf = result["facts"].get(fact, 0.0)
        if cf > 0.0:
            status = "✓ TRIGGERED" if cf > 0.5 else ""
            print(f"  {fact}: {cf:.4f} {status}")
    
    # Print evidence summary
    print("\nEvidence Summary:")
    img_facts = {k: v for k, v in result["facts"].items() if k.startswith("img_")}
    symptom_facts = {k: v for k, v in result["facts"].items() if k in [
        "rapid_change", "bleeding", "itching", "pain"
    ]}
    
    if img_facts:
        print("  Model Predictions:")
        for fact, cf in sorted(img_facts.items()):
            print(f"    {fact}: {cf:.4f}")
    
    if symptom_facts:
        print("  Clinical Symptoms:")
        for fact, cf in sorted(symptom_facts.items()):
            if cf > 0.0:
                print(f"    {fact}: {cf:.4f}")
    
    # Print trace
    print("\nReasoning Trace:")
    for i, entry in enumerate(result["trace"], 1):
        print(f"\n  Step {i}: {entry['rule_id']}")
        print(f"    IF {entry['operator']}({', '.join(entry['premises'])})")
        print(f"      → {entry['conclusion']}")
        print(f"    Premise CF: {entry['premise_cf']:.4f} × Rule CF: {entry['rule_cf']:.2f} = {entry['contrib_cf']:.4f}")
        if entry['previous_conclusion_cf'] is not None:
            print(f"    Combined: {entry['previous_conclusion_cf']:.4f} + {entry['contrib_cf']:.4f} = {entry['new_conclusion_cf']:.4f}")
        else:
            print(f"    New: {entry['new_conclusion_cf']:.4f}")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    # Demo with mock data (same as certainty_factors.py --skinai)
    print("=" * 70)
    print("SkinAI Analyzer Demo")
    print("=" * 70)
    
    model_output = [
        {"label": "mel", "prob": 0.62},
        {"label": "nv", "prob": 0.27},
        {"label": "bkl", "prob": 0.11},
    ]
    
    intake_data = {
        "rapid_change": True,
        "bleeding": False,
        "itching": True,
        "pain": False,
    }
    
    print("\nInput Data:")
    print("\n  Model Predictions:")
    for item in model_output:
        print(f"    {item['label']}: {item['prob']:.2f}")
    
    print("\n  User Intake:")
    for key, value in intake_data.items():
        print(f"    {key}: {value}")
    
    # Run analysis
    result = analyze_skin_lesion(model_output, intake_data)
    _print_result(result)
