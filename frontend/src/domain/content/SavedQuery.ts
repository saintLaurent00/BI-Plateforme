export type SavedQueryStatus = 'active' | 'archived';

export interface SavedQuery {
  id: string;
  name: string;
  description?: string;
  sql: string;
  dataSourceId?: string;
  ownerIds: string[];
  tags: string[];
  status: SavedQueryStatus;
  lastExecutedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateSavedQueryInput {
  name: string;
  description?: string;
  sql: string;
  dataSourceId?: string;
  ownerIds?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}