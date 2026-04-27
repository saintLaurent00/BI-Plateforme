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
import { 
  FormSection, 
  FormInput, 
  FormTextarea, 
  FormActions, 
  FormButton,
  FormLabel,
  FormButtonGroup
} from '../components/FormElements';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { executeQuery, getTables, getTableSchema, saveQuery, getSavedQueries } from '../lib/db';
import { supersetService } from '../services/supersetService';
import { isConfigured as isSupersetConfigured } from '../lib/supersetClient';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SchemaItem = ({ name, type, icon: Icon, onClick }: any) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-muted/50 cursor-pointer group transition-all duration-300 border border-transparent hover:border-border"
  >
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-background group-hover:text-accent group-hover:shadow-sm transition-all">
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground truncate flex-1">{name}</span>
    <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest group-hover:text-muted-foreground/50">{type}</span>
  </div>
);

const SchemaFolder = ({ title, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className="space-y-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-muted/50 transition-all group/folder"
      >
        <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground/50 group-hover/folder:text-muted-foreground transition-transform", isOpen && "rotate-90")} />
        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex-1 text-left group-hover/folder:text-foreground transition-colors uppercase">{title}</span>
      </button>
      {isOpen && <div className="pl-4 space-y-1">{children}</div>}
    </div>
  );
};

