import { getRoles } from '@/platform/persistence/local/db';

export const identityService = {
  async listUsers() {
    return [];
  },
  async createUser(user: Record<string, unknown>) {
    return { ...user, id: user.id ?? crypto.randomUUID() };
  },
  async updateUser(id: string | number, user: Record<string, unknown>) {
    return { ...user, id };
  },
  async removeUser(id: string | number) {
    return { success: true, id };
  },
  async listRoles() {
    return getRoles();
  },
  async listAuditLogs() {
    return [];
  },
  async authenticateSSO(provider: 'google' | 'github' | 'ldap') {
    return { provider, authenticated: true };
  },
  async listReports() {
    return [];
  },
};
