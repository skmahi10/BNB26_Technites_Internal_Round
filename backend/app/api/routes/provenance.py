from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.artifact import Artifact
from app.models.provenance_event import ProvenanceEvent
from app.services.blockchain.service import BlockchainService


router = APIRouter(
    prefix="/api/provenance",
    tags=["Provenance"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("")
def create_provenance_event(
    artifact_id: str,
    action: str,
    model_id: str | None = None,
    parent_hash: str | None = None,
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

    # If no model ID is supplied, use the artifact's claimed model.
    blockchain_model_id = model_id or artifact.claimed_model

    if not blockchain_model_id:
        raise HTTPException(
            status_code=400,
            detail="model_id is required for blockchain provenance",
        )

    # Write the artifact hash to the blockchain.
    try:
        blockchain = BlockchainService()

        tx = blockchain.register_model(
            blockchain_model_id,
            artifact.sha256_hash,
            "1.0.0",
        )

        blockchain_tx = tx["transactionHash"]

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Blockchain registration failed: {str(exc)}",
        )

    # Store the provenance event together with the blockchain transaction.
    event = ProvenanceEvent(
        event_id=f"evt_{uuid4().hex[:12]}",
        artifact_id=artifact_id,
        parent_hash=parent_hash,
        model_id=blockchain_model_id,
        action=action,
        blockchain_tx=blockchain_tx,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "eventId": event.event_id,
        "artifactId": event.artifact_id,
        "parentHash": event.parent_hash,
        "modelId": event.model_id,
        "action": event.action,
        "createdAt": event.created_at,
        "blockchainTx": event.blockchain_tx,
    }


@router.get("/{artifact_id}")
def get_provenance(
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

    return {
        "artifactId": artifact_id,
        "artifactHash": artifact.sha256_hash,
        "events": [
            {
                "eventId": event.event_id,
                "parentHash": event.parent_hash,
                "modelId": event.model_id,
                "action": event.action,
                "createdAt": event.created_at,
                "blockchainTx": event.blockchain_tx,
            }
            for event in events
        ],
    }