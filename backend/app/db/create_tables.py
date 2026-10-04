from app.db.database import Base, engine
from app.models.artifact import Artifact
from app.models.provenance_event import ProvenanceEvent


Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")