import type { DataType } from '@/services/data';

export type TimeGrain =
  | 'year'
  | 'quarter'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute';

export interface QueryDimension {
  column: string;
  label?: string;
  temporalGrain?: TimeGrain;
}

export type MetricExpressionType = 'saved' | 'adhoc';

export interface QueryMetric {
  id?: string;
  name: string;
  label: string;
  expression: string;
  expressionType: MetricExpressionType;
  format?: string;
}

export interface QueryCalculatedColumn {
  id?: string;
  name: string;
  label: string;
  expression: string;
  type: Exclude<DataType, 'geospatial' | 'category'>;
}

export type FilterOperator =
  | '=='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'LIKE'
  | 'NOT LIKE'
  | 'ILIKE'
  | 'NOT ILIKE'
  | 'IN'
  | 'NOT IN'
  | 'IS NULL'
  | 'IS NOT NULL';

export interface QueryFilter {
  column: string;
  operator: FilterOperator;
  value?: string | number | boolean | null | Array<string | number>;
}

export interface QueryOrder {
  column: string;
  direction: 'asc' | 'desc';
}

export interface QueryTimeRange {
  column: string;
  from?: string;
  to?: string;
}

export interface ChartQuery {
  datasetId: string;
  dimensions: QueryDimension[];
  metrics: QueryMetric[];
  calculatedColumns?: QueryCalculatedColumn[];
  filters?: QueryFilter[];
  timeRange?: QueryTimeRange;
  orderBy?: QueryOrder[];
  having?: string;
  limit?: number;
  offset?: number;
}

export interface ChartResult {
  columns: string[];
  data: Record<string, unknown>[];
  rowCount: number;
  query: string;
}

export interface QueryExecutionContext {
  generatedAt: string;
  executionTimeMs?: number;
}
