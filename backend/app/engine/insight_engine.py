from __future__ import annotations

from typing import Any


class InsightEngine:
    def generate(self, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not rows:
            return [{"type": "empty", "severity": "info", "message": "Aucune donnée sur ce périmètre."}]

        first_row = rows[0]
        numeric_keys = [key for key, value in first_row.items() if isinstance(value, (int, float))]
        if not numeric_keys:
            return []

        key = numeric_keys[0]
        values = [float(row[key]) for row in rows if row.get(key) is not None]
        if not values:
            return []

        max_value = max(values)
        min_value = min(values)
        delta = max_value - min_value

        return [
            {
                "type": "spread",
                "severity": "info",
                "message": f"Amplitude observée sur {key}: {delta:.2f}.",
            }
        ]
