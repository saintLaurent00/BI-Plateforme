import { UserDTO } from './user.dto';

export interface DatasetColumn {
  name: string;
  type: string;
  displayName?: string;
  description?: string;
  isCalculated?: boolean;
  expression?: string;
  isFiltered?: boolean;
  isGroupable?: boolean;
  isTemporal?: boolean;
  isPrimaryKey?: boolean;
  section?: string;
  region?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface DatasetColumnDTO extends DatasetColumn {}

export interface DatasetMetric {
  name: string;
  expression: string;
  displayName?: string;
  description?: string;
  metric_type?: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'custom';
  format?: string;
  section?: string;
  region?: string;
  [key: string]: any;
}

export interface DatasetMetricDTO extends DatasetMetric {}

export type SensitivityLevel = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

export interface Dataset {
  id: number | string;
  table_name: string;
  name?: string;
  kind?: 'physical' | 'virtual';
  schema?: string;
  sql?: string;
  database?: {
    id: number | string;
    database_name: string;
    engine?: string;
  };
  database_id?: number | string;
  healthScore?: number;
  columns?: DatasetColumnDTO[];
  metrics?: DatasetMetricDTO[];
  owner?: string;
  owners?: Partial<UserDTO>[];
  description?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  data_category?: string;
  sensitivity_level?: SensitivityLevel;
  row_count?: number;
  size_mb?: number;
  tags?: string[];
  cache_timeout?: number;
  is_sqllab_view?: boolean;
  metadata?: Record<string, any>;
  lastModified?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface DatasetDTO extends Dataset {}

export interface CreateDatasetDTO {
  table_name: string;
  name?: string;
  kind?: 'physical' | 'virtual';
  database_id?: number | string;
  database?: {
    id: number | string;
    database_name: string;
    engine?: string;
  };
  schema?: string;
  sql?: string;
  columns?: any[];
  metrics?: any[];
  description?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  data_category?: string;
  sensitivity_level?: SensitivityLevel;
  tags?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface UpdateDatasetDTO {
  id: number | string;
  name?: string;
  schema?: string;
  sql?: string;
  columns?: any[];
  metrics?: any[];
  description?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  data_category?: string;
  sensitivity_level?: SensitivityLevel;
  tags?: string[];
  cache_timeout?: number;
  metadata?: Record<string, any>;
  [key: string]: any;
}
