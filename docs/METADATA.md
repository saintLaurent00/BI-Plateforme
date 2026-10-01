# Hifadih BI Metadata Model

## 1. Purpose

Hifadih BI uses a metadata layer similar in principle to Apache Superset, but the model is explicitly separated into:

- **Identity metadata** — users, groups, roles, permissions.
- **Source metadata** — data sources/connections.
- **Dataset metadata** — physical/virtual datasets, columns, metrics, calculated columns.
- **Analytics metadata** — charts, dashboards, saved SQL queries.
- **Security metadata** — row-level security policies and resource access.
- **Operational metadata** — audit logs and scheduled reports.

The metadata layer describes **what Hifadih BI knows about the platform**. It is not the analytical data itself.

Superset similarly maintains metadata for chart and dashboard definitions, users and other application information, while the analytical data remains in external data sources. citeturn0search9turn0search10

## 2. Core model

```text
MetadataCatalog
├── Identity
│   ├── User
│   ├── Group
│   ├── Role
│   └── Permission
│
├── Sources
│   └── DataSource
│
├── Semantic / Dataset
│   └── DatasetMetadata
│       ├── ColumnMetadata[]
│       ├── MetricMetadata[]
│       ├── CalculatedColumnMetadata[]
│       ├── TimeMetadata
│       ├── Statistics
│       ├── Capabilities
│       └── Governance
│
├── Analytics
│   ├── Chart
│   ├── Dashboard
│   └── SavedQuery
│
├── Security
│   └── RowLevelSecurityPolicy
│
└── Operations
    ├── Report
    └── AuditLog
```

The canonical TypeScript contracts live under `frontend/src/domain/`.

## 3. Identity

### User

A user is an identity in Hifadih BI.

Important relations:

```text
User
 ├── roleIds[]
 └── groupIds[]
```

A user does not directly own permission definitions. Permissions are granted through roles.

### Group

A group represents organizational membership.

```text
Group
 ├── memberIds[]
 └── roleIds[]
```

Groups are useful for resource membership and sharing. This follows the same conceptual separation used by current Superset security: groups represent organizational membership while roles primarily represent capability grants. citeturn0search2

### Role

A role is a capability bundle.

```text
Role
 └── permissionIds[]
```

Roles are intentionally separated from groups:

- **Group** = who belongs together.
- **Role** = what a user/group can do.
- **Permission** = action allowed on a resource.

### Permission

A permission is modeled as:

```text
(resource, action, optional scope)
```

Examples:

- `datasets:read`
- `datasets:update`
- `charts:create`
- `dashboards:delete`
- `sql_lab:execute`
- `users:manage`

This keeps authorization extensible without hard-coding every possible permission into users.

## 4. Data sources

`DataSource` represents a configured connection.

It intentionally does **not** contain a raw database password.

Secrets are represented by a `connectionSecretRef` so authentication material can later live in a backend secret manager.

```text
DataSource
├── identity
├── engine
├── connection metadata
├── environment
├── governance
└── connectionSecretRef
```

This becomes the future Rust API boundary for connection management.

## 5. Dataset semantic metadata

`DatasetMetadata` is the semantic contract consumed by the Chart Builder and Query Engine.

```text
DatasetMetadata
├── identity
├── source
├── columns[]
├── metrics[]
├── calculatedColumns[]
├── time
├── statistics
├── capabilities
└── governance
```

### Columns

A column separates semantic naming from physical SQL naming:

```text
name         = unitPrice
physicalName = unit_price
label        = Unit Price
```

The UI and query model use `name`.

The SQL compiler resolves `name` to `physicalName`.

### Metrics

Metrics are aggregate/analytic definitions:

```text
SUM(revenue)
SUM(profit)
SUM(profit) / NULLIF(SUM(revenue), 0)
COUNT(DISTINCT customer_id)
```

This follows the same semantic-layer distinction used by Superset, where virtual metrics are aggregate expressions. citeturn0search0

### Calculated columns

