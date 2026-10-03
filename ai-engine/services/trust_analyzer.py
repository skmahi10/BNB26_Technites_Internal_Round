import re

def analyze_trust_data(model_id: str, version: str, artifact_hash: str, metadata: dict) -> dict:
    evidence = []
    risk_score = 0
    anomaly_detected = False

    # 1. Artifact Hash Validation (Check if it matches a standard hex pattern)
    if not re.match(r"^(0x)?[a-fA-F0-9]{40,64}$", artifact_hash):
        evidence.append(f"Warning: Artifact hash '{artifact_hash}' does not match standard 40-64 char hex format.")
        risk_score += 40
        anomaly_detected = True
    else:
        evidence.append("Artifact hash format is structurally valid.")

    # 2. Metadata Completeness Check
    expected_keys = ["framework", "author", "creation_date"]
    missing_keys = [k for k in expected_keys if k not in metadata]
    
    if missing_keys:
        evidence.append(f"Missing expected metadata fields: {', '.join(missing_keys)}.")
        risk_score += (15 * len(missing_keys))
    else:
        evidence.append("Metadata structure is complete.")

    consistency_score = max(0.0, round(1.0 - (risk_score / 100), 2))
    
    if risk_score < 30:
        classification = "CONSISTENT"
    elif risk_score > 60:
        classification = "ANOMALOUS"
    else:
        classification = "NEEDS_REVIEW"

    return {
        "consistency_score": consistency_score,
        "risk_score": min(risk_score, 100),
        "confidence": 0.85, 
        "anomaly_detected": anomaly_detected,
        "classification": classification,
        "evidence": evidence
    }