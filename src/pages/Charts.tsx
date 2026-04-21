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
  Activity
} from 'lucide-react';
import { getCharts as getLocalCharts, getChart as getLocalChart } from '../lib/db';
import { supersetService } from '../services/supersetService';
import { isConfigured as isSupersetConfigured } from '../lib/supersetClient';
import { ChartCard } from '../components/cards/ChartCard';
import { Badge } from '../components/Badge';
import { MiniChart } from '../components/cards/MiniChart';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'motion/react';

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

  const handleChartClick = async (chart: any) => {
    setSelectedChart(chart);
    setIsDetailsLoading(true);
    try {
      // Fetch full details if it's a Superset chart and configured
      if (typeof chart.id === 'number' && isSupersetConfigured) {
        const fullChart = await supersetService.getChart(chart.id);
        setSelectedChart(fullChart);
      } else {
        const fullId = typeof chart.id === 'number' ? String(chart.id) : chart.id;
        try {
          const fullChart = await getLocalChart(fullId);
          setSelectedChart(fullChart);
        } catch (e) {
          // Keep the shallow chart data if local not found
        }
      }
    } catch (err) {
      // Quietly continue with existing data
    } finally {
      setIsDetailsLoading(false);
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
              {charts.map((chart) => (
                <ChartCard 
                  key={chart.id} 
                  chart={chart} 
                  view={view} 
                  onClick={() => handleChartClick(chart)}
                />
              ))}
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
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Asset Metadata</p>
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
                    <div className="h-64 bg-muted/30 rounded-3xl border border-border/50 flex items-center justify-center relative group overflow-hidden">
                      <div className="w-full h-full p-8 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700">
                        <MiniChart type={selectedChart.viz_type || selectedChart.chart_type} />
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
                          {selectedChart.datasource_name || selectedChart.table_name || selectedChart.dataset || 'Unknown'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Modified</span>
                        </div>
                        <p className="font-bold text-sm tracking-tight text-foreground/90">
                          {selectedChart.changed_on_delta_humanized || (selectedChart.created_at ? new Date(selectedChart.created_at).toLocaleDateString() : 'N/A')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <UserIcon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Owner</span>
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

                    {/* Description or Comments */}
                    <div className="space-y-4 pt-10 border-t border-border">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Context & Intelligence</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed font-light italic">
                        {selectedChart.description || "No strategic description provided for this visualization. Use the editor to add context for better team collaboration."}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4 pt-10 border-t border-border">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Actions</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <button 
                          onClick={() => navigate(`/chart/edit/${selectedChart.id}`)}
                          className="w-full flex items-center justify-between p-4 bg-muted hover:bg-accent hover:text-accent-foreground rounded-2xl transition-all group"
                        >
                          <span className="text-sm font-bold tracking-tight">Open in Editor</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-muted hover:bg-accent hover:text-accent-foreground rounded-2xl transition-all group">
                          <span className="text-sm font-bold tracking-tight">Export Visual Asset</span>
                          <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" />
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
