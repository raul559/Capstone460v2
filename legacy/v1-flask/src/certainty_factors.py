"""
MYCIN-style Certainty Factor (CF) reasoning module.

Implements core CF utilities and a rule evaluation engine based on MYCIN's
certainty factor model for handling uncertainty in expert systems.
"""

from dataclasses import dataclass
from typing import Optional


def clamp_cf(x: float) -> float:
    """
    Clamp a certainty factor value to [-1, 1].
    
    Args:
        x: The value to clamp.
    
    Returns:
        The clamped value in [-1, 1].
    """
    return max(-1.0, min(1.0, x))


def cf_and(cfs: list[float]) -> float:
    """
    Compute AND combination of certainty factors.
    
    Returns the minimum CF value. If the list is empty, returns 0.0.
    
    Args:
        cfs: List of certainty factor values.
    
    Returns:
        The minimum CF, or 0.0 if list is empty.
    """
    return min(cfs) if cfs else 0.0


def cf_or(cfs: list[float]) -> float:
    """
    Compute OR combination of certainty factors.
    
    Returns the maximum CF value. If the list is empty, returns 0.0.
    
    Args:
        cfs: List of certainty factor values.
    
    Returns:
        The maximum CF, or 0.0 if list is empty.
    """
    return max(cfs) if cfs else 0.0


def apply_rule(evidence_cf: float, rule_cf: float) -> float:
    """
    Apply a rule's certainty factor to an evidence certainty factor.
    
    Computes evidence_cf * rule_cf and clamps the result to [-1, 1].
    
    Args:
        evidence_cf: The certainty factor of the premise evidence.
        rule_cf: The rule's intrinsic certainty factor (must be in [0, 1]).
    
    Returns:
        The clamped result of evidence_cf * rule_cf.
    
    Raises:
        ValueError: If rule_cf is not in [0, 1].
    """
    if not (0.0 <= rule_cf <= 1.0):
        raise ValueError(f"rule_cf must be in [0, 1], got {rule_cf}")
    return clamp_cf(evidence_cf * rule_cf)


def cf_combine(cf1: float, cf2: float) -> float:
    """
    Combine two certainty factors using MYCIN's combination rule.
    
    Applies different formulas based on the signs of cf1 and cf2:
    - Both positive: cf1 + cf2 * (1 - cf1)
    - Both negative: cf1 + cf2 * (1 + cf1)
    - Mixed signs: (cf1 + cf2) / (1 - min(|cf1|, |cf2|))
    
    Handles edge cases where the denominator would be zero.
    
    Args:
        cf1: First certainty factor.
        cf2: Second certainty factor.
    
    Returns:
        The combined certainty factor, clamped to [-1, 1].
    """
    if cf1 > 0 and cf2 > 0:
        # Both positive
        result = cf1 + cf2 * (1 - cf1)
    elif cf1 < 0 and cf2 < 0:
        # Both negative
        result = cf1 + cf2 * (1 + cf1)
    else:
        # Mixed signs
        denominator = 1.0 - min(abs(cf1), abs(cf2))
        if denominator == 0:
            # Edge case: avoid division by zero
            result = clamp_cf(cf1 + cf2)
        else:
            result = (cf1 + cf2) / denominator
    
    return clamp_cf(result)


@dataclass
class Rule:
    """
    Represents a rule in the expert system.
    
    Attributes:
        id: Unique identifier for the rule.
        premises: List of premise (fact) identifiers.
        operator: Combination operator: "AND" or "OR".
        rule_cf: The rule's intrinsic certainty factor (0..1).
        conclusion: The conclusion (fact) identifier.
    """
    id: str
    premises: list[str]
    operator: str
    rule_cf: float
    conclusion: str


