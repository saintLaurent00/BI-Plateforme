"""
🚀 BI-Plateforme : Point d'Entrée Principal du Backend
---------------------------------------------------
Ce fichier orchestre le démarrage de l'application FastAPI, la configuration des middlewares,
l'initialisation de la base de données analytique (SQLite) et le lancement des services de fond.

Organisation :
- Configuration des logs structurés (JSON-like avec contexte utilisateur).
- Initialisation des plugins dynamiques.
- Initialisation de la base de données analytique de démonstration.
- Lancement du Scheduler d'alertes asynchrone.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.endpoints import router as api_router
from app.core.config import settings
import sqlite3
import pandas as pd
import logging
import os

# Configuration des logs structurés
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(user)s: %(message)s'
)

class ContextFilter(logging.Filter):
    def filter(self, record):
        if not hasattr(record, 'user'):
            record.user = 'System'
        return True

logger = logging.getLogger("BI-Plateforme")
logger.addFilter(ContextFilter())

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Service du Frontend (Fichiers Statiques)
# On vérifie si le dossier dist existe (après npm run build)
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

    @app.exception_handler(404)
    async def spa_fallback(request, exc):
        # Fallback pour les routes SPA (React Router)
        return FileResponse("dist/index.html")

def init_db():
    conn = sqlite3.connect(settings.DB_PATH)
    data = [
        {"id": 1, "date": "2024-01-01", "category": "Food", "amount": 50, "merchant": "Whole Foods", "region": "Sud"},
        {"id": 2, "date": "2024-01-02", "category": "Tech", "amount": 1200, "merchant": "Apple", "region": "North"},
        {"id": 3, "date": "2024-01-03", "category": "Food", "amount": 30, "merchant": "Trader Joes", "region": "Sud"},
        {"id": 4, "date": "2024-01-04", "category": "Transport", "amount": 15, "merchant": "Uber", "region": "North"},
        {"id": 5, "date": "2024-01-05", "category": "Tech", "amount": 200, "merchant": "Amazon", "region": "Sud"},
    ]
    df = pd.DataFrame(data)
    df.to_sql("transactions", conn, if_exists="replace", index=False)
    conn.close()

@app.on_event("startup")
async def startup_event():
    from app.core.plugins.manager import plugin_manager
    from app.worker.scheduler import AlertSystem, ScheduledJob
    from app.api.endpoints import query_service
    import asyncio

    plugin_manager.load_plugins()
    init_db()

    # Initialisation du Scheduler d'alertes (chargement depuis la Méta DB)
    alert_system = AlertSystem(query_service)

    # Lancement du scheduler en tâche de fond
    asyncio.create_task(alert_system.start())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
