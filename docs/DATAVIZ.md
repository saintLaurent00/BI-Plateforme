# Dataviz Architecture

## Principle

Charts visualize a `ChartResult`. They do not query the source themselves.

```text
Metadata
  ↓
Chart Builder
  ↓
ChartQuery
  ↓
Query Executor
  ↓
ChartResult
  ↓
Visualization Adapter
  ↓
Chart Plugin
  ↓
ECharts / D3
```

## Sample dataset

The canonical development dataset lives under:

```text
features/datasets/sample/
├── SampleSalesData.ts
└── SampleSalesDataset.ts
```

The sample rows are deterministic so every chart can be tested against the same analytical source.

## Chart configuration

A saved chart contains two independent objects:

1. `query`: how the data is requested;
2. `visualization`: how the result is rendered.

Never merge these concepts into one opaque configuration object.

## Plugin boundary

Plugins receive result data and visualization configuration.

They do not:

- access SQL.js;
- access IndexedDB;
- build SQL;
- load datasets;
- own semantic metadata.
