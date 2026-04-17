from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import QueryRequest, Dataset, DatasetColumn, DatasetMetric
from app.engine.query_builder import QueryBuilder
from app.engine.insight_generator import InsightGenerator
import sqlite3
import pandas as pd
import os

app = FastAPI(title="BI-Plateforme API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Datasets
DATASETS = {
    "transactions": Dataset(
        name="transactions",
        table_name="transactions",
        columns=[
            DatasetColumn(name="id", type="number"),
            DatasetColumn(name="date", type="date"),
            DatasetColumn(name="category", type="string"),
            DatasetColumn(name="amount", type="number"),
            DatasetColumn(name="merchant", type="string"),
        ],
        metrics=[
            DatasetMetric(name="total_amount", expression="SUM(amount)"),
            DatasetMetric(name="transaction_count", expression="COUNT(*)"),
            DatasetMetric(name="avg_amount", expression="AVG(amount)"),
        ]
    )
}

query_builder = QueryBuilder(DATASETS)
insight_generator = InsightGenerator()

DB_PATH = "bi_platform.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    # Create sample data
    df = pd.DataFrame([
        {"id": 1, "date": "2024-01-01", "category": "Food", "amount": 50, "merchant": "Whole Foods"},
        {"id": 2, "date": "2024-01-02", "category": "Tech", "amount": 1200, "merchant": "Apple"},
        {"id": 3, "date": "2024-01-03", "category": "Food", "amount": 30, "merchant": "Trader Joes"},
        {"id": 4, "date": "2024-01-04", "category": "Transport", "amount": 15, "merchant": "Uber"},
        {"id": 5, "date": "2024-01-05", "category": "Tech", "amount": 200, "merchant": "Amazon"},
    ])
    df.to_sql("transactions", conn, if_exists="replace", index=False)
    conn.close()

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/datasets")
def get_datasets():
    return list(DATASETS.values())

@app.post("/api/query")
def run_query(request: QueryRequest):
    try:
        sql = query_builder.build(request)
        conn = sqlite3.connect(DB_PATH)
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
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
