import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any
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
    last_run: datetime = None

class AlertSystem:
    def __init__(self, query_service):
        self.query_service = query_service
        self.jobs: List[ScheduledJob] = []
        self._running = False

    def add_job(self, job: ScheduledJob):
        self.jobs.append(job)
        logger.info(f"Added scheduled job: {job.name} (every {job.interval_seconds}s)")

    async def _run_job(self, job: ScheduledJob):
        logger.info(f"Running job: {job.name}")
        # Simulation d'une requête pour vérifier un seuil
        # Dans un vrai système, on utiliserait query_service.execute_query
        # Ici on simule pour l'exemple
        current_value = 150.0 # Simulation

        triggered = False
        if job.operator == '>' and current_value > job.threshold:
            triggered = True
        elif job.operator == '<' and current_value < job.threshold:
            triggered = True

        if triggered:
            logger.warning(f"🚨 ALERT TRIGGERED: {job.name} - Value {current_value} {job.operator} {job.threshold}")
            # Ici on enverrait un email/Slack/Webhook

        job.last_run = datetime.now()

    async def start(self):
        self._running = True
        logger.info("Scheduler started")
        while self._running:
            now = datetime.now()
            for job in self.jobs:
                if job.last_run is None or (now - job.last_run).total_seconds() >= job.interval_seconds:
                    asyncio.create_task(self._run_job(job))

            await asyncio.sleep(10) # Tick toutes les 10 secondes

    def stop(self):
        self._running = False
        logger.info("Scheduler stopped")
