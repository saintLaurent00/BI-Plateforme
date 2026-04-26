"""
⚙️ Configuration Globale (Core)
----------------------------
Gère les variables d'environnement et les paramètres par défaut de l'application.
Utilise Pydantic Settings pour une validation stricte des types.
"""

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BI-Plateforme"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-prism-key")
    DB_PATH: str = "bi_platform.db"
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    class Config:
        case_sensitive = True

settings = Settings()
