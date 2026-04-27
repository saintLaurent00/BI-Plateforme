import { supersetClient } from '../lib/supersetClient';
import { Dashboard, Chart, Dataset, User } from '../types';

export const supersetService = {
  // User Profile
  async getCurrentUser(): Promise<User> {
    const response = await supersetClient.get('/api/v1/me/');
    return response.data.result;
  },

  // Dashboards
  async getDashboards(page = 0, pageSize = 25): Promise<{ result: Dashboard[], count: number }> {
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
    
    const result = response.data?.result || [];
    const dashboards = result.map((d: any) => ({
      ...d,
      // Mapping for backward compatibility
      title: d.dashboard_title,
      owner: d.owners?.[0]?.first_name + ' ' + d.owners?.[0]?.last_name,
      status: d.published ? 'Published' : 'Draft',
      lastModified: d.changed_on_delta_humanized,
    }));

    return { result: dashboards, count: response.data?.count || 0 };
  },

  async getDashboard(idOrSlug: string | number): Promise<Dashboard> {
    const response = await supersetClient.get(`/api/v1/dashboard/${idOrSlug}`);
    const d = response.data?.result;
    if (!d) {
      throw new Error(`Dashboard ${idOrSlug} not found in Superset`);
    }
    const metadata = d.json_metadata ? JSON.parse(d.json_metadata) : {};
    return {
      ...d,
      title: d.dashboard_title,
      name: d.dashboard_title,
      owner: d.owners?.[0]?.first_name + ' ' + d.owners?.[0]?.last_name,
      status: d.published ? 'Published' : 'Draft',
      lastModified: d.changed_on_delta_humanized,
      backgroundColor: metadata.backgroundColor || '#f8fafc',
    };
  },

  async updateDashboard(id: number, dashboardData: any) {
    const response = await supersetClient.put(`/api/v1/dashboard/${id}`, dashboardData);
    return response.data;
  },

  // Charts
  async getCharts(page = 0, pageSize = 25): Promise<{ result: Chart[], count: number }> {
    const response = await supersetClient.get('/api/v1/chart/', {
      params: {
        q: JSON.stringify({
          page,
          page_size: pageSize,
        }),
      },
    });

    const result = response.data?.result || [];
    const charts = result.map((c: any) => ({
      ...c,
      title: c.slice_name,
      type: c.viz_type,
      dataset: c.datasource_name,
      owner: c.owners?.[0]?.first_name + ' ' + c.owners?.[0]?.last_name,
      lastModified: c.changed_on_delta_humanized,
    }));

    return { result: charts, count: response.data?.count || 0 };
  },

  async getChart(id: number): Promise<Chart> {
    const response = await supersetClient.get(`/api/v1/chart/${id}`);
    const c = response.data.result;
    return {
      ...c,
      title: c.slice_name,
      type: c.viz_type,
      dataset: c.datasource_name,
      owner: c.owners?.[0]?.first_name + ' ' + c.owners?.[0]?.last_name,
      lastModified: c.changed_on_delta_humanized,
    };
  },

  async getChartData(chartId: number, queryContext: any) {
    const response = await supersetClient.post('/api/v1/chart/data', queryContext);
    return response.data;
  },

  // Datasets
  async getDatasets(page = 0, pageSize = 25): Promise<{ result: Dataset[], count: number }> {
    const response = await supersetClient.get('/api/v1/dataset/', {
      params: {
        q: JSON.stringify({
          page,
          page_size: pageSize,
        }),
      },
    });

    const result = response.data?.result || [];
    const datasets = result.map((d: any) => ({
      ...d,
      name: d.table_name,
      type: d.kind === 'physical' ? 'Physical' : 'Virtual',
      owner: d.owners?.[0]?.first_name + ' ' + d.owners?.[0]?.last_name,
    }));

    return { result: datasets, count: response.data?.count || 0 };
  },

  async getDataset(id: number | string): Promise<Dataset> {
    const response = await supersetClient.get(`/api/v1/dataset/${id}`);
    const d = response.data.result;
    return {
      ...d,
      name: d.table_name || d.name,
      type: d.kind === 'physical' ? 'Physical' : 'Virtual',
      owner: d.owners?.[0]?.first_name + ' ' + d.owners?.[0]?.last_name,
      columns: d.columns || [],
      metrics: d.metrics || [],
    };
  },

  async updateDataset(id: number | string, datasetData: any) {
    const response = await supersetClient.put(`/api/v1/dataset/${id}`, datasetData);
    return response.data;
  },

  // SQL Lab
  async executeSql(sql: string, databaseId: number, schema?: string) {
    const response = await supersetClient.post('/api/v1/sqllab/execute/', {
      sql,
      database_id: databaseId,
      schema,
      runAsync: false, // For simplicity in this demo
    });
    return response.data;
  },

  // Databases (for SQL Lab selection)
  async getDatabases(page = 0, pageSize = 25) {
    const response = await supersetClient.get('/api/v1/database/', {
      params: {
        q: JSON.stringify({
          page,
          page_size: pageSize,
        }),
      },
    });
    return {
      result: response.data?.result || [],
      count: response.data?.count || 0
    };
  },

  async createDatabase(dbData: any) {
    return (await supersetClient.post('/api/v1/database/', dbData)).data;
  },

  async updateDatabase(id: number, dbData: any) {
    return (await supersetClient.put(`/api/v1/database/${id}`, dbData)).data;
  },

  async createDataset(datasetData: any) {
    return (await supersetClient.post('/api/v1/dataset/', datasetData)).data;
  },

  async testConnection(dbData: any) {
    return (await supersetClient.post('/api/v1/database/test_connection/', dbData)).data;
  },

  async deleteDatabase(id: number) {
    return (await supersetClient.delete(`/api/v1/database/${id}`)).data;
  },

  // Security - Users
  async getUsers(page = 0, pageSize = 25) {
    const response = await supersetClient.get('/api/v1/security/users/', {
      params: {
        q: JSON.stringify({
          page,
          page_size: pageSize,
        }),
      },
    });
    return {
      result: response.data?.result || [],
      count: response.data?.count || 0
    };
  },

  async createUser(userData: any) {
    return (await supersetClient.post('/api/v1/security/users/', userData)).data;
  },

  async updateUser(id: number, userData: any) {
    return (await supersetClient.put(`/api/v1/security/users/${id}`, userData)).data;
  },

  async deleteUser(id: number) {
    return (await supersetClient.delete(`/api/v1/security/users/${id}`)).data;
  },

  // Security - Roles
  async getRoles(page = 0, pageSize = 25) {
    const response = await supersetClient.get('/api/v1/security/roles/', {
      params: {
        q: JSON.stringify({
          page,
          page_size: pageSize,
        }),
      },
    });
    return {
      result: response.data?.result || [],
      count: response.data?.count || 0
    };
  },

  // Reports & Alerts
  async getReports(page = 0, pageSize = 25) {
    const response = await supersetClient.get('/api/v1/report/', {
      params: {
        q: JSON.stringify({
          page,
          page_size: pageSize,
        }),
      },
    });
    return {
      result: response.data?.result || [],
      count: response.data?.count || 0
    };
  },

  // Audit Logs
  async getLogs(page = 0, pageSize = 25) {
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
    return {
      result: response.data?.result || [],
      count: response.data?.count || 0
    };
  },

  async createRole(name: string) {
    return supersetClient.post('/api/v1/security/roles/', { name });
  },

  async updateRole(id: number, name: string) {
    return supersetClient.put(`/api/v1/security/roles/${id}`, { name });
  },

  async deleteRole(id: number) {
    return supersetClient.delete(`/api/v1/security/roles/${id}`);
  },

  // Authentication & SSO
  async authenticateSSO(provider: 'google' | 'github' | 'ldap') {
    console.log(`Initiating SSO authentication with ${provider}`);
    // In a real app, this would redirect to the provider's auth URL
    // or open a popup as per the OAuth Integration skill.
    return { success: true, message: `SSO with ${provider} initiated` };
  }
};
