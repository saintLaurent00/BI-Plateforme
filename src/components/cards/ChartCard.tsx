import React from 'react';
import { motion } from 'motion/react';
import { 
  MoreVertical,
  Star,
  Database,
  PieChart,
  BarChart,
  LineChart,
  Map,
  Table as TableIcon,
  Activity
} from 'lucide-react';
import { Badge } from '../Badge';
import { MiniChart } from './MiniChart';
import { cn } from '../../lib/utils';

interface ChartCardProps {
  chart: any;
  view?: 'grid' | 'list';
  onClick?: () => void;
}

export const ChartCard: React.FC<ChartCardProps> = ({ chart, view = 'grid', onClick }) => {
  const getIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('pie')) return PieChart;
    if (t.includes('bar')) return BarChart;
    if (t.includes('line')) return LineChart;
    if (t.includes('map')) return Map;
    if (t.includes('table')) return TableIcon;
    return Activity;
  };

  const Icon = getIcon(chart.viz_type || chart.chart_type);
  const title = chart.slice_name || chart.name || chart.title;
  const type = chart.viz_type || chart.chart_type;
  const dataset = chart.datasource_name || chart.table_name || chart.dataset;
  const date = chart.changed_on_delta_humanized || (chart.created_at ? new Date(chart.created_at).toLocaleDateString() : 'Recently');

  if (view === 'list') {
    return (
      <div 
        onClick={onClick}
        className="glass-panel p-5 flex items-center gap-8 group cursor-pointer hover:border-accent/30 transition-all duration-500"
      >
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent/20 transition-all">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base text-foreground tracking-tight group-hover:text-accent transition-colors">{title}</h4>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">Visualization Asset</span>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{date}</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{dataset}</span>
            </div>
            <span className="text-[8px] text-muted-foreground/60 mt-1 font-serif italic">Source Table</span>
          </div>
          <Badge variant="info" className="bg-accent/5 text-accent border-accent/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{type}</Badge>
          <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
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
      onClick={onClick}
      className="glass-panel group cursor-pointer overflow-hidden hover:border-accent/30 transition-all duration-500"
    >
      <div className="h-32 bg-muted/30 relative overflow-hidden flex items-center justify-center p-4">
        <div className="w-full h-full opacity-60 group-hover:opacity-100 transition-all duration-500">
          <MiniChart type={type} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="p-2 bg-background/90 backdrop-blur-xl rounded-xl border border-border/20 hover:bg-background transition-all shadow-md"
          >
            <Star className="w-3 h-3 text-muted-foreground hover:text-amber-500" />
          </button>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-3 bg-background/90 backdrop-blur-xl rounded-xl border border-border/20 shadow-lg group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
            <Icon className="w-4.5 h-4.5 text-foreground" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-foreground tracking-tight truncate group-hover:text-accent transition-colors">{title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Database className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest truncate">{dataset}</span>
            </div>
          </div>
          <Badge variant="info" className="bg-accent/5 text-accent border-accent/10 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shrink-0">{type}</Badge>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-prism-500 to-blue-500 flex items-center justify-center text-[8px] font-bold text-white">
              {title.charAt(0)}
            </div>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{date}</span>
          </div>
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
