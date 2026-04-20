from app.models.schemas import QueryRequest, Dataset
from typing import Dict, List

class QueryBuilder:
    def __init__(self, datasets: Dict[str, Dataset]):
        self.datasets = datasets

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
                if f.op == "between" and isinstance(f.value, list) and len(f.value) == 2:
                    where_parts.append(f'"{f.field}" BETWEEN \'{f.value[0]}\' AND \'{f.value[1]}\'')
                elif f.op == "eq":
                    val = f"'{f.value}'" if isinstance(f.value, str) else f.value
                    where_parts.append(f'"{f.field}" = {val}')

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
