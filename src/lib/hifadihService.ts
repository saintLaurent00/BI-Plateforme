import { toast } from 'sonner';
import { 
  UserDTO, 
  CreateUserDTO, 
  UpdateUserDTO,
  RoleDTO,
  CreateRoleDTO,
  UpdateRoleDTO,
  GroupDTO,
  CreateGroupDTO,
  UpdateGroupDTO,
  DatasetDTO,
  CreateDatasetDTO,
  UpdateDatasetDTO,
  DataSourceDTO,
  CreateDataSourceDTO,
  UpdateDataSourceDTO,
  DashboardDTO,
  CreateDashboardDTO,
  UpdateDashboardDTO,
  ChartDTO,
  CreateChartDTO,
  AuditLogDTO,
  ReportDTO
} from '../core/types';

/**
 * Hifadih BI Service
 * Centralise la logique métier et les appels aux données pour l'outil BI avec gestion des DTOs.
 */
export const hifadihService = {
  // Gestion des Tableaux de Bord (Dashboards)
  async getDashboards(): Promise<{ result: DashboardDTO[] }> {
    const stored = localStorage.getItem('hifadih_dashboards');
    return { result: stored ? JSON.parse(stored) : [] };
  },

  async getDashboard(id: string | number): Promise<DashboardDTO | undefined> {
    const { result } = await this.getDashboards();
    return result.find((d) => String(d.id) === String(id));
  },

  async createDashboard(dashboard: CreateDashboardDTO): Promise<DashboardDTO> {
    const { result } = await this.getDashboards();
    const newDashboard: DashboardDTO = {
      ...dashboard,
      id: Date.now(),
      owners: [],
      published: dashboard.published ?? true,
      tags: dashboard.tags || [],
      lastModified: new Date().toISOString()
    };
    const updated = [...result, newDashboard];
    localStorage.setItem('hifadih_dashboards', JSON.stringify(updated));
    return newDashboard;
  },

  // Gestion des Graphiques/Visualisations (Charts)
  async getCharts(): Promise<{ result: ChartDTO[] }> {
    const stored = localStorage.getItem('hifadih_charts');
    return { result: stored ? JSON.parse(stored) : [] };
  },

  async getChart(id: string | number): Promise<ChartDTO | undefined> {
    const { result } = await this.getCharts();
    return result.find((c) => String(c.id) === String(id));
  },

  async createChart(chart: CreateChartDTO): Promise<ChartDTO> {
    const { result } = await this.getCharts();
    const newChart: ChartDTO = {
      ...chart,
      id: Date.now(),
      slice_name: chart.slice_name,
      datasource_name: chart.datasource_name || 'Database',
      owners: [],
      lastModified: new Date().toISOString()
    };
    const updated = [...result, newChart];
    localStorage.setItem('hifadih_charts', JSON.stringify(updated));
    return newChart;
  },

  // Gestion des Datasets
  async getDatasets(): Promise<{ result: DatasetDTO[] }> {
    const stored = localStorage.getItem('hifadih_datasets');
    return { result: stored ? JSON.parse(stored) : [] };
  },

  async getDataset(id: string | number): Promise<DatasetDTO | undefined> {
    const { result } = await this.getDatasets();
    return result.find((d) => String(d.id) === String(id));
  },

  async createDataset(dataset: CreateDatasetDTO): Promise<DatasetDTO> {
    const { result } = await this.getDatasets();
    const newDataset: DatasetDTO = {
      ...dataset,
      id: Date.now(),
      columns: dataset.columns || [],
      metrics: dataset.metrics || [],
      database: {
        id: dataset.database_id,
        database_name: 'Database'
      },
      created_at: new Date().toISOString()
    };
    const updated = [...result, newDataset];
    localStorage.setItem('hifadih_datasets', JSON.stringify(updated));
    return newDataset;
  },

  async updateDataset(id: string | number, dto: UpdateDatasetDTO): Promise<boolean> {
    const { result } = await this.getDatasets();
    const updated = result.map(d => String(d.id) === String(id) ? { ...d, ...dto, updated_at: new Date().toISOString() } : d);
    localStorage.setItem('hifadih_datasets', JSON.stringify(updated));
    return true;
  },

  async deleteDataset(id: string | number): Promise<{ success: boolean }> {
    const { result } = await this.getDatasets();
    const updated = result.filter((d) => String(d.id) !== String(id));
    localStorage.setItem('hifadih_datasets', JSON.stringify(updated));
    return { success: true };
  },

  // Gestion des Sources de Données (DataSources)
  async getDatabases(): Promise<{ result: DataSourceDTO[] }> {
    const stored = localStorage.getItem('hifadih_databases');
    return { result: stored ? JSON.parse(stored) : [] };
  },

  async createDataSource(dto: CreateDataSourceDTO): Promise<DataSourceDTO> {
    const { result } = await this.getDatabases();
    const newDb: DataSourceDTO = {
      ...dto,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    const updated = [...result, newDb];
    localStorage.setItem('hifadih_databases', JSON.stringify(updated));
    return newDb;
  },

  // Gestion des Utilisateurs (Users)
  async getUsers(): Promise<{ result: UserDTO[] }> {
    const stored = localStorage.getItem('hifadih_users');
    return { result: stored ? JSON.parse(stored) : [] };
  },

  async createUser(user: CreateUserDTO): Promise<UserDTO> {
    const { result } = await this.getUsers();
    const newUser: UserDTO = {
      ...user,
      id: Date.now(),
      username: user.username || user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      roles: user.roles || ['User'],
      active: user.active ?? true,
      status: 'Active',
      job_title: user.job_title,
      department: user.department,
      section: user.section,
      region: user.region,
      zone: user.zone,
      branch: user.branch,
      site_location: user.site_location,
      manager_name: user.manager_name,
      phone: user.phone,
      created_at: new Date().toISOString()
    };
    const updated = [...result, newUser];
    localStorage.setItem('hifadih_users', JSON.stringify(updated));
    return newUser;
  },

  async updateUser(id: string | number, user: UpdateUserDTO): Promise<{ success: boolean }> {
    const { result } = await this.getUsers();
    const updated = result.map((u) => (String(u.id) === String(id)) ? { ...u, ...user, updated_at: new Date().toISOString() } : u);
    localStorage.setItem('hifadih_users', JSON.stringify(updated));
    return { success: true };
  },

  async deleteUser(id: string | number): Promise<{ success: boolean }> {
    const { result } = await this.getUsers();
    const updated = result.filter((u) => String(u.id) !== String(id));
    localStorage.setItem('hifadih_users', JSON.stringify(updated));
    return { success: true };
  },

  // Gestion des Rôles (Roles)
  async getRoles(): Promise<{ result: RoleDTO[] }> {
    const stored = localStorage.getItem('hifadih_roles');
    return { result: stored ? JSON.parse(stored) : [] };
  },

  async createRole(role: CreateRoleDTO): Promise<RoleDTO> {
    const { result } = await this.getRoles();
    const newRole: RoleDTO = {
      ...role,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    const updated = [...result, newRole];
    localStorage.setItem('hifadih_roles', JSON.stringify(updated));
    return newRole;
  },

  async deleteRole(id: string | number): Promise<{ success: boolean }> {
    const { result } = await this.getRoles();
    const updated = result.filter((r) => String(r.id) !== String(id));
    localStorage.setItem('hifadih_roles', JSON.stringify(updated));
    return { success: true };
  },

  // Gestion des Groupes (Groups)
  async getGroups(): Promise<{ result: GroupDTO[] }> {
    const stored = localStorage.getItem('hifadih_groups');
    return { result: stored ? JSON.parse(stored) : [] };
  },

  async createGroup(group: CreateGroupDTO): Promise<GroupDTO> {
    const { result } = await this.getGroups();
    const newGroup: GroupDTO = {
      ...group,
      id: Date.now().toString(),
      members_count: group.member_ids?.length || 0,
      created_at: new Date().toISOString()
    };
    const updated = [...result, newGroup];
    localStorage.setItem('hifadih_groups', JSON.stringify(updated));
    return newGroup;
  },

  // Authentification SSO
  async authenticateSSO(provider: string) {
    console.log(`Authentification via SSO ${provider}`);
    return { success: true, user: { name: 'Hifadih User', role: 'Admin' } };
  },

  // Gestion des Rapports
  async getReports(): Promise<{ result: ReportDTO[] }> {
    const stored = localStorage.getItem('hifadih_reports');
    return { result: stored ? JSON.parse(stored) : [] };
  },

  // Gestion des Logs / Audit
  async getLogs(): Promise<{ result: AuditLogDTO[] }> {
    const stored = localStorage.getItem('hifadih_logs');
    return { result: stored ? JSON.parse(stored) : [] };
  },

  // Exécution de requêtes SQL
  async executeSql(sql: string, connectionId?: string | number) {
    console.log('Exécution SQL via Hifadih Engine:', sql, 'Connexion:', connectionId);
    return {
      data: [
        { id: 1, label: 'Exemple A', value: 120 },
        { id: 2, label: 'Exemple B', value: 450 }
      ]
    };
  },

  // Utilitaires
  isConfigured() {
    return true;
  }
};
