import initSqlJs, { type Database } from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';
import type { DatasetMetadata } from '@/services/data';
import type { ChartQuery, ChartResult } from '@/services/query/models';
import type { QueryExecutor } from '@/services/query/execution/QueryExecutor';
import { compileChartQuery } from '../compiler/QueryCompiler';
import { validateChartQuery } from '@/services/query/validation/QueryValidator';

export interface SampleDatasetRows {
  dataset: DatasetMetadata;
  rows: readonly Record<string, unknown>[];
}

export class SampleQueryExecutor implements QueryExecutor {
  private sqlPromise: Promise<any> | null = null;

  constructor(private readonly sample: SampleDatasetRows) {}

  private getSql(): Promise<any> {
    if (!this.sqlPromise) {
      this.sqlPromise = initSqlJs({ locateFile: () => sqlWasm });
    }
    return this.sqlPromise;
  }

  async execute(dataset: DatasetMetadata, query: ChartQuery): Promise<ChartResult> {
    validateChartQuery(dataset, query);
    const sql = compileChartQuery(dataset, query);
    const SQL = await this.getSql();
    const db: Database = new SQL.Database();

    try {
      const columns = dataset.columns;
      const definitions = columns
        .map(column => `"${column.physicalName}" ${column.dataType === 'number' ? 'REAL' : 'TEXT'}`)
        .join(', ');

      db.run(`CREATE TABLE dataset (${definitions})`);

      const statement = db.prepare(
        `INSERT INTO dataset (${columns.map(column => `"${column.physicalName}"`).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      );

      for (const row of this.sample.rows) {
        statement.run(columns.map(column => row[column.name] ?? null) as any);
      }
      statement.free();

      const sourceName = dataset.tableName ?? dataset.name;
      const normalizedSql = sql
        .replace(new RegExp(`"${sourceName}"`, 'g'), 'dataset')
        .replace(new RegExp(`FROM ${dataset.name}`, 'g'), 'FROM dataset');

      const results = db.exec(normalizedSql);
      if (results.length === 0) {
        return { columns: [], data: [], rowCount: 0, query: normalizedSql };
      }

      const result = results[0];
      const data = result.values.map(row =>
        Object.fromEntries(result.columns.map((column, index) => [column, row[index]])),
      );

      return {
        columns: result.columns,
        data,
        rowCount: data.length,
        query: normalizedSql,
      };
    } finally {
      db.close();
    }
  }
}
