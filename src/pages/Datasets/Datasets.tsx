import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Table as TableIcon, 
  Activity, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Info,
  Edit2,
  Plus,
  Trash2,
  Calculator,
  Braces,
  Settings2
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { AIInsight } from '../../components/dashboard/AIInsight';
import { useParams, useNavigate } from 'react-router-dom';
import { supersetService } from '../../lib/superset-service';
import { Modal } from '../../components/ui/Modal';
import { FormSection, FormInput, FormTextarea, FormActions, FormButton } from '../../components/ui/FormElements';
import { toast } from 'sonner';
import { cn } from '../../core/utils/utils';
import { Dataset, DatasetColumn, DatasetMetric } from '../../core/types';

const HealthMetric = ({ label, value, score, icon: Icon }: any) => (
  <div className="glass-panel p-5 flex items-center gap-4">
    <div className={cn(
      "p-3 rounded-xl",
      score > 90 ? "bg-emerald-500/10 text-emerald-500" : score > 70 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
    )}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-xl font-bold text-foreground">{value}</h4>
        <span className={cn(
          "text-xs font-bold",
          score > 90 ? "text-emerald-500" : score > 70 ? "text-amber-500" : "text-rose-500"
        )}>{score}%</span>
      </div>
    </div>
  </div>
);

import { DataTable } from '../../components/ui/DataTable';

