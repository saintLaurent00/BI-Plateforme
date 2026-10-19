import { supersetRequest } from '@/platform/api/superset-client';

export interface SupersetDataset {
  id: string | number;
  table_name?: string;
  name?: string;
  schema?: string | null;
  database?: { id?: number; database_name?: string; database_name_label?: string };
  database_id?: number;
  owners?: Array<{ id?: number; username?: string; first_name?: string; last_name?: string }>;
  columns?: Array<{ id?: number; column_name?: string; type?: string; type_generic?: number }>;
  created_on?: string;
  changed_on?: string;
  changed_on_delta_humanized?: string;
  [key: string]: unknown;
}
export interface SupersetDatabase { id: number; database_name: string; backend?: string; allow_run_async?: boolean; allow_ctas?: boolean; allow_dml?: boolean; [key: string]: unknown; }
interface ListResponse<T> { count?: number; result?: T[]; }
const listQuery = (page = 0, pageSize = 100) => `?q=${encodeURIComponent(`(page:${page},page_size:${pageSize})`)}`;

export const dataCatalogService = {
  async listDataSources(): Promise<SupersetDatabase[]> { return this.listDatabases(); },
  async listDatabases(): Promise<SupersetDatabase[]> {
    const response = await supersetRequest<ListResponse<SupersetDatabase>>(`/api/v1/database/${listQuery()}`);
    return Array.isArray(response?.result) ? response.result : [];
  },
  async listDatasets(): Promise<SupersetDataset[]> {
    const response = await supersetRequest<ListResponse<SupersetDataset>>(`/api/v1/dataset/${listQuery()}`);
    return Array.isArray(response?.result) ? response.result : [];
  },
  async getDataset(id: string | number): Promise<SupersetDataset> {
    const response = await supersetRequest<{ result: SupersetDataset }>(`/api/v1/dataset/${encodeURIComponent(String(id))}`);
    return response.result;
  },
  async createDataset(input: {
    table_name: string;
    name?: string;
    database_id?: string | number;
    database?: { id?: string | number };
    schema?: string;
    sql?: string;
    kind?: string;
    [key: string]: unknown;
  }): Promise<SupersetDataset> {
    const databaseId = input.database_id ?? input.database?.id;
    if (!databaseId || databaseId === 'local') {
      throw new Error('Sélectionnez une base de données configurée dans Apache Superset.');
    }
    const body: Record<string, unknown> = {
      database: Number(databaseId),
      table_name: input.table_name,
      schema: input.schema ?? null,
    };
    if (input.sql) body.sql = input.sql;
    const response = await supersetRequest<{ id?: number; result?: SupersetDataset }>(
      '/api/v1/dataset/',
      { method: 'POST', body: JSON.stringify(body) },
    );
    if (response.result) return response.result;
    if (response.id !== undefined) return { id: response.id, table_name: input.table_name, name: input.name };
    throw new Error('Superset n’a pas renvoyé le dataset créé.');
  },
  async deleteDataset(id: string | number): Promise<void> {
    await supersetRequest<unknown>(`/api/v1/dataset/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
  },
  async refreshDataset(id: string | number): Promise<unknown> {
    return supersetRequest<unknown>(`/api/v1/dataset/${encodeURIComponent(String(id))}/refresh`, { method: 'PUT', body: JSON.stringify({}) });
  },
};