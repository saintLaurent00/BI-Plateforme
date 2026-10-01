export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'category'
  | 'geospatial';

export type Aggregation =
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'count';

export interface DatasetField {
  key: string;
  label: string;
  type: DataType;
  role?: 'dimension' | 'measure' | 'identifier';
  aggregatable?: boolean;
}

export interface Dataset<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: string;
  description: string;
  fields: DatasetField[];
  rows: readonly T[];
}

export interface ChartDataPoint {
  [key: string]: string | number | null;
}
