# Hifadih BI — Metadata Architecture

## 1. Purpose

Metadata describes **what a dataset means** and **how the platform may use it**.

It is not the query result and it is not the database itself.

The metadata contract is the stable boundary between:

```
Data source
    ↓
Dataset metadata
    ↓
Semantic layer
    ↓
Chart query
    ↓
Query executor
    ↓
Chart result
```

The frontend uses this contract today with local/sample data. The future Rust query engine will consume the same semantic concepts against PostgreSQL and other supported engines.

## 2. Four levels of metadata

### 2.1 Data source metadata

Describes the connection context:

- engine
- environment
- database/schema
- ownership and tags

It must never contain credentials in the frontend metadata model.

### 2.2 Dataset metadata

Describes the analytical object:

- physical or virtual dataset
- source reference
- schema/table or virtual SQL
- description
- columns
- metrics
- calculated columns
- temporal configuration
- statistics
- capabilities
- governance

A dataset is the principal semantic scope for chart construction.

### 2.3 Column metadata

A column has both a **semantic identity** and a **physical identity**.

Example:

```ts
{
  name: 'unitPrice',
  physicalName: 'unit_price',
  label: 'Unit Price',
  dataType: 'number',
  role: 'measure'
}
```

This distinction is intentional. The UI/query model should not be forced to expose database naming conventions.

Column metadata controls:

- data type
- dimension/measure/identifier/temporal role
- groupability
- filterability
- nullability
- temporal behavior
- formatting
- optional expression

### 2.4 Semantic computed objects

#### Metrics

A metric is evaluated in an aggregate context.

Examples:

```sql
SUM(revenue)
SUM(profit)
SUM(profit) / NULLIF(SUM(revenue), 0) * 100
COUNT(DISTINCT customer_id)
```

Metrics can be saved at dataset level or defined ad hoc by a chart.

#### Calculated columns

A calculated column is evaluated at row level.

Examples:

```sql
quantity * unit_price
profit / NULLIF(quantity, 0)
CASE WHEN revenue > 10000 THEN 'High Value' ELSE 'Standard' END
```

Aggregate functions are deliberately forbidden in calculated columns.

This follows the same core distinction used by Superset's semantic layer: virtual metrics are aggregate expressions, while calculated columns are row-level expressions. citeturn0search0turn1search8

## 3. Metadata invariants

1. Every dataset has a stable ID.
2. Every column has a stable semantic name and an explicit physical name.
3. Metrics and calculated columns belong to a dataset semantic scope.
4. SQL expressions are metadata, not executable browser code.
5. Credentials never belong in dataset metadata.
6. UI labels are not used as query identifiers.
7. Metadata is independent from React, ECharts, SQLite, HTTP, and Rust.
8. Query definitions reference semantic names, not database-specific UI labels.
9. Visualization configuration is separate from metadata.
10. Query execution is separate from metadata.

## 4. Superset-inspired, Hifadih-specific model

Superset exposes dataset columns, metrics, temporal configuration and datasource capabilities as metadata, and its query schema separates dimensions, metrics, filters, ordering, limits and time configuration. citeturn1search2turn1search3turn1search6

Hifadih keeps that proven separation but adds an explicit physical/semantic mapping:

```
physicalName  →  name  →  label
unit_price        unitPrice   Unit Price
```

This is important for a future Rust/PostgreSQL query engine because the semantic query remains stable even when the physical database schema differs.

## 5. What metadata is NOT

Metadata is not:

- a chart query
- a chart result
- a chart visualization configuration
- a SQL execution engine
- a database connection pool
- a React component
- a plugin renderer

The resulting dependency direction is:

```
metadata/domain
      ↓
query
      ↓
execution
      ↓
visualization
```

Never reverse these dependencies.

## 6. Future extensions

The metadata model is intentionally ready for:

- richer time grains
- dataset certification
- metric certification
- semantic types
- row-level security metadata
- column-level permissions
- data quality/profile information
- lineage
- freshness
- caching policy
- compatible-dimension/metric discovery
- external semantic-layer providers

These should be added without making the chart plugins responsible for them.
