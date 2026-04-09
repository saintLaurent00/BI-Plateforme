import initSqlJs, { Database } from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';

let dbInstance: Database | null = null;
let SQL: any = null;

const DB_NAME = 'PrismOfflineDB';
const STORE_NAME = 'database';
const DB_KEY = 'sqlite_db';

async function getIndexedDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(data: Uint8Array) {
  const idb = await getIndexedDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = idb.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, DB_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function loadFromIndexedDB() {
  const idb = await getIndexedDB();
  return new Promise<Uint8Array | null>((resolve, reject) => {
    const transaction = idb.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(DB_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export const initDatabase = async () => {
  if (dbInstance) return { db: dbInstance, SQL };

  SQL = await initSqlJs({
    locateFile: () => sqlWasm,
  });

  const savedData = await loadFromIndexedDB();
  if (savedData) {
    dbInstance = new SQL.Database(savedData);
  } else {
    dbInstance = new SQL.Database();
    // Initialize system tables
    dbInstance.run(`
      CREATE TABLE IF NOT EXISTS charts (
        id TEXT PRIMARY KEY,
        name TEXT,
        table_name TEXT,
        chart_type TEXT,
        x_axis TEXT,
        y_axis TEXT,
        config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS dashboards (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        layout TEXT,
        background_color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS saved_queries (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        sql TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Seed sample charts if empty
      INSERT OR IGNORE INTO charts (id, name, table_name, chart_type, x_axis, y_axis, config)
      VALUES 
      ('sample-1', 'Sales by Region', 'sales_data', 'Bar', '["region"]', '["sales"]', '{"showLegend":true}'),
      ('sample-2', 'User Growth', 'users', 'Line', '["created_at"]', '["id"]', '{"showGrid":true}'),
      ('sample-3', 'Revenue Distribution', 'finance', 'Pie', '["category"]', '["amount"]', '{"labelType":"Category Name"}');

      -- Seed sample data tables
      CREATE TABLE IF NOT EXISTS sales_data (region TEXT, sales NUMBER);
      INSERT OR IGNORE INTO sales_data VALUES ('North', 1200), ('South', 800), ('East', 1500), ('West', 1100);

      CREATE TABLE IF NOT EXISTS users (created_at TEXT, id NUMBER);
      INSERT OR IGNORE INTO users VALUES ('2026-01-01', 10), ('2026-02-01', 25), ('2026-03-01', 45), ('2026-04-01', 80);

      CREATE TABLE IF NOT EXISTS finance (category TEXT, amount NUMBER);
      INSERT OR IGNORE INTO finance VALUES ('Software', 5000), ('Hardware', 3000), ('Services', 2000);

      -- Seed a sample dashboard
      INSERT OR IGNORE INTO dashboards (id, name, description, layout, background_color)
      VALUES ('sample-dashboard', 'Executive Sales Overview', 'A high-level view of sales performance and user growth.', 
      '[{"id":"r1","type":"row","children":[{"id":"c1","type":"chart","content":{"id":"sample-1","name":"Sales by Region","chart_type":"Bar","table_name":"sales_data","x_axis":"region","y_axis":["sales"]},"meta":{"width":6,"height":350}},{"id":"c2","type":"chart","content":{"id":"sample-2","name":"User Growth","chart_type":"Line","table_name":"users","x_axis":"created_at","y_axis":["id"]},"meta":{"width":6,"height":350}}],"meta":{"height":400}},{"id":"r2","type":"row","children":[{"id":"c3","type":"chart","content":{"id":"sample-3","name":"Revenue Distribution","chart_type":"Pie","table_name":"finance","x_axis":"category","y_axis":["amount"]},"meta":{"width":12,"height":400}}],"meta":{"height":450}}]', 
      '#f8fafc');
    `);
  }

  return { db: dbInstance, SQL };
};

export const saveChart = async (chart: any) => {
  const { db } = await initDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO charts (id, name, table_name, chart_type, x_axis, y_axis, config)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    chart.id,
    chart.name,
    chart.tableName,
    chart.chartType,
    JSON.stringify(chart.xAxis),
    JSON.stringify(chart.yAxis),
    JSON.stringify(chart.config || {})
  ]);
  stmt.free();
  
  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
};

export const getCharts = async () => {
  const { db } = await initDatabase();
  const res = db.exec("SELECT * FROM charts ORDER BY created_at DESC");
  if (res.length === 0) return [];
  
  const { columns, values } = res[0];
  return values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => {
      if (['x_axis', 'y_axis', 'config'].includes(col)) {
        obj[col] = JSON.parse(row[i] as string);
      } else {
        obj[col] = row[i];
      }
    });
    return obj;
  });
};

