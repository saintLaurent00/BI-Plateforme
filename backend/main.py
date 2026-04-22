from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import QueryRequest, User
from app.engine.query_builder import QueryBuilder
from app.engine.insight_generator import InsightGenerator
from app.services.dataset_service import DatasetService
from app.services.auth_service import AuthService
from typing import Optional, Dict, Any
import sqlite3
import pandas as pd
import os
import logging

# Configuration des logs structurés
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(user)s: %(message)s'
)

class ContextFilter(logging.Filter):
    def filter(self, record):
        if not hasattr(record, 'user'):
            record.user = 'System'
        return True

logger = logging.getLogger("BI-Plateforme")
logger.addFilter(ContextFilter())

app = FastAPI(title="BI-Plateforme API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

dataset_service = DatasetService()
auth_service = AuthService()
query_builder = QueryBuilder(dataset_service.datasets)
insight_generator = InsightGenerator()

DB_PATH = "bi_platform.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    # Create sample data with regions for RLS test
    data = [
        {"id": 1, "date": "2024-01-01", "category": "Food", "amount": 50, "merchant": "Whole Foods", "region": "Sud"},
        {"id": 2, "date": "2024-01-02", "category": "Tech", "amount": 1200, "merchant": "Apple", "region": "North"},
        {"id": 3, "date": "2024-01-03", "category": "Food", "amount": 30, "merchant": "Trader Joes", "region": "Sud"},
        {"id": 4, "date": "2024-01-04", "category": "Transport", "amount": 15, "merchant": "Uber", "region": "North"},
        {"id": 5, "date": "2024-01-05", "category": "Tech", "amount": 200, "merchant": "Amazon", "region": "Sud"},
    ]
    df = pd.DataFrame(data)
    df.to_sql("transactions", conn, if_exists="replace", index=False)
    conn.close()

@app.on_event("startup")
def startup_event():
    init_db()

def get_current_user(request: Request) -> Optional[User]:
    # Simulation d'une session / auth via header pour le MVP
    username = request.headers.get("X-User")
    if username:
        return auth_service.get_user_by_username(username)
    return None

@app.get("/api/datasets")
def get_datasets():
    return dataset_service.get_all()

@app.post("/api/query")
async def run_query(request: QueryRequest, req: Request):
    user = get_current_user(req)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if not dataset_service.is_allowed(request.dataset, user.role_id):
        logger.warning(f"Access denied for dataset {request.dataset}", extra={'user': user.username})
        raise HTTPException(status_code=403, detail="Access denied to this dataset")

    user_name = user.username
    try:
        sql = query_builder.build(request, user=user)
        logger.info(f"Execution SQL", extra={'user': user_name})

        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query(sql, conn)
        conn.close()

        data = df.to_dict(orient="records")
        insights = insight_generator.generate(request.dataset, data)

        return {
            "sql": sql,
            "data": data,
            "columns": list(df.columns),
            "insights": insights,
            "user_context": user.username if user else None
        }
    except Exception as e:
        logger.error(f"Erreur de requête: {str(e)}", extra={'user': user_name})
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "QUERY_EXECUTION_FAILED",
                "message": "La requête a échoué. Veuillez vérifier vos métriques.",
                "technical_details": str(e)
            }
        )

@app.post("/api/explain")
async def explain_data(request: QueryRequest, req: Request):
    user = get_current_user(req)
    try:
        sql = query_builder.build(request, user=user)
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query(sql, conn)
        conn.close()

        data = df.to_dict(orient="records")
        insights = insight_generator.generate(request.dataset, data)

        explanation = f"Analyse de {request.dataset} : "
        if insights:
            explanation += " ".join([i['message'] for i in insights])
        else:
            explanation += "Aucune tendance significative détectée pour le moment."

        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/suggest-queries/{dataset_name}")
def suggest_queries(dataset_name: str):
    if not dataset_service.get_by_name(dataset_name):
        raise HTTPException(status_code=404, detail="Dataset not found")

    suggestions = [
        {"name": "Total par catégorie", "metrics": ["total_amount"], "dimensions": ["category"]},
        {"name": "Évolution temporelle", "metrics": ["total_amount"], "dimensions": ["date"], "granularity": "month"},
        {"name": "Top marchands", "metrics": ["transaction_count"], "dimensions": ["merchant"], "limit": 5}
    ]
    return suggestions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
