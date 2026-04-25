import sys
import os
import asyncio
import time
import sqlite3
import pandas as pd

# Add backend directory to sys.path so 'app' can be found
sys.path.append(os.path.join(os.getcwd(), 'backend'))

def init_test_db(db_path):
    conn = sqlite3.connect(db_path)
    data = [
        {"id": 1, "date": "2024-01-01", "category": "Food", "amount": 50, "region": "Sud"},
        {"id": 2, "date": "2024-01-02", "category": "Tech", "amount": 1200, "region": "North"},
    ]
    df = pd.DataFrame(data)
    df.to_sql("transactions", conn, if_exists="replace", index=False)
    conn.close()

async def test_cache_logic():
    try:
        from app.domain.schemas import QueryRequest, Filter, User, Dataset, DatasetColumn, DatasetMetric
        from app.domain.query.service import QueryService
        from app.infrastructure.cache.manager import cache_manager
        from app.core.config import settings

        print("✅ Imports successful.")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return

    init_test_db(settings.DB_PATH)

    # Setup dummy dataset
    dataset = Dataset(
        name="transactions",
        table_name="transactions",
        columns=[
            DatasetColumn(name="date", type="date"),
            DatasetColumn(name="amount", type="number"),
            DatasetColumn(name="region", type="string", security_scope="region")
        ],
        metrics=[
            DatasetMetric(name="total_amount", expression="SUM(amount)")
        ]
    )

    datasets = {"transactions": dataset}
    query_service = QueryService(datasets=datasets)

    request = QueryRequest(
        dataset="transactions",
        metrics=["total_amount"],
        dimensions=["date"],
        filters=[]
    )

    user = User(
        id="u1", username="test", role_id="analyst", security_attributes={"region": "Sud"}
    )

    # 1. First execution (Database)
    print("\n--- Execution 1 (Database expected) ---")
    start = time.time()
    res1 = await query_service.execute_query(request, user)
    duration1 = time.time() - start
    print(f"Source: {res1['metadata']['source']}")
    print(f"Duration: {duration1:.4f}s")

    # 2. Second execution (Cache)
    print("\n--- Execution 2 (Cache expected) ---")
    start = time.time()
    res2 = await query_service.execute_query(request, user)
    duration2 = time.time() - start
    print(f"Source: {res2['metadata']['source']}")
    print(f"Duration: {duration2:.4f}s")

    if res2['metadata']['source'] == 'cache':
        print("✅ Cache integration verified.")
    else:
        print("❌ Cache integration failed.")

    # 3. Security context isolation check
    print("\n--- Execution 3 (Different User context - Database expected) ---")
    user2 = User(
        id="u2", username="test2", role_id="analyst", security_attributes={"region": "North"}
    )
    res3 = await query_service.execute_query(request, user2)
    print(f"Source: {res3['metadata']['source']}")
    if res3['metadata']['source'] == 'database':
        print("✅ Security context isolation in cache verified.")
    else:
        print("❌ Security context leakage in cache!")

if __name__ == "__main__":
    asyncio.run(test_cache_logic())
