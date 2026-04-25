from app.domain.schemas import User
from app.infrastructure.drivers.base import BaseDialect
from app.infrastructure.drivers.sqlite import SQLiteDialect
from typing import Optional, List, Any

class RawQuerySecurizer:
    """
    Sécurise une requête SQL brute en l'enveloppant dans une sous-requête
    pour y injecter les filtres de sécurité (RLS) sans modifier le SQL original.
    """
    def __init__(self, dialect: Optional[BaseDialect] = None):
        self.dialect = dialect or SQLiteDialect()

    def _sanitize_value(self, val) -> str:
        if isinstance(val, str):
            escaped = val.replace("'", "''")
            return f"'{escaped}'"
        return str(val)

    def securize(self, sql: str, user: User, security_mapping: List[dict]) -> str:
        """
        security_mapping: liste de dict {'column': 'region', 'scope': 'region'}
        """
        if not user or user.role_id == 'admin':
            return sql

        where_parts = []
        for mapping in security_mapping:
            scope = mapping['scope']
            col_name = mapping['column']

            if scope in user.security_attributes:
                val = user.security_attributes[scope]
                quoted_col = self.dialect.quote_identifier(col_name)

                if val == "*":
                    continue
                elif isinstance(val, list):
                    vals = ", ".join([self._sanitize_value(v) for v in val])
                    where_parts.append(f'{quoted_col} IN ({vals})')
                else:
                    where_parts.append(f'{quoted_col} = {self._sanitize_value(val)}')

        if not where_parts:
            return sql

        # Wrapping: SELECT * FROM (USER_SQL) AS wrapped WHERE RLS_CLAUSES
        where_clause = " AND ".join(where_parts)
        wrapped_sql = f"SELECT * FROM ({sql}) AS prism_wrapped WHERE {where_clause}"
        return wrapped_sql
