# Frontend Architecture

The frontend follows a feature-first modular monolith. Business capabilities live under `frontend/src/features`; platform mechanisms and generic presentation primitives remain shared.

```text
frontend/src/
├── features/
│   ├── identity/       # models, application services and identity UI
│   ├── datasets/       # datasets, data catalog and metadata
│   ├── queries/        # query models, validation and execution
│   ├── charts/         # chart models, adapters, editors and plugins
│   ├── dashboards/     # dashboard models, listing, detail and editor
│   ├── exploration/    # SQL Lab and saved-query workflows
│   ├── governance/     # audit, permissions and row-level security
│   └── reporting/      # report definitions and workflows
├── platform/
│   ├── routing/
│   ├── persistence/
│   ├── runtime/
│   └── configuration/
├── ui/
│   ├── components/     # reusable presentation primitives
│   ├── layout/
│   └── documentation/
├── App.tsx
├── main.tsx
└── index.css
```

## Feature ownership

A feature owns its domain models, application services, feature-specific UI, and adapters where applicable.

- **identity** — users, groups, roles, permissions, administration and login.
- **datasets** — data sources, datasets, metadata, semantic model, catalog and sample data.
- **queries** — query models, builder, validation, compilation and execution.
- **charts** — chart models, visualization adapters, chart editor and chart plugins.
- **dashboards** — dashboard models, layout, listing, detail and editor.
- **exploration** — SQL Lab and saved-query workflows.
- **governance** — audit, access control and row-level security.
- **reporting** — report definitions and reporting contracts.

New business code must be added to its owning feature, not to a generic service directory.

## Migration compatibility

The `services/` tree is being retired as the implementation location. Where legacy imports still exist, files under `services/` should be thin re-export facades pointing to the corresponding feature. They must not contain a second copy of the business implementation.

Identity, datasets, charts, dashboards and exploration now expose feature-first public APIs. Their core domain models, application services and feature UI implementations are located under `features/`; legacy service paths are being retained as compatibility facades. Queries are also migrated at the model, validation, compiler and execution layers, with the legacy service API forwarding to `features/queries`. Remaining cleanup focuses on replacing legacy imports throughout the application and validating the complete frontend build.

## Platform

`platform/` contains runtime mechanisms that are not business capabilities: routing, local persistence and SQLite, runtime utilities, and configuration. Business logic must not be moved into platform.

## Generic UI

`ui/` contains reusable presentation primitives only: tables, modals, badges, skeletons, generic cards, and application layout. Business-specific UI belongs to its owning feature.

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

The charts feature owns the registry and adapters; plugin packages implement chart-specific rendering and query behavior. Plugin packages consume the shared plugin contract rather than defining a global plugin API.

## Backend evolution

The current frontend is a modular monolith. Its module boundaries are compatible with a future Rust backend:

```text
Frontend feature
      ↓
platform/API adapter
      ↓
Rust business module
```

The architecture does not require microservices today.
