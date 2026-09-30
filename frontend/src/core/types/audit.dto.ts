export interface AuditLogDTO {
  id: string | number;
  user_id?: string | number;
  user_email?: string;
  action: string;
  resource_type: 'USER' | 'ROLE' | 'GROUP' | 'DATASET' | 'DATASOURCE' | 'DASHBOARD' | 'CHART' | 'SYSTEM';
  resource_id?: string | number;
  department?: string;
  section?: string;
  region?: string;
  details?: string;
  ip_address?: string;
  metadata?: Record<string, any>;
  created_at: string;
  [key: string]: any;
}

export interface RowLevelSecurityDTO {
  id: string | number;
  table_name: string;
  policy_name: string;
  clause: string;
  status: 'Active' | 'Draft' | 'Disabled';
  description?: string;
  department?: string;
  section?: string;
  region?: string;
  group_ids?: (string | number)[];
  role_ids?: (string | number)[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface ReportDTO {
  id: string | number;
  name: string;
  description?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  schedule: string;
  recipients: string[];
  format: 'PDF' | 'CSV' | 'PNG';
  last_run?: string;
  next_run?: string;
  active: boolean;
  metadata?: Record<string, any>;
  [key: string]: any;
}