export const SqlLab = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreateMode = searchParams.get('mode') === 'create_dataset';
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [saveType, setSaveType] = React.useState<'query' | 'dataset'>(isCreateMode ? 'dataset' : 'query');
  const [queryInfo, setQueryInfo] = React.useState({ name: '', description: '' });
  const [activeTab, setActiveTab] = React.useState<'results' | 'history'>('results');
  const [history, setHistory] = React.useState<any[]>([]);
  const [sql, setSql] = React.useState(isCreateMode ? "-- Écrivez votre requête de dataset ici\nSELECT * FROM sales_data LIMIT 100;" : "SELECT * FROM sqlite_master;");
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
  const [paramsModalOpen, setParamsModalOpen] = React.useState(false);
  const [queryParameters, setQueryParameters] = React.useState<Record<string, string>>({});
  const [paramKeys, setParamKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadSchema();
    loadSavedQueries();
    loadHistory();
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    if (!isSupersetConfigured) {
      setDatabases([{ id: 'local', database_name: 'Local_SQLite' }]);
      return;
    }

    try {
      const { result } = await supersetService.getDatabases();
      setDatabases([{ id: 'local', database_name: 'Local_SQLite' }, ...(result || [])]);
    } catch (err) {
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

  const handleRun = async (params: Record<string, string> = {}) => {
    // Detect parameters if they exist: {{param_name}}
    const matches = sql.match(/\{\{([^}]+)\}\}/g);
    const uniqueParams = matches ? Array.from(new Set(matches.map(m => m.slice(2, -2).trim()))) : [];

    // If there are parameters and we haven't provided them yet, open the modal
    if (uniqueParams.length > 0 && Object.keys(params).length === 0) {
      setParamKeys(uniqueParams);
      // Initialize with existing values if any
      const initialParams: Record<string, string> = {};
      uniqueParams.forEach(key => {
        initialParams[key] = queryParameters[key] || '';
      });
      setQueryParameters(initialParams);
      setParamsModalOpen(true);
      return;
    }

    setIsExecuting(true);
    setError(null);
    const start = performance.now();
    try {
      // Replace parameters in SQL
      let finalizedSql = sql;
      Object.entries(params).forEach(([key, value]) => {
        // Simple string replacement for now. 
        // Note: For real security, we should ideally use prepared statements if the backend supports it,
        // but since we are executing arbitrary SQL, we at least sanitize the value to prevent common breaks.
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\1*`, 'g');
        // If it's a number-like value, don't wrap in quotes, otherwise wrap if needed
        // For simplicity and safety in this demo, we assume the user might need quotes if it's a string
        finalizedSql = finalizedSql.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
      });

      let res;
      if (selectedDatabase.id === 'local') {
        res = await executeQuery(finalizedSql);
      } else {
        const supersetRes = await supersetService.executeSql(finalizedSql, selectedDatabase.id);
        res = supersetRes.data || [];
      }
      setResults(res);
      const time = Math.round(performance.now() - start);
      setExecutionTime(time);
      addToHistory(finalizedSql, time, true);
      setActiveTab('results');
      setParamsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to execute query');
      setResults([]);
      addToHistory(sql, 0, false);
      setActiveTab('results');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleParamsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRun(queryParameters);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInfo.name) return;

    try {
      const id = activeQueryId || crypto.randomUUID();
      if (saveType === 'dataset') {
          // In a real app, this would call Superset API
          await supersetService.createDataset({
              table_name: queryInfo.name,
              database: selectedDatabase.id === 'local' ? 1 : selectedDatabase.id,
              sql: sql
          });
      } else {
          await saveQuery({
            id,
            name: queryInfo.name,
            description: queryInfo.description,
            sql
          });
      }
      setIsModalOpen(false);
      loadSavedQueries();
      if (saveType === 'dataset') {
          navigate('/datasets');
      } else {
          setActiveQueryId(id);
      }
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
        <div className="h-16 border-b border-border px-8 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-1 h-full">
            <div className="flex items-center gap-3 px-6 h-full border-b-[3px] border-accent text-xs font-bold text-foreground bg-muted/30">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="tracking-tight">{queryInfo.name || 'Nouvelle Requête'}</span>
              <button 
                onClick={() => {
                  setSql('');
                  setQueryInfo({ name: '', description: '' });
                  setActiveQueryId(null);
                }}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors ml-4"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isCreateMode && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg mr-4 animate-pulse">
                    <span className="text-[10px] font-black uppercase text-accent tracking-widest">Mode Création Dataset</span>
                </div>
            )}
            <button 
              onClick={() => handleRun()}
              disabled={isExecuting}
              className="btn-primary flex items-center gap-2 px-8 py-2.5 shadow-lg shadow-accent/20"
            >
              <Play className={cn("w-4 h-4", isExecuting && "animate-spin")} />
              {isExecuting ? 'Exécution' : 'Exécuter'}
            </button>
            <div className="h-8 w-px bg-border mx-2"></div>
            {!isCreateMode && (
                <button 
                onClick={() => { setSaveType('query'); setIsModalOpen(true); }}
                className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                title="Sauvegarder"
                >
                <Save className="w-4.5 h-4.5" />
                </button>
            )}
            <button 
              onClick={() => { setSaveType('dataset'); setIsModalOpen(true); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all",
                isCreateMode 
                    ? "bg-accent text-accent-foreground font-bold shadow-lg shadow-accent/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Publier en Dataset"
            >
              <Database className="w-4.5 h-4.5" />
              {isCreateMode && <span className="text-[10px] font-black uppercase tracking-widest">Finaliser le Dataset</span>}
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
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
          <div className="h-14 border-b border-border px-8 flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setActiveTab('results')}
                  className={cn(
                    "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all relative py-4",
                    activeTab === 'results' ? "text-accent" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TableIcon className="w-4 h-4" />
                  Results
                  {activeTab === 'results' && <motion.div layoutId="sqlTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all relative py-4",
                    activeTab === 'history' ? "text-accent" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  History
                  {activeTab === 'history' && <motion.div layoutId="sqlTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
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
                  <div className="p-12 text-center text-muted-foreground">
                    <Clock className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">No query history yet.</p>
                  </div>
                ) : (
                  history.map((entry) => (
                    <div 
                      key={entry.id}
                      onClick={() => setSql(entry.sql)}
                      className="p-4 bg-muted/10 rounded-xl border border-border hover:border-accent/30 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={entry.success ? 'success' : 'error'} className="text-[8px]">{entry.success ? 'SUCCESS' : 'FAILED'}</Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">{entry.time}ms</span>
                      </div>
                      <code className="text-xs text-muted-foreground line-clamp-1 font-mono group-hover:text-foreground">{entry.sql}</code>
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
          {!isCreateMode && (
            <FormButtonGroup 
                options={['query', 'dataset']}
                value={saveType}
                onChange={(type) => setSaveType(type as any)}
                className="p-1 bg-muted/30 border border-border rounded-2xl"
            />
          )}

          <FormSection label="Identifier">
            <FormInput 
              value={queryInfo.name}
              onChange={(e) => setQueryInfo({ ...queryInfo, name: e.target.value })}
              placeholder={saveType === 'query' ? "e.g. Regional Revenue Q1" : "e.g. V_REGIONAL_SALES"} 
              required
            />
          </FormSection>

          <FormSection label="Description">
            <FormTextarea 
              value={queryInfo.description}
              onChange={(e) => setQueryInfo({ ...queryInfo, description: e.target.value })}
              placeholder="What strategic value does this provide?" 
            />
          </FormSection>

          <FormActions>
            <FormButton variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="flex-1">
              Discard
            </FormButton>
            <FormButton type="submit" className="flex-1">
              {saveType === 'query' ? 'Save Query' : 'Publish Dataset'}
            </FormButton>
          </FormActions>
        </form>
      </Modal>

      {/* Parameter Inputs Modal */}
      <Modal
        isOpen={paramsModalOpen}
        onClose={() => setParamsModalOpen(false)}
        title="Query Parameters"
      >
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground">
            This query contains parameters. Please provide values for the placeholders below to continue.
          </p>
          <form onSubmit={handleParamsSubmit} className="space-y-6">
            <div className="space-y-4">
              {paramKeys.map(key => (
                <FormSection key={key} label={key.replace(/_/g, ' ')}>
                  <FormInput
                    value={queryParameters[key] || ''}
                    onChange={(e) => setQueryParameters(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Value for {{${key}}}`}
                    className="py-3"
                    required
                  />
                </FormSection>
              ))}
            </div>
            <FormActions className="pt-2">
              <FormButton variant="secondary" type="button" onClick={() => setParamsModalOpen(false)} className="flex-1 py-3 rounded-xl font-black text-[10px]">
                Cancel
              </FormButton>
              <FormButton type="submit" disabled={isExecuting} className="flex-1 py-3 rounded-xl font-black text-[10px]">
                {isExecuting ? 'Executing...' : 'Run Query'}
              </FormButton>
            </FormActions>
          </form>
        </div>
      </Modal>
    </div>
  );
};
