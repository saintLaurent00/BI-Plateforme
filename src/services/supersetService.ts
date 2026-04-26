import { supersetClient } from '../lib/supersetClient';
import { Dashboard, Chart, Dataset, User } from '../types';
import { handleApiError, buildQueryParams } from '../lib/apiUtils';

const PAGINATION_DEFAULTS = { page: 0, pageSize: 25 };
const DEFAULT_BG_COLOR = '#f8fafc';

const formatOwnerName = (owner?: { first_name?: string; last_name?: string }): string => {
  if (!owner) return 'Unknown';
  const parts = [owner.first_name, owner.last_name].filter(Boolean);
  return parts.join(' ') || 'Unknown';
};

const formatDashboard = (d: any): Dashboard => {
  const metadata = d.json_metadata ? JSON.parse(d.json_metadata) : {};
  return {
    ...d,
    title: d.dashboard_title,
    name: d.dashboard_title,
    owner: formatOwnerName(d.owners?.[0]),
    status: d.published ? 'Published' : 'Draft',
    lastModified: d.changed_on_delta_humanized,
    backgroundColor: metadata.backgroundColor || DEFAULT_BG_COLOR,
  };
};

const formatChart = (c: any): Chart => ({
  ...c,
  title: c.slice_name,
  type: c.viz_type,
  dataset: c.datasource_name,
  owner: formatOwnerName(c.owners?.[0]),
  lastModified: c.changed_on_delta_humanized,
});

const formatDataset = (d: any): Dataset => ({
  ...d,
  name: d.table_name,
  type: d.kind === 'physical' ? 'Physical' : 'Virtual',
  owner: formatOwnerName(d.owners?.[0]),
});

