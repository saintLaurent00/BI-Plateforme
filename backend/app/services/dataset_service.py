from app.models.schemas import Dataset, DatasetColumn, DatasetMetric
from typing import Dict

class DatasetService:
    def __init__(self):
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
