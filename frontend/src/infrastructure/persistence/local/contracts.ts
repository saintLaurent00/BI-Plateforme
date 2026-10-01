import type {
  User, CreateUserInput, UpdateUserInput,
  Role, CreateRoleInput,
  Group, CreateGroupInput,
  DataSource, CreateDataSourceInput,
  Dashboard, CreateDashboardInput,
  SavedQuery, Report, AuditLog,
  DatasetMetadata
} from '../../../domain';

export type UserDTO = User;
export type CreateUserDTO = CreateUserInput;
export type UpdateUserDTO = UpdateUserInput;
export type RoleDTO = Role;
export type CreateRoleDTO = CreateRoleInput;
export type UpdateRoleDTO = Partial<CreateRoleInput> & { id: string };
export type GroupDTO = Group;
export type CreateGroupDTO = CreateGroupInput;
export type UpdateGroupDTO = Partial<CreateGroupInput> & { id: string };
export type DataSourceDTO = DataSource;
export type CreateDataSourceDTO = CreateDataSourceInput;
export type UpdateDataSourceDTO = Partial<CreateDataSourceInput> & { id: string };
export type DashboardDTO = Dashboard;
export type CreateDashboardDTO = CreateDashboardInput;
export type UpdateDashboardDTO = Partial<CreateDashboardInput> & { id: string };
export type ChartDTO = import('../../../domain').Chart;
export type CreateChartDTO = import('../../../domain').CreateChartInput;
export type DatasetDTO = DatasetMetadata;
export type CreateDatasetDTO = DatasetMetadata;
export type UpdateDatasetDTO = Partial<DatasetMetadata> & { id: string };
export type AuditLogDTO = AuditLog;
export type ReportDTO = Report;
