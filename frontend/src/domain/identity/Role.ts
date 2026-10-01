import type { Permission } from './Permission';

export type RoleScopeLevel = 'global' | 'regional' | 'sectional' | 'departmental';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissionIds: string[];
  isSystemRole: boolean;
  scopeLevel?: RoleScopeLevel;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds?: string[];
  isSystemRole?: boolean;
  scopeLevel?: RoleScopeLevel;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export type RolePermission = Permission;