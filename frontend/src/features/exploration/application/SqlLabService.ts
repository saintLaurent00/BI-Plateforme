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
  async getBootstrap(): Promise<unknown> {
    return supersetRequest<unknown>('/api/v1/sqllab/');
  },
};