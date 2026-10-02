import type { Chart } from '@/services/visualization/models/chart-index';
import type { Dashboard } from '@/services/dashboard/models/content-index';
import type { AuditLog } from '@/services/governance/models/audit-index';
import type { DataSource } from '@/services/data/models/catalog-index';
import type { Group, Permission, Role, User } from '@/services/identity/identity-index';
import type { Report } from '@/services/reporting/models/reporting-index';
import type { RowLevelSecurityPolicy } from '@/services/governance/models/security-index';
import type { SavedQuery } from '@/services/dashboard/models/content-index';
import type { DatasetMetadata } from './DatasetMetadata';

export interface MetadataCatalog {
  users: User[];
  groups: Group[];
  roles: Role[];
  permissions: Permission[];

  dataSources: DataSource[];
  datasets: DatasetMetadata[];

  charts: Chart[];
  dashboards: Dashboard[];
  savedQueries: SavedQuery[];

  securityPolicies: RowLevelSecurityPolicy[];
  reports: Report[];
  auditLogs: AuditLog[];
}

export function findDataset(
  catalog: MetadataCatalog,
  datasetId: string,
): DatasetMetadata | undefined {
  return catalog.datasets.find(dataset => dataset.id === datasetId);
}

export function findChart(
  catalog: MetadataCatalog,
  chartId: string,
): Chart | undefined {
  return catalog.charts.find(chart => chart.id === chartId);
}

export function findDashboard(
  catalog: MetadataCatalog,
  dashboardId: string,
): Dashboard | undefined {
  return catalog.dashboards.find(dashboard => dashboard.id === dashboardId);
}