def evaluate_rules(
    evidence: dict[str, float],
    rules: list[Rule]
) -> tuple[dict[str, float], list[dict]]:
    """
    Evaluate a set of rules against evidence using MYCIN CF reasoning.
    
    Processes each rule in order. For each rule, evaluates whether all
    premises are available in the current facts. If so, combines their
    CFs using the rule's operator, applies the rule CF, and updates
    the conclusion fact. Multiple rules can contribute to the same
    conclusion; their CFs are combined.
    
    Args:
        evidence: Dictionary of initial fact CFs (clamped to [-1, 1]).
        rules: List of Rule objects to evaluate.
    
    Returns:
        A tuple of (final_facts, trace) where:
        - final_facts: Dict of all facts and their final CFs.
        - trace: List of rule evaluation records, each containing:
          - rule_id, operator, premises, premise_cfs, premise_cf,
            rule_cf, conclusion, contrib_cf, previous_conclusion_cf,
            new_conclusion_cf.
    
    Raises:
        ValueError: If any rule has an invalid operator or rule_cf.
    """
    # Initialize facts with clamped evidence
    facts = {key: clamp_cf(value) for key, value in evidence.items()}
    trace = []
    
    for rule in rules:
        # Validate rule
        if rule.operator not in ("AND", "OR"):
            raise ValueError(f"Invalid operator '{rule.operator}'. Must be 'AND' or 'OR'.")
        if not (0.0 <= rule.rule_cf <= 1.0):
            raise ValueError(f"Rule {rule.id} has invalid rule_cf: {rule.rule_cf}")
        
        # Check if all premises are available
        if not all(premise in facts for premise in rule.premises):
            continue
        
        # Gather premise CFs
        premise_cfs = [facts[premise] for premise in rule.premises]
        
        # Compute premise CF based on operator
        if rule.operator == "AND":
            premise_cf = cf_and(premise_cfs)
        else:  # "OR"
            premise_cf = cf_or(premise_cfs)
        
        # Apply rule CF
        contrib_cf = apply_rule(premise_cf, rule.rule_cf)
        
        # Update conclusion
        previous_conclusion_cf = facts.get(rule.conclusion)
        if rule.conclusion in facts:
            new_conclusion_cf = cf_combine(facts[rule.conclusion], contrib_cf)
        else:
            new_conclusion_cf = contrib_cf
        
        facts[rule.conclusion] = new_conclusion_cf
        
        # Record trace
        trace_entry = {
            "rule_id": rule.id,
            "operator": rule.operator,
            "premises": rule.premises,
            "premise_cfs": premise_cfs,
            "premise_cf": premise_cf,
            "rule_cf": rule.rule_cf,
            "conclusion": rule.conclusion,
            "contrib_cf": contrib_cf,
            "previous_conclusion_cf": previous_conclusion_cf,
            "new_conclusion_cf": new_conclusion_cf,
        }
        trace.append(trace_entry)
    
    return facts, trace


def build_evidence_from_model(topk: list[dict]) -> dict[str, float]:
    """
    Build CF evidence from model predictions.
    
    Converts model output (list of label/probability pairs) into CF facts.
    Clamps probabilities to [0, 1], then treats as positive CF values in [-1, 1].
    
    Args:
        topk: List of dicts with "label" and "prob" keys.
              Example: [{"label": "mel", "prob": 0.62}, ...]
    
    Returns:
        Dict of CF facts like {"img_mel": 0.62, "img_nv": 0.27, ...}
    """
    evidence = {}
    for item in topk:
        label = item.get("label", "").strip()
        prob = item.get("prob", 0.0)
        # Clamp to [0, 1]
        prob = max(0.0, min(1.0, prob))
        # Create fact with "img_" prefix
        fact_name = f"img_{label}"
        evidence[fact_name] = clamp_cf(prob)
    return evidence


def build_evidence_from_intake(intake: dict) -> dict[str, float]:
    """
    Build CF evidence from user intake form responses.
    
    Maps user answers (True/False) to CF values:
    - rapid_change=True -> 0.7
    - bleeding=True -> 0.6
    - itching=True -> 0.3
    - pain=True -> 0.4
    - Missing or False -> 0.0
    
    Args:
        intake: Dict of user answers, e.g., {"rapid_change": True, "bleeding": False, ...}
    
    Returns:
        Dict of CF facts like {"rapid_change": 0.7, "bleeding": 0.0, ...}
    """
    # Define CF mappings for each symptom
    symptom_cf_map = {
        "rapid_change": 0.7,
        "bleeding": 0.6,
        "itching": 0.3,
        "pain": 0.4,
    }
    
    evidence = {}
    for symptom, cf_value in symptom_cf_map.items():
        # Use 0.0 if missing or False, otherwise use the mapped CF value
        if intake.get(symptom, False):
            evidence[symptom] = cf_value
        else:
            evidence[symptom] = 0.0
    
    return evidence


