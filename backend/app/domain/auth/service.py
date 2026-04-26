"""
👥 Auth Service (Domain)
----------------------
Gère la validation des identités et la résolution des permissions.
S'appuie sur le Metadata Repository pour accéder aux données utilisateurs en SQL.
"""

from app.domain.schemas import User, Role
from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.repository import MetadataRepository
from typing import Dict, List, Optional

class AuthService:
    def __init__(self):
        # Pour le MVP on ouvre une session.
        # En production on utiliserait une dépendance injectée.
        self.db = SessionLocal()
        self.repo = MetadataRepository(self.db)

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.repo.get_user_by_username(username)

    def get_user_permissions(self, user: User) -> List[str]:
        return self.repo.get_role_permissions(user.role_id)

    def __del__(self):
        self.db.close()
