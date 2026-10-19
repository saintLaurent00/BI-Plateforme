import { supersetRequest } from '@/platform/api/superset-client';

export interface SupersetChart {
  id: number | string;
  slice_name: string;
  viz_type?: string;
  datasource_id?: number;
  datasource_type?: string;
  description?: string | null;
  changed_on_delta_humanized?: string;
  created_on_delta_humanized?: string;
  owners?: Array<{ id?: number; username?: string; first_name?: string; last_name?: string }>;
  [key: string]: unknown;
}

interface ListResponse<T> { count?: number; result?: T[]; }
const listQuery = (page = 0, pageSize = 100) => `?q=${encodeURIComponent(`(page:${page},page_size:${pageSize})`)}`;

export const visualizationService = {
  async listCharts(): Promise<SupersetChart[]> {
    const response = await supersetRequest<ListResponse<SupersetChart>>(`/api/v1/chart/${listQuery()}`);
    return Array.isArray(response?.result) ? response.result : [];
  },
  async getChart(id: string | number): Promise<SupersetChart> {
    const response = await supersetRequest<{ result: SupersetChart }>(`/api/v1/chart/${encodeURIComponent(String(id))}`);
    return response.result;
  },
  async deleteChart(id: string | number): Promise<void> {
    await supersetRequest<unknown>(`/api/v1/chart/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
  },
  async getChartData(id: string | number): Promise<unknown> {
    return supersetRequest<unknown>(`/api/v1/chart/${encodeURIComponent(String(id))}/data/`);
  },
};