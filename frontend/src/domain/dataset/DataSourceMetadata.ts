import type { MetadataAudit, MetadataTag } from './DataType';

export interface DataSourceMetadata extends MetadataAudit {
  id: string;
  name: string;
  engine: string;
  environment?: 'production' | 'staging' | 'development' | 'test';

  host?: string;
  port?: number;
  database?: string;
  schema?: string;

  tags?: MetadataTag[];
  metadata?: Record<string, unknown>;
}
