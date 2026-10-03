import pickle
import numpy as np
import os

# Load the model once when the service starts
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/anomaly_detector.pkl')
try:
    with open(MODEL_PATH, 'rb') as f:
        anomaly_model = pickle.load(f)
except FileNotFoundError:
    anomaly_model = None

def analyze_testing_data(test_type: str, test_data_summary: dict) -> dict:
    evidence = []
    risk_score = 0
    accuracy = test_data_summary.get("accuracy", 0.0)
    error_rate = test_data_summary.get("error_rate", 1.0)

    # 1. Base rule checks
    if accuracy < 0.70:
        evidence.append(f"Low accuracy warning ({accuracy}).")
        risk_score += 30
    if error_rate > 0.20:
        evidence.append(f"Error rate is elevated ({error_rate}).")
        risk_score += 25

    # 2. ML Anomaly Detection (Isolation Forest)
    is_anomaly = False
    if anomaly_model:
        # Reshape data for scikit-learn
        X_test = np.array([[accuracy, error_rate]])
        prediction = anomaly_model.predict(X_test)
        
        # -1 indicates an anomaly, 1 indicates normal
        if prediction[0] == -1:
            is_anomaly = True
            evidence.append("ML Anomaly Detector flagged these metrics as highly unusual compared to historical data.")
            risk_score += 40
    else:
        evidence.append("Warning: ML model not loaded. Falling back to rule-based analysis.")

    consistency_score = max(0.0, round(1.0 - (risk_score / 100), 2))
    classification = "HIGH_RISK" if risk_score >= 40 else "ACCEPTABLE_RISK"

    return {
        "consistency_score": consistency_score,
        "risk_score": min(risk_score, 100),
        "confidence": 0.92 if anomaly_model else 0.75,
        "anomaly_detected": is_anomaly,
        "classification": classification,
        "evidence": evidence
    }