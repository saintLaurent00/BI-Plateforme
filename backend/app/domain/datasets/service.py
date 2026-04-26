"""
📂 Dataset Service (Domain)
-------------------------
Gère l'accès et la résolution des jeux de données BI.
Communique avec le Metadata Repository pour récupérer les définitions persistées (SQL).
Gère également le contrôle d'accès au niveau des datasets.
"""

from app.domain.schemas import Dataset
from app.infrastructure.database.repository import MetadataRepository
from app.infrastructure.database.session import SessionLocal
from typing import List, Dict, Optional

class DatasetService:
    def __init__(self):
        # On pourrait passer la DB en paramètre, mais pour simplifier on ouvre une session
        self.db = SessionLocal()
        self.repo = MetadataRepository(self.db)

        # Mappe dataset -> allowed roles (à terme en DB aussi)
        self.dataset_permissions: Dict[str, List[str]] = {
            "transactions": ["admin", "viewer", "analyst"]
        }

    def get_all(self) -> List[Dataset]:
        return self.repo.get_all_datasets()

    def get_by_name(self, name: str) -> Optional[Dataset]:
        return self.repo.get_dataset_by_name(name)

    def is_allowed(self, dataset_name: str, role_id: str) -> bool:
        allowed_roles = self.dataset_permissions.get(dataset_name, [])
        return "admin" in role_id or role_id in allowed_roles

    def __del__(self):
        self.db.close()
