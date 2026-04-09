import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  LayoutGrid, 
  List, 
  MoreVertical,
  Star,
  Database,
  Plus,
  PieChart,
  BarChart,
  LineChart,
  Map,
  Table as TableIcon,
  Activity
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { getCharts } from '../lib/db';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ChartCard = ({ chart, view }: any) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Pie': return PieChart;
      case 'Bar': return BarChart;
      case 'Line': return LineChart;
      case 'Map': return Map;
      case 'Table': return TableIcon;
      default: return Activity;
    }
  };

  const Icon = getIcon(chart.chart_type);

  if (view === 'list') {
    return (
      <div className="glass-panel p-5 flex items-center gap-8 group cursor-pointer hover:border-accent/30 transition-all duration-500">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-accent group-hover:text-accent-foreground group-hover:ring-8 group-hover:ring-accent/5 transition-all">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base text-slate-900 tracking-tight group-hover:text-accent transition-colors">{chart.name}</h4>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Visualization Asset</span>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(chart.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{chart.table_name}</span>
            </div>
            <span className="text-[8px] text-slate-300 mt-1 font-serif italic">Source Table</span>
          </div>
          <Badge variant="info" className="bg-accent/5 text-accent border-accent/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{chart.chart_type}</Badge>
          <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel group cursor-pointer overflow-hidden hover:border-accent/30 transition-all duration-500"
    >
      <div className="h-44 bg-slate-50 relative overflow-hidden flex items-center justify-center">
        <img 
          src={`https://picsum.photos/seed/${chart.name}/600/400`} 
          alt={chart.name} 
          className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <button className="p-2.5 bg-white/90 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white transition-all shadow-xl">
            <Star className="w-3.5 h-3.5 text-slate-400 hover:text-amber-500" />
          </button>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
            <Icon className="w-6 h-6 text-slate-900" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg text-slate-900 tracking-tight mb-1 truncate group-hover:text-accent transition-colors">{chart.name}</h3>
        <p className="text-[10px] text-slate-400 font-serif italic mb-6">Visual intelligence component</p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[100px]">{chart.table_name}</span>
          </div>
          <Badge variant="info" className="bg-accent/5 text-accent border-accent/10 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">{chart.chart_type}</Badge>
        </div>
      </div>
    </motion.div>
  );
};
;

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

  React.useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      const c = await getCharts();
      setCharts(c);
    } catch (err) {
      console.error('Failed to load charts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Horizontal Filter Bar */}
      <div className="border-b border-border bg-background/50 backdrop-blur-md px-8 py-4 flex items-center gap-8 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Type:</span>
            <div className="flex items-center gap-1">
              {["Line", "Bar", "Pie", "Map", "Table"].map(type => (
                <button 
                  key={type}
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-muted transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1"></div>

        <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider">Clear All</button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 lg:p-12 space-y-10 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Charts</h2>
            <p className="text-muted-foreground text-sm mt-1">Explore and manage your visualizations.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-muted rounded-md p-1">
              <button 
                onClick={() => setView('grid')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  view === 'grid' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('list')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  view === 'list' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => navigate('/chart/add')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chart
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <input 
            type="text" 
            placeholder="Search charts..." 
            className="input-minimal pl-11 py-3"
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
              <ChartCard key={chart.id} chart={chart} view={view} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
