import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  LayoutGrid, 
  List, 
  Plus,
  BarChart,
  X,
  Database,
  User as UserIcon,
  Calendar,
  ExternalLink,
  ChevronRight,
  PieChart,
  LineChart,
  Map as MapIcon,
  Activity,
  Trash2,
  Download,
  Copy,
  Share2
} from 'lucide-react';
import { getCharts as getLocalCharts, getChart as getLocalChart, executeQuery } from '../../core/utils/db';
import Papa from 'papaparse';
import { supersetService } from '../../lib/superset-service';
import { isConfigured as isSupersetConfigured } from '../../lib/supersetClient';
import { ChartCard } from '../../components/ui/cards/ChartCard';
import { Badge } from '../../components/ui/Badge';
import { MiniChart } from '../../components/ui/cards/MiniChart';
import { cn } from '../../core/utils/utils';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const FilterSection = ({ title, options }: any) => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</h4>
    <div className="space-y-1">
      {options.map((option: any) => (
        <label key={option.label} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer group transition-colors">
          <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
          <span className="text-xs text-muted-foreground group-hover:text-foreground flex-1">{option.label}</span>
          <span className="text-[10px] font-medium text-muted-foreground/60">{option.count}</span>
        </label>
      ))}
    </div>
  </div>
);

import { DataTable } from '../../components/ui/DataTable';

