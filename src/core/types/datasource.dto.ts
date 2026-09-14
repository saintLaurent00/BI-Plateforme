export type SupportedEngine = 
  | 'postgresql'
  | 'mysql'
  | 'sqlserver'
  | 'oracle'
  | 'bigquery'
  | 'snowflake'
  | 'redshift'
  | 'databricks'
  | 'duckdb'
  | 'clickhouse'
  | 'trino'
  | 'sqlite'
  | 'mariadb'
  | 'cockroachdb';

export type DataSourceEnvironment = 'Production' | 'Staging' | 'Development' | 'Test';

export interface DataSource {
  id: string | number;
  name: string;
  engine: SupportedEngine | string;
  host?: string;
  port?: string | number;
  database?: string;
  username?: string;
  password?: string;
  useSsl?: boolean;
  useSshTunnel?: boolean;
  sshHost?: string;
  sshUser?: string;
  maxConnections?: number;
  timeout?: number;
  backend?: string;
  database_name?: string;
  sqlalchemy_uri?: string;
  configuration_method?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  environment?: DataSourceEnvironment;
  data_center?: string;
  compliance_level?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface DataSourceDTO extends DataSource {}

export interface CreateDataSourceDTO {
  name: string;
  engine: SupportedEngine | string;
  host?: string;
  port?: string | number;
  database?: string;
  username?: string;
  password?: string;
  useSsl?: boolean;
  useSshTunnel?: boolean;
  sshHost?: string;
  sshUser?: string;
  maxConnections?: number;
  timeout?: number;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  environment?: DataSourceEnvironment;
  data_center?: string;
  compliance_level?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface UpdateDataSourceDTO extends Partial<CreateDataSourceDTO> {
  id: string | number;
  [key: string]: any;
}

export interface DatabaseConnection {
  id: number | string;
  database_name: string;
  backend: string;
  sqlalchemy_uri: string;
  configuration_method: string;
  region?: string;
  section?: string;
  department?: string;
  [key: string]: any;
}

export interface ConnectionTestDTO {
  engine: string;
  host?: string;
  port?: string | number;
  database?: string;
  username?: string;
  password?: string;
  useSsl?: boolean;
  region?: string;
  section?: string;
  [key: string]: any;
}

export interface ConnectionTestResultDTO {
  success: boolean;
  message: string;
  ping_ms?: number;
  region_verified?: boolean;
  metadata?: Record<string, any>;
  [key: string]: any;
}
