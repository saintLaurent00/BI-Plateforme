"""
🧠 Query Builder Engine (Domain)
------------------------------
Le cœur algorithmique de la plateforme. Traduit une requête logique (métriques, dimensions)
en un SQL optimisé et sécurisé pour un dialecte donné.

Responsabilités :
- Résolution des expressions calculées (Jinja2).
- Gestion des agrégations et groupements.
- Injection automatique du RLS (Row Level Security).
- Formatage des dates selon le moteur SQL.
"""

from app.domain.schemas import QueryRequest, Dataset, User
from app.infrastructure.drivers.base import BaseDialect
from app.infrastructure.drivers.sqlite import SQLiteDialect
from typing import Dict, List, Optional, Any
from jinja2 import Template

class QueryBuilder:
    def __init__(self, datasets: Dict[str, Dataset], dialect: Optional[BaseDialect] = None):
        self.datasets = datasets
        self.dialect = dialect or SQLiteDialect()

    def _sanitize_value(self, val) -> str:
        if isinstance(val, str):
            # Basic escaping for single quotes
            escaped = val.replace("'", "''")
            return f"'{escaped}'"
        return str(val)

    def _compile_expression(self, expr: str, context: Dict[str, Any]) -> str:
        template = Template(expr)
        return template.render(**context)

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

            # Use dialect to quote identifiers
            quoted_dim = self.dialect.quote_identifier(dim)

            template_context = {"user": user, "params": request.params}

            base_expr = quoted_dim
            if col_meta.expression:
                base_expr = self._compile_expression(col_meta.expression, template_context)

            if col_meta and col_meta.type == 'date' and request.granularity:
                select_parts.append(f'{self.dialect.format_date(base_expr, request.granularity)} AS {quoted_dim}')
            else:
                select_parts.append(f'{base_expr} AS {quoted_dim}')

        for metric_req in request.metrics:
            # Check if it's a predefined metric
            predefined = next((m for m in dataset.metrics if m.name == metric_req), None)
            if not predefined:
                raise ValueError(f"Métrique {metric_req} non définie pour ce dataset")

            template_context = {"user": user, "params": request.params}
            compiled_expression = self._compile_expression(predefined.expression, template_context)

            quoted_metric = self.dialect.quote_identifier(predefined.name)
            select_parts.append(f'{compiled_expression} AS {quoted_metric}')

        select_clause = "SELECT " + ", ".join(select_parts)

        # From clause
        if dataset.kind == "virtual" and dataset.sql:
            from_clause = f'FROM ({dataset.sql}) AS {self.dialect.quote_identifier(dataset.name)}'
        else:
            from_clause = f'FROM {self.dialect.quote_identifier(dataset.table_name)}'

        # Where clause
        where_parts = []

        # --- Automatic RLS Injection ---
        if user and user.role_id != 'admin':
            # Check for columns with security_scope
            for col in dataset.columns:
                if col.security_scope and col.security_scope in user.security_attributes:
                    val = user.security_attributes[col.security_scope]
                    quoted_col = self.dialect.quote_identifier(col.name)

                    if val == "*":
                        # Wildcard: skip filter for this scope
                        continue
                    elif isinstance(val, list):
                        # Multiple values: IN clause
                        vals = ", ".join([self._sanitize_value(v) for v in val])
                        where_parts.append(f'{quoted_col} IN ({vals})')
                    else:
                        # Single value: EQ clause
                        where_parts.append(f'{quoted_col} = {self._sanitize_value(val)}')

        # --- Default Jinja2 Filters ---
        if dataset.default_filters:
            template_context = {"user": user, "params": request.params or {}}
            compiled_default_filter = self._compile_expression(dataset.default_filters, template_context)
            if compiled_default_filter.strip():
                where_parts.append(f"({compiled_default_filter})")

        if request.filters:
            for f in request.filters:
                quoted_field = self.dialect.quote_identifier(f.field)
                op = self.dialect.get_op(f.op)

                if f.op == "between" and isinstance(f.value, list) and len(f.value) == 2:
                    v1 = self._sanitize_value(f.value[0])
                    v2 = self._sanitize_value(f.value[1])
                    where_parts.append(f'{quoted_field} BETWEEN {v1} AND {v2}')
                elif f.op == "in" and isinstance(f.value, list):
                    vals = ", ".join([self._sanitize_value(v) for v in f.value])
                    where_parts.append(f'{quoted_field} IN ({vals})')
                else:
                    val = self._sanitize_value(f.value)
                    where_parts.append(f'{quoted_field} {op} {val}')

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

                template_context = {"user": user, "params": request.params}

                base_expr = self.dialect.quote_identifier(dim)
                if col_meta and col_meta.expression:
                    base_expr = self._compile_expression(col_meta.expression, template_context)

                if col_meta and col_meta.type == 'date' and request.granularity:
                    group_parts.append(self.dialect.format_date(base_expr, request.granularity))
                else:
                    group_parts.append(base_expr)
            group_by_clause = "GROUP BY " + ", ".join(group_parts)

        # Order by clause
        order_by_clause = ""
        if request.order_by:
            parts = []
            for o in request.order_by:
                direction = "DESC" if o.direction.lower() == "desc" else "ASC"
                parts.append(f'{self.dialect.quote_identifier(o.field)} {direction}')
            order_by_clause = "ORDER BY " + ", ".join(parts)

        # Final assembly
        limit_offset = self.dialect.limit_offset(request.limit, request.offset)
        sql = f"{select_clause} {from_clause} {where_clause} {group_by_clause} {order_by_clause} {limit_offset}"
        return sql.strip().replace("  ", " ")
