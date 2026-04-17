from __future__ import annotations

from pydantic import BaseModel


class DatasetColumn(BaseModel):
    key: str
    physical_name: str
    data_type: str


class MetricDefinition(BaseModel):
    key: str
    sql_expression: str
    label: str


class DatasetDefinition(BaseModel):
    name: str
    table_name: str
    columns: dict[str, DatasetColumn]
    metrics: dict[str, MetricDefinition]
