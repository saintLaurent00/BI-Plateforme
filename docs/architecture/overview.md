# Architecture

BI-Plateforme follows the structural model of Apache Superset while replacing the backend implementation with Rust.

Core flow:

Data → Database / Connector → Dataset → Query → Result → Visualization → Dashboard

Top-level responsibilities:

- `backend/`: Rust backend, API, models, connectors, query execution, security, tasks and cache.
- `frontend/`: React/TypeScript application organized around Dashboard, Explore, SQL Lab and reusable components.
- `plugins/`: visualization plugins.
- `packages/`: reusable frontend packages.
- `sdk/`: embedding/integration SDK.
- `websocket/`: realtime communication.
- `tests/`: backend, frontend, plugin and integration tests.
