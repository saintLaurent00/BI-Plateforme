# Query Engine Contract

## Contract

`ChartQuery` is the only query definition consumed by visualization workflows.

```text
DatasetMetadata
      ↓
ChartQuery
      ↓
validateChartQuery()
      ↓
compileChartQuery()
      ↓
QueryExecutor
      ↓
ChartResult
```

## Current executor

`SampleQueryExecutor` executes against deterministic local data through SQL.js.

It is a development adapter, not the future production query engine.

## Future executor

The Rust backend will implement the same conceptual contract:

```text
React ChartQuery
      ↓ HTTP
Rust API
      ↓
Rust query planner/compiler
      ↓
PostgreSQL / supported engine
      ↓
ChartResult
```

The chart layer must not change when the executor changes.

## Security invariant

Arbitrary SQL must never be executed with JavaScript `eval` or `Function`. SQL expressions are declarative metadata and are validated before execution.

## Query responsibilities

The query layer owns:

- dimensions;
- metrics;
- calculated columns;
- filters;
- time range;
- time grain;
- ordering;
- having;
- pagination.

Visualization configuration does not belong in `ChartQuery`.
