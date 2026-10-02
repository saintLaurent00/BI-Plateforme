import type { DataType, MetadataAudit, SemanticRole } from './DataType';

export interface ColumnMetadata extends MetadataAudit {
  id: string;

  /** Stable semantic identifier exposed to the query builder. */
  name: string;

  /** Physical column name in the source database. */
  physicalName: string;

  /** Human-readable label used by the UI. */
  label: string;

  description?: string;

  dataType: DataType;
  role: SemanticRole;

  nullable: boolean;
  primaryKey?: boolean;

  /** Whether the column can participate in GROUP BY. */
  groupable: boolean;

  /** Whether the column can be used by filters. */
  filterable: boolean;

  /** Whether this is a temporal column. */
  temporal: boolean;

  /** Optional SQL expression for a virtual/calculated column. */
  expression?: string;

  format?: string;
  datetimeFormat?: string;
  semanticType?: string;

  metadata?: Record<string, unknown>;
}
