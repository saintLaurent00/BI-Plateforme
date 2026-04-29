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
  }

  // Always ensure system tables exist
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

    -- Ensure admin tables exist
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      permission_name TEXT NOT NULL,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS data_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      engine TEXT NOT NULL,
      host TEXT,
      port TEXT,
      database TEXT,
      username TEXT,
      password TEXT,
      use_ssl INTEGER DEFAULT 0,
      use_ssh_tunnel INTEGER DEFAULT 0,
      ssh_host TEXT,
      ssh_user TEXT,
      max_connections INTEGER DEFAULT 5,
      timeout INTEGER DEFAULT 30,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS dataset_metadata (
      id TEXT PRIMARY KEY,
      name TEXT,
      table_name TEXT,
      sql TEXT,
      columns TEXT,
      metrics TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Ensure sample data tables exist
    CREATE TABLE IF NOT EXISTS sales_data (region TEXT, sales NUMBER);
    CREATE TABLE IF NOT EXISTS users (created_at TEXT, id NUMBER);
    CREATE TABLE IF NOT EXISTS finance (category TEXT, amount NUMBER);
  `);

  // Seed default roles if empty
  try {
    const rolesCount = dbInstance.exec("SELECT COUNT(*) FROM roles")[0].values[0][0] as number;
    if (rolesCount === 0) {
      const adminId = crypto.randomUUID();
      const editorId = crypto.randomUUID();
      const viewerId = crypto.randomUUID();

      dbInstance.run(`
        INSERT INTO roles (id, name, description) VALUES 
        ('${adminId}', 'Admin', 'Accès total à la plateforme Prism'),
        ('${editorId}', 'Editeur', 'Peut créer et modifier des graphiques et dashboards'),
        ('${viewerId}', 'Lecteur', 'Accès en lecture seule aux analyses');

        INSERT INTO permissions (id, role_id, permission_name) VALUES
        ('${crypto.randomUUID()}', '${adminId}', 'ALL'),
        ('${crypto.randomUUID()}', '${editorId}', 'READ'),
        ('${crypto.randomUUID()}', '${editorId}', 'WRITE'),
        ('${crypto.randomUUID()}', '${viewerId}', 'READ');
      `);
    }
  } catch (e) {
    console.error("Failed to seed roles:", e);
  }

  // Check if sample tables are empty and seed them if needed
  const checkSeeded = (tableName: string) => {
    try {
      const res = dbInstance!.exec(`SELECT COUNT(*) FROM "${tableName}"`);
      return res[0].values[0][0] as number > 0;
    } catch (e) {
      return false;
    }
  };

  if (!checkSeeded('sales_data')) {
    dbInstance.run(`INSERT INTO sales_data VALUES ('North', 1200), ('South', 800), ('East', 1500), ('West', 1100)`);
  }
  if (!checkSeeded('users')) {
    dbInstance.run(`INSERT INTO users VALUES ('2026-01-01', 10), ('2026-02-01', 25), ('2026-03-01', 45), ('2026-04-01', 80)`);
  }
  if (!checkSeeded('finance')) {
    dbInstance.run(`INSERT INTO finance VALUES ('Software', 5000), ('Hardware', 3000), ('Services', 2000)`);
  }

  if (!savedData) {
    // Seed sample charts and dashboards only on first run
    dbInstance.run(`
      INSERT OR IGNORE INTO charts (id, name, table_name, chart_type, x_axis, y_axis, config)
      VALUES 
      ('sample-1', 'Sales by Region', 'sales_data', 'Bar', '["region"]', '["sales"]', '{"showLegend":true}'),
      ('sample-2', 'User Growth', 'users', 'Line', '["created_at"]', '["id"]', '{"showGrid":true}'),
      ('sample-3', 'Revenue Distribution', 'finance', 'Pie', '["category"]', '["amount"]', '{"labelType":"Category Name"}');

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

export const getChart = async (id: string) => {
  const { db } = await initDatabase();
  const res = db.exec(`SELECT * FROM charts WHERE id = '${id}'`);
  if (res.length === 0) return null;
  
  const { columns, values } = res[0];
  const row = values[0];
  const obj: any = {};
  columns.forEach((col, i) => {
    if (['x_axis', 'y_axis', 'config'].includes(col)) {
      obj[col] = JSON.parse(row[i] as string);
    } else {
      obj[col] = row[i];
    }
  });
  return obj;
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

export const deleteDashboard = async (id: string) => {
  const { db } = await initDatabase();
  db.run(`DELETE FROM dashboards WHERE id = '${id}'`);
  
  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
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

export const getRoles = async () => {
  const { db } = await initDatabase();
  const res = db.exec(`
    SELECT r.*, GROUP_CONCAT(p.permission_name) as permissions 
    FROM roles r 
    LEFT JOIN permissions p ON r.id = p.role_id 
    GROUP BY r.id 
    ORDER BY r.name ASC
  `);
  if (res.length === 0) return [];
  
  const { columns, values } = res[0];
  return values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => {
      if (col === 'permissions') {
        obj[col] = row[i] ? (row[i] as string).split(',') : [];
      } else {
        obj[col] = row[i];
      }
    });
    return obj;
  });
};

