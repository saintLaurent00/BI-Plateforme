from pydantic import BaseModel
from typing import List, Any, Optional, Dict

class Filter(BaseModel):
    field: str
    op: str # 'eq', 'gt', 'lt', 'ge', 'le', 'ne', 'between', 'in', 'like'
    value: Any

class OrderBy(BaseModel):
    field: str
    direction: str = "asc" # "asc" or "desc"

class QueryRequest(BaseModel):
    dataset: str
    metrics: List[str] # e.g., ["total_amount", "transaction_count"]
    dimensions: List[str] # e.g., ["date", "category"]
    filters: Optional[List[Filter]] = []
    order_by: Optional[List[OrderBy]] = []
    granularity: Optional[str] = None # 'day', 'week', 'month', 'quarter', 'year'
    limit: Optional[int] = 1000
    offset: Optional[int] = 0

class DatasetColumn(BaseModel):
    name: str
    type: str # 'string', 'number', 'date', 'boolean'
    expression: Optional[str] = None # For calculated columns
    security_scope: Optional[str] = None # e.g., 'region', 'department'
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

# --- Identity & Security ---

class Role(BaseModel):
    id: str
    name: str
    permissions: List[str]

class User(BaseModel):
    id: str
    username: str
    role_id: str
    group_ids: List[str] = []
    # security_attributes: e.g. {"region": "Sud", "department": "Sales"}
    security_attributes: Dict[str, Any] = {}

class QueryContext(BaseModel):
    user: Optional[User] = None
