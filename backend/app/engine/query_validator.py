from __future__ import annotations

from fastapi import HTTPException

from app.schemas.dataset import DatasetDefinition
from app.schemas.query import QueryRequest


class QueryValidator:
    def validate(self, request: QueryRequest, dataset: DatasetDefinition) -> None:
        if not request.metrics:
            raise HTTPException(status_code=422, detail="Au moins une métrique est requise")

        for metric in request.metrics:
            if metric not in dataset.metrics:
                raise HTTPException(status_code=422, detail=f"Métrique non autorisée: {metric}")

        for dimension in request.dimensions:
            if dimension not in dataset.columns:
                raise HTTPException(status_code=422, detail=f"Dimension non autorisée: {dimension}")

        for query_filter in request.filters:
            if query_filter.field not in dataset.columns:
                raise HTTPException(status_code=422, detail=f"Filtre non autorisé: {query_filter.field}")