export const supersetService = {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await supersetClient.get('/api/v1/me/');
      return response.data.result;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch current user');
    }
  },

  async getDashboards(page = PAGINATION_DEFAULTS.page, pageSize = PAGINATION_DEFAULTS.pageSize): Promise<{ result: Dashboard[], count: number }> {
    try {
      const response = await supersetClient.get('/api/v1/dashboard/', {
        params: {
          q: JSON.stringify({
            page,
            page_size: pageSize,
            order_column: 'changed_on_delta_humanized',
            order_direction: 'desc',
          }),
        },
      });
      const result = (response.data?.result || []).map(formatDashboard);
      return { result, count: response.data?.count || 0 };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch dashboards');
    }
  },

  async getDashboard(idOrSlug: string | number): Promise<Dashboard> {
    try {
      const response = await supersetClient.get(`/api/v1/dashboard/${idOrSlug}`);
      const d = response.data?.result;
      if (!d) throw new Error(`Dashboard ${idOrSlug} not found`);
      return formatDashboard(d);
    } catch (error) {
      throw handleApiError(error, `Failed to fetch dashboard ${idOrSlug}`);
    }
  },

  async updateDashboard(id: number, dashboardData: any): Promise<any> {
    try {
      const response = await supersetClient.put(`/api/v1/dashboard/${id}`, dashboardData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to update dashboard ${id}`);
    }
  },

  async getCharts(page = PAGINATION_DEFAULTS.page, pageSize = PAGINATION_DEFAULTS.pageSize): Promise<{ result: Chart[], count: number }> {
    try {
      const response = await supersetClient.get('/api/v1/chart/', {
        params: { q: JSON.stringify({ page, page_size: pageSize }) },
      });
      const result = (response.data?.result || []).map(formatChart);
      return { result, count: response.data?.count || 0 };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch charts');
    }
  },

  async getChart(id: number): Promise<Chart> {
    try {
      const response = await supersetClient.get(`/api/v1/chart/${id}`);
      if (!response.data?.result) throw new Error(`Chart ${id} not found`);
      return formatChart(response.data.result);
    } catch (error) {
      throw handleApiError(error, `Failed to fetch chart ${id}`);
    }
  },

  async getChartData(chartId: number, queryContext: any): Promise<any> {
    try {
      const response = await supersetClient.post('/api/v1/chart/data', queryContext);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch chart data for ${chartId}`);
    }
  },

  async getDatasets(page = PAGINATION_DEFAULTS.page, pageSize = PAGINATION_DEFAULTS.pageSize): Promise<{ result: Dataset[], count: number }> {
    try {
      const response = await supersetClient.get('/api/v1/dataset/', {
        params: { q: JSON.stringify({ page, page_size: pageSize }) },
      });
      const result = (response.data?.result || []).map(formatDataset);
      return { result, count: response.data?.count || 0 };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch datasets');
    }
  },

  async executeSql(sql: string, databaseId: number, schema?: string): Promise<any> {
    try {
      const response = await supersetClient.post('/api/v1/sqllab/execute/', {
        sql,
        database_id: databaseId,
        schema,
        runAsync: false,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to execute SQL');
    }
  },

  async getDatabases(page = PAGINATION_DEFAULTS.page, pageSize = PAGINATION_DEFAULTS.pageSize): Promise<{ result: any[], count: number }> {
    try {
      const response = await supersetClient.get('/api/v1/database/', {
        params: { q: JSON.stringify({ page, page_size: pageSize }) },
      });
      return { result: response.data?.result || [], count: response.data?.count || 0 };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch databases');
    }
  },

  async createDatabase(dbData: any): Promise<any> {
    try {
      return (await supersetClient.post('/api/v1/database/', dbData)).data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create database');
    }
  },

  async updateDatabase(id: number, dbData: any): Promise<any> {
    try {
      return (await supersetClient.put(`/api/v1/database/${id}`, dbData)).data;
    } catch (error) {
      throw handleApiError(error, `Failed to update database ${id}`);
    }
  },

  async createDataset(datasetData: any): Promise<any> {
    try {
      return (await supersetClient.post('/api/v1/dataset/', datasetData)).data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create dataset');
    }
  },

  async testConnection(dbData: any): Promise<any> {
    try {
      return (await supersetClient.post('/api/v1/database/test_connection/', dbData)).data;
    } catch (error) {
      throw handleApiError(error, 'Failed to test database connection');
    }
  },

  async deleteDatabase(id: number): Promise<any> {
    try {
      return (await supersetClient.delete(`/api/v1/database/${id}`)).data;
    } catch (error) {
      throw handleApiError(error, `Failed to delete database ${id}`);
    }
  },

  async getUsers(page = PAGINATION_DEFAULTS.page, pageSize = PAGINATION_DEFAULTS.pageSize): Promise<{ result: any[], count: number }> {
    try {
      const response = await supersetClient.get('/api/v1/security/users/', {
        params: { q: JSON.stringify({ page, page_size: pageSize }) },
      });
      return { result: response.data?.result || [], count: response.data?.count || 0 };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch users');
    }
  },

  async createUser(userData: any): Promise<any> {
    try {
      return (await supersetClient.post('/api/v1/security/users/', userData)).data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create user');
    }
  },

  async updateUser(id: number, userData: any): Promise<any> {
    try {
      return (await supersetClient.put(`/api/v1/security/users/${id}`, userData)).data;
    } catch (error) {
      throw handleApiError(error, `Failed to update user ${id}`);
    }
  },

  async deleteUser(id: number): Promise<any> {
    try {
      return (await supersetClient.delete(`/api/v1/security/users/${id}`)).data;
    } catch (error) {
      throw handleApiError(error, `Failed to delete user ${id}`);
    }
  },

  async getRoles(page = PAGINATION_DEFAULTS.page, pageSize = PAGINATION_DEFAULTS.pageSize): Promise<{ result: any[], count: number }> {
    try {
      const response = await supersetClient.get('/api/v1/security/roles/', {
        params: { q: JSON.stringify({ page, page_size: pageSize }) },
      });
      return { result: response.data?.result || [], count: response.data?.count || 0 };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch roles');
    }
  },

  async createRole(name: string): Promise<any> {
    try {
      return supersetClient.post('/api/v1/security/roles/', { name });
    } catch (error) {
      throw handleApiError(error, 'Failed to create role');
    }
  },

  async updateRole(id: number, name: string): Promise<any> {
    try {
      return supersetClient.put(`/api/v1/security/roles/${id}`, { name });
    } catch (error) {
      throw handleApiError(error, `Failed to update role ${id}`);
    }
  },

  async deleteRole(id: number): Promise<any> {
    try {
      return supersetClient.delete(`/api/v1/security/roles/${id}`);
    } catch (error) {
      throw handleApiError(error, `Failed to delete role ${id}`);
    }
  },

  async getReports(page = PAGINATION_DEFAULTS.page, pageSize = PAGINATION_DEFAULTS.pageSize): Promise<{ result: any[], count: number }> {
    try {
      const response = await supersetClient.get('/api/v1/report/', {
        params: { q: JSON.stringify({ page, page_size: pageSize }) },
      });
      return { result: response.data?.result || [], count: response.data?.count || 0 };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch reports');
    }
  },

  async getLogs(page = PAGINATION_DEFAULTS.page, pageSize = PAGINATION_DEFAULTS.pageSize): Promise<{ result: any[], count: number }> {
    try {
      const response = await supersetClient.get('/api/v1/log/', {
        params: {
          q: JSON.stringify({
            page,
            page_size: pageSize,
            order_column: 'dttm',
            order_direction: 'desc',
          }),
        },
      });
      return { result: response.data?.result || [], count: response.data?.count || 0 };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch logs');
    }
  },

  async authenticateSSO(provider: 'google' | 'github' | 'ldap'): Promise<any> {
    console.log(`Initiating SSO with ${provider}`);
    return { success: true, message: `SSO with ${provider} initiated` };
  }
};
