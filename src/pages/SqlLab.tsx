import React from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Terminal, 
  Play, 
  Save, 
  Download, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Table as TableIcon, 
  Columns, 
  Key, 
  Clock, 
  X,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { executeQuery, getTables, getTableSchema, saveQuery, getSavedQueries } from '../lib/db';
import { supersetService } from '../services/supersetService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SchemaItem = ({ name, type, icon: Icon, onClick }: any) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer group transition-colors"
  >
    <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
    <span className="text-xs text-muted-foreground group-hover:text-foreground font-medium truncate flex-1">{name}</span>
    <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">{type}</span>
  </div>
);

const SchemaFolder = ({ title, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors group"
      >
        <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex-1 text-left">{title}</span>
      </button>
      {isOpen && <div className="pl-4 space-y-0.5">{children}</div>}
    </div>
  );
};

export const SqlLab = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [saveType, setSaveType] = React.useState<'query' | 'dataset'>('query');
  const [queryInfo, setQueryInfo] = React.useState({ name: '', description: '' });
  const [activeTab, setActiveTab] = React.useState<'results' | 'history'>('results');
  const [history, setHistory] = React.useState<any[]>([]);
  const [sql, setSql] = React.useState("SELECT * FROM sqlite_master;");
  const [results, setResults] = React.useState<any[]>([]);
  const [tables, setTables] = React.useState<string[]>([]);
  const [savedQueries, setSavedQueries] = React.useState<any[]>([]);
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  const [schema, setSchema] = React.useState<any[]>([]);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [executionTime, setExecutionTime] = React.useState<number | null>(null);
  const [activeQueryId, setActiveQueryId] = React.useState<string | null>(null);
  const [databases, setDatabases] = React.useState<any[]>([]);
  const [selectedDatabase, setSelectedDatabase] = React.useState<any>({ id: 'local', database_name: 'Local_SQLite' });
  const [isDbSelectorOpen, setIsDbSelectorOpen] = React.useState(false);

  React.useEffect(() => {
    loadSchema();
    loadSavedQueries();
    loadHistory();
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    try {
      const { result } = await supersetService.getDatabases();
      setDatabases([{ id: 'local', database_name: 'Local_SQLite' }, ...(result || [])]);
    } catch (err) {
      console.error('Failed to load Superset databases:', err);
      setDatabases([{ id: 'local', database_name: 'Local_SQLite' }]);
    }
  };

  const loadSchema = async () => {
    if (selectedDatabase.id === 'local') {
      try {
        const t = await getTables();
        setTables(t);
      } catch (err) {
        console.error('Failed to load tables:', err);
      }
    } else {
      // For Superset, we'd ideally fetch tables for the selected DB
      // For now, we'll keep it simple or show a message
      setTables([]);
    }
  };

  const loadSavedQueries = async () => {
    try {
      const q = await getSavedQueries();
      setSavedQueries(q);
    } catch (err) {
      console.error('Failed to load saved queries:', err);
    }
  };

  const handleTableClick = async (tableName: string) => {
    setSelectedTable(tableName);
    const s = await getTableSchema(tableName);
    setSchema(s);
    setSql(`SELECT * FROM "${tableName}" LIMIT 100;`);
    setActiveQueryId(null);
  };

  const handleQueryClick = (query: any) => {
    setSql(query.sql);
    setQueryInfo({ name: query.name, description: query.description });
    setActiveQueryId(query.id);
  };

  const loadHistory = () => {
    const h = localStorage.getItem('prism_sql_history');
    if (h) setHistory(JSON.parse(h));
  };

  const addToHistory = (query: string, time: number, success: boolean) => {
    const newEntry = { id: crypto.randomUUID(), sql: query, time, success, timestamp: new Date().toISOString() };
    const newHistory = [newEntry, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('prism_sql_history', JSON.stringify(newHistory));
  };

  const handleRun = async () => {
    setIsExecuting(true);
    setError(null);
    const start = performance.now();
    try {
      let res;
      if (selectedDatabase.id === 'local') {
        res = await executeQuery(sql);
      } else {
        const supersetRes = await supersetService.executeSql(sql, selectedDatabase.id);
        // Superset result structure varies, we need to adapt it
        res = supersetRes.data || [];
      }
      setResults(res);
      const time = Math.round(performance.now() - start);
      setExecutionTime(time);
      addToHistory(sql, time, true);
      setActiveTab('results');
    } catch (err: any) {
      setError(err.message || 'Failed to execute query');
      setResults([]);
      addToHistory(sql, 0, false);
      setActiveTab('results');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInfo.name) return;

    try {
      const id = activeQueryId || crypto.randomUUID();
      await saveQuery({
        id,
        name: queryInfo.name,
        description: queryInfo.description,
        sql
      });
      setIsModalOpen(false);
      loadSavedQueries();
      setActiveQueryId(id);
    } catch (err) {
      console.error('Failed to save query:', err);
    }
  };

  const columns = results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar: Schema Explorer */}
      <aside className="w-60 border-r border-border flex flex-col">
        <div className="p-6 border-b border-border space-y-6">
          <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Database</label>
            <button 
              onClick={() => setIsDbSelectorOpen(!isDbSelectorOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-muted rounded-md border border-border text-xs font-medium hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{selectedDatabase.database_name}</span>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isDbSelectorOpen && "rotate-180")} />
            </button>

            {isDbSelectorOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                {databases.map(db => (
                  <button
                    key={db.id}
                    onClick={() => {
                      setSelectedDatabase(db);
                      setIsDbSelectorOpen(false);
                      loadSchema();
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2",
                      selectedDatabase.id === db.id ? "text-accent font-bold" : "text-muted-foreground"
                    )}
                  >
                    <Database className="w-3 h-3" />
                    {db.database_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <input 
              type="text" 
              placeholder="Search tables..." 
              className="input-minimal pl-9 py-2 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <SchemaFolder title="Saved Queries" defaultOpen={true}>
            {savedQueries.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic px-3">No saved queries.</p>
            ) : (
              savedQueries.map(q => (
                <SchemaItem 
                  key={q.id} 
                  name={q.name} 
                  type="SQL" 
                  icon={FileText} 
                  onClick={() => handleQueryClick(q)}
                />
              ))
            )}
          </SchemaFolder>

          <SchemaFolder title="Tables" defaultOpen={true}>
            {tables.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic px-3">No tables found.</p>
            ) : (
              tables.map(table => (
                <SchemaItem 
                  key={table} 
                  name={table} 
                  type="Table" 
                  icon={TableIcon} 
                  onClick={() => handleTableClick(table)}
                />
              ))
            )}
          </SchemaFolder>
          
          {selectedTable && (
            <SchemaFolder title={`Columns: ${selectedTable}`} defaultOpen={true}>
              {schema.map(col => (
                <SchemaItem 
                  key={col.name} 
                  name={col.name} 
                  type={col.type} 
                  icon={col.pk ? Key : Columns} 
                />
              ))}
            </SchemaFolder>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Tabs */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-background">
          <div className="flex items-center gap-1 h-full">
            <div className="flex items-center gap-2 px-4 h-full border-b-2 border-accent text-xs font-medium text-foreground">
              <Terminal className="w-3.5 h-3.5" />
              {queryInfo.name || 'Untitled Query'}
              <button 
                onClick={() => {
                  setSql('');
                  setQueryInfo({ name: '', description: '' });
                  setActiveQueryId(null);
                }}
                className="p-0.5 hover:bg-muted rounded transition-colors ml-2"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRun}
              disabled={isExecuting}
              className="flex items-center gap-2 px-8 py-2.5 bg-accent text-accent-foreground rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-xl shadow-accent/10 active:scale-95 disabled:opacity-50"
            >
              <Play className={cn("w-4 h-4", isExecuting && "animate-spin")} />
              {isExecuting ? 'Executing...' : 'Run Intelligence'}
            </button>
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <button 
              onClick={() => { setSaveType('query'); setIsModalOpen(true); }}
              className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              title="Save Query"
            >
              <Save className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setSaveType('dataset'); setIsModalOpen(true); }}
              className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              title="Save as Dataset"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SQL Editor */}
        <div className="h-1/2 bg-muted/30 p-0 font-mono text-sm leading-relaxed overflow-hidden relative group border-b border-border">
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            className="w-full h-full bg-transparent text-foreground p-8 outline-none resize-none"
            spellCheck={false}
          />
          <div className="absolute bottom-4 right-6 flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>{selectedDatabase.id === 'local' ? 'SQLite WASM' : 'Superset Backend'}</span>
            <span>UTF-8</span>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden text-slate-900">
          <div className="h-14 border-b border-border px-8 flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setActiveTab('results')}
                  className={cn(
                    "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all relative py-4",
                    activeTab === 'results' ? "text-prism-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <TableIcon className="w-4 h-4" />
                  Results
                  {activeTab === 'results' && <motion.div layoutId="sqlTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-prism-600" />}
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all relative py-4",
                    activeTab === 'history' ? "text-prism-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  History
                  {activeTab === 'history' && <motion.div layoutId="sqlTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-prism-600" />}
                </button>
              </div>
              {activeTab === 'results' && (
                <div className="flex items-center gap-4">
                  {results.length > 0 && <Badge variant="success">{results.length.toLocaleString()} rows</Badge>}
                  {error && <Badge variant="warning" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Error</Badge>}
                  {executionTime !== null && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium">{executionTime}ms</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === 'results' ? (
              error ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-10 h-10 text-rose-500 mb-4" />
                  <h4 className="font-medium text-sm mb-2">Query Error</h4>
                  <p className="text-xs text-muted-foreground max-w-md font-mono bg-muted p-4 rounded-md border border-border">
                    {error}
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center h-full">
                  <Terminal className="w-10 h-10 text-muted/30 mb-4" />
                  <h4 className="text-sm font-medium text-muted-foreground">No results</h4>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Run a query to see data here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-background shadow-sm z-10">
                    <tr>
                      {columns.map(col => (
                        <th key={col} className="px-8 py-3 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {results.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors group">
                        {columns.map(col => (
                          <td key={col} className="px-8 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                            {String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              <div className="p-4 space-y-2">
                {history.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Clock className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">No query history yet.</p>
                  </div>
                ) : (
                  history.map((entry) => (
                    <div 
                      key={entry.id}
                      onClick={() => setSql(entry.sql)}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-prism-200 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={entry.success ? 'success' : 'error'} className="text-[8px]">{entry.success ? 'SUCCESS' : 'FAILED'}</Badge>
                          <span className="text-[10px] font-mono text-slate-400">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{entry.time}ms</span>
                      </div>
                      <code className="text-xs text-slate-600 line-clamp-1 font-mono group-hover:text-prism-600">{entry.sql}</code>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Query/Dataset Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={saveType === 'query' ? "Save Intelligence Query" : "Publish as Virtual Dataset"}
      >
        <form onSubmit={handleSave} className="space-y-8">
          <div className="flex p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <button 
              type="button"
              onClick={() => setSaveType('query')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                saveType === 'query' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Query
            </button>
            <button 
              type="button"
              onClick={() => setSaveType('dataset')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                saveType === 'dataset' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Dataset
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Identifier</label>
            <input 
              type="text" 
              value={queryInfo.name}
              onChange={(e) => setQueryInfo({ ...queryInfo, name: e.target.value })}
              placeholder={saveType === 'query' ? "e.g. Regional Revenue Q1" : "e.g. V_REGIONAL_SALES"} 
              className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-accent focus:ring-8 focus:ring-accent/5 rounded-2xl text-sm font-bold transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Description</label>
            <textarea 
              value={queryInfo.description}
              onChange={(e) => setQueryInfo({ ...queryInfo, description: e.target.value })}
              placeholder="What strategic value does this provide?" 
              className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-accent focus:ring-8 focus:ring-accent/5 rounded-2xl text-sm font-medium transition-all outline-none min-h-[120px] resize-none"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-accent text-accent-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-accent/10 active:scale-95"
            >
              {saveType === 'query' ? 'Save Query' : 'Publish Dataset'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
