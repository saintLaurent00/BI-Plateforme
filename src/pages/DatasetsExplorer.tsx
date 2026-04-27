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
  ShieldCheck,
  Filter,
  Edit3,
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { 
  FormSection, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormActions, 
  FormButton,
  FormLabel
} from '../components/FormElements';
import { Link, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { importCSV, getTables } from '../lib/db';
import { supersetService } from '../services/supersetService';
import { isConfigured as isSupersetConfigured } from '../lib/supersetClient';
import { cn } from '../lib/utils';

const DatasetListItem = ({ name, type, owner, lastModified, health }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="glass-panel p-4 group hover:border-accent/30 transition-all duration-300 flex items-center gap-6"
  >
    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 shrink-0">
      <Database className="w-4 h-4" />
    </div>

    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
      <div className="col-span-1 md:col-span-1">
        <h4 className="font-bold text-sm text-foreground tracking-tight group-hover:text-accent transition-colors truncate">{name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={type === 'Physical' ? 'success' : 'info'} className="px-1.5 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest">{type}</Badge>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            Live
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Owner</p>
        <span className="text-[10px] text-foreground font-bold uppercase tracking-widest">{owner}</span>
      </div>

      <div className="hidden md:block">
        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Last Modified</p>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{lastModified}</span>
        </div>
      </div>

      <div>
        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Health Score</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[100px]">
            <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${health}%` }}></div>
          </div>
          <span className="text-[10px] font-black text-foreground">{health}%</span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3 shrink-0">
      <Link 
        to={`/datasets/${name}`}
        className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-accent hover:text-accent-foreground rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-all group/link"
      >
        Explore
        <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
      </Link>
      <Link 
        to={`/datasets/edit/${name}`}
        className="p-2 text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-all"
      >
        <Edit3 className="w-4 h-4" />
      </Link>
      <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

export const DatasetsExplorer = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<'idle' | 'parsing' | 'importing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [localTables, setLocalTables] = React.useState<string[]>([]);
  const [supersetDatasets, setSupersetDatasets] = React.useState<any[]>([]);
  const [databases, setDatabases] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'All' | 'Physical' | 'Virtual'>('All');
  const [minHealth, setMinHealth] = React.useState(0);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (!isSupersetConfigured) {
        const tables = await getTables();
        setLocalTables(tables);
        setSupersetDatasets([]);
        setDatabases([]);
      } else {
        const [tables, dsResponse, dbResponse] = await Promise.all([
          getTables(),
          supersetService.getDatasets().catch(() => ({ result: [] })),
          supersetService.getDatabases().catch(() => ({ result: [] }))
        ]);
        setLocalTables(tables);
        setSupersetDatasets(dsResponse.result);
        setDatabases(dbResponse.result);
      }
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setIsLoading(false);
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
          loadData();
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

  const filteredDatasets = [
    ...localTables.map(table => ({
      name: table,
      type: "Physical",
      owner: "Local User",
      lastModified: "Just now",
      health: 100
    })),
    ...supersetDatasets.map(ds => ({
      name: ds.table_name || ds.name,
      type: ds.kind === 'physical' ? 'Physical' : 'Virtual',
      owner: ds.owner || 'Superset',
      lastModified: ds.changed_on_delta_humanized || 'Recently',
      health: ds.healthScore || 95
    }))
  ].filter(ds => {
    const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ds.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || ds.type === typeFilter;
    const matchesHealth = ds.health >= minHealth;
    return matchesSearch && matchesType && matchesHealth;
  });

  return (
    <div className="p-6 lg:p-10 space-y-10 bg-muted/20 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Datasets</h2>
          <p className="text-muted-foreground text-sm font-light">Structurez vos sources de données physiques et virtuelles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-5 py-2 bg-background border border-border rounded-xl text-xs focus:ring-4 ring-accent/5 focus:border-accent w-64 transition-all shadow-sm"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "px-5 py-2 bg-background border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:border-accent/30 transition-all",
                (typeFilter !== 'All' || minHealth > 0) && "border-accent text-accent"
              )}
            >
              <Filter className="w-4 h-4 text-muted-foreground/40" />
              Filtres
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-background border border-border rounded-xl shadow-2xl p-6 z-50 space-y-6">
                <FormSection label="Dataset Type">
                  <div className="grid grid-cols-3 gap-2">
                    {['All', 'Physical', 'Virtual'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t as any)}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                          typeFilter === t 
                            ? "bg-accent text-accent-foreground border-accent" 
                            : "bg-muted/50 border-transparent hover:bg-muted"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </FormSection>

                <FormSection>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="p-0 mb-0">Min Health Score</FormLabel>
                    <span className="text-[10px] font-bold text-accent">{minHealth}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    value={minHealth}
                    onChange={(e) => setMinHealth(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-accent"
                  />
                </FormSection>

                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <button 
                    onClick={() => {
                      setTypeFilter('All');
                      setMinHealth(0);
                    }}
                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest px-2 py-1"
                  >
                    Reset
                  </button>
                  <FormButton 
                    onClick={() => setIsFilterOpen(false)}
                    className="px-6 py-2 rounded-xl"
                  >
                    Apply
                  </FormButton>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-background border border-border rounded-2xl text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:border-accent/30 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-muted-foreground/60" />
            Importer CSV
          </button>

          <button 
            onClick={() => navigate('/datasets/new')}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-accent/20"
          >
            <Plus className="w-4 h-4" />
            Nouveau
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />
          ))
        ) : filteredDatasets.length > 0 ? (
          filteredDatasets.map((ds, i) => (
            <DatasetListItem key={i} {...ds} />
          ))
        ) : (
          <div className="py-24 text-center border border-dashed border-border rounded-2xl">
            <Database className="w-12 h-12 text-muted/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No datasets found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
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
          </div>

          <div className="bg-muted p-4 rounded-md flex gap-3">
            <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <strong>Info:</strong> Les données sont traitées localement dans votre navigateur.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
