# Backend Architecture

The backend is Rust-only and follows the functional responsibilities of Apache Superset: API, models, connectors, commands, query execution, security, tasks, cache, configuration and errors.

Visualization plugins do not own database connections or SQL execution.
