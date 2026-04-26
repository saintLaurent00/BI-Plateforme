"""
🐘 Postgres Dialect (Infrastructure)
---------------------------------
Implémentation spécifique à PostgreSQL du moteur de traduction SQL.
Utilise des fonctions natives comme DATE_TRUNC pour une performance maximale.
"""

from app.infrastructure.drivers.base import BaseDialect

class PostgresDialect(BaseDialect):
    def quote_identifier(self, identifier: str) -> str:
        safe = identifier.replace('"', '""')
        return f'"{safe}"'

    def format_date(self, field: str, granularity: str) -> str:
        if granularity in ['year', 'quarter', 'month', 'week', 'day']:
            return f"DATE_TRUNC('{granularity}', {field})"
        return field

    def limit_offset(self, limit: int, offset: int) -> str:
        return f"LIMIT {limit} OFFSET {offset}"
