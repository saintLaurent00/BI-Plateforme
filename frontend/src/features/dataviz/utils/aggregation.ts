import type { Aggregation, ChartDataPoint } from '../types';

function numericValues<T extends object>(
  rows: readonly T[],
  field: keyof T,
): number[] {
  return rows
    .map((row) => row[field])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

export function aggregate<T extends object>(
  rows: readonly T[],
  field: keyof T,
  operation: Aggregation,
): number {
  if (operation === 'count') return rows.length;

  const values = numericValues(rows, field);
  if (values.length === 0) return 0;

  switch (operation) {
    case 'sum':
      return values.reduce((total, value) => total + value, 0);
    case 'avg':
      return values.reduce((total, value) => total + value, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return 0;
  }
}

export function groupBy<T extends object>(
  rows: readonly T[],
  dimension: keyof T,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const row of rows) {
    const key = String(row[dimension]);
    const group = groups.get(key);

    if (group) {
      group.push(row);
    } else {
      groups.set(key, [row]);
    }
  }

  return groups;
}

export function aggregateByDimension<T extends object>(
  rows: readonly T[],
  dimension: keyof T,
  measure: keyof T,
  operation: Aggregation = 'sum',
): ChartDataPoint[] {
  return Array.from(groupBy(rows, dimension), ([key, group]) => ({
    [String(dimension)]: key,
    [String(measure)]: aggregate(group, measure, operation),
  }));
}
