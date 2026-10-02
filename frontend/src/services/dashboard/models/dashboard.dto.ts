import { UserDTO } from './user.dto';

export type DashboardStatus = 'Published' | 'Draft' | 'Archived';

export interface Dashboard {
  id: number | string;
  dashboard_title: string;
  title?: string;
  name?: string;
  owners: Partial<UserDTO>[];
  owner?: string;
  published: boolean;
  status?: DashboardStatus;
  changed_on_delta_humanized?: string;
  lastModified?: string;
  thumbnail?: string;
  tags: string[];
  description?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  category?: string;
  refresh_interval?: number;
  json_metadata?: string;
  position_json?: string;
  layout?: any[];
  url?: string;
  backgroundColor?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface DashboardDTO extends Dashboard {}

export interface CreateDashboardDTO {
  dashboard_title: string;
  description?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  category?: string;
  refresh_interval?: number;
  tags?: string[];
  layout?: any[];
  backgroundColor?: string;
  published?: boolean;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface UpdateDashboardDTO {
  id: number | string;
  dashboard_title?: string;
  description?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  category?: string;
  refresh_interval?: number;
  published?: boolean;
  status?: DashboardStatus;
  layout?: any[];
  tags?: string[];
  backgroundColor?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface Chart {
  id: number | string;
  slice_name: string;
  title?: string;
  viz_type: string;
  type?: string;
  datasource_id: number | string;
  datasource_name: string;
  dataset?: string;
  owners: Partial<UserDTO>[];
  owner?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  category?: string;
  changed_on_delta_humanized?: string;
  lastModified?: string;
  thumbnail?: string;
  params?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface ChartDTO extends Chart {}

export interface CreateChartDTO {
  slice_name: string;
  viz_type: string;
  datasource_id: number | string;
  datasource_name?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  category?: string;
  params?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface UpdateChartDTO {
  id: number | string;
  slice_name?: string;
  viz_type?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  category?: string;
  params?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface QueryResultDTO {
  id: string;
  sql: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  execution_time: number;
  rows: number;
  results: any[];
  error?: string;
  timestamp: string;
  region?: string;
  section?: string;
  [key: string]: any;
}

export interface QueryResult extends QueryResultDTO {}
