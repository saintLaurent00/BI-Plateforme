export type SupportedEngine =
  | 'postgresql' | 'mysql' | 'sqlserver' | 'oracle' | 'bigquery'
  | 'snowflake' | 'redshift' | 'databricks' | 'duckdb' | 'clickhouse'
  | 'trino' | 'sqlite' | 'mariadb' | 'cockroachdb' | (string & {});

export type DataSourceEnvironment = 'production' | 'staging' | 'development' | 'test';

export interface DataSource {
  id: string;
  name: string;
  engine: SupportedEngine;
  host?: string;
  port?: number;
  databaseName?: string;
  connectionSecretRef?: string;
  sslEnabled?: boolean;
  sshTunnelEnabled?: boolean;
  maxConnections?: number;
  timeoutSeconds?: number;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  environment?: DataSourceEnvironment;
  dataCenter?: string;
  complianceLevel?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateDataSourceInput {
  name: string;
  engine: SupportedEngine;
  host?: string;
  port?: number;
  databaseName?: string;
  connectionSecretRef?: string;
  sslEnabled?: boolean;
  sshTunnelEnabled?: boolean;
  maxConnections?: number;
  timeoutSeconds?: number;
  environment?: DataSourceEnvironment;
  tags?: string[];
  metadata?: Record<string, unknown>;
}