import type { CalculatedColumnMetadata } from './CalculatedColumnMetadata';
import type { ColumnMetadata } from './ColumnMetadata';
import type { DataSourceMetadata } from './DataSourceMetadata';
import type { DatasetKind, MetadataAudit, MetadataTag, SensitivityLevel } from './DataType';
import type { MetricMetadata } from './MetricMetadata';

export interface DatasetTimeMetadata {
  column: string;
  supportedGrains: Array<'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute'>;
  defaultGrain?: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute';
}

export interface DatasetStatistics {
  rowCount?: number;
  sizeBytes?: number;
  lastProfiledAt?: string;
}

export interface DatasetCapabilities {
  supportsFilters: boolean;
  supportsGroupBy: boolean;
  supportsMetrics: boolean;
  supportsCalculatedColumns: boolean;
  supportsTimeGrain: boolean;
  supportsSamples: boolean;
  supportsDrillDown?: boolean;
}

export interface DatasetGovernance {
  ownerId?: string;
  ownerName?: string;
  sensitivity?: SensitivityLevel;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  tags?: MetadataTag[];
}

export interface DatasetMetadata extends MetadataAudit {
  id: string;
  name: string;
  label: string;
  description?: string;

  kind: DatasetKind;

  /** Source reference; the dataset itself does not own the connection. */
  dataSource?: DataSourceMetadata;

  schema?: string;
  tableName?: string;

  /** SQL defining a virtual dataset, when applicable. */
  sql?: string;

  columns: ColumnMetadata[];
  metrics: MetricMetadata[];
  calculatedColumns: CalculatedColumnMetadata[];

  time?: DatasetTimeMetadata;
  statistics?: DatasetStatistics;
  capabilities: DatasetCapabilities;
  governance?: DatasetGovernance;

  cacheTimeoutSeconds?: number;
  tags?: MetadataTag[];

  metadata?: Record<string, unknown>;
}

export function getDatasetColumn(
  dataset: DatasetMetadata,
  name: string,
): ColumnMetadata | CalculatedColumnMetadata | undefined {
  return (
    dataset.columns.find(column => column.name === name) ??
    dataset.calculatedColumns.find(column => column.name === name)
  );
}

export function getDatasetMetric(
  dataset: DatasetMetadata,
  name: string,
): MetricMetadata | undefined {
  return dataset.metrics.find(metric => metric.name === name || metric.id === name);
}
