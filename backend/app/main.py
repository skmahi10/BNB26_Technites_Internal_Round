from fastapi import FastAPI

from app.api.routes.artifacts import router as artifacts_router
from app.api.routes.provenance import router as provenance_router
from app.api.routes import verification

app = FastAPI(
    title="ModelLedger API",
    description="Backend API for AI model provenance, testing, and verification.",
    version="0.1.0",
)


app.include_router(artifacts_router)
app.include_router(provenance_router)
app.include_router(verification.router) 


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "modelledger-backend",
    }