from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Security
from app.domain.auth.service import AuthService
from app.domain.schemas import User

auth_service = AuthService()

def get_current_user(request: Request) -> Optional[User]:
    username = request.headers.get("X-User")
    if not username:
        raise HTTPException(status_code=401, detail="Authentication required")

    user = auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
