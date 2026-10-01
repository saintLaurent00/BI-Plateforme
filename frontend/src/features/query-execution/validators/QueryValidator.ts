import type { ChartQuery } from '../../../domain/query';
import { getDatasetColumn, getDatasetMetric } from '../../../domain/dataset';
import type { DatasetMetadata } from '../../../domain/dataset';

const AGGREGATE_FUNCTIONS = /\b(SUM|AVG|MIN|MAX|COUNT)\s*\(/i;

function assertExpression(expression: string, label: string): void {
  if (!expression.trim()) throw new Error(`${label} expression cannot be empty.`);
  if (/;|--|\/\*/.test(expression)) {
    throw new Error(`${label} expression contains forbidden SQL syntax.`);
  }
}

export function validateChartQuery(dataset: DatasetMetadata, query: ChartQuery): void {
  if (dataset.id !== query.datasetId) {
    throw new Error('Chart query dataset does not match the selected dataset.');
  }

  for (const dimension of query.dimensions) {
    if (!getDatasetColumn(dataset, dimension.column)) {
      throw new Error(`Unknown dimension: ${dimension.column}`);
    }
  }

  for (const metric of query.metrics) {
    assertExpression(metric.expression, `Metric "${metric.name}"`);
    if (
      metric.expressionType === 'saved' &&
      !getDatasetMetric(dataset, metric.id ?? metric.name)
    ) {
      throw new Error(`Unknown saved metric: ${metric.name}`);
    }
  }

  for (const column of query.calculatedColumns ?? []) {
    assertExpression(column.expression, `Calculated column "${column.name}"`);
    if (AGGREGATE_FUNCTIONS.test(column.expression)) {
      throw new Error(`Calculated column "${column.name}" cannot contain aggregate functions.`);
    }
  }

  for (const filter of query.filters ?? []) {
    if (!getDatasetColumn(dataset, filter.column)) {
      throw new Error(`Unknown filter column: ${filter.column}`);
    }
  }

  for (const order of query.orderBy ?? []) {
    if (
      !getDatasetColumn(dataset, order.column) &&
      !query.metrics.some(metric => metric.name === order.column || metric.label === order.column)
    ) {
      throw new Error(`Unknown order column: ${order.column}`);
    }
  }

  if (query.limit !== undefined && (query.limit < 1 || query.limit > 50000)) {
    throw new Error('Query limit must be between 1 and 50000.');
  }
}
