from fastapi import APIRouter, Depends, HTTPException, Request
from app.domain.schemas import QueryRequest, User
from app.domain.datasets.service import DatasetService
from app.domain.query.builder import QueryBuilder
from app.domain.query.insights import InsightGenerator
from app.core.security.auth import get_current_user
from app.core.config import settings
import sqlite3
import pandas as pd
import logging

router = APIRouter()
logger = logging.getLogger("BI-Plateforme")

dataset_service = DatasetService()
query_builder = QueryBuilder(dataset_service.datasets)
insight_generator = InsightGenerator()

@router.get("/datasets")
def get_datasets(current_user: User = Depends(get_current_user)):
    return dataset_service.get_all()

@router.post("/query")
async def run_query(request: QueryRequest, current_user: User = Depends(get_current_user)):
    if not dataset_service.is_allowed(request.dataset, current_user.role_id):
        raise HTTPException(status_code=403, detail="Access denied to this dataset")

    try:
        sql = query_builder.build(request, user=current_user)
        logger.info(f"User {current_user.username} executing SQL", extra={'user': current_user.username})

        conn = sqlite3.connect(settings.DB_PATH)
        df = pd.read_sql_query(sql, conn)
        conn.close()

        data = df.to_dict(orient="records")
        insights = insight_generator.generate(request.dataset, data)

        return {
            "sql": sql,
            "data": data,
            "columns": list(df.columns),
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={"error_code": "QUERY_FAILED", "technical_details": str(e)}
        )

@router.get("/suggest-queries/{dataset_name}")
def suggest_queries(dataset_name: str, current_user: User = Depends(get_current_user)):
    if not dataset_service.get_by_name(dataset_name):
        raise HTTPException(status_code=404, detail="Dataset not found")

    return [
        {"name": "Total par catégorie", "metrics": ["total_amount"], "dimensions": ["category"]},
        {"name": "Top marchands", "metrics": ["transaction_count"], "dimensions": ["merchant"], "limit": 5}
    ]
