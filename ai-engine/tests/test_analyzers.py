import pytest
from services.trust_analyzer import analyze_trust_data
from services.testing_analyzer import analyze_testing_data

def test_trust_analyzer_valid_input():
    """Test with perfect provenance data."""
    result = analyze_trust_data(
        model_id="ML-001",
        version="v1.0",
        artifact_hash="0x1234567890abcdef1234567890abcdef12345678",
        metadata={"framework": "PyTorch", "author": "Faizan", "creation_date": "2026-10-04"}
    )
    assert result["anomaly_detected"] is False
    assert result["classification"] == "CONSISTENT"
    assert result["risk_score"] == 0

def test_trust_analyzer_missing_metadata():
    """Test the missing metadata scenario required by the PR checklist."""
    result = analyze_trust_data(
        model_id="ML-002",
        version="v1.1",
        artifact_hash="0x1234567890abcdef1234567890abcdef12345678",
        metadata={}
    )
    assert result["risk_score"] == 45  # 15 * 3 missing keys
    assert result["classification"] == "NEEDS_REVIEW"

def test_trust_analyzer_tampered_hash():
    """Test suspicious/tampered artifacts (invalid hash)."""
    result = analyze_trust_data(
        model_id="ML-003",
        version="v2.0",
        artifact_hash="short-invalid-hash",
        metadata={"framework": "TensorFlow", "author": "Team", "creation_date": "2026-10-04"}
    )
    assert result["anomaly_detected"] is True
    assert result["risk_score"] == 40
    assert result["classification"] == "NEEDS_REVIEW"

def test_testing_analyzer_high_risk():
    """Test anomalous lifecycle testing metrics."""
    result = analyze_testing_data(
        test_type="security_audit",
        test_data_summary={"accuracy": 0.65, "error_rate": 0.25}
    )
    assert result["classification"] == "HIGH_RISK"
    assert result["anomaly_detected"] is True  # The ML model now catches this!
    assert result["risk_score"] == 95  # 30 (acc) + 25 (err) + 40 (ML anomaly penalty)