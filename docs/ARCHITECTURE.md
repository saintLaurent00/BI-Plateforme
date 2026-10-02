# Hifadih BI — Architecture

## 1. Architecture decision

Hifadih BI uses a Business Services / Modular Monolith architecture.

The frontend is organized around business capabilities rather than technical layers such as domain/, features/, infrastructure/ or pages/.

This keeps the current application modular without prematurely turning it into microservices.

## 2. Repository shape

```text
BI-Plateforme/
├── backend/                 # Rust backend foundation
├── frontend/
│   ├── plugins/             # Visualization plugin packages
│   └── src/
│       ├── services/        # Business capabilities
│       ├── platform/        # Runtime mechanisms
│       ├── ui/              # Generic presentation
│       ├── App.tsx
│       └── main.tsx
├── docs/
└── .github/
```

## 3. Frontend business services

```text
services/
├── identity/
├── data/
├── query/
├── visualization/
├── dashboard/
├── exploration/
├── governance/
└── reporting/
```

### identity
Owns authentication and identity concepts: User, Group, Role, Permission, administration and login.

### data
Owns the data catalog and semantic metadata: DataSource, DatasetMetadata, ColumnMetadata, MetricMetadata, CalculatedColumnMetadata, MetadataCatalog and sample data.

### query
Owns the analytical query lifecycle: ChartQuery, dimensions, metrics, filters, validation, SQL compilation, execution and query results.

### visualization
Owns chart models, ChartResult adapters, chart editor, chart selector, chart rendering and the plugin registry.

### dashboard
Owns dashboard models, layout, dashboard list/detail and the dashboard editor.

### exploration
Owns SQL Lab and saved queries.

### governance
Owns audit logs, resource access and row-level security.

### reporting
Owns reporting definitions and workflows.

## 4. Platform

```text
platform/
├── routing/
├── persistence/
│   ├── local/
│   └── sqlite/
└── runtime/
```

Platform is technical infrastructure. It must not become a generic business-logic dumping ground.

## 5. Generic UI

```text
ui/
├── components/
├── layout/
└── documentation/
```

Only reusable, business-agnostic presentation primitives belong here.

## 6. Canonical BI pipeline

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
  ├── SampleQueryExecutor
  └── Rust API executor (future)
  ↓
ChartResult
  ↓
Visualization Adapter
  ↓
Chart Plugin
  ↓
ECharts / D3
```

The fundamental separation is:

```text
METADATA ≠ QUERY ≠ EXECUTION ≠ VISUALIZATION ≠ PERSISTENCE
```

## 7. Service boundaries

Cross-service dependencies must use the owning service public API.

```ts
import { ChartQuery, executeQuery } from '@/services/query';
import { DatasetMetadata } from '@/services/data';
```

Deep imports across another service internals should be avoided.

Generic UI components are imported from @/ui; platform mechanisms from @/platform.

## 8. Visualization plugins

Visualization plugins are isolated under `frontend/plugins/`. The visualization service owns the registry and plugin contract under `services/visualization/plugins/`; plugin packages own chart-specific rendering and configuration.

## 9. Future Rust backend

```text
React Business Service
        ↓
Platform API Adapter
        ↓
Rust Business Module
        ↓
Persistence / Connectors
```

The current repository remains a modular monolith; splitting into deployable services is a future deployment decision, not a prerequisite for clean modularity.

## 10. Migration status

The previous technical-layer directories have been removed from frontend/src/. The target structure is therefore the active source architecture, not a parallel documentation-only proposal.