Calculated columns are row-level expressions:

```text
quantity * unit_price
quantity * unit_price * (1 - discount)
profit / NULLIF(quantity, 0)
```

Aggregate functions are deliberately excluded from calculated-column semantics. Superset uses the same distinction between metrics and calculated columns. citeturn0search0

## 6. Chart

A chart is a persisted analytical definition.

```text
Chart
├── datasetId
├── chartType
├── query
├── visualization
├── ownerIds[]
└── metadata
```

The important rule is:

```text
Chart
 ├── Query definition
 └── Visualization definition
```

A chart does not own SQL execution logic.

The query is compiled and executed through the Query Engine.

The visualization configuration is consumed by a chart plugin.

Superset similarly persists the information needed to recreate a saved visualization, including its query, chart type and options. citeturn0search0

## 7. Dashboard

A dashboard is a composition of charts.

```text
Dashboard
├── chart references
├── layout
├── owners
├── publication status
├── tags
└── metadata
```

A dashboard does not duplicate chart definitions.

```text
Dashboard
   │
   ├── Chart A
   ├── Chart B
   └── Chart C
```

Each chart remains independently persisted and reusable.

Superset exposes the same broad model through dashboard resources and their chart definitions. citeturn0search11

## 8. Saved queries

`SavedQuery` stores reusable SQL for SQL Lab and future workflows.

```text
SavedQuery
├── SQL
├── dataSourceId
├── owners
├── tags
└── execution metadata
```

A saved query is **not automatically a chart** and **not automatically a dataset**.

A future workflow may create a virtual dataset from a saved query, but those remain separate domain objects.

## 9. Security

### Resource access

Resource ownership and access should be modeled separately from capability roles.

```text
User / Group
       │
       ├── ownership / membership
       │
Role ──┴── permissions
```

This avoids coupling "who can access this resource" with "what operations this identity can perform."

Current Superset documentation explicitly distinguishes users, groups and roles as subjects and recommends groups for new resource-level membership while roles remain focused on permissions. citeturn0search2

### Row-level security

`RowLevelSecurityPolicy` constrains rows returned from a dataset:

```text
Dataset
  │
  └── Policy
       ├── clause
       ├── groups
       └── roles
```

Example:

```sql
region = 'West Africa'
```

The policy is applied by the query execution layer, never by a visualization plugin.

## 10. Audit

Every important mutation should eventually generate an `AuditLog`.

```text
AuditLog
├── actorUserId
├── action
├── resourceType
├── resourceId
├── details
└── createdAt
```

Audit metadata is operational metadata. It is not mixed into chart or dataset query definitions.

## 11. Reports

Reports represent scheduled or exported analytical artifacts.

They reference dashboards/charts indirectly through future scheduling configuration rather than embedding analytical definitions.

## 12. Architectural rules

1. Domain entities use semantic/camelCase names.
2. DTO/API/storage naming is handled at infrastructure boundaries.
3. Domain models never contain raw credentials.
4. Users do not directly own permissions.
5. Groups represent membership; roles represent capabilities.
6. Dataset metadata is separate from query definitions.
7. Query definitions are separate from visualization configuration.
8. Dashboards reference charts instead of duplicating them.
9. Saved SQL queries remain distinct from datasets and charts.
10. Security policies are enforced before visualization.
11. Plugins never access users, roles, databases, or SQL execution.
12. Audit logs are append-oriented operational metadata.
13. Rust will implement infrastructure ports later without changing the domain contracts.

## 13. Relation to the execution pipeline

```text
User
  ↓
Chart Builder
  ↓
DatasetMetadata
  ↓
ChartQuery
  ↓
QueryValidator
  ↓
QueryCompiler
  ↓
QueryExecutor
  ↓
ChartResult
  ↓
Visualization Adapter
  ↓
Chart Plugin
```

The metadata layer therefore remains upstream of query compilation and visualization.

This is the foundation for a Superset-inspired BI platform without coupling Hifadih BI to Superset's internal implementation.
