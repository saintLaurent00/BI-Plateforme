from abc import ABC, abstractmethod
from typing import List, Optional

class BaseDialect(ABC):
    @abstractmethod
    def quote_identifier(self, identifier: str) -> str:
        pass

    @abstractmethod
    def format_date(self, field: str, granularity: str) -> str:
        pass

    @abstractmethod
    def limit_offset(self, limit: int, offset: int) -> str:
        pass

    def get_op(self, op: str) -> str:
        op_map = {
            "eq": "=", "ne": "!=", "gt": ">", "lt": "<",
            "ge": ">=", "le": "<=", "like": "LIKE", "in": "IN"
        }
        return op_map.get(op, "=")
