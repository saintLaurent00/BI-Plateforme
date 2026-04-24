from app.infrastructure.drivers.base import BaseDialect

class SQLiteDialect(BaseDialect):
    def quote_identifier(self, identifier: str) -> str:
        safe = identifier.replace('"', '""')
        return f'"{safe}"'

    def format_date(self, field: str, granularity: str) -> str:
        if granularity == 'year':
            return f"strftime('%Y-01-01', {field})"
        elif granularity == 'quarter':
            return f"strftime('%Y-', {field}) || printf('%02d-01', ((strftime('%m', {field}) - 1) / 3) * 3 + 1)"
        elif granularity == 'month':
            return f"strftime('%Y-%m-01', {field})"
        elif granularity == 'week':
            return f"date({field}, 'weekday 1', '-7 days')"
        elif granularity == 'day':
            return f"date({field})"
        return field

    def limit_offset(self, limit: int, offset: int) -> str:
        return f"LIMIT {limit} OFFSET {offset}"
