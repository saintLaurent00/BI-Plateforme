export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  active: boolean;
}

export interface Dashboard {
  id: number | string;
  dashboard_title: string;
  title?: string; // Alias for backward compatibility
  name?: string; // Alias
  owners: Partial<User>[];
  owner?: string; // Alias
  published: boolean;
  status?: 'Published' | 'Draft' | 'Archived'; // Alias
  changed_on_delta_humanized: string;
  lastModified?: string; // Alias
  thumbnail?: string;
  tags: string[];
  json_metadata?: string;
  position_json?: string;
  layout?: any[];
  url?: string;
  backgroundColor?: string;
}

export interface Chart {
  id: number | string;
  slice_name: string;
  title?: string; // Alias
  viz_type: string;
  type?: string; // Alias
  datasource_id: number;
  datasource_name: string;
  dataset?: string; // Alias
  owners: Partial<User>[];
  owner?: string; // Alias
  changed_on_delta_humanized: string;
  lastModified?: string; // Alias
  thumbnail?: string;
  params?: string;
}

export interface Dataset {
  id: number | string;
  table_name: string;
  name?: string; // Alias
  kind: 'physical' | 'virtual';
  type?: 'Physical' | 'Virtual'; // Alias
  database: {
    id: number;
    database_name: string;
  };
  healthScore?: number;
  columns?: any[];
  metrics?: any[];
  owner?: string;
}

export interface DatabaseConnection {
  id: number;
  database_name: string;
  backend: string;
  sqlalchemy_uri: string;
  configuration_method: string;
}

export interface QueryResult {
  id: string;
  sql: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  execution_time: number;
  rows: number;
  results: any[];
  error?: string;
  timestamp: string;
}
