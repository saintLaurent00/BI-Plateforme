# Hifadih BI — Data Model

## Analytical model

```text
DataSource
    ↓
Dataset
    ├── Columns
    ├── Metrics
    └── Calculated Columns
          ↓
      ChartQuery
          ↓
      ChartResult
          ↓
        Chart
          ↓
      Dashboard
```

## Separation

- DataSource describes where data comes from.
- DatasetMetadata describes the analytical source.
- Metadata defines semantic meaning.
- ChartQuery describes requested data.
- ChartResult contains execution output.
- Chart describes a saved visualization.
- Dashboard composes saved charts.

This separation is the foundation for the future Rust query engine.
