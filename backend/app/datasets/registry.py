from __future__ import annotations

from app.schemas.dataset import DatasetColumn, DatasetDefinition, MetricDefinition


class DatasetRegistry:
    def __init__(self) -> None:
        self._datasets: dict[str, DatasetDefinition] = {
            "transactions": DatasetDefinition(
                name="transactions",
                table_name="fct_transactions",
                columns={
                    "date": DatasetColumn(key="date", physical_name="transaction_date", data_type="date"),
                    "region": DatasetColumn(key="region", physical_name="region", data_type="string"),
                    "channel": DatasetColumn(key="channel", physical_name="channel", data_type="string"),
                    "amount": DatasetColumn(key="amount", physical_name="amount", data_type="number"),
                },
                metrics={
                    "sum(amount)": MetricDefinition(
                        key="sum(amount)",
                        sql_expression="SUM(amount)",
                        label="Montant total",
                    ),
                    "count(*)": MetricDefinition(
                        key="count(*)",
                        sql_expression="COUNT(*)",
                        label="Transactions",
                    ),
                    "avg(amount)": MetricDefinition(
                        key="avg(amount)",
                        sql_expression="AVG(amount)",
                        label="Panier moyen",
                    ),
                },
            )
        }

    def get(self, dataset_name: str) -> DatasetDefinition:
        if dataset_name not in self._datasets:
            raise KeyError(f"Dataset inconnu: {dataset_name}")
        return self._datasets[dataset_name]

    def list(self) -> list[DatasetDefinition]:
        return list(self._datasets.values())