export const Datasets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('columns');
  const [dataset, setDataset] = React.useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Edit State
  const [editingColumn, setEditingColumn] = React.useState<DatasetColumn | null>(null);
  const [editingMetric, setEditingMetric] = React.useState<DatasetMetric | null>(null);
  const [isCalculatedColumn, setIsCalculatedColumn] = React.useState(false);
  const [sampleData, setSampleData] = React.useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (id) loadDataset();
  }, [id]);

  const loadDataset = async () => {
    setIsLoading(true);
    try {
      const ds = await supersetService.getDataset(id!);
      setDataset(ds);
    } catch (err) {
      toast.error("Impossible de charger le dataset.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const loadingToast = toast.loading("Suppression du dataset...");
    try {
      await supersetService.deleteDataset(id);
      toast.success("Dataset supprimé avec succès.", { id: loadingToast });
      navigate('/datasets');
    } catch (err) {
      toast.error("Erreur lors de la suppression du dataset.", { id: loadingToast });
      console.error('Delete error:', err);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleUpdateColumn = (updatedCol: DatasetColumn) => {
    if (!dataset) return;
    let newCols = [...dataset.columns];
    if (editingColumn && !isCalculatedColumn) {
        newCols = newCols.map(c => c.name === editingColumn.name ? updatedCol : c);
    } else {
        newCols.push({ ...updatedCol, isCalculated: true });
    }
    setDataset({ ...dataset, columns: newCols });
    setEditingColumn(null);
    setIsCalculatedColumn(false);
    toast.success("Configuration sauvegardée.");
  };

  const handleSaveMetric = (metric: DatasetMetric) => {
    if (!dataset) return;
    let newMetrics = [...dataset.metrics];
    if (editingMetric) {
        newMetrics = newMetrics.map(m => m.name === editingMetric.name ? metric : m);
    } else {
        newMetrics.push(metric);
    }
    setDataset({ ...dataset, metrics: newMetrics });
    setEditingMetric(null);
    toast.success("Métrique mise à jour.");
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
    );
  }

  if (!dataset) {
    return <div className="p-20 text-center text-muted-foreground">Dataset introuvable.</div>;
  }

  return (
    <div className="min-h-full flex flex-col bg-muted/10">
      {/* Sub-header / Toolbar */}
      <div className="bg-background border-b border-border px-8 py-5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/datasets')}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
                <Badge variant={dataset.kind === 'physical' ? 'success' : 'info'} className="text-[7px] px-1 font-black uppercase tracking-widest">{dataset.kind}</Badge>
                <h2 className="text-xl font-bold text-foreground truncate max-w-[300px]">{dataset.name}</h2>
            </div>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{dataset.database?.database_name || 'Local'} • {dataset.table_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-muted p-1 rounded-xl">
             {['columns', 'metrics', 'sql', 'settings'].map(tab => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                 >
                    {tab === 'columns' ? 'Colonnes' : tab === 'metrics' ? 'Métriques' : tab === 'sql' ? 'Source SQL' : 'Paramètres'}
                 </button>
             ))}
          </div>
          <div className="h-6 w-px bg-border mx-2"></div>
          <button 
            onClick={() => navigate('/chart-editor?dataset=' + dataset.name)}
            className="btn-primary px-6 py-2 shadow-lg shadow-accent/20 flex items-center gap-2"
          >
            Explorer <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
                {activeTab === 'columns' && (
                    <motion.div 
                        key="columns"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                        <div className="lg:col-span-8 space-y-6">
                            <div className="prism-card overflow-hidden">
                                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Catalogue des colonnes</h3>
                                    <button 
                                        onClick={() => { setEditingColumn({ name: '', type: 'FLOAT' }); setIsCalculatedColumn(true); }}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent/80 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Ajouter une colonne calculée
                                    </button>
                                </div>
                                <DataTable 
                                    data={dataset.columns}
                                    columns={[
                                        {
                                            key: 'name',
                                            label: 'Colonne',
                                            render: (val, row) => (
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0",
                                                        row.isCalculated ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        {row.isCalculated ? <Calculator className="w-4.5 h-4.5" /> : row.type?.substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm text-foreground">{row.displayName || val}</span>
                                                            {row.displayName && <span className="text-[9px] font-mono text-muted-foreground">({val})</span>}
                                                            {row.isCalculated && <Badge variant="info" className="text-[7px] px-1 font-black uppercase tracking-widest">SQL</Badge>}
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground line-clamp-1">{row.description || 'Aucune description définie'}</p>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'type',
                                            label: 'Type',
                                            render: (val) => <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{val}</span>
                                        },
                                        {
                                            key: 'actions',
                                            label: 'Actions',
                                            render: (_, row) => (
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => { setEditingColumn(row); setIsCalculatedColumn(!!row.isCalculated); }}
                                                        className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {row.isCalculated && (
                                                        <button className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        }
                                    ]}
                                    onRowClick={(row) => { setEditingColumn(row); setIsCalculatedColumn(!!row.isCalculated); }}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-4 sticky top-28">
                            <AnimatePresence mode="wait">
                                {editingColumn ? (
                                    <motion.div 
                                        key="col-edit"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="prism-card p-6 space-y-6 border-accent/30"
                                    >
                                        <div className="flex items-center justify-between border-b border-border pb-4 -mx-2 px-2">
                                            <h3 className="font-bold text-foreground">Edition: {isCalculatedColumn ? 'Nouvelle Colonne' : editingColumn.name}</h3>
                                            <button onClick={() => setEditingColumn(null)} className="p-1 hover:bg-muted rounded-md"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <FormSection label="Nom Système">
                                                <FormInput 
                                                    value={editingColumn.name} 
                                                    disabled={!isCalculatedColumn} 
                                                    onChange={(e) => setEditingColumn({...editingColumn, name: e.target.value})}
                                                    className="font-mono text-xs" 
                                                />
                                            </FormSection>
                                            <FormSection label="Nom d'Affichage">
                                                <FormInput 
                                                    value={editingColumn.displayName || ''} 
                                                    placeholder="Prénom"
                                                    onChange={(e) => setEditingColumn({...editingColumn, displayName: e.target.value})}
                                                />
                                            </FormSection>
                                            <FormSection label="Description">
                                                <FormTextarea 
                                                    value={editingColumn.description || ''} 
                                                    placeholder="Information sur..."
                                                    onChange={(e) => setEditingColumn({...editingColumn, description: e.target.value})}
                                                    className="min-h-[80px]"
                                                />
                                            </FormSection>
                                            {isCalculatedColumn && (
                                                <FormSection label="Expression SQL">
                                                    <FormTextarea 
                                                        value={editingColumn.expression || ''}
                                                        placeholder="Ex: price * (1 - tax)"
                                                        onChange={(e) => setEditingColumn({...editingColumn, expression: e.target.value})}
                                                        className="font-mono text-xs min-h-[120px] bg-muted/30"
                                                    />
                                                </FormSection>
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-4 border-t border-border">
                                            <FormButton variant="secondary" className="flex-1" onClick={() => setEditingColumn(null)}>Annuler</FormButton>
                                            <FormButton className="flex-1" onClick={() => handleUpdateColumn(editingColumn)}>Appliquer</FormButton>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="col-empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="prism-card p-10 text-center space-y-4 border-dashed"
                                    >
                                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto opacity-40">
                                            <Settings2 className="w-8 h-8" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Sélectionnez une colonne pour configurer son catalogue ou ses métadonnées.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'metrics' && (
                    <motion.div 
                        key="metrics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                         <div className="lg:col-span-8 space-y-6">
                            <div className="prism-card overflow-hidden">
                                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Métriques agrégées</h3>
                                    <button 
                                        onClick={() => setEditingMetric({ name: '', expression: 'SUM(1)' })}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent/80 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nouvelle Métrique
                                    </button>
                                </div>
                                <div className="p-0">
                                    {dataset.metrics.length > 0 ? (
                                        <DataTable 
                                            data={dataset.metrics}
                                            columns={[
                                                {
                                                    key: 'name',
                                                    label: 'Métrique',
                                                    render: (val, row) => (
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                                                                <Braces className="w-4.5 h-4.5" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-foreground text-sm leading-none">{row.displayName || val}</h5>
                                                                {row.displayName && <p className="text-[10px] font-mono text-muted-foreground mt-1 opacity-60">{val}</p>}
                                                            </div>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    key: 'expression',
                                                    label: 'Expression SQL',
                                                    render: (val) => (
                                                        <code className="text-[10px] font-mono text-accent block p-2 bg-muted/30 border border-border/50 rounded-lg max-w-[300px] truncate">
                                                            {val}
                                                        </code>
                                                    )
                                                },
                                                {
                                                    key: 'actions',
                                                    label: 'Actions',
                                                    render: (_, row) => (
                                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <button 
                                                                onClick={() => setEditingMetric(row)} 
                                                                className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-accent transition-all"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button className="p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-lg transition-all">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )
                                                }
                                            ]}
                                            onRowClick={setEditingMetric}
                                        />
                                    ) : (
                                        <div className="py-20 text-center space-y-4">
                                             <Braces className="w-12 h-12 text-muted/30 mx-auto" />
                                             <p className="text-muted-foreground text-sm italic">Aucune métrique personnalisée pour ce dataset.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>

                         <div className="lg:col-span-4">
                            <AnimatePresence mode="wait">
                                {editingMetric ? (
                                    <motion.div 
                                        key="metric-edit"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="prism-card p-6 space-y-6"
                                    >
                                        <h3 className="font-bold text-foreground">Config Métrique</h3>
                                        <div className="space-y-4">
                                            <FormSection label="Nom Système">
                                                <FormInput 
                                                    value={editingMetric.name}
                                                    onChange={(e) => setEditingMetric({...editingMetric, name: e.target.value})}
                                                    className="font-mono text-xs"
                                                />
                                            </FormSection>
                                            <FormSection label="Label Public">
                                                <FormInput 
                                                    value={editingMetric.displayName || ''}
                                                    placeholder="Chiffre d'Affaires"
                                                    onChange={(e) => setEditingMetric({...editingMetric, displayName: e.target.value})}
                                                />
                                            </FormSection>
                                            <FormSection label="Expression SQL">
                                                <div className="p-3 bg-muted/50 rounded-xl space-y-2 mb-2">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase">Guide</p>
                                                    <p className="text-[9px] text-muted-foreground italic">Utilisez des fonctions d'agrégation : SUM, AVG, COUNT, MAX...</p>
                                                </div>
                                                <FormTextarea 
                                                    value={editingMetric.expression}
                                                    onChange={(e) => setEditingMetric({...editingMetric, expression: e.target.value})}
                                                    className="font-mono text-xs min-h-[120px]"
                                                />
                                            </FormSection>
                                        </div>
                                        <div className="flex gap-3 pt-4 border-t border-border">
                                            <FormButton variant="secondary" className="flex-1" onClick={() => setEditingMetric(null)}>Annuler</FormButton>
                                            <FormButton className="flex-1" onClick={() => handleSaveMetric(editingMetric)}>Enregistrer</FormButton>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <AIInsight 
                                        title="Besoin d'aide ?"
                                        insight="Les métriques vous permettent de définir des calculs complexes une seule fois. Par exemple, créez un 'Taux de Conversion' en divisant les ventes par le nombre de clics."
                                    />
                                )}
                            </AnimatePresence>
                         </div>
                    </motion.div>
                )}

                {activeTab === 'sql' && (
                    <motion.div 
                        key="sql"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="prism-card">
                            <div className="p-4 border-b border-border flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Source SQL Definition</h3>
                                <button 
                                    onClick={() => navigate('/sql-lab?mode=edit&dataset=' + dataset.id)}
                                    className="p-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all"
                                >
                                    Modifier dans SQL Lab
                                </button>
                            </div>
                            <div className="p-8 bg-muted/10">
                                <pre className="font-mono text-sm text-foreground bg-background p-6 rounded-2xl border border-border overflow-auto max-h-[500px]">
                                    {dataset.sql || `SELECT * FROM "${dataset.table_name}";`}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div 
                        key="settings"
                        className="max-w-2xl mx-auto space-y-8"
                    >
                        <div className="prism-card p-10 space-y-8">
                            <h3 className="text-2xl font-bold tracking-tight">Paramètres Généraux</h3>
                            <div className="space-y-6">
                                <FormSection label="Nom du Dataset">
                                    <FormInput value={dataset.name} onChange={(e) => setDataset({...dataset, name: e.target.value})} className="text-lg font-bold" />
                                </FormSection>
                                <FormSection label="Table d'origine">
                                    <FormInput value={dataset.table_name} disabled className="bg-muted" />
                                </FormSection>
                                <FormSection label="Propriétaire">
                                    <FormInput value={dataset.owner || 'Admin'} />
                                </FormSection>
                            </div>
                            <div className="pt-8 border-t border-rose-500/10 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-rose-500">Zone de danger</h4>
                                    <p className="text-xs text-muted-foreground">La suppression du dataset est irréversible et affectera tous les charts liés.</p>
                                </div>
                                <button 
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="px-6 py-2 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all rounded-xl"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </main>

      {/* Confirmation Modal de Suppression */}
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
              <p className="text-xs text-rose-500/70">La suppression du dataset "{dataset.name}" supprimera également tous les graphiques qui en dépendent.</p>
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

