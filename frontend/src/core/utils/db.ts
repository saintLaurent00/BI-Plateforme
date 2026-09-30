import initSqlJs, { Database } from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';

const dbInstances: Record<string, Database> = {};
let SQL: any = null;

const DB_NAME = 'HifadihOfflineDB';
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

async function saveToIndexedDB(data: Uint8Array, key: string = DB_KEY) {
  const idb = await getIndexedDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = idb.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function loadFromIndexedDB(key: string = DB_KEY) {
  const idb = await getIndexedDB();
  return new Promise<Uint8Array | null>((resolve, reject) => {
    const transaction = idb.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export const initDatabase = async (dbId?: string) => {
  const actualDbId = dbId || 'local';
  if (dbInstances[actualDbId]) {
    return { db: dbInstances[actualDbId], SQL };
  }

  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: () => sqlWasm,
    });
  }

  const storeKey = `sqlite_db_${actualDbId}`;
  const savedData = await loadFromIndexedDB(storeKey);
  
  let targetDb: Database;
  if (savedData) {
    targetDb = new SQL.Database(savedData);
  } else {
    targetDb = new SQL.Database();
  }

  dbInstances[actualDbId] = targetDb;

  // Now configure this database instance
  if (actualDbId === 'local') {
    // 1. Ensure system tables exist in local metadata DB
    targetDb.run(`
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
      CREATE TABLE IF NOT EXISTS sales_data (region TEXT, sales NUMBER);
      CREATE TABLE IF NOT EXISTS users (created_at TEXT, id NUMBER);
      CREATE TABLE IF NOT EXISTS finance (category TEXT, amount NUMBER);
    `);

    // Seed default roles if empty in local DB
    try {
      const rolesCount = targetDb.exec("SELECT COUNT(*) FROM roles")[0].values[0][0] as number;
      if (rolesCount === 0) {
        const adminId = crypto.randomUUID();
        const editorId = crypto.randomUUID();
        const viewerId = crypto.randomUUID();

        targetDb.run(`
          INSERT INTO roles (id, name, description) VALUES 
          ('${adminId}', 'Admin', 'Accès total à la plateforme Hifadih BI'),
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

    const checkSeeded = (tableName: string) => {
      try {
        const res = targetDb.exec(`SELECT COUNT(*) FROM "${tableName}"`);
        return res[0].values[0][0] as number > 0;
      } catch (e) {
        return false;
      }
    };

    if (!checkSeeded('sales_data')) {
      targetDb.run(`INSERT INTO sales_data VALUES ('North', 1200), ('South', 800), ('East', 1500), ('West', 1100)`);
    }
    if (!checkSeeded('users')) {
      targetDb.run(`INSERT INTO users VALUES ('2026-01-01', 10), ('2026-02-01', 25), ('2026-03-01', 45), ('2026-04-01', 80)`);
    }
    if (!checkSeeded('finance')) {
      targetDb.run(`INSERT INTO finance VALUES ('Software', 5000), ('Hardware', 3000), ('Services', 2000)`);
    }
  } else {
    // Determine the category profile of this datasource based on its saved name or database config 
    let dbName = '';
    try {
      const { db: localDb } = await initDatabase('local');
      const res = localDb.exec(`SELECT name, database FROM data_sources WHERE id = '${actualDbId}'`);
      if (res.length > 0 && res[0].values.length > 0) {
        const row = res[0].values[0];
        dbName = ((row[0] as string) || (row[1] as string) || '').toLowerCase();
      }
    } catch (err) {
      console.warn("Failed to read datasources config, defaulting seed:", err);
    }

    const checkSeeded = (tableName: string) => {
      try {
        const res = targetDb.exec(`SELECT COUNT(*) FROM "${tableName}"`);
        return res[0].values[0][0] as number > 0;
      } catch (e) {
        return false;
      }
    };

    // Ventes / Sales module
    if (dbName.includes('sale') || dbName.includes('vent') || dbName.includes('commer') || dbName.includes('shop') || dbName.includes('client')) {
      targetDb.run(`
        CREATE TABLE IF NOT EXISTS commandes (id INTEGER PRIMARY KEY, client_id INTEGER, date_commande TEXT, montant_total REAL, statut TEXT);
        CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY, nom TEXT, email TEXT, ville TEXT, pays TEXT);
        CREATE TABLE IF NOT EXISTS produits (id INTEGER PRIMARY KEY, nom_produit TEXT, categorie TEXT, prix_unitaire REAL, stock_disponible INTEGER);
        CREATE TABLE IF NOT EXISTS details_commandes (id INTEGER PRIMARY KEY, commande_id INTEGER, produit_id INTEGER, quantite INTEGER, prix_facture REAL);
        CREATE TABLE IF NOT EXISTS regions_vente (id INTEGER PRIMARY KEY, nom_region TEXT, responsable TEXT, objective_annuel REAL);
      `);

      if (!checkSeeded('commandes')) {
        targetDb.run(`
          INSERT INTO commandes (id, client_id, date_commande, montant_total, statut) VALUES
          (1, 101, '2026-06-01', 150.50, 'En cours'),
          (2, 102, '2026-06-02', 89.99, 'Livrée'),
          (3, 103, '2026-06-03', 420.00, 'Payée'),
          (4, 104, '2026-06-04', 75.00, 'Annulée'),
          (5, 105, '2026-06-05', 110.20, 'Payée')
        `);
      }
      if (!checkSeeded('clients')) {
        targetDb.run(`
          INSERT INTO clients (id, nom, email, ville, pays) VALUES
          (101, 'Société Dupont', 'dupont@exist.fr', 'Paris', 'France'),
          (102, 'Jean Martin', 'j.martin@mail.com', 'Lyon', 'France'),
          (103, 'Marta Gomez', 'marta@gomez.es', 'Madrid', 'Espagne'),
          (104, 'Paul Smith', 'psmith@tech.co.uk', 'Londres', 'Royaume-Uni'),
          (105, 'Alice Müller', 'alice@mueller.de', 'Berlin', 'Allemagne')
        `);
      }
      if (!checkSeeded('produits')) {
        targetDb.run(`
          INSERT INTO produits (id, nom_produit, categorie, prix_unitaire, stock_disponible) VALUES
          (201, 'Licence SaaS Hifadih', 'Logiciel', 1200.00, 999),
          (202, 'Pack Installation & Audit', 'Service', 1500.00, 150),
          (203, 'Module AI Pro Add-on', 'Logiciel', 450.00, 999),
          (204, 'Formation Équipe (1 jour)', 'Service', 800.00, 50),
          (205, 'Support Dédié 24/7 (Annuel)', 'Assistance', 3000.00, 12)
        `);
      }
      if (!checkSeeded('details_commandes')) {
        targetDb.run(`
          INSERT INTO details_commandes (id, commande_id, produit_id, quantite, prix_facture) VALUES
          (1, 1, 201, 1, 1200.00),
          (2, 1, 203, 2, 900.00),
          (3, 2, 204, 1, 800.00),
          (4, 3, 202, 1, 1500.00),
          (5, 3, 205, 1, 3000.00)
        `);
      }
      if (!checkSeeded('regions_vente')) {
        targetDb.run(`
          INSERT INTO regions_vente (id, nom_region, responsable, objective_annuel) VALUES
          (10, 'Île-de-France', 'Sophie Leray', 500000),
          (11, 'Auvergne-Rhône-Alpes', 'Marc Dubois', 350000),
          (12, 'Europe Occidentale', 'Carlos Mendez', 1200000),
          (13, 'Amérique du Nord', 'Johnathan Doe', 2000000)
        `);
      }
    }
    // Finance module
    else if (dbName.includes('fin') || dbName.includes('bank') || dbName.includes('arg') || dbName.includes('pay') || dbName.includes('compte') || dbName.includes('bud')) {
      targetDb.run(`
        CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY, compte_id INTEGER, date_transaction TEXT, description TEXT, montant REAL, type_transaction TEXT);
        CREATE TABLE IF NOT EXISTS budgets (id INTEGER PRIMARY KEY, categorie_id INTEGER, annee INTEGER, mois INTEGER, montant_alloue REAL);
        CREATE TABLE IF NOT EXISTS comptes_bancaires (id INTEGER PRIMARY KEY, libelle TEXT, type_compte TEXT, solde_actuel REAL, devise TEXT);
        CREATE TABLE IF NOT EXISTS categories_depenses (id INTEGER PRIMARY KEY, nom_categorie TEXT, limite_mensuelle REAL);
        CREATE TABLE IF NOT EXISTS flux_tresorerie (id INTEGER PRIMARY KEY, periode TEXT, entrees REAL, sorties REAL);
      `);

      if (!checkSeeded('transactions')) {
        targetDb.run(`
          INSERT INTO transactions (id, compte_id, date_transaction, description, montant, type_transaction) VALUES
          (1, 1, '2026-06-01', 'Licence logicielle Hifadih', 1200.00, 'CREDIT'),
          (2, 1, '2026-06-02', 'Hosting infrastructure AWS', -450.25, 'DEBIT'),
          (3, 2, '2026-06-03', 'Abonnement Marketing Tools', -99.00, 'DEBIT'),
          (4, 1, '2026-06-04', 'Facture Client #40922', 5500.00, 'CREDIT'),
          (5, 3, '2026-06-05', 'Remboursement Taxes', 185.00, 'CREDIT')
        `);
      }
      if (!checkSeeded('comptes_bancaires')) {
        targetDb.run(`
          INSERT INTO comptes_bancaires (id, libelle, type_compte, solde_actuel, devise) VALUES
          (1, 'Compte Courant BRED', 'Courant', 24500.50, 'EUR'),
          (2, 'Compte USD Silicon Valley Bank', 'Courant', 120300.00, 'USD'),
          (3, 'Compte Épargne CIC', 'Placement', 75000.00, 'EUR')
        `);
      }
      if (!checkSeeded('flux_tresorerie')) {
        targetDb.run(`
          INSERT INTO flux_tresorerie (id, periode, entrees, sorties) VALUES
          (1, '2026-01', 12000.00, 8500.00),
          (2, '2026-02', 15000.00, 9000.00),
          (3, '2026-03', 18500.00, 11000.00),
          (4, '2026-04', 21000.00, 12500.00)
        `);
      }
    }
    // RH / HR module
    else if (dbName.includes('rh') || dbName.includes('hr') || dbName.includes('emp') || dbName.includes('work') || dbName.includes('staff')) {
      targetDb.run(`
        CREATE TABLE IF NOT EXISTS employes (id INTEGER PRIMARY KEY, nom_complet TEXT, email TEXT, date_embauche TEXT, departement_id INTEGER, statut TEXT);
        CREATE TABLE IF NOT EXISTS departements (id INTEGER PRIMARY KEY, nom_departement TEXT, manager_id INTEGER, budget_annuel REAL);
        CREATE TABLE IF NOT EXISTS salaires (id INTEGER PRIMARY KEY, employe_id INTEGER, salaire_base REAL, primes REAL, date_effet TEXT);
        CREATE TABLE IF NOT EXISTS conges_absences (id INTEGER PRIMARY KEY, employe_id INTEGER, type_conge TEXT, date_debut TEXT, date_fin TEXT, statut_validation TEXT);
        CREATE TABLE IF NOT EXISTS evaluations (id INTEGER PRIMARY KEY, employe_id INTEGER, annee_review INTEGER, note_performance INTEGER, commentaire TEXT);
      `);

      if (!checkSeeded('employes')) {
        targetDb.run(`
          INSERT INTO employes (id, nom_complet, email, date_embauche, departement_id, statut) VALUES
          (1, 'Sophie Leray', 's.leray@hifadih.com', '2023-01-15', 1, 'Actif'),
          (2, 'Marc Dubois', 'm.dubois@hifadih.com', '2024-03-10', 2, 'Actif'),
          (3, 'Carlos Mendez', 'c.mendez@hifadih.com', '2022-06-01', 1, 'Actif'),
          (4, 'Fatou Diop', 'f.diop@hifadih.com', '2025-11-01', 3, 'Actif')
        `);
      }
      if (!checkSeeded('departements')) {
        targetDb.run(`
          INSERT INTO departements (id, nom_departement, manager_id, budget_annuel) VALUES
          (1, 'Ventes', 3, 120000.00),
          (2, 'R&D', 2, 350000.00),
          (3, 'Ressources Humaines', 4, 80000.00)
        `);
      }
    }
    // Default template database
    else {
      targetDb.run(`
        CREATE TABLE IF NOT EXISTS utilisateurs (id INTEGER PRIMARY KEY, pseudo TEXT, email TEXT, role TEXT, derniere_connexion TEXT);
        CREATE TABLE IF NOT EXISTS stocks (id INTEGER PRIMARY KEY, produit_id INTEGER, quantite_stock INTEGER, seuil_alerte INTEGER);
        CREATE TABLE IF NOT EXISTS factures (id INTEGER PRIMARY KEY, client_id INTEGER, numero_facture TEXT, montant_du REAL, date_echeance TEXT, statut_paiement TEXT);
      `);

      if (!checkSeeded('utilisateurs')) {
        targetDb.run(`
          INSERT INTO utilisateurs (id, pseudo, email, role, derniere_connexion) VALUES
          (1, 'admin', 'admin@hifadih.com', 'Administrateur', '2026-06-11 14:22'),
          (2, 'laurent', 'ouattaralaurent69@gmail.com', 'Analyste senior', '2026-06-12 09:30')
        `);
      }
      if (!checkSeeded('stocks')) {
        targetDb.run(`
          INSERT INTO stocks (id, produit_id, quantite_stock, seuil_alerte) VALUES
          (1, 201, 999, 10),
          (2, 202, 150, 5),
          (3, 203, 999, 10)
        `);
      }
      if (!checkSeeded('factures')) {
        targetDb.run(`
          INSERT INTO factures (id, client_id, numero_facture, montant_du, date_echeance, statut_paiement) VALUES
          (1, 101, 'FAC-2026-001', 1200.00, '2026-07-01', 'Payée'),
          (2, 102, 'FAC-2026-002', 800.00, '2026-07-10', 'En attente')
        `);
      }
    }
  }

  // Save the newly initialized/seeded SQLite bin to IndexedDB under its unique key
  if (!savedData) {
    const binaryData = targetDb.export();
    await saveToIndexedDB(binaryData, storeKey);
  }

  return { db: targetDb, SQL };
};

export const saveChart = async (chart: any) => {
  const { db } = await initDatabase('local');
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
  await saveToIndexedDB(binaryData, `sqlite_db_local`);
};

export const getCharts = async () => {
  const { db } = await initDatabase('local');
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
  const { db } = await initDatabase('local');
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
  const { db } = await initDatabase('local');
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
  const { db } = await initDatabase('local');
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
  await saveToIndexedDB(binaryData, `sqlite_db_local`);
};

export const getDashboard = async (id: string) => {
  const { db } = await initDatabase('local');
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
  const { db } = await initDatabase('local');
  db.run(`DELETE FROM dashboards WHERE id = '${id}'`);
  
  const binaryData = db.export();
  await saveToIndexedDB(binaryData, `sqlite_db_local`);
};

export const saveQuery = async (query: any) => {
  const { db } = await initDatabase('local');
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
  await saveToIndexedDB(binaryData, `sqlite_db_local`);
};

export const getSavedQueries = async () => {
  const { db } = await initDatabase('local');
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
  if (!dbInstances['local']) {
    throw new Error('Database not initialized. Call initDatabase("local") first.');
  }
  return { db: dbInstances['local'], SQL };
};

export const getRoles = async () => {
  const { db } = await initDatabase('local');
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
  const { db } = await initDatabase('local');
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
  await saveToIndexedDB(binaryData, `sqlite_db_local`);
};

export const deleteRole = async (id: string) => {
  const { db } = await initDatabase('local');
  db.run("DELETE FROM roles WHERE id = ?", [id]);
  const binaryData = db.export();
  await saveToIndexedDB(binaryData, `sqlite_db_local`);
};

export const getDataSources = async () => {
  const { db } = await initDatabase('local');
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
  const { db } = await initDatabase('local');
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
  await saveToIndexedDB(binaryData, `sqlite_db_local`);
  return id;
};

export const deleteDataSource = async (id: string) => {
  const { db } = await initDatabase('local');
  db.run("DELETE FROM data_sources WHERE id = ?", [id]);
  const binaryData = db.export();
  await saveToIndexedDB(binaryData, `sqlite_db_local`);
};

export const executeQuery = async (sql: string, dbId?: string) => {
  const actualDbId = dbId || 'local';
  const { db } = await initDatabase(actualDbId);
  try {
    const results = db.exec(sql);
    
    // Automatically persist to IndexedDB if it is a mutation query (e.g. INSERT, UPDATE, DELETE, CREATE, DROP)
    const isMutation = !/^\s*SELECT\b/i.test(sql);
    if (isMutation) {
      const binaryData = db.export();
      await saveToIndexedDB(binaryData, `sqlite_db_${actualDbId}`);
    }

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
    console.error('SQL Error on database: ' + actualDbId, error);
    throw error;
  }
};

export const importCSV = async (tableName: string, csvData: any[], dbId?: string) => {
  const actualDbId = dbId || 'local';
  const { db } = await initDatabase(actualDbId);
  
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
  await saveToIndexedDB(binaryData, `sqlite_db_${actualDbId}`);
};

export const getTables = async (dbId?: string) => {
  const actualDbId = dbId || 'local';
  const { db } = await initDatabase(actualDbId);
  const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  if (res.length === 0) return [];
  return res[0].values.map(row => row[0] as string);
};

export const getTableSchema = async (tableName: string, dbId?: string) => {
  const actualDbId = dbId || 'local';
  const { db } = await initDatabase(actualDbId);
  const res = db.exec(`PRAGMA table_info("${tableName}")`);
  if (res.length === 0) return [];
  return res[0].values.map(row => ({
    name: row[1] as string,
    type: row[2] as string,
    notnull: row[3] as number,
    pk: row[5] as number
  }));
};
