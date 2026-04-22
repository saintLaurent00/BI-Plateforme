from app.models.schemas import QueryRequest, Dataset, User
from typing import Dict, List, Optional

class QueryBuilder:
    def __init__(self, datasets: Dict[str, Dataset]):
        self.datasets = datasets

    def _sanitize(self, val) -> str:
        if isinstance(val, str):
            # Basic escaping for single quotes
            escaped = val.replace("'", "''")
            return f"'{escaped}'"
        return str(val)

    def _apply_granularity(self, field: str, granularity: str) -> str:
        # SQLite specific date truncation
        if granularity == 'year':
            return f"strftime('%Y-01-01', {field})"
        elif granularity == 'quarter':
            # Quarter logic for SQLite: (month-1)/3 + 1
            return f"strftime('%Y-', {field}) || printf('%02d-01', ((strftime('%m', {field}) - 1) / 3) * 3 + 1)"
        elif granularity == 'month':
            return f"strftime('%Y-%m-01', {field})"
        elif granularity == 'week':
            # Week start (Monday)
            return f"date({field}, 'weekday 1', '-7 days')"
        elif granularity == 'day':
            return f"date({field})"
        return field

    def build(self, request: QueryRequest, user: Optional[User] = None) -> str:
        dataset = self.datasets.get(request.dataset)
        if not dataset:
            raise ValueError(f"Dataset {request.dataset} not found")

        # Select clause
        select_parts = []
        for dim in request.dimensions:
            # Check if dimension is a valid column
            col_meta = next((c for c in dataset.columns if c.name == dim), None)
            if not col_meta:
                raise ValueError(f"Dimension {dim} non valide pour ce dataset")

            # Escape double quotes in column names
            safe_dim = dim.replace('"', '""')
            base_expr = f'"{safe_dim}"'
            if col_meta.expression:
                base_expr = col_meta.expression

            if col_meta and col_meta.type == 'date' and request.granularity:
                select_parts.append(f'{self._apply_granularity(base_expr, request.granularity)} AS "{dim}"')
            else:
                select_parts.append(f'{base_expr} AS "{dim}"')

        for metric_req in request.metrics:
            # Check if it's a predefined metric
            predefined = next((m for m in dataset.metrics if m.name == metric_req), None)
            if not predefined:
                raise ValueError(f"Métrique {metric_req} non définie pour ce dataset")

            safe_metric_name = predefined.name.replace('"', '""')
            select_parts.append(f'{predefined.expression} AS "{safe_metric_name}"')

        select_clause = "SELECT " + ", ".join(select_parts)

        # From clause
        from_clause = f'FROM "{dataset.table_name}"'

        # Where clause
        where_parts = []

        # --- Automatic RLS Injection ---
        if user and user.role_id != 'admin':
            # Check for columns with security_scope
            for col in dataset.columns:
                if col.security_scope and col.security_scope in user.security_attributes:
                    val = user.security_attributes[col.security_scope]

                    if val == "*":
                        # Wildcard: skip filter for this scope
                        continue
                    elif isinstance(val, list):
                        # Multiple values: IN clause
                        vals = ", ".join([self._sanitize(v) for v in val])
                        where_parts.append(f'"{col.name}" IN ({vals})')
                    else:
                        # Single value: EQ clause
                        where_parts.append(f'"{col.name}" = {self._sanitize(val)}')

        op_map = {
            "eq": "=", "ne": "!=", "gt": ">", "lt": "<",
            "ge": ">=", "le": "<=", "like": "LIKE"
        }

        if request.filters:
            for f in request.filters:
                field = f.field.replace('"', '')

                if f.op == "between" and isinstance(f.value, list) and len(f.value) == 2:
                    v1 = self._sanitize(f.value[0])
                    v2 = self._sanitize(f.value[1])
                    where_parts.append(f'"{field}" BETWEEN {v1} AND {v2}')
                elif f.op == "in" and isinstance(f.value, list):
                    vals = ", ".join([self._sanitize(v) for v in f.value])
                    where_parts.append(f'"{field}" IN ({vals})')
                elif f.op in op_map:
                    val = self._sanitize(f.value)
                    where_parts.append(f'"{field}" {op_map[f.op]} {val}')

        where_clause = ""
        if where_parts:
            where_clause = "WHERE " + " AND ".join(where_parts)

        # Group by clause
        group_by_clause = ""
        if request.dimensions:
            # Must group by the same expressions as in SELECT if granularity is applied
            group_parts = []
            for dim in request.dimensions:
                col_meta = next((c for c in dataset.columns if c.name == dim), None)

                base_expr = f'"{dim}"'
                if col_meta and col_meta.expression:
                    base_expr = col_meta.expression

                if col_meta and col_meta.type == 'date' and request.granularity:
                    group_parts.append(self._apply_granularity(base_expr, request.granularity))
                else:
                    group_parts.append(base_expr)
            group_by_clause = "GROUP BY " + ", ".join(group_parts)

        # Order by clause
        order_by_clause = ""
        if request.order_by:
            parts = []
            for o in request.order_by:
                direction = "DESC" if o.direction.lower() == "desc" else "ASC"
                parts.append(f'"{o.field}" {direction}')
            order_by_clause = "ORDER BY " + ", ".join(parts)

        # Final assembly
        sql = f"{select_clause} {from_clause} {where_clause} {group_by_clause} {order_by_clause} LIMIT {request.limit} OFFSET {request.offset}"
        return sql.strip()
