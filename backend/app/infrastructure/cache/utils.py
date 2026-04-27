"""
🔏 Cache Utilities (Infrastructure)
----------------------------------
Fonctions utilitaires pour la gestion des clés de cache.
Génère des hashes sécurisés incluant le contexte RLS pour garantir l'isolation des données.
"""

import hashlib
import json
from typing import Any, Dict
from app.domain.schemas import QueryRequest, User

def generate_cache_key(request: QueryRequest, user: User) -> str:
    """
    Génère une clé de cache unique basée sur la requête et le contexte de sécurité de l'utilisateur.
    Ceci garantit que deux utilisateurs avec des droits différents ne partagent pas le même cache.
    """
    # On extrait les éléments qui influencent le résultat
    query_data = {
        "dataset": request.dataset,
        "metrics": sorted(request.metrics),
        "dimensions": sorted(request.dimensions),
        "filters": [f.dict() for f in request.filters or []],
        "granularity": request.granularity,
        "params": request.params,
        "limit": request.limit,
        "offset": request.offset,
        # Sécurité : On inclut les attributs RLS de l'utilisateur
        "security_attributes": user.security_attributes if user else {},
        "role_id": user.role_id if user else "anonymous"
    }

    # Sérialisation stable pour le hash
    query_str = json.dumps(query_data, sort_keys=True)
    return hashlib.sha256(query_str.encode()).hexdigest()
