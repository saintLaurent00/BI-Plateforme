export type AuditResourceType =
  | 'user' | 'role' | 'group' | 'datasource' | 'dataset'
  | 'dashboard' | 'chart' | 'saved_query' | 'report' | 'system';

export interface AuditLog {
  id: string;
  actorUserId?: string;
  action: string;
  resourceType: AuditResourceType;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}