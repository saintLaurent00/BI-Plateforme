# Chart Plugin System

## Responsibility

A chart plugin owns one visualization type.

Typical responsibilities:

- chart metadata;
- visualization controls;
- result-to-render transformation;
- rendering;
- chart-specific validation.

## Forbidden responsibilities

A plugin must not:

- create `ChartQuery`;
- execute SQL;
- access a datasource;
- mutate dataset metadata;
- perform source-level aggregation.

## Target contract

```text
ChartResult + VisualizationConfig
             ↓
       plugin adapter
             ↓
        plugin renderer
```

The existing `plugins/` directory remains the extension boundary. Legacy `buildQuery` implementations will be removed from plugins as the chart builder migration progresses.
