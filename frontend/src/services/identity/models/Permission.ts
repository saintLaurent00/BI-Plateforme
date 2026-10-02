export type PermissionAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'execute'
  | 'export'
  | 'manage';

export type PermissionResource =
  | 'users'
  | 'groups'
  | 'roles'
  | 'datasources'
  | 'datasets'
  | 'charts'
  | 'dashboards'
  | 'saved_queries'
  | 'sql_lab'
  | 'reports'
  | 'audit'
  | 'system';

export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope?: string;
  description?: string;
}