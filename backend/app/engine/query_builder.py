from app.models.schemas import QueryRequest, Dataset
from typing import Dict, List

class QueryBuilder:
    def __init__(self, datasets: Dict[str, Dataset]):
        self.datasets = datasets

    def _sanitize(self, val) -> str:
        if isinstance(val, str):
            # Basic escaping for single quotes
            escaped = val.replace("'", "''")
            return f"'{escaped}'"
        return str(val)

    def build(self, request: QueryRequest) -> str:
        dataset = self.datasets.get(request.dataset)
        if not dataset:
            raise ValueError(f"Dataset {request.dataset} not found")

        # Select clause
        select_parts = []
        for dim in request.dimensions:
            select_parts.append(f'"{dim}"')

        for metric_req in request.metrics:
            # Check if it's a predefined metric
            predefined = next((m for m in dataset.metrics if m.name == metric_req), None)
            if predefined:
                select_parts.append(f'{predefined.expression} AS "{predefined.name}"')
            else:
                # Fallback or validation
                select_parts.append(metric_req)

        select_clause = "SELECT " + ", ".join(select_parts)

        # From clause
        from_clause = f'FROM "{dataset.table_name}"'

        # Where clause
        where_parts = []
        if request.filters:
            for f in request.filters:
                # Basic validation for field name (should be alphanumeric or underscored)
                field = f.field.replace('"', '')

                if f.op == "between" and isinstance(f.value, list) and len(f.value) == 2:
                    v1 = self._sanitize(f.value[0])
                    v2 = self._sanitize(f.value[1])
                    where_parts.append(f'"{field}" BETWEEN {v1} AND {v2}')
                elif f.op == "eq":
                    val = self._sanitize(f.value)
                    where_parts.append(f'"{field}" = {val}')

        where_clause = ""
        if where_parts:
            where_clause = "WHERE " + " AND ".join(where_parts)

        # Group by clause
        group_by_clause = ""
        if request.dimensions:
            group_by_clause = "GROUP BY " + ", ".join([f'"{d}"' for d in request.dimensions])

        # Final assembly
        sql = f"{select_clause} {from_clause} {where_clause} {group_by_clause} LIMIT {request.limit}"
        return sql.strip()
