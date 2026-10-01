import type { Chart } from '../chart';
import type { Dashboard } from '../content';
import type { AuditLog } from '../audit';
import type { DataSource } from '../catalog';
import type { Group, Permission, Role, User } from '../identity';
import type { Report } from '../reporting';
import type { RowLevelSecurityPolicy } from '../security';
import type { SavedQuery } from '../content';
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