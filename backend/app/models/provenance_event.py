from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ProvenanceEvent(Base):
    __tablename__ = "provenance_events"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    event_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    artifact_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("artifacts.artifact_id"),
        nullable=False,
        index=True,
    )

    parent_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    model_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    signature: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    blockchain_tx: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )