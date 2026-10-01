import type { ChartQuery, QueryFilter, QueryOrder } from '../../../domain/query';
import type { DatasetMetadata } from '../../../domain/dataset';

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

function quoteIdentifier(value: string): string {
  if (!IDENTIFIER.test(value)) throw new Error(`Invalid identifier: ${value}`);
  return `"${value}"`;
}

function validateExpression(expression: string): void {
  if (!expression.trim()) throw new Error('SQL expression cannot be empty.');
  if (/;|--|\/\*/.test(expression)) {
    throw new Error('SQL expressions cannot contain statements or comments.');
  }
}

function resolvePhysicalColumn(dataset: DatasetMetadata, semanticName: string): string {
  const column = dataset.columns.find(item => item.name === semanticName);
  if (column) return column.physicalName;
  const calculated = dataset.calculatedColumns.find(item => item.name === semanticName);
  if (calculated) return calculated.name;
  return semanticName;
}

function compileDimension(dataset: DatasetMetadata, column: string, grain?: string): string {
  const quoted = quoteIdentifier(resolvePhysicalColumn(dataset, column));
  if (!grain) return quoted;

  if (grain === 'quarter') {
    return `strftime('%Y', ${quoted}) || '-Q' || (((CAST(strftime('%m', ${quoted}) AS INTEGER) - 1) / 3) + 1)`;
  }

  const formats: Record<string, string> = {
    year: '%Y',
    month: '%Y-%m',
    week: '%Y-%W',
    day: '%Y-%m-%d',
    hour: '%Y-%m-%d %H',
    minute: '%Y-%m-%d %H:%M',
  };

  const format = formats[grain];
  return format ? `strftime('${format}', ${quoted})` : quoted;
}

function compileFilter(dataset: DatasetMetadata, filter: QueryFilter): string {
  const column = quoteIdentifier(resolvePhysicalColumn(dataset, filter.column));
  const value = filter.value;

  switch (filter.operator) {
    case 'IS NULL':
    case 'IS NOT NULL':
      return `${column} ${filter.operator}`;
    case 'IN':
    case 'NOT IN': {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${filter.operator} requires a non-empty array.`);
      }
      const values = value.map(item =>
        typeof item === 'number'
          ? String(item)
          : `'${String(item).replace(/'/g, "''")}'`,
      );
      return `${column} ${filter.operator} (${values.join(', ')})`;
    }
    default: {
      if (value === undefined || value === null) {
        throw new Error(`${filter.operator} requires a value.`);
      }
      const literal =
        typeof value === 'number'
          ? String(value)
          : typeof value === 'boolean'
            ? value ? '1' : '0'
            : `'${String(value).replace(/'/g, "''")}'`;
      const operator = filter.operator === '==' ? '=' : filter.operator;
      return `${column} ${operator} ${literal}`;
    }
  }
}

function compileOrder(dataset: DatasetMetadata, order: QueryOrder): string {
  return `${quoteIdentifier(resolvePhysicalColumn(dataset, order.column))} ${order.direction.toUpperCase()}`;
}

export function compileChartQuery(dataset: DatasetMetadata, query: ChartQuery): string {
  if (dataset.id !== query.datasetId) {
    throw new Error(`Query dataset "${query.datasetId}" does not match dataset "${dataset.id}".`);
  }

  const source = dataset.tableName ?? dataset.name;
  const sourceSql =
    dataset.kind === 'virtual' && dataset.sql ? `(${dataset.sql})` : quoteIdentifier(source);

  const calculated = query.calculatedColumns ?? [];
  const withClause = calculated.length
    ? `WITH base AS (SELECT * FROM ${sourceSql}), calculated AS (SELECT base.*, ${calculated
        .map(column => {
          validateExpression(column.expression);
          return `${column.expression} AS ${quoteIdentifier(column.name)}`;
        })
        .join(', ')} FROM base)`
    : '';

  const from = calculated.length ? 'calculated' : sourceSql;
  const dimensions = query.dimensions.map(
    dimension =>
      `${compileDimension(dataset, dimension.column, dimension.temporalGrain)} AS ${quoteIdentifier(
        dimension.label ?? dimension.column,
      )}`,
  );
  const metrics = query.metrics.map(metric => {
    validateExpression(metric.expression);
    return `${metric.expression} AS ${quoteIdentifier(metric.label || metric.name)}`;
  });

  if (dimensions.length === 0 && metrics.length === 0) {
    throw new Error('A chart query requires at least one dimension or metric.');
  }

  const whereParts = [
    ...(query.filters ?? []).map(filter => compileFilter(dataset, filter)),
    ...(query.timeRange
      ? [
          ...(query.timeRange.from
            ? [`${quoteIdentifier(resolvePhysicalColumn(dataset, query.timeRange.column))} >= '${query.timeRange.from.replace(/'/g, "''")}'`]
            : []),
          ...(query.timeRange.to
            ? [`${quoteIdentifier(query.timeRange.column)} < '${query.timeRange.to.replace(/'/g, "''")}'`]
            : []),
        ]
      : []),
  ];

  const groupBy = query.dimensions.map(dimension =>
    compileDimension(dimension.column, dimension.temporalGrain),
  );

  return [
    withClause,
    `SELECT ${[...dimensions, ...metrics].join(', ')} FROM ${from}`,
    whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '',
    groupBy.length ? `GROUP BY ${groupBy.join(', ')}` : '',
    query.having ? `HAVING ${query.having}` : '',
    query.orderBy?.length ? `ORDER BY ${query.orderBy.map(order => compileOrder(dataset, order)).join(', ')}` : '',
    query.limit !== undefined ? `LIMIT ${Math.max(1, Math.floor(query.limit))}` : '',
    query.offset !== undefined ? `OFFSET ${Math.max(0, Math.floor(query.offset))}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}
