"""
🌐 Endpoints API (Presentation Layer)
-----------------------------------
Définit les routes HTTP exposées par la plateforme.
Gère l'authentification, les permissions et la délégation aux services de domaine.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Dict, Any, Optional
from app.domain.schemas import QueryRequest, RawQueryRequest, User, Dataset
from app.domain.datasets.service import DatasetService
from app.domain.query.service import QueryService
from app.domain.query.insights import InsightGenerator
from app.infrastructure.database.introspector import Introspector
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
introspector = Introspector()

@router.get("/datasets")
def get_datasets(current_user: User = Depends(get_current_user)):
    return dataset_service.get_all()

@router.get("/database/tables")
def get_db_tables(current_user: User = Depends(get_current_user)):
    if "admin" not in current_user.role_id:
        raise HTTPException(status_code=403)
    return introspector.get_tables()

@router.get("/database/columns/{table_name}")
def get_db_columns(table_name: str, current_user: User = Depends(get_current_user)):
    if "admin" not in current_user.role_id:
        raise HTTPException(status_code=403)
    return introspector.get_columns(table_name)

@router.post("/database/discover-joins")
def discover_joins(tables: List[str], current_user: User = Depends(get_current_user)):
    if "admin" not in current_user.role_id:
        raise HTTPException(status_code=403)
    return introspector.discover_joins(tables)

@router.post("/datasets")
def create_dataset(dataset: Dataset, current_user: User = Depends(get_current_user)):
    if "admin" not in current_user.role_id:
        raise HTTPException(status_code=403, detail="Only admins can create datasets")

    try:
        dataset_service.repo.create_dataset(dataset)
        return {"message": "Dataset created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/query/raw")
async def run_raw_query(request: RawQueryRequest, current_user: User = Depends(get_current_user)):
    try:
        result = await query_service.execute_raw_sql(request, current_user)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/v1/chart/data")
async def get_chart_data(request: QueryRequest, current_user: User = Depends(get_current_user)):
    # On réutilise la logique de Query Intelligence pour le frontend Superset-like
    if not dataset_service.is_allowed(request.dataset, current_user.role_id):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        result = await query_service.execute_query(request, current_user)
        return result
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

# --- Couche de compatibilité Superset (pour le frontend branche main) ---

@router.post("/v1/dashboard/")
def save_dashboard_api(request: Request, current_user: User = Depends(get_current_user)):
    # Reçoit le JSON complexe du frontend
    import asyncio
    data = asyncio.run(request.json())
    dataset_service.repo.save_dashboard(data)
    return {"message": "Dashboard saved"}

@router.get("/v1/me/")
def get_me(current_user: User = Depends(get_current_user)):
    from app.domain.auth.service import auth_service
    permissions = auth_service.get_user_permissions(current_user)
    return {
        "result": {
            "username": current_user.username,
            "id": current_user.id,
            "first_name": "Laurent",
            "last_name": "O.",
            "roles": [current_user.role_id],
            "permissions": permissions,
            "security_attributes": current_user.security_attributes
        }
    }

@router.get("/v1/dashboard/")
def get_dashboards(current_user: User = Depends(get_current_user)):
    dashboards = dataset_service.repo.get_dashboards()
    return {
        "result": dashboards,
        "count": len(dashboards)
    }

@router.get("/v1/chart/")
def get_charts(current_user: User = Depends(get_current_user)):
    charts = dataset_service.repo.get_charts()
    return {
        "result": charts,
        "count": len(charts)
    }

@router.get("/v1/dataset/")
def get_superset_datasets(current_user: User = Depends(get_current_user)):
    datasets = dataset_service.get_all()
    return {
        "result": [
            {
                "id": i,
                "table_name": ds.name,
                "kind": "physical",
                "owners": [{"first_name": "Laurent", "last_name": "O."}]
            } for i, ds in enumerate(datasets)
        ],
        "count": len(datasets)
    }

@router.get("/suggest-queries/{dataset_name}")
def suggest_queries(dataset_name: str, current_user: User = Depends(get_current_user)):
    if not dataset_service.get_by_name(dataset_name):
        raise HTTPException(status_code=404, detail="Dataset not found")

    return [
        {"name": "Total par catégorie", "metrics": ["total_amount"], "dimensions": ["category"]},
        {"name": "Top marchands", "metrics": ["transaction_count"], "dimensions": ["merchant"], "limit": 5}
    ]
