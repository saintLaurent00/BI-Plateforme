import time
from typing import Any, Optional, Dict, Tuple
from app.infrastructure.cache.base import BaseCache

class InMemoryCache(BaseCache):
    def __init__(self):
        self._cache: Dict[str, Tuple[Any, float]] = {}

    async def get(self, key: str) -> Optional[Any]:
        if key not in self._cache:
            return None

        value, expiry = self._cache[key]
        if time.time() > expiry:
            del self._cache[key]
            return None

        return value

    async def set(self, key: str, value: Any, ttl: int = 3600) -> None:
        expiry = time.time() + ttl
        self._cache[key] = (value, expiry)

    async def delete(self, key: str) -> None:
        if key in self._cache:
            del self._cache[key]

    async def clear(self) -> None:
        self._cache.clear()

# Global instance for the service
cache_manager = InMemoryCache()
