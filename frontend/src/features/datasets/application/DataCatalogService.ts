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
  async deleteDataset(id: string | number): Promise<void> {
    await supersetRequest<unknown>(`/api/v1/dataset/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
  },
  async refreshDataset(id: string | number): Promise<unknown> {
    return supersetRequest<unknown>(`/api/v1/dataset/${encodeURIComponent(String(id))}/refresh`, { method: 'PUT', body: JSON.stringify({}) });
  },
};