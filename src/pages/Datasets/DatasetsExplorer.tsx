import React from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
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
  Trash2,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  FormSection, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormActions, 
  FormButton,
  FormLabel
} from '../../components/ui/FormElements';
import { Link, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { importCSV, getTables, deleteDataset } from '../../core/utils/db';
import { cn } from '../../core/utils/utils';

const DatasetListItem = ({ id, name, type, owner, lastModified, health, onDelete }: any) => (
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
        to={`/datasets/${id || name}`}
        className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-accent hover:text-accent-foreground rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-all group/link"
      >
        Explore
        <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
      </Link>
      <Link 
        to={`/datasets/edit/${id || name}`}
        className="p-2 text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-all"
      >
        <Edit3 className="w-4 h-4" />
      </Link>
      <button 
        onClick={() => onDelete({ id, name })}
        className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

import { DataTable } from '../../components/ui/DataTable';

export const DatasetsExplorer = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<'idle' | 'parsing' | 'importing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [localTables, setLocalTables] = React.useState<string[]>([]);
  const [metadataDatasets, setMetadataDatasets] = React.useState<any[]>([]);
  const [databases, setDatabases] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [datasetToDelete, setDatasetToDelete] = React.useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  
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
      const { initDatabase } = await import('../../core/utils/db');
      const { db } = await initDatabase();
      const tables = await getTables();
      setLocalTables(tables);
      
      const res = db.exec("SELECT * FROM dataset_metadata ORDER BY created_at DESC");
      if (res.length > 0) {
        const { columns, values } = res[0];
        const datasets = values.map(row => {
          const obj: any = {};
          columns.forEach((col, i) => obj[col] = row[i]);
          return obj;
        });
        setMetadataDatasets(datasets);
      } else {
        setMetadataDatasets([]);
      }
      
      setDatabases([{ id: 1, database_name: 'Local SQLite' }]);
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
    ...localTables
      .filter(table => !metadataDatasets.some(meta => meta.table_name === table))
      .map(table => ({
        name: table,
        id: table,
        type: "Physical",
        owner: "Local User",
        lastModified: "À l'instant",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        health: 100
      })),
    ...metadataDatasets.map(ds => ({
      name: ds.name || ds.table_name,
      id: ds.id || ds.table_name,
      type: ds.sql ? 'Virtual' : 'Physical',
      owner: 'Admin',
      created_at: ds.created_at,
      updated_at: ds.created_at,
      lastModified: 'Récemment',
      health: 95
    }))
  ].filter(ds => {
    const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ds.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || ds.type === typeFilter;
    const matchesHealth = ds.health >= minHealth;
    return matchesSearch && matchesType && matchesHealth;
  });

  const handleDelete = async () => {
    if (!datasetToDelete) return;
    
    const loadingToast = toast.loading("Suppression du dataset...");
    try {
      await deleteDataset(datasetToDelete.id || datasetToDelete.name);
      toast.success("Dataset supprimé avec succès.", { id: loadingToast });
      loadData();
    } catch (err) {
      toast.error("Erreur lors de la suppression.", { id: loadingToast });
      console.error('Delete error:', err);
    }
    
    setIsDeleteModalOpen(false);
    setDatasetToDelete(null);
  };

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
          <DataTable 
            showSearch={false}
            data={filteredDatasets}
            columns={[
              {
                key: 'name',
                label: 'Nom',
                render: (val, row) => (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 shrink-0 uppercase text-[10px] font-black">
                      {row.type?.substring(0, 3)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground tracking-tight">{val}</p>
                      <Badge variant={row.type === 'Physical' ? 'success' : 'info'} className="px-1.5 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest">{row.type}</Badge>
                    </div>
                  </div>
                )
              },
              { 
                key: 'owner', 
                label: 'Propriétaire',
                render: (val) => (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                      {(val?.[0] || 'U').toUpperCase()}
                    </div>
                    <span className="text-xs">{val}</span>
                  </div>
                )
              },
              {
                key: 'created_at',
                label: 'Créé le',
                render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A'
              },
              { 
                key: 'updated_at', 
                label: 'Modifié le',
                render: (val, row) => (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3 text-muted-foreground/40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{row.lastModified || (val ? new Date(val).toLocaleDateString() : 'N/A')}</span>
                  </div>
                )
              },
              {
                key: 'health',
                label: 'Santé',
                render: (val) => (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
                      <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${val}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black text-foreground">{val}%</span>
                  </div>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (_, row) => (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link 
                      to={`/datasets/edit/${row.id || row.name}`}
                      className="p-2 text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => {
                        setDatasetToDelete(row);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              }
            ]}
            onRowClick={(row) => navigate(`/datasets/${row.id || row.name}`)}
          />
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        maxWidth="md"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-rose-600">Action Irréversible</h4>
              <p className="text-xs text-rose-500/70">La suppression du dataset "{datasetToDelete?.name}" supprimera également tous les graphiques qui en dépendent.</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Êtes-vous sûr de vouloir supprimer ce dataset ? Cette action ne peut pas être annulée.
          </p>

          <div className="flex gap-4 pt-2">
            <FormButton 
              variant="secondary" 
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </FormButton>
            <button 
              onClick={handleDelete}
              className="flex-1 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
