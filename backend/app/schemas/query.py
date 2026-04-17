from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class QueryFilter(BaseModel):
    field: str
    op: Literal["eq", "neq", "gt", "gte", "lt", "lte", "in", "between", "like"]
    value: Any


class QueryRequest(BaseModel):
    dataset: str = Field(..., min_length=1)
    metrics: list[str] = Field(default_factory=list)
    dimensions: list[str] = Field(default_factory=list)
    filters: list[QueryFilter] = Field(default_factory=list)
    limit: int = Field(default=1000, ge=1, le=5000)


class QueryResponse(BaseModel):
    data: list[dict[str, Any]]
    meta: dict[str, Any]
    insights: list[dict[str, Any]] = Field(default_factory=list)
