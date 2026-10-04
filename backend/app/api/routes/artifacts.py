from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.artifact import Artifact
from app.services.artifact_service import register_artifact


router = APIRouter(
    prefix="/api/artifacts",
    tags=["Artifacts"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("")
async def create_artifact(
    file: UploadFile = File(...),
    claimed_model: str | None = Form(None),
    artifact_type: str | None = Form(None),
    db: Session = Depends(get_db),
):
    file_content = await file.read()

    result = register_artifact(
        db=db,
        file_content=file_content,
        filename=file.filename,
        claimed_model=claimed_model,
        artifact_type=artifact_type,
    )

    return {
        "artifactId": result["artifactId"],
        "filename": result["filename"],
        "artifactType": result["artifactType"],
        "sha256Hash": result["sha256Hash"],
        "status": result["status"],
    }


@router.get("/{artifact_id}")
def get_artifact(
    artifact_id: str,
    db: Session = Depends(get_db),
):
    artifact = db.scalar(
        select(Artifact).where(Artifact.artifact_id == artifact_id)
    )

    if artifact is None:
        raise HTTPException(
            status_code=404,
            detail="Artifact not found",
        )

    return {
        "artifactId": artifact.artifact_id,
        "filename": artifact.filename,
        "artifactType": artifact.artifact_type,
        "claimedModel": artifact.claimed_model,
        "sha256Hash": artifact.sha256_hash,
        "storageLocation": artifact.storage_location,
        "status": artifact.status,
        "createdAt": artifact.created_at,
    }