from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.datasets import router as datasets_router
from app.api.query import router as query_router

app = FastAPI(title="BI-Plateforme Query Intelligence Engine", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets_router)
app.include_router(query_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
