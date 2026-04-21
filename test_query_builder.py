from app.models.schemas import QueryRequest, Dataset, DatasetColumn, DatasetMetric, Filter, OrderBy
from app.engine.query_builder import QueryBuilder
import json

datasets = {
    "transactions": Dataset(
        name="transactions",
        table_name="transactions",
        columns=[
            DatasetColumn(name="id", type="number"),
            DatasetColumn(name="date", type="date"),
            DatasetColumn(name="category", type="string"),
            DatasetColumn(name="amount", type="number"),
        ],
        metrics=[
            DatasetMetric(name="total_amount", expression="SUM(amount)"),
        ]
    )
}

qb = QueryBuilder(datasets)

# Test 1: Basic query with granularity
req1 = QueryRequest(
    dataset="transactions",
    metrics=["total_amount"],
    dimensions=["date"],
    granularity="month",
    limit=5
)
print("Test 1 SQL:", qb.build(req1))

# Test 2: Filters and sorting
req2 = QueryRequest(
    dataset="transactions",
    metrics=["total_amount"],
    dimensions=["category"],
    filters=[Filter(field="amount", op="gt", value=100)],
    order_by=[OrderBy(field="total_amount", direction="desc")],
    limit=10
)
print("Test 2 SQL:", qb.build(req2))
