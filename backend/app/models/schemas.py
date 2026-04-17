from pydantic import BaseModel
from typing import List, Any, Optional, Dict

class Filter(BaseModel):
    field: str
    op: str # 'eq', 'gt', 'lt', 'between', 'in', etc.
    value: Any

class QueryRequest(BaseModel):
    dataset: str
    metrics: List[str] # e.g., ["total_amount", "transaction_count"]
    dimensions: List[str] # e.g., ["date", "category"]
    filters: Optional[List[Filter]] = []
    limit: Optional[int] = 1000

class DatasetColumn(BaseModel):
    name: str
    type: str # 'string', 'number', 'date'
    description: Optional[str] = None

class DatasetMetric(BaseModel):
    name: str
    expression: str # e.g., "SUM(amount)"
    description: Optional[str] = None

class Dataset(BaseModel):
    name: str
    table_name: str
    columns: List[DatasetColumn]
    metrics: List[DatasetMetric]
