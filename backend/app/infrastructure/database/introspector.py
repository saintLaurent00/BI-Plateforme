import sqlite3
from typing import List, Dict, Any
from app.core.config import settings

class Introspector:
    """
    Explore la base de données analytique pour découvrir les tables,
    les colonnes et suggérer des jointures.
    """
    def __init__(self, db_path: str = settings.DB_PATH):
        self.db_path = db_path

    def get_tables(self) -> List[str]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall() if not row[0].startswith('sqlite_')]
        conn.close()
        return tables

    def get_columns(self, table_name: str) -> List[Dict[str, str]]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [{"name": row[1], "type": row[2]} for row in cursor.fetchall()]
        conn.close()
        return columns

    def discover_joins(self, table_names: List[str]) -> List[Dict[str, Any]]:
        """
        Analyse les colonnes des tables fournies pour suggérer des jointures
        basées sur les noms de colonnes identiques (ex: user_id, id).
        """
        all_cols = {}
        for t in table_names:
            all_cols[t] = [c['name'] for c in self.get_columns(t)]

        suggestions = []
        for i in range(len(table_names)):
            for j in range(i + 1, len(table_names)):
                t1, t2 = table_names[i], table_names[j]
                # Recherche de correspondances de noms
                for c1 in all_cols[t1]:
                    for c2 in all_cols[t2]:
                        if c1 == c2 or (c1 == 'id' and c2 == f"{t1.rstrip('s')}_id") or (c2 == 'id' and c1 == f"{t2.rstrip('s')}_id"):
                            suggestions.append({
                                "left_table": t1,
                                "right_table": t2,
                                "left_on": c1,
                                "right_on": c2,
                                "type": "inner"
                            })
        return suggestions
