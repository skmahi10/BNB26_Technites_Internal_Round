from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from services.trust_analyzer import analyze_trust_data
from services.testing_analyzer import analyze_testing_data

app = FastAPI(title="ModelLedger AI Analysis Engine")

# --- Schemas ---
class TrustAnalysisRequest(BaseModel):
    model_id: str
    version: str
    artifact_hash: str
    metadata: dict

class TestingAnalysisRequest(BaseModel):
    model_id: str
    version: str
    test_type: str
    test_data_summary: dict

class AIAnalysisResponse(BaseModel):
    consistency_score: float
    risk_score: int
    confidence: float
    anomaly_detected: bool
    classification: str
    evidence: List[str]

# --- Endpoints ---
@app.post("/api/v1/analyze/trust", response_model=AIAnalysisResponse)
async def analyze_trust(request: TrustAnalysisRequest):
    """
    Evaluates artifact characteristics and provenance information.
    """
    result = analyze_trust_data(
        request.model_id, 
        request.version, 
        request.artifact_hash, 
        request.metadata
    )
    return AIAnalysisResponse(**result)

@app.post("/api/v1/analyze/testing", response_model=AIAnalysisResponse)
async def analyze_testing(request: TestingAnalysisRequest):
    """
    Evaluates test records and quality metrics.
    """
    result = analyze_testing_data(
        request.test_type, 
        request.test_data_summary
    )
    return AIAnalysisResponse(**result)