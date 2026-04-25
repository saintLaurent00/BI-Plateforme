from typing import Dict, Any, Optional
import pandas as pd
import sqlite3
import logging
from app.domain.schemas import QueryRequest, User, Dataset
from app.domain.query.builder import QueryBuilder
from app.infrastructure.cache.manager import cache_manager
from app.infrastructure.cache.utils import generate_cache_key
from app.core.config import settings

logger = logging.getLogger("BI-Plateforme.QueryService")

class QueryService:
    def __init__(self, datasets: Dict[str, Dataset]):
        self.datasets = datasets
        self.builder = QueryBuilder(datasets=datasets)

    async def execute_query(self, request: QueryRequest, user: User) -> Dict[str, Any]:
        # 1. Génération de la clé de cache
        cache_key = generate_cache_key(request, user)

        # 2. Tentative de récupération depuis le cache
        cached_result = await cache_manager.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for query {cache_key}", extra={"user": user.username})
            return {
                "data": cached_result,
                "metadata": {
                    "source": "cache",
                    "cache_key": cache_key
                }
            }

        # 3. Construction du SQL
        sql = self.builder.build(request, user)
        logger.info(f"Executing SQL: {sql}", extra={"user": user.username})

        # 4. Exécution (Simulation SQLite pour le moment)
        try:
            conn = sqlite3.connect(settings.DB_PATH)
            df = pd.read_sql_query(sql, conn)
            conn.close()

            result_data = df.to_dict(orient="records")

            # 5. Mise en cache du résultat (TTL de 5 minutes par défaut)
            await cache_manager.set(cache_key, result_data, ttl=300)

            return {
                "data": result_data,
                "metadata": {
                    "source": "database",
                    "sql": sql,
                    "row_count": len(result_data)
                }
            }
        except Exception as e:
            logger.error(f"Query execution failed: {str(e)}", extra={"user": user.username})
            raise e
