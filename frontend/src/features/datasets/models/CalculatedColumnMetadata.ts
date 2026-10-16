import type { DataType, MetadataAudit, SemanticRole } from './DataType';

export interface CalculatedColumnMetadata extends MetadataAudit {
  id: string;
  name: string;
  label: string;
  description?: string;

  /** Row-level SQL expression. Aggregate functions are not allowed here. */
  expression: string;

  dataType: Exclude<DataType, 'geospatial' | 'category'>;
  role?: SemanticRole;

  groupable: boolean;
  filterable: boolean;

  format?: string;
  metadata?: Record<string, unknown>;
}
