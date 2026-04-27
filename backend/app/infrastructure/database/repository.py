"""
🏛️ Metadata Repository (Infrastructure)
--------------------------------------
Couche d'accès aux données (DAL) pour le Metadata Store.
Assure la conversion entre les modèles SQLAlchemy et les schémas de domaine Pydantic.
Centralise toutes les opérations CRUD sur l'identité, le scheduling et la sémantique.
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.infrastructure.database.models import (
    DatasetModel, ColumnModel, MetricModel,
    UserModel, RoleModel, PermissionModel,
    ScheduledJobModel, CachePolicyModel
)
from app.domain.schemas import Dataset, DatasetColumn, DatasetMetric, User, Role

class MetadataRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- Dataset Methods ---
    def get_dataset_by_name(self, name: str) -> Optional[Dataset]:
        db_dataset = self.db.query(DatasetModel).filter(DatasetModel.name == name).first()
        if not db_dataset:
            return None

        return Dataset(
            name=db_dataset.name,
            table_name=db_dataset.table_name,
            kind=db_dataset.kind,
            sql=db_dataset.sql,
            columns=[
                DatasetColumn(
                    name=c.name,
                    label=c.label or c.name,
                    type=c.type,
                    expression=c.expression,
                    is_visible=c.is_visible,
                    security_scope=c.security_scope,
                    description=c.description
                ) for c in db_dataset.columns
            ],
            metrics=[
                DatasetMetric(name=m.name, expression=m.expression, description=m.description)
                for m in db_dataset.metrics
            ]
        )

    def get_all_datasets(self) -> List[Dataset]:
        db_datasets = self.db.query(DatasetModel).all()
        return [self.get_dataset_by_name(ds.name) for ds in db_datasets]

    def create_dataset(self, dataset: Dataset):
        # Delete existing if any to allow updates (MVP style)
        self.db.query(DatasetModel).filter(DatasetModel.name == dataset.name).delete()

        db_dataset = DatasetModel(
            id=dataset.name,
            name=dataset.name,
            table_name=dataset.table_name,
            kind=dataset.kind,
            sql=dataset.sql
        )
        self.db.add(db_dataset)

        for col in dataset.columns:
            db_col = ColumnModel(
                id=f"{dataset.name}_{col.name}_{len(db_dataset.columns)}", # Unique ID
                dataset_id=db_dataset.id,
                name=col.name,
                label=col.label,
                type=col.type,
                expression=col.expression,
                is_visible=col.is_visible,
                security_scope=col.security_scope
            )
            self.db.add(db_col)

        for met in dataset.metrics:
            db_met = MetricModel(
                id=f"{dataset.name}_{met.name}",
                dataset_id=db_dataset.id,
                name=met.name,
                expression=met.expression
            )
            self.db.add(db_met)

        self.db.commit()

    # --- User & Security Methods ---
    def get_user_by_username(self, username: str) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.username == username).first()
        if not db_user:
            return None

        return User(
            id=db_user.id,
            username=db_user.username,
            role_id=db_user.role_id,
            security_attributes=db_user.security_attributes or {}
        )

    def get_role_permissions(self, role_id: str) -> List[str]:
        db_role = self.db.query(RoleModel).filter(RoleModel.id == role_id).first()
        if not db_role:
            return []
        return [p.id for p in db_role.permissions]

    # --- Scheduling Methods ---
    def get_active_jobs(self) -> List[Any]:
        from app.worker.scheduler import ScheduledJob
        db_jobs = self.db.query(ScheduledJobModel).filter(ScheduledJobModel.is_enabled == True).all()
        return [
            ScheduledJob(
                id=j.id,
                name=j.name,
                dataset=j.dataset,
                metric=j.metric,
                threshold=j.threshold,
                operator=j.operator,
                interval_seconds=j.interval_seconds,
                last_run=j.last_run
            ) for j in db_jobs
        ]

    def update_job_last_run(self, job_id: str, last_run_dt):
        db_job = self.db.query(ScheduledJobModel).filter(ScheduledJobModel.id == job_id).first()
        if db_job:
            db_job.last_run = last_run_dt
            self.db.commit()

    # --- Cache Policy Methods ---
    def get_cache_policy(self, dataset_name: str) -> Optional[int]:
        policy = self.db.query(CachePolicyModel).filter(CachePolicyModel.dataset_name == dataset_name).first()
        if policy and policy.is_enabled:
            return policy.ttl
        return None

    # --- Creation Helpers (Admin) ---
    def create_user(self, user_data: Dict[str, Any]):
        db_user = UserModel(**user_data)
        self.db.add(db_user)
        self.db.commit()
        return db_user

    def create_job(self, job: Any):
        db_job = ScheduledJobModel(
            id=job.id,
            name=job.name,
            dataset=job.dataset,
            metric=job.metric,
            threshold=job.threshold,
            operator=job.operator,
            interval_seconds=job.interval_seconds
        )
        self.db.add(db_job)
        self.db.commit()
