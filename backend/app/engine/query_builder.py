from __future__ import annotations

from app.schemas.dataset import DatasetDefinition
from app.schemas.query import QueryRequest


class QueryBuilder:
    OPERATOR_MAP = {
        "eq": "=",
        "neq": "!=",
        "gt": ">",
        "gte": ">=",
        "lt": "<",
        "lte": "<=",
        "like": "LIKE",
    }

    def build(self, request: QueryRequest, dataset: DatasetDefinition) -> tuple[str, dict[str, object]]:
        select_parts: list[str] = []
        group_by_parts: list[str] = []
        params: dict[str, object] = {}

        for dimension in request.dimensions:
            column = dataset.columns[dimension].physical_name
            select_parts.append(f"{column} AS {dimension}")
            group_by_parts.append(column)

        for metric_key in request.metrics:
            metric = dataset.metrics[metric_key]
            alias = metric.key.replace("(", "_").replace(")", "").replace("*", "all").replace(" ", "")
            alias = alias.replace(",", "_")
            select_parts.append(f"{metric.sql_expression} AS {alias}")

        where_clauses: list[str] = []
        for index, query_filter in enumerate(request.filters):
            column = dataset.columns[query_filter.field].physical_name
            param_name = f"p{index}"

            if query_filter.op == "between":
                low_name, high_name = f"{param_name}_low", f"{param_name}_high"
                params[low_name], params[high_name] = query_filter.value
                where_clauses.append(f"{column} BETWEEN :{low_name} AND :{high_name}")
            elif query_filter.op == "in":
                values = query_filter.value
                placeholders = []
                for value_index, value in enumerate(values):
                    list_param = f"{param_name}_{value_index}"
                    params[list_param] = value
                    placeholders.append(f":{list_param}")
                where_clauses.append(f"{column} IN ({', '.join(placeholders)})")
            else:
                params[param_name] = query_filter.value
                operator = self.OPERATOR_MAP[query_filter.op]
                where_clauses.append(f"{column} {operator} :{param_name}")

        sql = f"SELECT {', '.join(select_parts)} FROM {dataset.table_name}"

        if where_clauses:
            sql += f" WHERE {' AND '.join(where_clauses)}"

        if group_by_parts:
            sql += f" GROUP BY {', '.join(group_by_parts)}"

        sql += " ORDER BY 1"
        sql += " LIMIT :limit"
        params["limit"] = request.limit

        return sql, params
