import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Database, 
  Table as TableIcon, 
  Settings2, 
  Plus, 
  ChevronLeft, 
  Save,
  Trash2,
  Edit3,
  Calculator,
  Sigma,
  Search,
  Eye,
  EyeOff,
  MoreHorizontal,
  ChevronDown,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../core/utils/utils';
import { toast } from 'sonner';

interface Column {
  name: string;
  type: string;
  displayName: string;
  description: string;
  isMetric: boolean;
  isCalculated: boolean;
  formula?: string;
  visible: boolean;
}

interface Metric {
  name: string;
  displayName: string;
  expression: string;
  type: string;
}

export const PhysicalDatasetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'columns' | 'metrics' | 'calculated'>('columns');
  
  // Mock data for the dataset
  const [dataset, setDataset] = React.useState({
    name: 'Analyse Ventes Multi-tables',
    datasource: 'Local SQLite',
    tables: ['orders', 'products', 'customers'],
    createdAt: '2024-03-20',
  });

  const [columns, setColumns] = React.useState<Column[]>([
    { name: 'id', type: 'integer', displayName: 'ID Commande', description: 'Identifiant unique', isMetric: false, isCalculated: false, visible: true },
    { name: 'order_date', type: 'datetime', displayName: 'Date de Commande', description: '', isMetric: false, isCalculated: false, visible: true },
    { name: 'status', type: 'string', displayName: 'Statut', description: '', isMetric: false, isCalculated: false, visible: true },
    { name: 'total_amount', type: 'decimal', displayName: 'Montant Total', description: '', isMetric: false, isCalculated: false, visible: true },
    { name: 'customer_id', type: 'integer', displayName: 'ID Client', description: '', isMetric: false, isCalculated: false, visible: false },
    { name: 'product_name', type: 'string', displayName: 'Produit', description: '', isMetric: false, isCalculated: false, visible: true },
    { name: 'category', type: 'string', displayName: 'Catégorie', description: '', isMetric: false, isCalculated: false, visible: true },
  ]);

  const [metrics, setMetrics] = React.useState<Metric[]>([
    { name: 'count', displayName: 'Nombre de commandes', expression: 'COUNT(*)', type: 'count' },
    { name: 'sum_total', displayName: 'Chiffre d\'affaires', expression: 'SUM(total_amount)', type: 'sum' },
    { name: 'avg_price', displayName: 'Panier Moyen', expression: 'AVG(total_amount)', type: 'avg' },
  ]);

  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredColumns = columns.filter(c => 
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    toast.success("Dataset mis à jour avec succès");
    navigate('/datasets');
  };

  return (
    <div className="min-h-full bg-muted/10 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/datasets')}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <Database className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-foreground">{dataset.name}</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="text-[7px] uppercase tracking-widest">{dataset.datasource}</Badge>
                    <span className="text-[10px] text-muted-foreground font-medium">Créé le {dataset.createdAt}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            className="btn-primary px-8 py-2 shadow-lg shadow-accent/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Tabs */}
          <div className="flex items-center border-b border-border gap-8">
            <button 
              onClick={() => setActiveTab('columns')}
              className={cn(
                "pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative",
                activeTab === 'columns' ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Colonnes ({columns.length})
              {activeTab === 'columns' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('metrics')}
              className={cn(
                "pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative",
                activeTab === 'metrics' ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Métriques ({metrics.length})
              {activeTab === 'metrics' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('calculated')}
              className={cn(
                "pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative",
                activeTab === 'calculated' ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Champs Calculés
              {activeTab === 'calculated' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full" />}
            </button>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
             {activeTab === 'columns' && (
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            placeholder="Rechercher une colonne..."
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                     <div className="flex gap-2">
                         <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-muted transition-all">
                            <Filter className="w-3 h-3" />
                            Filtrer
                         </button>
                         <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent border border-accent/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent/20 transition-all">
                            <Plus className="w-3 h-3" />
                            Ajouter
                         </button>
                     </div>
                  </div>

                  <div className="prism-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visualisation</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Label</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredColumns.map((col, idx) => (
                                <tr key={idx} className={cn("hover:bg-muted/5 transition-colors group", !col.visible && "opacity-60")}>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => {
                                                const newCols = [...columns];
                                                newCols[idx].visible = !newCols[idx].visible;
                                                setColumns(newCols);
                                            }}
                                            className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                col.visible ? "text-accent bg-accent/10" : "text-muted-foreground bg-muted"
                                            )}
                                        >
                                            {col.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">{col.name}</td>
                                    <td className="px-6 py-4 font-bold text-sm text-foreground italic">{col.displayName}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant="neutral" className="px-2 py-0 text-[8px]">{col.type}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-lg transition-all">
                                            <Edit3 className="w-4 h-4 text-muted-foreground hover:text-accent" />
                                        </button>
                                        <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-rose-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
               </div>
             )}

             {activeTab === 'metrics' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <h3 className="text-xl font-bold">Métriques du Dataset</h3>
                        <p className="text-sm text-muted-foreground">Définissez des agrégations réutilisables (Sommes, Moyennes, Comptes).</p>
                     </div>
                     <button className="flex items-center gap-2 btn-primary px-6 py-2">
                        <Sigma className="w-4 h-4" />
                        Nouvelle Métrique
                     </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {metrics.map((metric, i) => (
                        <div key={i} className="glass-panel p-6 space-y-4 hover:border-accent/40 transition-all group">
                           <div className="flex items-center justify-between">
                              <div className="p-3 bg-accent/10 text-accent rounded-xl">
                                 {metric.type === 'count' ? <Search className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
                              </div>
                              <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                 <MoreHorizontal className="w-4 h-4" />
                              </button>
                           </div>
                           <div className="space-y-1">
                              <h4 className="font-bold text-lg">{metric.displayName}</h4>
                              <p className="font-mono text-[10px] text-accent uppercase">{metric.expression}</p>
                           </div>
                           <div className="flex gap-2">
                               <Badge variant="neutral">{metric.type}</Badge>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             )}

             {activeTab === 'calculated' && (
                <div className="space-y-12 py-12 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto">
                            <Calculator className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Champs Calculés</h3>
                            <p className="text-muted-foreground">Créez de nouvelles colonnes basées sur des formules SQL pour enrichir vos données.</p>
                        </div>
                        <button className="btn-primary w-full py-3">
                            <Plus className="w-5 h-5 mr-2" />
                            Créer un champ calculé
                        </button>
                    </div>
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};
