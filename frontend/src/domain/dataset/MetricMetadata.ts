import type { AggregationFunction, MetadataAudit } from './DataType';

export type MetricDefinitionType = 'simple' | 'sql';

export interface MetricMetadata extends MetadataAudit {
  id: string;
  name: string;
  label: string;
  description?: string;

  /** SQL expression executed in an aggregate/query context. */
  expression: string;

  type: MetricDefinitionType;

  /** Present for simple metrics; SQL metrics may use a custom expression. */
  aggregation?: AggregationFunction;

  format?: string;
  certified?: boolean;
  certifiedBy?: string;
  certificationDetails?: string;

  metadata?: Record<string, unknown>;
}
