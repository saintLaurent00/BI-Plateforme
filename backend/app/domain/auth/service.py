from app.domain.schemas import User, Role
from typing import Dict, List, Optional

class AuthService:
    def __init__(self):
        self.roles: Dict[str, Role] = {
            "admin": Role(id="admin", name="Administrator", permissions=["*"]),
            "viewer": Role(id="viewer", name="Viewer", permissions=["dataset:read"]),
        }

        self.users: Dict[str, User] = {
            "user_south": User(
                id="u1",
                username="jean_sud",
                role_id="viewer",
                security_attributes={"region": "Sud"}
            ),
            "user_north": User(
                id="u2",
                username="marie_nord",
                role_id="viewer",
                security_attributes={"region": "North"}
            ),
            "manager_all": User(
                id="m1",
                username="directeur_general",
                role_id="viewer",
                security_attributes={"region": "*"} # Wildcard: Access to all regions
            ),
            "manager_multi": User(
                id="m2",
                username="manager_sud_nord",
                role_id="viewer",
                security_attributes={"region": ["Sud", "North"]} # Multiple values
            ),
            "admin_user": User(
                id="u3",
                username="admin",
                role_id="admin",
                security_attributes={} # Admins see everything
            )
        }

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.users.get(username)

    def get_role(self, role_id: str) -> Optional[Role]:
        return self.roles.get(role_id)
