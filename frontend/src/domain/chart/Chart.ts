import type { ChartQuery } from '../query';
import type { ResourceAccess } from '../security';

export type ChartStatus = 'active' | 'archived';

export interface VisualizationConfig {
  [key: string]: unknown;
}

export interface Chart {
  id: string;
  name: string;
  description?: string;
  datasetId: string;
  chartType: string;
  query: ChartQuery;
  visualization: VisualizationConfig;
  ownerIds: string[];
  access?: ResourceAccess;
  tags: string[];
  status: ChartStatus;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateChartInput {
  name: string;
  description?: string;
  datasetId: string;
  chartType: string;
  query: ChartQuery;
  visualization?: VisualizationConfig;
  ownerIds?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}