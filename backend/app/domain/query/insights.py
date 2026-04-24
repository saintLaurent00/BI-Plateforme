from app.domain.schemas import QueryRequest
from typing import List, Dict

import statistics

class InsightGenerator:
    def generate(self, dataset: str, data: List[Dict]) -> List[Dict]:
        if not data:
            return []

        insights = []

        # Heuristic Trend Analysis
        if len(data) >= 2:
            try:
                # Try to find numeric columns for trend
                numeric_cols = [k for k, v in data[0].items() if isinstance(v, (int, float))]
                for col in numeric_cols:
                    values = [d[col] for d in data if d[col] is not None]
                    if len(values) < 2: continue

                    first = values[0]
                    last = values[-1]

                    if first > 0:
                        change = ((last - first) / first) * 100
                        if abs(change) > 10:
                            direction = "hausse" if change > 0 else "baisse"
                            insights.append({
                                "type": "trend",
                                "message": f"Tendance détectée sur {col} : Une {direction} de {abs(change):.1f}% sur la période sélectionnée.",
                                "severity": "warning" if change < 0 else "success"
                            })
            except:
                pass

        # Anomaly Detection (Simple Standard Deviation)
        try:
            numeric_cols = [k for k, v in data[0].items() if isinstance(v, (int, float))]
            for col in numeric_cols:
                values = [d[col] for d in data if d[col] is not None]
                if len(values) >= 3:
                    mean = statistics.mean(values)
                    stdev = statistics.stdev(values)
                    if stdev > 0:
                        for d in data:
                            if d[col] is not None and abs(d[col] - mean) > 2 * stdev:
                                insights.append({
                                    "type": "anomaly",
                                    "message": f"Anomalie détectée sur {col} : La valeur {d[col]} s'écarte significativement de la moyenne.",
                                    "severity": "danger"
                                })
                                break # Only report first for brevity
        except:
            pass

        # Simple heuristic insights for the demo
        if dataset == "transactions":
            # Find highest amount
            try:
                highest = max(data, key=lambda x: x.get('amount', 0) if isinstance(x.get('amount'), (int, float)) else 0)
                if highest.get('amount', 0) > 0:
                    insights.append({
                        "type": "peak",
                        "message": f"Pic détecté : Une transaction de {highest.get('amount')}€ a été enregistrée.",
                        "severity": "info"
                    })
            except:
                pass

            # Count categories
            try:
                categories = set(d.get('category') for d in data if d.get('category'))
                if len(categories) > 1:
                    insights.append({
                        "type": "distribution",
                        "message": f"Votre activité est répartie sur {len(categories)} catégories différentes.",
                        "severity": "success"
                    })
            except:
                pass

        # General insights
        insights.append({
            "type": "volume",
            "message": f"Analyse terminée sur {len(data)} enregistrements.",
            "severity": "neutral"
        })

        return insights
