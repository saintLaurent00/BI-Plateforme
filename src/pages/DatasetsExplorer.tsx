import React from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Search, 
  Plus, 
  MoreVertical,
  Clock,
  ArrowUpRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { importCSV, getTables } from '../lib/db';

const DatasetCard = ({ name, type, owner, lastModified, health }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel p-8 group hover:border-accent/30 transition-all duration-500"
  >
    <div className="flex items-start justify-between mb-10">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-accent group-hover:text-accent-foreground group-hover:ring-8 group-hover:ring-accent/5 transition-all duration-500">
        <Database className="w-5 h-5" />
      </div>
      <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>

    <div className="space-y-10">
      <div>
        <h4 className="font-bold text-lg text-slate-900 tracking-tight group-hover:text-accent transition-colors">{name}</h4>
        <div className="flex items-center gap-3 mt-3">
          <Badge variant={type === 'Physical' ? 'success' : 'info'} className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">{type}</Badge>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{owner}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10 py-8 border-y border-slate-50">
        <div className="space-y-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Health</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: `${health}%` }}></div>
            </div>
            <span className="text-[10px] font-black text-slate-900">{health}%</span>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Sync</p>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{lastModified}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Operational
        </div>
        <Link 
          to={`/datasets/${name}`}
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-accent transition-all group/link"
        >
          Explore Source
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  </motion.div>
);

export const DatasetsExplorer = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<'idle' | 'parsing' | 'importing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [localTables, setLocalTables] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const tables = await getTables();
      setLocalTables(tables);
    } catch (err) {
      console.error('Failed to load tables:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('parsing');
    const tableName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setImportStatus('importing');
        try {
          await importCSV(tableName, results.data);
          setImportStatus('success');
          loadTables();
          setTimeout(() => {
            setIsModalOpen(false);
            setImportStatus('idle');
          }, 2000);
        } catch (err: any) {
          setImportStatus('error');
          setErrorMessage(err.message || 'Failed to import data');
        }
      },
      error: (err) => {
        setImportStatus('error');
        setErrorMessage(err.message);
      }
    });
  };

  const datasets = [
    ...localTables.map(table => ({
      name: table,
      type: "Physical",
      owner: "Local User",
      status: "Healthy",
      lastModified: "Just now",
      health: 100
    })),
    { name: "Sales_Data_v2", type: "Physical", owner: "Sarah Chen", status: "Healthy", lastModified: "2h ago", health: 98 },
    { name: "User_Profiles", type: "Virtual", owner: "Mike Ross", status: "Healthy", lastModified: "5h ago", health: 100 },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Datasets</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your local data sources.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="input-minimal pl-10"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Import CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((ds, i) => (
          <DatasetCard key={i} {...ds} />
        ))}
      </div>

      {/* Import Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Import Dataset"
      >
        <div className="space-y-6">
          <div className="p-12 border border-dashed border-border rounded-lg bg-muted/30 flex flex-col items-center justify-center text-center group hover:border-accent/40 hover:bg-muted/50 transition-all relative">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={importStatus !== 'idle' && importStatus !== 'success' && importStatus !== 'error'}
            />
            <div className="w-12 h-12 bg-background rounded-md border border-border shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              {importStatus === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : importStatus === 'error' ? (
                <AlertCircle className="w-6 h-6 text-rose-500" />
              ) : (
                <Upload className="w-6 h-6 text-foreground" />
              )}
            </div>
            <h4 className="text-sm font-medium mb-1">
              {importStatus === 'parsing' ? 'Parsing CSV...' : 
               importStatus === 'importing' ? 'Importing...' :
               importStatus === 'success' ? 'Success!' :
               importStatus === 'error' ? 'Failed' :
               'Upload CSV'}
            </h4>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
              {importStatus === 'error' ? errorMessage : 'Your data will be stored locally and work 100% offline.'}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-md flex gap-3">
            <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <strong>Privacy:</strong> Your data never leaves your computer. It is processed entirely in the browser using SQLite WASM.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
