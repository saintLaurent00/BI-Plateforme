from app.models.schemas import QueryRequest
from typing import List, Dict

class InsightGenerator:
    def generate(self, dataset: str, data: List[Dict]) -> List[Dict]:
        if not data:
            return []

        insights = []

        # Simple heuristic insights for the demo
        if dataset == "transactions":
            # Find highest amount
            highest = max(data, key=lambda x: x.get('amount', 0) if isinstance(x.get('amount'), (int, float)) else 0)
            insights.append({
                "type": "peak",
                "message": f"Pic détecté : Une transaction de {highest.get('amount')}€ a été enregistrée le {highest.get('date')}.",
                "severity": "info"
            })

            # Count categories
            categories = set(d.get('category') for d in data if d.get('category'))
            if len(categories) > 1:
                insights.append({
                    "type": "distribution",
                    "message": f"Votre activité est répartie sur {len(categories)} catégories différentes.",
                    "severity": "success"
                })

        # General insights
        insights.append({
            "type": "volume",
            "message": f"Analyse terminée sur {len(data)} enregistrements.",
            "severity": "neutral"
        })

        return insights
