import type { ChartQuery } from './ChartQuery';

export interface SavedQueryDefinition {
  id: string;
  name: string;
  query?: ChartQuery;
  sql?: string;
  dataSourceId?: string;
  datasetId?: string;
}