export const saveRole = async (role: any) => {
  const { db } = await initDatabase();
  const id = role.id || crypto.randomUUID();
  
  db.run("INSERT OR REPLACE INTO roles (id, name, description) VALUES (?, ?, ?)", [
    id,
    role.name,
    role.description
  ]);

  // Handle permissions
  db.run("DELETE FROM permissions WHERE role_id = ?", [id]);
  if (role.permissions && role.permissions.length > 0) {
    role.permissions.forEach((p: string) => {
      db.run("INSERT INTO permissions (id, role_id, permission_name) VALUES (?, ?, ?)", [
        crypto.randomUUID(),
        id,
        p
      ]);
    });
  }

  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
};

export const deleteRole = async (id: string) => {
  const { db } = await initDatabase();
  db.run("DELETE FROM roles WHERE id = ?", [id]);
  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
};

export const getDataSources = async () => {
  const { db } = await initDatabase();
  const res = db.exec("SELECT * FROM data_sources ORDER BY created_at DESC");
  if (res.length === 0) return [];
  
  const { columns, values } = res[0];
  return values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => {
      // Map snake_case to camelCase for the frontend
      const key = col.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (['useSsl', 'useSshTunnel'].includes(key)) {
        obj[key] = row[i] === 1;
      } else {
        obj[key] = row[i];
      }
    });
    return obj;
  });
};

export const saveDataSource = async (ds: any) => {
  const { db } = await initDatabase();
  const id = ds.id || crypto.randomUUID();
  
  db.run(`
    INSERT OR REPLACE INTO data_sources (
      id, name, engine, host, port, database, username, password, 
      use_ssl, use_ssh_tunnel, ssh_host, ssh_user, max_connections, timeout
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    id,
    ds.name,
    ds.engine,
    ds.host,
    ds.port,
    ds.database,
    ds.username,
    ds.password,
    ds.useSsl ? 1 : 0,
    ds.useSshTunnel ? 1 : 0,
    ds.sshHost || null,
    ds.sshUser || null,
    ds.maxConnections || 5,
    ds.timeout || 30
  ]);

  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
  return id;
};

export const deleteDataSource = async (id: string) => {
  const { db } = await initDatabase();
  db.run("DELETE FROM data_sources WHERE id = ?", [id]);
  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
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

export const getDataset = async (id: string) => {
  const { db } = await initDatabase();
  const res = db.exec(`SELECT * FROM dataset_metadata WHERE id = '${id}' OR table_name = '${id}'`);
  
  let metadata: any = null;
  if (res.length > 0) {
    const { columns, values } = res[0];
    const row = values[0];
    metadata = {};
    columns.forEach((col, i) => {
      if (['columns', 'metrics'].includes(col)) {
        metadata[col] = JSON.parse(row[i] as string);
      } else {
        metadata[col] = row[i];
      }
    });
  }

  const tableName = metadata?.table_name || id;
  const schema = await getTableSchema(tableName);
  
  if (schema.length === 0 && !metadata) return null;

  return {
    id: metadata?.id || tableName,
    table_name: tableName,
    name: metadata?.name || tableName,
    kind: metadata?.sql ? 'virtual' : 'physical',
    sql: metadata?.sql || `SELECT * FROM "${tableName}"`,
    database: {
      id: 1,
      database_name: 'Local SQLite'
    },
    columns: metadata?.columns || schema.map(c => ({
      name: c.name,
      type: c.type,
      displayName: c.name
    })),
    metrics: metadata?.metrics || [
      { name: 'count', expression: 'COUNT(*)', displayName: 'Total Count' }
    ]
  };
};

export const saveDatasetMetadata = async (ds: any) => {
  const { db } = await initDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO dataset_metadata (id, name, table_name, sql, columns, metrics)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    ds.id || ds.table_name,
    ds.name || ds.table_name,
    ds.table_name,
    ds.sql || '',
    JSON.stringify(ds.columns || []),
    JSON.stringify(ds.metrics || [])
  ]);
  stmt.free();
  
  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
};

export const deleteDataset = async (id: string) => {
  const { db } = await initDatabase();
  db.run(`DELETE FROM dataset_metadata WHERE id = '${id}' OR table_name = '${id}'`);
  const binaryData = db.export();
  await saveToIndexedDB(binaryData);
};