def get_skinai_rules() -> list[Rule]:
    """
    Return a list of clinical rules for SkinAI diagnosis.
    
    Rules integrate model predictions (img_* facts) and clinical intake
    (rapid_change, bleeding, etc.) to reach clinical conclusions
    (high_risk_flag, moderate_risk_flag, etc.).
    
    Uses HAM10000 label categories:
    - mel: melanoma
    - nv: nevus
    - bkl: benign keratosis
    - bcc: basal cell carcinoma
    - akiec: actinic keratosis
    - df: dermatofibroma
    - vasc: vascular lesion
    
    Returns:
        List of Rule objects.
    """
    return [
        # High-risk rules
        Rule(
            id="R_MEL_RAPID",
            premises=["img_mel", "rapid_change"],
            operator="AND",
            rule_cf=0.85,
            conclusion="high_risk_flag"
        ),
        Rule(
            id="R_MEL_BLEED",
            premises=["img_mel", "bleeding"],
            operator="AND",
            rule_cf=0.9,
            conclusion="high_risk_flag"
        ),
        Rule(
            id="R_MEL_ALONE",
            premises=["img_mel"],
            operator="AND",
            rule_cf=0.75,
            conclusion="high_risk_flag"
        ),
        
        # Moderate-risk rules
        Rule(
            id="R_BCC_AKIEC",
            premises=["img_bcc", "img_akiec"],
            operator="OR",
            rule_cf=0.65,
            conclusion="moderate_risk_flag"
        ),
        Rule(
            id="R_BCC_ALONE",
            premises=["img_bcc"],
            operator="AND",
            rule_cf=0.6,
            conclusion="moderate_risk_flag"
        ),
        Rule(
            id="R_AKIEC_ALONE",
            premises=["img_akiec"],
            operator="AND",
            rule_cf=0.58,
            conclusion="moderate_risk_flag"
        ),
        Rule(
            id="R_NV_RAPID",
            premises=["img_nv", "rapid_change"],
            operator="AND",
            rule_cf=0.55,
            conclusion="moderate_risk_flag"
        ),
        Rule(
            id="R_NV_BLEED",
            premises=["img_nv", "bleeding"],
            operator="AND",
            rule_cf=0.65,
            conclusion="moderate_risk_flag"
        ),
        
        # Low-risk rules
        Rule(
            id="R_NV_STABLE",
            premises=["img_nv"],
            operator="AND",
            rule_cf=0.6,
            conclusion="low_risk_flag"
        ),
        Rule(
            id="R_BKL_ALONE",
            premises=["img_bkl"],
            operator="AND",
            rule_cf=0.65,
            conclusion="low_risk_flag"
        ),
        Rule(
            id="R_VASC_ALONE",
            premises=["img_vasc"],
            operator="AND",
            rule_cf=0.7,
            conclusion="low_risk_flag"
        ),
        Rule(
            id="R_DF_ALONE",
            premises=["img_df"],
            operator="AND",
            rule_cf=0.75,
            conclusion="low_risk_flag"
        ),
        
        # Clinical review trigger
        Rule(
            id="R_NEEDS_REVIEW",
            premises=["high_risk_flag", "moderate_risk_flag"],
            operator="OR",
            rule_cf=0.75,
            conclusion="needs_clinician_review"
        ),
    ]


def _print_trace(trace: list[dict]) -> None:
    """Pretty-print rule evaluation trace."""
    print("\nExecution Trace:")
    for i, entry in enumerate(trace, 1):
        print(f"\n  Step {i}: Rule {entry['rule_id']}")
        print(f"    Operator: {entry['operator']}")
        print(f"    Premises: {entry['premises']}")
        print(f"    Premise CFs: {[f'{cf:.4f}' for cf in entry['premise_cfs']]}")
        print(f"    Premise CF ({entry['operator']}): {entry['premise_cf']:.4f}")
        print(f"    Rule CF: {entry['rule_cf']:.2f}")
        print(f"    Contribution CF: {entry['contrib_cf']:.4f}")
        prev = entry['previous_conclusion_cf']
        if prev is not None:
            print(f"    Previous '{entry['conclusion']}' CF: {prev:.4f}")
            print(f"    Combined CF: {entry['new_conclusion_cf']:.4f}")
        else:
            print(f"    New conclusion: {entry['conclusion']} = {entry['new_conclusion_cf']:.4f}")


