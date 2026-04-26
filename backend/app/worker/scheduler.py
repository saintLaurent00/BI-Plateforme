"""
⏰ Alert & Task Scheduler (Background Worker)
-------------------------------------------
Moteur de tâches asynchrones piloté par la base de données.
Il synchronise périodiquement les 'ScheduledJobs' depuis la Méta DB et les exécute.
Supporte la surveillance de métriques et le déclenchement d'alertes.
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger("BI-Plateforme.Scheduler")

class ScheduledJob(BaseModel):
    id: str
    name: str
    dataset: str
    metric: str
    threshold: float
    operator: str # '>', '<', '=='
    interval_seconds: int
    last_run: Optional[datetime] = None

class AlertSystem:
    def __init__(self, query_service):
        self.query_service = query_service
        self._running = False

    async def _run_job(self, job: ScheduledJob):
        from app.infrastructure.database.session import SessionLocal
        from app.infrastructure.database.repository import MetadataRepository

        logger.info(f"Running job: {job.name}")

        current_value = 150.0 # Simulation

        triggered = False
        if job.operator == '>' and current_value > job.threshold:
            triggered = True
        elif job.operator == '<' and current_value < job.threshold:
            triggered = True

        if triggered:
            logger.warning(f"🚨 ALERT TRIGGERED: {job.name} - Value {current_value} {job.operator} {job.threshold}")

        db = SessionLocal()
        repo = MetadataRepository(db)
        repo.update_job_last_run(job.id, datetime.now())
        db.close()

    async def start(self):
        from app.infrastructure.database.session import SessionLocal
        from app.infrastructure.database.repository import MetadataRepository

        self._running = True
        logger.info("Scheduler started (Syncing with Metadata Store)")

        while self._running:
            db = SessionLocal()
            repo = MetadataRepository(db)
            jobs = repo.get_active_jobs()
            db.close()

            now = datetime.now()
            for job in jobs:
                if job.last_run is None or (now - job.last_run).total_seconds() >= job.interval_seconds:
                    asyncio.create_task(self._run_job(job))

            await asyncio.sleep(10)

    def stop(self):
        self._running = False
        logger.info("Scheduler stopped")
