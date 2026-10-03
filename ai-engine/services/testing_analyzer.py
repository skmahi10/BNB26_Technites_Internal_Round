def analyze_testing_data(test_type: str, test_data_summary: dict) -> dict:
    evidence = []
    risk_score = 0

    # Extract metrics (defaulting to safe values if not present)
    accuracy = test_data_summary.get("accuracy")
    error_rate = test_data_summary.get("error_rate")

    if accuracy is not None:
        if accuracy >= 0.90:
            evidence.append(f"High accuracy reported ({accuracy}).")
        elif accuracy < 0.70:
            evidence.append(f"Low accuracy warning ({accuracy}).")
            risk_score += 30
            
    if error_rate is not None:
        if error_rate > 0.20:
            evidence.append(f"Error rate is elevated ({error_rate}).")
            risk_score += 25

    if accuracy is None and error_rate is None:
        evidence.append("Missing core performance metrics in test summary.")
        risk_score += 50

    consistency_score = max(0.0, round(1.0 - (risk_score / 100), 2))
    classification = "ACCEPTABLE_RISK" if risk_score < 30 else "HIGH_RISK"

    return {
        "consistency_score": consistency_score,
        "risk_score": min(risk_score, 100),
        "confidence": 0.90,
        "anomaly_detected": risk_score > 40,
        "classification": classification,
        "evidence": evidence
    }