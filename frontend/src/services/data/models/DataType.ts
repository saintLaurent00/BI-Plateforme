export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'category'
  | 'geospatial'
  | 'json'
  | 'unknown';

export type SemanticRole =
  | 'dimension'
  | 'measure'
  | 'identifier'
  | 'temporal'
  | 'geospatial';

export type DatasetKind = 'physical' | 'virtual';

export type SensitivityLevel =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted';

export type AggregationFunction =
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'count'
  | 'count_distinct';

export interface MetadataAudit {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface MetadataTag {
  key: string;
  value?: string;
}
