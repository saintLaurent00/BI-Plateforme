export type PermissionType = 
  | 'ALL'
  | 'READ'
  | 'WRITE'
  | 'DELETE'
  | 'EXECUTE_SQL'
  | 'MANAGE_USERS'
  | 'MANAGE_ROLES'
  | 'MANAGE_DATASOURCES'
  | 'EXPORT_DATA'
  | 'MANAGE_DASHBOARDS';

export type RoleScopeLevel = 'Global' | 'Regional' | 'Sectional' | 'Departmental';

export interface Role {
  id: string | number;
  name: string;
  description?: string;
  permissions: string[];
  is_system_role?: boolean;
  users_count?: number;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  scope_level?: RoleScopeLevel;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface RoleDTO extends Role {}

export interface CreateRoleDTO {
  name: string;
  description?: string;
  permissions: string[];
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  scope_level?: RoleScopeLevel;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface UpdateRoleDTO {
  id: string | number;
  name?: string;
  description?: string;
  permissions?: string[];
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  scope_level?: RoleScopeLevel;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface RolePermissionDTO {
  id: string;
  role_id: string | number;
  permission_name: string;
  resource?: string;
  region?: string;
  section?: string;
  [key: string]: any;
}
