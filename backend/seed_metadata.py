from app.infrastructure.database.session import SessionLocal, init_meta_db
from app.infrastructure.database.repository import MetadataRepository
from app.domain.schemas import Dataset, DatasetColumn, DatasetMetric

def seed_metadata():
    init_meta_db()
    db = SessionLocal()
    repo = MetadataRepository(db)

    # Check if already seeded
    if repo.get_dataset_by_name("transactions"):
        db.close()
        return

    # Seed transactions dataset
    transactions = Dataset(
        name="transactions",
        table_name="transactions",
        columns=[
            DatasetColumn(name="id", type="number"),
            DatasetColumn(name="date", type="date"),
            DatasetColumn(name="category", type="string"),
            DatasetColumn(name="amount", type="number"),
            DatasetColumn(name="merchant", type="string"),
            DatasetColumn(name="region", type="string", security_scope="region"),
        ],
        metrics=[
            DatasetMetric(name="total_amount", expression="SUM(amount)"),
            DatasetMetric(name="transaction_count", expression="COUNT(*)"),
            DatasetMetric(name="avg_amount", expression="AVG(amount)"),
        ]
    )

    repo.create_dataset(transactions)
    db.close()
    print("✅ Metadata seeded successfully.")

if __name__ == "__main__":
    seed_metadata()
