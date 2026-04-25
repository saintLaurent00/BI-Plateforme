from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.infrastructure.database.models import Base

# Pour le moment on utilise SQLite pour les métadonnées aussi (prism_meta.db)
META_DB_URL = f"sqlite:///prism_meta.db"

engine = create_engine(META_DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_meta_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