export const Charts = () => {
  const navigate = useNavigate();
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [charts, setCharts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedChart, setSelectedChart] = React.useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = React.useState(false);

  React.useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    if (!isSupersetConfigured) {
      try {
        const local = await getLocalCharts();
        setCharts(local);
      } catch (lerr) {}
      setIsLoading(false);
      return;
    }

    try {
      const { result } = await supersetService.getCharts();
      if (result.length > 0) {
        setCharts(result);
      } else {
        const local = await getLocalCharts();
        setCharts(local);
      }
    } catch (err) {
      try {
        const local = await getLocalCharts();
        setCharts(local);
      } catch (localErr) {
        console.error('Failed to load local charts:', localErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChartClick = (chart: any) => {
    navigate(`/chart-editor/${chart.id}`);
  };

  const handleChartSelect = async (chart: any) => {
    setSelectedChart(chart);
    setIsDetailsLoading(true);
    try {
      const fullId = typeof chart.id === 'number' ? String(chart.id) : chart.id;
      const fullChart = await getLocalChart(fullId);
      if (fullChart) {
        setSelectedChart(fullChart);
      }
    } catch (err) {
      console.error('Failed to load full chart details:', err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleExportCSV = async (chart: any) => {
    try {
      toast.loading("Extraction des données...", { id: 'export-csv' });
      const xAxis = chart.x_axis?.[0];
      const yAxes = chart.y_axis?.map((y: any) => y.column);
      
      if (!xAxis || !yAxes) {
        toast.error("Données insuffisantes pour l'exportation", { id: 'export-csv' });
        return;
      }

      const sql = `SELECT "${xAxis}", ${yAxes.map((y: string) => `SUM("${y}") as "${y}"`).join(', ')} FROM "${chart.table_name}" GROUP BY "${xAxis}" LIMIT 5000`;
      const data = await executeQuery(sql);
      
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${chart.name || 'chart'}_data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Données exportées avec succès", { id: 'export-csv' });
    } catch (err) {
      console.error('CSV Export failed:', err);
      toast.error("L'exportation CSV a échoué", { id: 'export-csv' });
    }
  };

  const handleDeleteChart = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette visualisation stratégique ?')) return;
    
    try {
      const { initDatabase } = await import('../../core/utils/db');
      const { db } = await initDatabase();
      db.run(`DELETE FROM charts WHERE id = ?`, [id]);
      toast.success("Graphique supprimé");
      setSelectedChart(null);
      loadCharts();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getChartIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('pie')) return PieChart;
    if (t.includes('bar')) return BarChart;
    if (t.includes('line')) return LineChart;
    if (t.includes('map')) return MapIcon;
    if (t.includes('table')) return List;
    return Activity;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 text-foreground">
      {/* Horizontal Filter Bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl px-12 py-3 flex items-center gap-8 sticky top-0 z-10 shadow-sm transition-colors">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Filtres</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Type:</span>
            <div className="flex items-center gap-1.5 font-mono">
              {["Line", "Bar", "Pie", "Map", "Table"].map(type => (
                <button 
                  key={type}
                  className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-border bg-muted/50 text-muted-foreground hover:border-accent/30 hover:text-accent transition-all"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1"></div>

        <button className="text-[9px] font-black text-muted-foreground hover:text-accent uppercase tracking-[0.2em] transition-colors">Réinitialiser</button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 lg:p-10 space-y-10 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground leading-tight">Visualisations</h2>
              <p className="text-muted-foreground text-sm font-light">Explorez et gérez vos visualisations stratégiques.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-background border border-border rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setView('grid')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    view === 'grid' ? "bg-accent text-accent-foreground shadow-lg shadow-accent/10" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setView('list')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    view === 'list' ? "bg-accent text-accent-foreground shadow-lg shadow-accent/10" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
              <button 
                onClick={() => navigate('/chart/add')}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-accent/20"
              >
                <Plus className="w-4 h-4" />
                Nouveau
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher une visualisation..." 
              className="pl-11 pr-5 py-3 w-full bg-background border border-border rounded-2xl text-sm focus:ring-4 ring-accent/5 focus:border-accent transition-all shadow-sm"
            />
          </div>

          {/* Grid/List View */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : charts.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border rounded-lg">
              <BarChart className="w-12 h-12 text-muted/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No charts yet</h3>
              <p className="text-muted-foreground text-sm mb-8">Create your first visualization to see it here.</p>
              <button 
                onClick={() => navigate('/chart/add')}
                className="btn-primary px-8"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              view === 'grid' 
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
                : "grid-cols-1"
            )}>
              {view === 'grid' ? (
                charts.map((chart) => (
                  <ChartCard 
                    key={chart.id} 
                    chart={chart} 
                    view={view} 
                    onClick={() => handleChartSelect(chart)}
                  />
                ))
              ) : (
                <DataTable 
                  showSearch={false}
                  data={charts}
                  columns={[
                    {
                      key: 'name',
                      label: 'Visualisation',
                      render: (val, row) => {
                        const Icon = getChartIcon(row.viz_type || row.chart_type);
                        return (
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground tracking-tight">{row.slice_name || row.name || row.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-accent/10 text-accent border-accent/20 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest">
                                  {row.viz_type || row.chart_type}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">{row.id?.toString().substring(0, 8)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    },
                    {
                      key: 'owner',
                      label: 'Propriétaire',
                      render: (val, row) => {
                        const owners = row.owners || (val ? [{ username: val }] : []);
                        if (Array.isArray(owners) && owners.length > 0) {
                          return (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                                {(owners[0].first_name?.[0] || owners[0].username?.[0] || 'U').toUpperCase()}
                              </div>
                              <span className="text-xs">{owners[0].first_name ? `${owners[0].first_name} ${owners[0].last_name || ''}` : owners[0].username}</span>
                            </div>
                          );
                        }
                        return <span className="text-xs text-muted-foreground">Système</span>;
                      }
                    },
                    {
                      key: 'datasource_name',
                      label: 'Dataset lié',
                      render: (val, row) => (
                        <div className="flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs truncate max-w-[150px]">{val || row.table_name || row.dataset || 'Dataset par défaut'}</span>
                        </div>
                      )
                    },
                    {
                      key: 'created_at',
                      label: 'Créé le',
                      render: (_, row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A')
                    },
                    {
                      key: 'changed_on_delta_humanized',
                      label: 'Modifié le',
                      render: (val, row) => val || (row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'N/A')
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      render: (_, row) => (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleChartSelect(row)}
                            className="p-1.5 text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteChart(row.id)}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    }
                  ]}
                  onRowClick={(row) => handleChartSelect(row)}
                />
              )}
            </div>
          )}
        </div>

        {/* Details Side Panel */}
        <AnimatePresence>
          {selectedChart && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-[450px] border-l border-border bg-background shadow-2xl z-20 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    {React.createElement(getChartIcon(selectedChart.viz_type || selectedChart.chart_type), { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg tracking-tight truncate max-w-[280px]">
                      {selectedChart.slice_name || selectedChart.name || selectedChart.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Métadonnées de l'Atout</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedChart(null)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {isDetailsLoading ? (
                  <div className="space-y-8 animate-pulse">
                    <div className="h-64 bg-muted rounded-2xl" />
                    <div className="space-y-4">
                      <div className="h-4 bg-muted w-3/4 rounded" />
                      <div className="h-4 bg-muted w-1/2 rounded" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Visual Preview */}
                    <div className="h-64 bg-muted/30 rounded-3xl border border-border/50 flex items-center justify-center relative group overflow-hidden cursor-pointer" onClick={() => handleChartClick(selectedChart)}>
                      <div className="w-full h-full p-8 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700">
                        <MiniChart type={selectedChart.viz_type || selectedChart.chart_type} />
                      </div>
                      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl border border-accent/20 shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          <ExternalLink className="w-4 h-4 text-accent" />
                          <span className="text-xs font-bold text-accent">Ouvrir l'éditeur</span>
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background to-transparent">
                        <Badge variant="info" className="bg-accent/10 text-accent border-accent/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {selectedChart.viz_type || selectedChart.chart_type}
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Database className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Dataset</span>
                        </div>
                        <p className="font-bold text-sm tracking-tight text-foreground/90 break-words">
                          {selectedChart.datasource_name || selectedChart.table_name || selectedChart.dataset || 'Dataset par défaut'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Modifié</span>
                        </div>
                        <p className="font-bold text-sm tracking-tight text-foreground/90">
                          {selectedChart.changed_on_delta_humanized || (selectedChart.created_at ? new Date(selectedChart.created_at).toLocaleDateString() : 'N/A')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <UserIcon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Propriétaire</span>
                        </div>
                        <p className="font-bold text-sm tracking-tight text-foreground/90">
                          {selectedChart.owner || 'System'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Activity className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Type</span>
                        </div>
                        <p className="font-bold text-sm tracking-tight text-foreground/90 capitalize">
                          {selectedChart.viz_type || selectedChart.chart_type}
                        </p>
                      </div>
                    </div>

                    {/* Axes Configuration */}
                    {(selectedChart.x_axis || selectedChart.y_axis) && (
                      <div className="space-y-6 pt-10 border-t border-border">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Structure des Données</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Axe Horizontal (X)</span>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-accent/10 text-accent border-accent/20">Dimension</Badge>
                              <span className="text-sm font-bold">{selectedChart.x_axis?.[0] || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Métriques (Y)</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedChart.y_axis?.map((y: any, idx: number) => (
                                <Badge key={idx} variant="outline" className="border-accent/40 text-accent font-bold">
                                  {y.agg}({y.column})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description or Comments */}
                    <div className="space-y-4 pt-10 border-t border-border">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Contexte & Intelligence</h4>
                        <button className="text-[9px] font-bold text-accent px-2 py-1 bg-accent/10 rounded-md">AI Insights</button>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed font-light italic">
                        {selectedChart.description || "Aucune description stratégique fournie pour cette visualisation. Utilisez l'éditeur pour ajouter du contexte et améliorer la collaboration."}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4 pt-10 border-t border-border mb-8">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Actions de Workflow</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => navigate(`/chart-editor/${selectedChart.id}`)}
                          className="flex items-center gap-3 p-4 bg-accent text-accent-foreground rounded-2xl transition-all hover:shadow-lg hover:shadow-accent/20 grow"
                        >
                          <Copy className="w-4 h-4" />
                          <span className="text-xs font-bold">Éditer</span>
                        </button>
                        <button 
                          onClick={() => handleExportCSV(selectedChart)}
                          className="flex items-center gap-3 p-4 bg-muted hover:bg-muted/80 rounded-2xl transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-xs font-bold">CSV</span>
                        </button>
                        <button 
                          onClick={() => {
                            toast.success("Publication...", { description: "Le graphique est en cours de déploiement sur le CDN de production." });
                          }}
                          className="flex items-center gap-3 p-4 bg-muted hover:bg-muted/80 rounded-2xl transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Partager</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteChart(selectedChart.id)}
                          className="flex items-center gap-3 p-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
