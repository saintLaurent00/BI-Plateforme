import {
  executeQuery,
  getDataSources,
  getTableSchema,
  getTables,
} from '@/platform/persistence/local/db';

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

async function ensureDatasetStore() {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS ${DATASET_TABLE} (
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
}

async function readDatasetRows(): Promise<DatasetRecord[]> {
  await ensureDatasetStore();
  const rows = await executeQuery(`SELECT * FROM ${DATASET_TABLE} ORDER BY created_at DESC`);
  return rows.map((row: any) => ({
    ...row,
    database: row.database_json ? JSON.parse(row.database_json) : undefined,
    database_id: row.database_id ?? undefined,
  }));
}

export const dataCatalogService = {
  async listDataSources() {
    return getDataSources();
  },
  async listDatabases() {
    const dataSources = await getDataSources();
    return dataSources.map((source: any) => ({
      ...source,
      database_name: source.name || source.databaseName || source.database_name || 'Base de données',
    }));
  },
  async listDatasets() {
    const stored = await readDatasetRows();
    const tables = await getTables();
    const systemTables = new Set([
      'charts', 'dashboards', 'saved_queries', 'roles', 'permissions',
      'data_sources', DATASET_TABLE,
    ]);

    const tableDatasets = await Promise.all(
      tables
        .filter(table => !systemTables.has(table))
        .map(async table => ({
          id: `table:${table}`,
          table_name: table,
          name: table,
          kind: 'physical' as const,
          columns: await getTableSchema(table),
        })),
    );

    return [...stored, ...tableDatasets];
  },
  async getDataset(id: string | number) {
    const datasets = await this.listDatasets();
    const normalizedId = String(id);
    return datasets.find(
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
    const q = (value: unknown) =>
      value == null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`;

    await executeQuery(`
      INSERT OR REPLACE INTO ${DATASET_TABLE}
      (id, table_name, name, kind, database_id, database_json, sql, created_at, updated_at)
      VALUES (${q(id)}, ${q(dataset.table_name)}, ${q(dataset.name)},
              ${q(dataset.kind ?? 'physical')}, ${q(dataset.database_id)},
              ${q(dataset.database ? JSON.stringify(dataset.database) : null)},
              ${q(dataset.sql)}, ${q(now)}, ${q(now)})
    `);

    return {
      ...dataset,
      id,
      created_at: now,
      updated_at: now,
    };
  },
  async deleteDataset(id: string | number) {
    await ensureDatasetStore();
    const escapedId = String(id).replace(/'/g, "''");
    await executeQuery(`DELETE FROM ${DATASET_TABLE} WHERE id = '${escapedId}'`);
  },
};
