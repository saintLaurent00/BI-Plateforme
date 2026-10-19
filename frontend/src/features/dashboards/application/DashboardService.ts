import { supersetRequest } from '@/platform/api/superset-client';

export interface SupersetDashboard {
  id: number | string;
  dashboard_title: string;
  slug?: string | null;
  url?: string | null;
  published?: boolean;
  owners?: Array<{ id?: number; username?: string; first_name?: string; last_name?: string }>;
  changed_on_delta_humanized?: string;
  created_on_delta_humanized?: string;
  changed_on?: string;
  created_on?: string;
  description?: string | null;
  [key: string]: unknown;
}

interface SupersetListResponse<T> {
  count?: number;
  result?: T[];
}

const listQuery = (page = 0, pageSize = 100) => `?q=${encodeURIComponent(`(page:${page},page_size:${pageSize})`)}`;

export const dashboardService = {
  async list(search = ''): Promise<SupersetDashboard[]> {
    const query = listQuery();
    const response = await supersetRequest<SupersetListResponse<SupersetDashboard>>(
      `/api/v1/dashboard/${query}`,
    );
    return Array.isArray(response?.result) ? response.result : [];
  },

  async get(id: string | number): Promise<SupersetDashboard> {
    const response = await supersetRequest<{ result: SupersetDashboard }>(
      `/api/v1/dashboard/${encodeURIComponent(String(id))}`,
    );
    return response.result;
  },

  async create(input: { dashboard_title: string; published?: boolean }): Promise<SupersetDashboard> {
    const response = await supersetRequest<{ id?: number; result?: SupersetDashboard }>(
      '/api/v1/dashboard/',
      {
        method: 'POST',
        body: JSON.stringify({
          dashboard_title: input.dashboard_title,
          published: input.published ?? false,
          owners: [],
          json_metadata: '{}',
          position_json: '{}',
          css: '',
        }),
      },
    );
    if (response.result) return response.result;
    if (response.id !== undefined) return { id: response.id, dashboard_title: input.dashboard_title };
    throw new Error('Superset a créé le tableau de bord sans renvoyer ses informations.');
  },

  async update(id: string | number, input: {
    dashboard_title?: string;
    position_json?: string;
    json_metadata?: string;
    css?: string;
    published?: boolean;
  }): Promise<SupersetDashboard> {
    const response = await supersetRequest<{ result?: SupersetDashboard }>(
      `/api/v1/dashboard/${encodeURIComponent(String(id))}`,
      { method: 'PUT', body: JSON.stringify(input) },
    );
    return response.result ?? { id, dashboard_title: input.dashboard_title || 'Tableau de bord' };
  },

  async remove(id: string | number): Promise<void> {
    await supersetRequest<unknown>(`/api/v1/dashboard/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    });
  },
};
