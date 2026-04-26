from typing import Dict, Any, Optional
"""
🛠️ Query Service (Domain Orchestrator)
--------------------------------------
Service de haut niveau coordonnant l'exécution des requêtes analytiques.
Fait le lien entre le Metadata Store (schémas), le Cache Manager (performance) et le Query Builder (SQL).
"""

import pandas as pd
import sqlite3
import logging
from app.domain.schemas import QueryRequest, RawQueryRequest, User, Dataset
from app.domain.query.builder import QueryBuilder
from app.domain.query.securizer import RawQuerySecurizer
from app.infrastructure.cache.manager import cache_manager
from app.infrastructure.cache.utils import generate_cache_key
from app.core.config import settings
from app.domain.datasets.service import DatasetService

logger = logging.getLogger("BI-Plateforme.QueryService")

class QueryService:
    def __init__(self, dataset_service: DatasetService):
        self.dataset_service = dataset_service
        self.securizer = RawQuerySecurizer()

    async def execute_raw_sql(self, request: RawQueryRequest, user: User) -> Dict[str, Any]:
        # En mode RAW, on doit quand même sécuriser.
        # Pour cet exemple, on suppose que l'utilisateur travaille sur le dataset 'transactions'
        # Dans un système complet, on parserait le SQL pour identifier les tables.
        dataset = self.dataset_service.get_by_name("transactions")
        security_mapping = []
        if dataset:
            for col in dataset.columns:
                if col.security_scope:
                    security_mapping.append({"column": col.name, "scope": col.security_scope})

        secure_sql = self.securizer.securize(request.sql, user, security_mapping)
        logger.info(f"Executing RAW SQL: {secure_sql}", extra={"user": user.username})

        try:
            conn = sqlite3.connect(settings.DB_PATH)
            df = pd.read_sql_query(secure_sql, conn)
            conn.close()
            return {
                "data": df.to_dict(orient="records"),
                "metadata": {"source": "database", "sql": secure_sql}
            }
        except Exception as e:
            logger.error(f"RAW Query failed: {str(e)}", extra={"user": user.username})
            raise e

    async def execute_query(self, request: QueryRequest, user: User) -> Dict[str, Any]:
        # 1. Résolution du dataset depuis le Metadata Store
        dataset = self.dataset_service.get_by_name(request.dataset)
        if not dataset:
            raise ValueError(f"Dataset {request.dataset} non trouvé")

        # 2. Génération de la clé de cache
        cache_key = generate_cache_key(request, user)

        # 3. Tentative de récupération depuis le cache
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

        # 4. Construction du SQL avec le QueryBuilder
        # On passe les datasets connus (ou juste celui nécessaire)
        builder = QueryBuilder(datasets={dataset.name: dataset})
        sql = builder.build(request, user)
        logger.info(f"Executing SQL: {sql}", extra={"user": user.username})

        # 5. Exécution
        try:
            conn = sqlite3.connect(settings.DB_PATH)
            df = pd.read_sql_query(sql, conn)
            conn.close()

            result_data = df.to_dict(orient="records")

            # 6. Mise en cache
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
