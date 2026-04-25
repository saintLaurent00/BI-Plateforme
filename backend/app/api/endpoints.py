from fastapi import APIRouter, Depends, HTTPException, Request
from app.domain.schemas import QueryRequest, User
from app.domain.datasets.service import DatasetService
from app.domain.query.service import QueryService
from app.domain.query.insights import InsightGenerator
from app.core.security.auth import get_current_user
from app.core.config import settings
import sqlite3
import pandas as pd
import logging

router = APIRouter()
logger = logging.getLogger("BI-Plateforme")

dataset_service = DatasetService()
query_service = QueryService(dataset_service)
insight_generator = InsightGenerator()

@router.get("/datasets")
def get_datasets(current_user: User = Depends(get_current_user)):
    return dataset_service.get_all()

@router.post("/datasets")
def create_dataset(dataset: Dataset, current_user: User = Depends(get_current_user)):
    if "admin" not in current_user.role_id:
        raise HTTPException(status_code=403, detail="Only admins can create datasets")

    try:
        dataset_service.repo.create_dataset(dataset)
        return {"message": "Dataset created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/query")
async def run_query(request: QueryRequest, current_user: User = Depends(get_current_user)):
    if not dataset_service.is_allowed(request.dataset, current_user.role_id):
        raise HTTPException(status_code=403, detail="Access denied to this dataset")

    try:
        result = await query_service.execute_query(request, current_user)

        data = result["data"]
        metadata = result["metadata"]

        insights = insight_generator.generate(request.dataset, data)

        return {
            "sql": metadata.get("sql"),
            "data": data,
            "metadata": metadata,
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
