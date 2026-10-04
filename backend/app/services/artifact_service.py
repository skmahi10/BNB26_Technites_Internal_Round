import hashlib
from pathlib import Path
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.artifact import Artifact


UPLOAD_DIR = Path("storage/artifacts")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def register_artifact(
    db: Session,
    file_content: bytes,
    filename: str,
    claimed_model: str | None = None,
    artifact_type: str | None = None,
) -> dict:
    """
    Save an uploaded artifact, generate its SHA-256 hash,
    and create the corresponding database record.
    """

    artifact_id = f"art_{uuid4().hex[:12]}"

    sha256_hash = hashlib.sha256(file_content).hexdigest()

    safe_filename = Path(filename).name
    artifact_path = UPLOAD_DIR / f"{artifact_id}_{safe_filename}"

    artifact_path.write_bytes(file_content)

    artifact = Artifact(
        artifact_id=artifact_id,
        filename=safe_filename,
        artifact_type=artifact_type,
        claimed_model=claimed_model,
        sha256_hash=sha256_hash,
        storage_location=str(artifact_path),
        status="REGISTERED",
    )

    db.add(artifact)
    db.commit()
    db.refresh(artifact)

    return {
        "artifactId": artifact.artifact_id,
        "filename": artifact.filename,
        "artifactType": artifact.artifact_type,
        "claimedModel": artifact.claimed_model,
        "sha256Hash": artifact.sha256_hash,
        "storageLocation": artifact.storage_location,
        "status": artifact.status,
    }