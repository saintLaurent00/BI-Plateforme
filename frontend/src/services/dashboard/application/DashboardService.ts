import {
  deleteDashboard as deleteLocalDashboard,
  getDashboard as getLocalDashboard,
  getDashboards as getLocalDashboards,
  saveDashboard as saveLocalDashboard,
} from '@/platform/persistence/local/db';

export const dashboardService = {
  async list() {
    return getLocalDashboards();
  },
  async get(id: string | number) {
    return getLocalDashboard(String(id));
  },
  async save(dashboard: unknown) {
    await saveLocalDashboard(dashboard);
    return dashboard;
  },
  async remove(id: string | number) {
    await deleteLocalDashboard(String(id));
  },
};
