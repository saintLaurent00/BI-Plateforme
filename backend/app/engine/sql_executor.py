from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine


class SQLExecutor:
    def __init__(self, database_url: str = "sqlite+pysqlite:///:memory:") -> None:
        self.engine: Engine = create_engine(database_url, future=True)

    def execute(self, sql: str, params: dict[str, object]) -> list[dict[str, object]]:
        with self.engine.connect() as connection:
            result = connection.execute(text(sql), params)
            return [dict(row._mapping) for row in result]
