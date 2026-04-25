from app.infrastructure.database.session import SessionLocal, init_meta_db
from app.infrastructure.database.repository import MetadataRepository
from app.infrastructure.database.models import PermissionModel, RoleModel, UserModel, ScheduledJobModel
from app.domain.schemas import Dataset, DatasetColumn, DatasetMetric
from app.worker.scheduler import ScheduledJob
import os

def seed_complete_metadata():
    # Suppression de l'ancienne meta DB pour repartir sur le nouveau schéma propre
    if os.path.exists("prism_meta.db"):
        os.remove("prism_meta.db")

    init_meta_db()
    db = SessionLocal()
    repo = MetadataRepository(db)

    # 1. Permissions
    perms = [
        PermissionModel(id="read:datasets", name="Read Datasets"),
        PermissionModel(id="write:datasets", name="Write Datasets"),
        PermissionModel(id="read:dashboards", name="Read Dashboards"),
        PermissionModel(id="write:dashboards", name="Write Dashboards"),
        PermissionModel(id="admin:all", name="Full Administration"),
    ]
    db.add_all(perms)
    db.commit()

    # 2. Roles
    admin_role = RoleModel(id="admin", name="Administrator")
    viewer_role = RoleModel(id="viewer", name="Viewer")

    admin_role.permissions = perms
    viewer_role.permissions = [p for p in perms if "read" in p.id]

    db.add_all([admin_role, viewer_role])
    db.commit()

    # 3. Users
    users = [
        UserModel(
            id="u1", username="admin", role_id="admin",
            security_attributes={"region": "*"} # Accès global
        ),
        UserModel(
            id="u2", username="jean_sud", role_id="viewer",
            security_attributes={"region": "Sud"} # Accès restreint
        ),
        UserModel(
            id="u3", username="marie_north", role_id="viewer",
            security_attributes={"region": "North"}
        )
    ]
    db.add_all(users)
    db.commit()

    # 4. Dataset
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
        ]
    )
    repo.create_dataset(transactions)

    # 5. Scheduled Job
    job = ScheduledJob(
        id="alert_sales_drop",
        name="Alerte Baisse de Ventes",
        dataset="transactions",
        metric="sum(amount)",
        threshold=100.0,
        operator="<",
        interval_seconds=60
    )
    repo.create_job(job)

    db.close()
    print("✅ Complete Metadata (Identity, BI, Alerts) seeded successfully.")

if __name__ == "__main__":
    seed_complete_metadata()
