import type { ChartQuery } from '@/services/query/models';
import type { ResourceAccess } from '@/services/governance/models/security-index';

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
  access?: ResourceAccess;
  tags?: string[];
  metadata?: Record<string, unknown>;
}