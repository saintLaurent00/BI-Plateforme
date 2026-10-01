export type SecurityPolicyStatus = 'active' | 'draft' | 'disabled';

export interface RowLevelSecurityPolicy {
  id: string;
  datasetId: string;
  name: string;
  clause: string;
  status: SecurityPolicyStatus;
  description?: string;
  groupIds: string[];
  roleIds: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}