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

function encodeQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export const dashboardService = {
  async list(search = ''): Promise<SupersetDashboard[]> {
    const query = encodeQuery({
      q: JSON.stringify({
        page: 0,
        page_size: 100,
        ...(search ? { filters: [{ col: 'dashboard_title', opr: 'ct', value: search }] } : {}),
      }),
    });
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

  async remove(id: string | number): Promise<void> {
    await supersetRequest<unknown>(`/api/v1/dashboard/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    });
  },
};
