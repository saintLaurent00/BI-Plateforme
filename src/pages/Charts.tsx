import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  LayoutGrid, 
  List, 
  Plus,
  BarChart
} from 'lucide-react';
import { getCharts as getLocalCharts } from '../lib/db';
import { supersetService } from '../services/supersetService';
import { ChartCard } from '../components/cards/ChartCard';
import { cn } from '../lib/utils';

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
      const { result } = await supersetService.getCharts();
      if (result.length > 0) {
        setCharts(result);
      } else {
        const local = await getLocalCharts();
        setCharts(local);
      }
    } catch (err) {
      console.error('Failed to load charts from Superset, falling back to local:', err);
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
