from app.domain.schemas import Dataset, DatasetColumn, DatasetMetric
from typing import Dict

class DatasetService:
    def __init__(self):
        # Mappe dataset -> allowed roles
        self.dataset_permissions: Dict[str, List[str]] = {
            "transactions": ["admin", "viewer", "analyst"]
        }
        self.datasets: Dict[str, Dataset] = {
            "transactions": Dataset(
                name="transactions",
                table_name="transactions",
                columns=[
                    DatasetColumn(name="id", type="number"),
                    DatasetColumn(name="date", type="date"),
                    DatasetColumn(name="category", type="string"),
                    DatasetColumn(name="amount", type="number"),
                    DatasetColumn(name="merchant", type="string"),
                    DatasetColumn(name="region", type="string", security_scope="region"),
                    DatasetColumn(name="is_expensive", type="boolean", expression="CASE WHEN amount > 100 THEN 1 ELSE 0 END"),
                ],
                metrics=[
                    DatasetMetric(name="total_amount", expression="SUM(amount)"),
                    DatasetMetric(name="transaction_count", expression="COUNT(*)"),
                    DatasetMetric(name="avg_amount", expression="AVG(amount)"),
                ]
            )
        }

    def get_all(self):
        return list(self.datasets.values())

    def get_by_name(self, name: str) -> Dataset:
        return self.datasets.get(name)

    def is_allowed(self, dataset_name: str, role_id: str) -> bool:
        allowed_roles = self.dataset_permissions.get(dataset_name, [])
        return "admin" in role_id or role_id in allowed_roles
