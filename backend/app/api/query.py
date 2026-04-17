from __future__ import annotations

import time

from fastapi import APIRouter, HTTPException

from app.datasets.registry import DatasetRegistry
from app.engine.insight_engine import InsightEngine
from app.engine.query_builder import QueryBuilder
from app.engine.query_validator import QueryValidator
from app.engine.sql_executor import SQLExecutor
from app.schemas.query import QueryRequest, QueryResponse

router = APIRouter(prefix="/api", tags=["query"])
registry = DatasetRegistry()
validator = QueryValidator()
builder = QueryBuilder()
executor = SQLExecutor()
insight_engine = InsightEngine()


@router.post("/query", response_model=QueryResponse)
def run_query(request: QueryRequest) -> QueryResponse:
    start_time = time.perf_counter()

    try:
        dataset = registry.get(request.dataset)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    validator.validate(request, dataset)
    sql, params = builder.build(request, dataset)
    rows = executor.execute(sql, params)
    insights = insight_engine.generate(rows)

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
    return QueryResponse(
        data=rows,
        meta={
            "dataset": request.dataset,
            "execution_ms": elapsed_ms,
            "row_count": len(rows),
        },
        insights=insights,
    )
