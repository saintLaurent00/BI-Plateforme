from sqlalchemy import Column, String, Integer, JSON, ForeignKey, Table, Text
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class DatasetModel(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    table_name = Column(String, nullable=False)
    description = Column(Text)

    columns = relationship("ColumnModel", back_populates="dataset", cascade="all, delete-orphan")
    metrics = relationship("MetricModel", back_populates="dataset", cascade="all, delete-orphan")

class ColumnModel(Base):
    __tablename__ = "columns"

    id = Column(String, primary_key=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # 'string', 'number', 'date', 'boolean'
    expression = Column(Text) # For calculated columns
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
