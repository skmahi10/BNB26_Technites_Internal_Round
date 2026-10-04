from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.artifact import Artifact
from app.models.provenance_event import ProvenanceEvent
from app.services.blockchain.service import BlockchainService


router = APIRouter(
    prefix="/api/verify",
    tags=["Verification"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{artifact_id}")
def verify_artifact(
    artifact_id: str,
    db: Session = Depends(get_db),
):
    artifact = db.scalar(
        select(Artifact).where(
            Artifact.artifact_id == artifact_id
        )
    )

    if artifact is None:
        raise HTTPException(
            status_code=404,
            detail="Artifact not found",
        )

    events = db.scalars(
        select(ProvenanceEvent)
        .where(
            ProvenanceEvent.artifact_id == artifact_id
        )
        .order_by(ProvenanceEvent.created_at)
    ).all()

    blockchain_verified = False
    hash_match = False
    blockchain_tx = None

    if events:
        latest_event = events[-1]
        blockchain_tx = latest_event.blockchain_tx

        if latest_event.model_id:
            try:
                blockchain = BlockchainService()

                hash_match = blockchain.verify_model_hash(
                    latest_event.model_id,
                    artifact.sha256_hash,
                )

                blockchain_verified = hash_match

            except Exception:
                blockchain_verified = False
                hash_match = False

    if blockchain_verified and hash_match:
        status = "TRUSTED"
        trust_level = "BLOCKCHAIN_VERIFIED"
        tamper_detected = False
    elif events:
        status = "TAMPERED"
        trust_level = "UNVERIFIABLE"
        tamper_detected = True
    else:
        status = "UNVERIFIABLE"
        trust_level = "SELF_ASSERTED"
        tamper_detected = False

    return {
        "artifactId": artifact.artifact_id,
        "status": status,
        "trustLevel": trust_level,
        "blockchainVerified": blockchain_verified,
        "hashMatch": hash_match,
        "tamperDetected": tamper_detected,
        "blockchainTx": blockchain_tx,
        "artifactHash": artifact.sha256_hash,
        "modelId": events[-1].model_id if events else artifact.claimed_model,
        "provenanceEvents": len(events),
    }