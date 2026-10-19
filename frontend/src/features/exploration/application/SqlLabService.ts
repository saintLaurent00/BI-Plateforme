import { supersetRequest } from '@/platform/api/superset-client';

export interface SqlLabColumn { name?: string; column_name?: string; type?: string; [key: string]: unknown; }
export interface SqlLabExecutionResult {
  data?: Array<Record<string, unknown>>;
  columns?: SqlLabColumn[];
  status?: string;
  query_id?: number;
  errorMessage?: string | null;
  query?: { errorMessage?: string | null; state?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export const sqlLabService = {
  async execute(input: { databaseId: number; sql: string; schema?: string; queryLimit?: number }): Promise<SqlLabExecutionResult> {
    return supersetRequest<SqlLabExecutionResult>('/api/v1/sqllab/execute/', {
      method: 'POST',
      body: JSON.stringify({
        database_id: input.databaseId,
        sql: input.sql,
        schema: input.schema,
        client_id: crypto.randomUUID(),
        runAsync: false,
        expand_data: true,
        queryLimit: input.queryLimit ?? 1000,
      }),
    });
  },
  async listSavedQueries(): Promise<Array<Record<string, unknown>>> {
    const response = await supersetRequest<{ result?: Array<Record<string, unknown>> }>(
      `/api/v1/saved_query/?q=${encodeURIComponent('(page:0,page_size:100)')}`,
    );
    return Array.isArray(response?.result) ? response.result : [];
  },
  async saveQuery(input: { id?: string | number; databaseId: number; name: string; description?: string; sql: string; schema?: string }): Promise<Record<string, unknown>> {
    const payload = {
      db_id: input.databaseId,
      label: input.name,
      description: input.description || '',
      sql: input.sql,
      schema: input.schema || null,
    };
    const response = input.id
      ? await supersetRequest<{ result?: Record<string, unknown> }>(`/api/v1/saved_query/${encodeURIComponent(String(input.id))}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      : await supersetRequest<{ id?: number; result?: Record<string, unknown> }>('/api/v1/saved_query/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
    if (response.result) return response.result;
    if ('id' in response && response.id !== undefined) return { id: response.id, label: input.name, sql: input.sql, description: input.description };
    throw new Error('Superset n’a pas renvoyé la requête enregistrée.');
  },
  async getBootstrap(): Promise<unknown> {
    return supersetRequest<unknown>('/api/v1/sqllab/');
  },
};