export const getDashboards = async () => {
  const { db } = await initDatabase();
  const res = db.exec("SELECT * FROM dashboards ORDER BY created_at DESC");
  if (res.length === 0) return [];
  
  const { columns, values } = res[0];
  return values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => {
      if (col === 'layout') {
        obj[col] = JSON.parse(row[i] as string);
      } else {
        obj[col] = row[i];
      }
    });
    return obj;
  });
};

export const saveDashboard = async (dashboard: any) => {
  const { db } = await initDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO dashboards (id, name, description, layout, background_color)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run([
    dashboard.id,
    dashboard.name,
    dashboard.description || '',
    JSON.stringify(dashboard.layout || []),
    dashboard.backgroundColor || '#f8fafc'
  ]);
  stmt.free();
  
  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
};

export const getDashboard = async (id: string) => {
  const { db } = await initDatabase();
  const res = db.exec(`SELECT * FROM dashboards WHERE id = '${id}'`);
  if (res.length === 0) return null;
  
  const { columns, values } = res[0];
  const row = values[0];
  const obj: any = {};
  columns.forEach((col, i) => {
    if (col === 'layout') {
      obj[col] = JSON.parse(row[i] as string);
    } else if (col === 'background_color') {
      obj['backgroundColor'] = row[i];
    } else {
      obj[col] = row[i];
    }
  });
  return obj;
};

export const saveQuery = async (query: any) => {
  const { db } = await initDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO saved_queries (id, name, description, sql)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run([
    query.id,
    query.name,
    query.description || '',
    query.sql
  ]);
  stmt.free();
  
  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
};

export const getSavedQueries = async () => {
  const { db } = await initDatabase();
  const res = db.exec("SELECT * FROM saved_queries ORDER BY created_at DESC");
  if (res.length === 0) return [];
  
  const { columns, values } = res[0];
  return values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
};

export const getDatabase = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return { db: dbInstance, SQL };
};

export const executeQuery = async (sql: string) => {
  const { db } = await initDatabase();
  try {
    const results = db.exec(sql);
    if (results.length === 0) return [];
    
    const { columns, values } = results[0];
    return values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  } catch (error) {
    console.error('SQL Error:', error);
    throw error;
  }
};

export const importCSV = async (tableName: string, csvData: any[]) => {
  const { db } = await initDatabase();
  
  if (csvData.length === 0) return;

  const columns = Object.keys(csvData[0]);
  const columnDefs = columns.map(col => `"${col}" TEXT`).join(', ');
  
  db.run(`DROP TABLE IF EXISTS "${tableName}"`);
  db.run(`CREATE TABLE "${tableName}" (${columnDefs})`);

  const placeholders = columns.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT INTO "${tableName}" VALUES (${placeholders})`);

  csvData.forEach(row => {
    stmt.run(columns.map(col => row[col]));
  });

  stmt.free();

  // Persist after import
  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
};

export const getTables = async () => {
  const { db } = await initDatabase();
  const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  if (res.length === 0) return [];
  return res[0].values.map(row => row[0] as string);
};

export const getTableSchema = async (tableName: string) => {
  const { db } = await initDatabase();
  const res = db.exec(`PRAGMA table_info("${tableName}")`);
  if (res.length === 0) return [];
  return res[0].values.map(row => ({
    name: row[1] as string,
    type: row[2] as string,
    notnull: row[3] as number,
    pk: row[5] as number
  }));
};
