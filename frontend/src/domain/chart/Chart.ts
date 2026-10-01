import type { ChartQuery } from '../query';

export interface VisualizationConfig {
  [key: string]: unknown;
}

export interface Chart {
  id: string;
  name: string;
  datasetId: string;
  chartType: string;
  query: ChartQuery;
  visualization: VisualizationConfig;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