def _demo_computer_diagnostic() -> None:
    """Demo: Simple diagnostic expert system for a computer problem."""
    print("=" * 70)
    print("MYCIN-style Certainty Factor Reasoning Demo")
    print("=" * 70)
    
    # Initial evidence: symptoms and observations
    evidence = {
        "slow_performance": 0.8,  # System is slow (high confidence)
        "high_memory_usage": 0.7,  # Memory usage is high
        "disk_full": 0.9,          # Disk is full (very high confidence)
    }
    
    print("\nInitial Evidence:")
    for fact, cf in evidence.items():
        print(f"  {fact}: {cf:.2f}")
    
    # Define rules
    rules = [
        Rule(
            id="R1",
            premises=["high_memory_usage", "slow_performance"],
            operator="AND",
            rule_cf=0.85,
            conclusion="memory_problem"
        ),
        Rule(
            id="R2",
            premises=["disk_full"],
            operator="AND",
            rule_cf=0.9,
            conclusion="storage_problem"
        ),
        Rule(
            id="R3",
            premises=["memory_problem", "storage_problem"],
            operator="OR",
            rule_cf=0.75,
            conclusion="system_needs_maintenance"
        ),
        Rule(
            id="R4",
            premises=["slow_performance"],
            operator="AND",
            rule_cf=0.6,
            conclusion="memory_problem"
        ),
    ]
    
    print("\nRules:")
    for rule in rules:
        print(f"  {rule.id}: IF {rule.operator}({', '.join(rule.premises)}) "
              f"THEN {rule.conclusion} (CF: {rule.rule_cf})")
    
    # Evaluate rules
    final_facts, trace = evaluate_rules(evidence, rules)
    
    print("\nFinal Facts:")
    for fact, cf in sorted(final_facts.items()):
        print(f"  {fact}: {cf:.4f}")
    
    _print_trace(trace)
    print("\n" + "=" * 70)


def _demo_skinai() -> None:
    """Demo: SkinAI diagnosis using model predictions and clinical intake."""
    print("=" * 70)
    print("SkinAI Diagnosis Demo (MYCIN-style CF Reasoning)")
    print("=" * 70)
    
    # Mock model output (top-k predictions from skin lesion classifier)
    model_output = [
        {"label": "mel", "prob": 0.62},
        {"label": "nv", "prob": 0.27},
        {"label": "bkl", "prob": 0.11},
    ]
    
    # Mock user intake responses
    intake = {
        "rapid_change": True,
        "bleeding": False,
        "itching": True,
        "pain": False,
    }
    
    print("\nModel Predictions:")
    for item in model_output:
        print(f"  {item['label']}: {item['prob']:.2f}")
    
    print("\nUser Intake:")
    for key, value in intake.items():
        print(f"  {key}: {value}")
    
    # Build evidence from model and intake
    model_evidence = build_evidence_from_model(model_output)
    intake_evidence = build_evidence_from_intake(intake)
    evidence = {**model_evidence, **intake_evidence}
    
    print("\nCombined Evidence (CF facts):")
    for fact, cf in sorted(evidence.items()):
        print(f"  {fact}: {cf:.4f}")
    
    # Get SkinAI rules
    rules = get_skinai_rules()
    
    print(f"\nRules ({len(rules)} total):")
    for rule in rules:
        print(f"  {rule.id}: IF {rule.operator}({', '.join(rule.premises)}) "
              f"THEN {rule.conclusion} (CF: {rule.rule_cf})")
    
    # Evaluate rules
    final_facts, trace = evaluate_rules(evidence, rules)
    
    print("\nFinal Facts (sorted by CF value):")
    sorted_facts = sorted(final_facts.items(), key=lambda x: abs(x[1]), reverse=True)
    for fact, cf in sorted_facts:
        status = ""
        if fact in ["high_risk_flag", "moderate_risk_flag", "low_risk_flag", "needs_clinician_review"]:
            if cf > 0.5:
                status = " ✓ TRIGGERED"
        print(f"  {fact}: {cf:.4f}{status}")
    
    _print_trace(trace)
    print("\n" + "=" * 70)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--skinai":
        _demo_skinai()
    else:
        _demo_computer_diagnostic()
