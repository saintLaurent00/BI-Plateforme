# Frontend Architecture

The frontend uses a Business Services / Modular Monolith architecture.

```text
frontend/src/
├── services/
│   ├── identity/
│   ├── data/
│   ├── query/
│   ├── visualization/
│   ├── dashboard/
│   ├── exploration/
│   ├── governance/
│   └── reporting/
├── platform/
│   ├── routing/
│   ├── persistence/
│   ├── runtime/
│   └── configuration/
├── ui/
│   ├── components/
│   ├── layout/
│   └── documentation/
├── App.tsx
├── main.tsx
└── index.css
```

## Business services

Each service owns its business capability, including models, application logic, execution logic and UI where applicable.

- identity — users, groups, roles, permissions, administration and login.
- data — data sources, datasets, metadata, semantic model, catalog and sample data.
- query — query models, builder, validation, compilation and execution.
- visualization — chart models, visualization adapters, chart editor and chart plugins.
- dashboard — dashboard models, layout, dashboard listing, detail and editor.
- exploration — SQL Lab and saved-query workflows.
- governance — audit, access control and row-level security.
- reporting — report definitions and reporting contracts.

## Platform

platform/ contains runtime mechanisms that are not business capabilities: routing, local persistence and SQLite, runtime utilities, and configuration.

Business logic must not be moved into platform/.

## Generic UI

ui/ contains reusable presentation primitives only: DataTable, Modal, Badge, Skeleton, generic cards, and application layout.

Business-specific UI belongs to its owning service.

## Query and visualization boundary

```text
DataSource
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

Metadata, query construction, execution, visualization and persistence remain separate responsibilities.

## Plugin boundary

Visualization plugins live in frontend/plugins/.

The visualization service owns the registry and adapters; plugin packages implement chart-specific rendering and query behavior.

The registry contract lives at `services/visualization/plugins/`; plugin packages consume that contract rather than defining a global plugin API.

## Backend evolution

The current frontend is a modular monolith. Its module boundaries are intentionally compatible with a future Rust backend:

```text
Frontend service
      ↓
platform/API adapter
      ↓
Rust business module
```

The architecture does not require microservices today.
