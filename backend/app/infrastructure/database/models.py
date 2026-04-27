"""
🗄️ Modèles de Données SQLAlchemy (Infrastructure)
-----------------------------------------------
Définition des tables du Metadata Store (prism_meta.db).
Ce fichier contient la structure relationnelle pour stocker l'identité,
la sémantique BI, la sécurité (RLS/RBAC) et le scheduling.
"""

from sqlalchemy import Column, String, Integer, JSON, ForeignKey, Table, Text, DateTime, Float, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

# --- Tables de liaison RBAC ---
user_groups = Table(
    "user_groups",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id")),
    Column("group_id", String, ForeignKey("groups.id"))
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", String, ForeignKey("roles.id")),
    Column("permission_id", String, ForeignKey("permissions.id"))
)

# --- Identity & Security ---

class PermissionModel(Base):
    __tablename__ = "permissions"
    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)

class RoleModel(Base):
    __tablename__ = "roles"
    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)

    permissions = relationship("PermissionModel", secondary=role_permissions)

class GroupModel(Base):
    __tablename__ = "groups"
    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True)
    hashed_password = Column(String) # Simulation pour MVP
    role_id = Column(String, ForeignKey("roles.id"))

    # Attributs RLS stockés en JSON: {"region": "Sud", "dept": "Sales"}
    security_attributes = Column(JSON, default={})
    is_active = Column(Boolean, default=True)

    role = relationship("RoleModel")
    groups = relationship("GroupModel", secondary=user_groups)

# --- BI Core Metadata ---

class DatasetModel(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    table_name = Column(String, nullable=False) # For physical, table name; for virtual, could be null
    description = Column(Text)
    kind = Column(String, default="physical") # 'physical' or 'virtual'
    sql = Column(Text) # For virtual datasets

    columns = relationship("ColumnModel", back_populates="dataset", cascade="all, delete-orphan")
    metrics = relationship("MetricModel", back_populates="dataset", cascade="all, delete-orphan")

class ColumnModel(Base):
    __tablename__ = "columns"

    id = Column(String, primary_key=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    name = Column(String, nullable=False)
    label = Column(String) # For renaming
    type = Column(String, nullable=False)
    expression = Column(Text)
    is_visible = Column(Boolean, default=True)
    security_scope = Column(String)
    description = Column(Text)

    dataset = relationship("DatasetModel", back_populates="columns")

class MetricModel(Base):
    __tablename__ = "metrics"

    id = Column(String, primary_key=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    name = Column(String, nullable=False)
    expression = Column(Text, nullable=False)
    description = Column(Text)

    dataset = relationship("DatasetModel", back_populates="metrics")

# --- Dashboards & Charts ---

class DashboardModel(Base):
    __tablename__ = "dashboards"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    layout = Column(JSON)
    background_color = Column(String, default="#f8fafc")

class ChartModel(Base):
    __tablename__ = "charts"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    dataset_name = Column(String, nullable=False)
    chart_type = Column(String, nullable=False)
    x_axis = Column(JSON)
    y_axis = Column(JSON)
    config = Column(JSON)

# --- Proactivity & Scheduling ---

class ScheduledJobModel(Base):
    __tablename__ = "scheduled_jobs"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    dataset = Column(String, nullable=False)
    metric = Column(String, nullable=False)
    threshold = Column(Float, nullable=False)
    operator = Column(String, nullable=False) # '>', '<', '=='
    interval_seconds = Column(Integer, nullable=False)
    last_run = Column(DateTime)
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)

# --- Caching Configuration (System Policies) ---

class CachePolicyModel(Base):
    __tablename__ = "cache_policies"

    id = Column(String, primary_key=True)
    dataset_name = Column(String, unique=True)
    ttl = Column(Integer, default=300) # seconds
    is_enabled = Column(Boolean, default=True)
