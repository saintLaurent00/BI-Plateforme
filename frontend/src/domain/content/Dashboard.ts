import type { ResourceAccess } from '../security';

export type DashboardStatus = 'draft' | 'published' | 'archived';

export interface DashboardLayoutItem {
  chartId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  status: DashboardStatus;
  ownerIds: string[];
  access?: ResourceAccess;
  layout: DashboardLayoutItem[];
  tags: string[];
  category?: string;
  refreshIntervalSeconds?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateDashboardInput {
  name: string;
  description?: string;
  ownerIds?: string[];
  access?: ResourceAccess;
  layout?: DashboardLayoutItem[];
  tags?: string[];
  category?: string;
  refreshIntervalSeconds?: number;
  status?: DashboardStatus;
  metadata?: Record<string, unknown>;
}