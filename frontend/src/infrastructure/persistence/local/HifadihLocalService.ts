import {
  executeQuery,
  getCharts,
  getDashboard,
  getDashboards,
  getDataSources,
  getRoles,
  getTables,
  getTableSchema,
  deleteDashboard,
  saveDashboard,
  saveChart,
} from '../../../core/utils/db';

type DatasetRecord = {
  id: string;
  table_name: string;
  name?: string;
  kind?: 'physical' | 'virtual';
  database_id?: string | number;
  database?: unknown;
  sql?: string;
  columns?: Array<{ name: string; type: string }>;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

const DATASET_TABLE = 'hifadih_datasets';

const ensureDatasetStore = async () => {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS hifadih_datasets (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      name TEXT,
      kind TEXT,
      database_id TEXT,
      database_json TEXT,
      sql TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);
};

const readDatasetRows = async (): Promise<DatasetRecord[]> => {
  await ensureDatasetStore();
  const rows = await executeQuery(`SELECT * FROM hifadih_datasets ORDER BY created_at DESC`);
  return rows.map((row: any) => ({
    ...row,
    database: row.database_json ? JSON.parse(row.database_json) : undefined,
    database_id: row.database_id ?? undefined,
  }));
};

export const hifadihService = {
  async getDashboards() {
    return { result: await getDashboards() };
  },

  async getDashboard(id: string | number) {
    return getDashboard(String(id));
  },

  async deleteDashboard(id: string | number) {
    await deleteDashboard(String(id));
    return { success: true };
  },

  async saveDashboard(dashboard: any) {
    await saveDashboard(dashboard);
    return { result: dashboard };
  },

  async getCharts() {
    return { result: await getCharts() };
  },

  async saveChart(chart: any) {
    await saveChart(chart);
    return { result: chart };
  },

  async getDatabases() {
    const dataSources = await getDataSources();
    return {
      result: dataSources.map((source: any) => ({
        ...source,
        database_name: source.name || source.databaseName || source.database_name || 'Base de données',
      })),
    };
  },

  async getDataSources() {
    return { result: await getDataSources() };
  },

  async getDatasets() {
    const stored = await readDatasetRows();
    const tables = await getTables();

    const tableDatasets = await Promise.all(
      tables
        .filter((table) => ![
          'charts',
          'dashboards',
          'saved_queries',
          'roles',
          'permissions',
          'data_sources',
          'hifadih_datasets',
        ].includes(table))
        .map(async (table) => ({
          id: `table:${table}`,
          table_name: table,
          name: table,
          kind: 'physical' as const,
          columns: await getTableSchema(table),
        })),
    );

    return { result: [...stored, ...tableDatasets] };
  },

  async getDataset(id: string | number) {
    const datasets = await this.getDatasets();
    const normalizedId = String(id);
    return datasets.result.find(
      (dataset: any) =>
        String(dataset.id) === normalizedId ||
        String(dataset.table_name) === normalizedId ||
        String(dataset.name) === normalizedId,
    ) ?? null;
  },

  async createDataset(dataset: Partial<DatasetRecord> & { table_name: string }) {
    await ensureDatasetStore();

    const id = String(dataset.id ?? crypto.randomUUID());
    const now = new Date().toISOString();
    const q = (value: unknown) => value == null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`;

    await executeQuery(`
      INSERT OR REPLACE INTO hifadih_datasets
      (id, table_name, name, kind, database_id, database_json, sql, created_at, updated_at)
      VALUES (${q(id)}, ${q(dataset.table_name)}, ${q(dataset.name)},
              ${q(dataset.kind ?? 'physical')}, ${q(dataset.database_id)},
              ${q(dataset.database ? JSON.stringify(dataset.database) : null)},
              ${q(dataset.sql)}, ${q(now)}, ${q(now)})
    `);

    return {
      result: {
        ...dataset,
        id,
        created_at: now,
        updated_at: now,
      },
    };
  },

  async deleteDataset(id: string | number) {
    await ensureDatasetStore();
    const escapedId = String(id).replace(/'/g, "''");
    await executeQuery(`DELETE FROM hifadih_datasets WHERE id = '${escapedId}'`);
    return { success: true };
  },

  async getUsers() {
    return { result: [] };
  },

  async createUser(user: Record<string, unknown>) {
    return { result: { ...user, id: user.id ?? crypto.randomUUID() } };
  },

  async updateUser(id: string | number, user: Record<string, unknown>) {
    return { result: { ...user, id } };
  },

  async deleteUser(id: string | number) {
    return { success: true, id };
  },

  async getLogs() {
    return { result: [] };
  },

  async getRoles() {
    return { result: await getRoles() };
  },

  async getReports() {
    return { result: [] };
  },

  async authenticateSSO(provider: 'google' | 'github' | 'ldap') {
    return { provider, authenticated: true };
  },
};
