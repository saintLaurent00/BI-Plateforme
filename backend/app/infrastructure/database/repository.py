from sqlalchemy.orm import Session
from typing import List, Optional
from app.infrastructure.database.models import DatasetModel, ColumnModel, MetricModel
from app.domain.schemas import Dataset, DatasetColumn, DatasetMetric

class MetadataRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_dataset_by_name(self, name: str) -> Optional[Dataset]:
        db_dataset = self.db.query(DatasetModel).filter(DatasetModel.name == name).first()
        if not db_dataset:
            return None

        return Dataset(
            name=db_dataset.name,
            table_name=db_dataset.table_name,
            columns=[
                DatasetColumn(
                    name=c.name,
                    type=c.type,
                    expression=c.expression,
                    security_scope=c.security_scope,
                    description=c.description
                ) for c in db_dataset.columns
            ],
            metrics=[
                DatasetMetric(
                    name=m.name,
                    expression=m.expression,
                    description=m.description
                ) for m in db_dataset.metrics
            ]
        )

    def get_all_datasets(self) -> List[Dataset]:
        db_datasets = self.db.query(DatasetModel).all()
        return [
            Dataset(
                name=ds.name,
                table_name=ds.table_name,
                columns=[
                    DatasetColumn(name=c.name, type=c.type, expression=c.expression, security_scope=c.security_scope)
                    for c in ds.columns
                ],
                metrics=[
                    DatasetMetric(name=m.name, expression=m.expression)
                    for m in ds.metrics
                ]
            ) for ds in db_datasets
        ]

    def create_dataset(self, dataset: Dataset):
        db_dataset = DatasetModel(
            id=dataset.name, # Use name as ID for simplicity in MVP
            name=dataset.name,
            table_name=dataset.table_name
        )
        self.db.add(db_dataset)

        for col in dataset.columns:
            db_col = ColumnModel(
                id=f"{dataset.name}_{col.name}",
                dataset_id=db_dataset.id,
                name=col.name,
                type=col.type,
                expression=col.expression,
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
