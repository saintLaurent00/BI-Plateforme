from __future__ import annotations

from fastapi import APIRouter

from app.datasets.registry import DatasetRegistry

router = APIRouter(prefix="/api", tags=["datasets"])
registry = DatasetRegistry()


@router.get("/datasets")
def list_datasets() -> list[dict[str, object]]:
    datasets = registry.list()
    return [
        {
            "name": dataset.name,
            "table_name": dataset.table_name,
            "columns": list(dataset.columns.keys()),
            "metrics": list(dataset.metrics.keys()),
        }
        for dataset in datasets
    ]
