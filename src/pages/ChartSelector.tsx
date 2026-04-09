import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  Database, 
  Check,
  PieChart,
  BarChart,
  LineChart,
  Activity,
  TrendingUp,
  Hash,
  Layers,
  Layout as LayoutIcon,
  Minus,
  ChevronDown
} from 'lucide-react';
import { getTables } from '../lib/db';
import { Badge } from '../components/Badge';

const CHART_CATEGORIES = [
  { name: 'All charts', icon: Layers },
  { name: 'Recommended', icon: Check },
  { name: 'Correlation', icon: Activity },
  { name: 'Distribution', icon: BarChart },
  { name: 'Evolution', icon: TrendingUp },
  { name: 'Flow', icon: Activity },
  { name: 'KPI', icon: Hash },
  { name: 'Map', icon: LayoutIcon },
  { name: 'Part of a Whole', icon: PieChart },
  { name: 'Ranking', icon: BarChart },
  { name: 'Table', icon: LayoutIcon },
  { name: 'Other', icon: Minus },
];

const CHART_TYPES = [
  { label: 'Area Chart', icon: TrendingUp, category: 'Evolution', description: 'Area charts are used to represent cumulative totals using numbers or percentages over time.' },
  { label: 'Bar Chart', icon: BarChart, category: 'Ranking', description: 'Bar charts are used to compare values across different categories.' },
  { label: 'Big Number', icon: Hash, category: 'KPI', description: 'Shows a single large number, often used for key metrics.' },
  { label: 'Big Number with Trendline', icon: Activity, category: 'KPI', description: 'Shows a single large number with a trendline below it.' },
  { label: 'Box Plot', icon: BarChart, category: 'Distribution', description: 'Box plots are used to show the distribution of data based on a five-number summary.' },
  { label: 'Bubble Chart', icon: Activity, category: 'Correlation', description: 'Bubble charts are scatter plots where the size of the bubble represents a third variable.' },
  { label: 'Funnel Chart', icon: Activity, category: 'Flow', description: 'Funnel charts are used to show the progress of a process through stages.' },
  { label: 'Gauge Chart', icon: Hash, category: 'KPI', description: 'Gauge charts are used to show a single value within a range.' },
  { label: 'Graph Chart', icon: Activity, category: 'Flow', description: 'Graph charts are used to show relationships between entities.' },
  { label: 'Heatmap', icon: LayoutIcon, category: 'Distribution', description: 'Heatmaps use color to represent values in a matrix.' },
  { label: 'Line Chart', icon: LineChart, category: 'Evolution', description: 'Line charts are used to show trends over time.' },
  { label: 'Mixed Chart', icon: Activity, category: 'Evolution', description: 'Mixed charts combine multiple chart types in a single visualization.' },
  { label: 'Pie Chart', icon: PieChart, category: 'Part of a Whole', description: 'Pie charts show the proportions of a whole.' },
  { label: 'Pivot Table', icon: LayoutIcon, category: 'Table', description: 'Pivot tables summarize data in a flexible grid.' },
  { label: 'Radar Chart', icon: Activity, category: 'Ranking', description: 'Radar charts compare multiple variables on a circular grid.' },
  { label: 'Scatter Plot', icon: Activity, category: 'Correlation', description: 'Scatter plots show the relationship between two variables.' },
  { label: 'Sunburst Chart', icon: PieChart, category: 'Part of a Whole', description: 'Sunburst charts show hierarchical data in a circular layout.' },
  { label: 'Table', icon: LayoutIcon, category: 'Table', description: 'Standard data table for detailed exploration.' },
  { label: 'Tree Chart', icon: Activity, category: 'Flow', description: 'Tree charts show hierarchical relationships.' },
  { label: 'Treemap', icon: LayoutIcon, category: 'Part of a Whole', description: 'Treemaps show hierarchical data using nested rectangles.' },
  { label: 'Waterfall Chart', icon: BarChart, category: 'Evolution', description: 'Waterfall charts show how an initial value is affected by intermediate changes.' },
  { label: 'World Map', icon: LayoutIcon, category: 'Map', description: 'World maps visualize data across geographical regions.' },
];

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

export const ChartSelector = () => {
  const navigate = useNavigate();
  const [tables, setTables] = React.useState<string[]>([]);
  const [selectedTable, setSelectedTable] = React.useState<string>('');
  const [selectedType, setSelectedType] = React.useState<string>('');
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('All');

  React.useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    const t = await getTables();
    setTables(t);
    if (t.length > 0) setSelectedTable(t[0]);
  };

  const filteredTypes = React.useMemo(() => {
    return CHART_TYPES.filter(t => 
      (category === 'All charts' || t.category === category) &&
      (t.label.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, category]);

  const selectedChartInfo = React.useMemo(() => {
    return CHART_TYPES.find(t => t.label === selectedType);
  }, [selectedType]);

  const handleCreate = () => {
    if (!selectedTable || !selectedType) return;
    navigate(`/chart-editor?table=${selectedTable}&type=${selectedType}`);
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/charts')}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Create a new chart</h1>
        </div>
        <button 
          onClick={handleCreate}
          disabled={!selectedTable || !selectedType}
          className="px-6 py-2 bg-prism-600 text-white rounded-xl text-sm font-bold hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 disabled:opacity-50 disabled:shadow-none active:scale-95"
        >
          Create new chart
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Categories */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Choose a dataset</h2>
            <div className="relative">
              <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prism-600" />
              <select 
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none appearance-none focus:border-prism-500 transition-all"
              >
                {tables.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4 mt-2">Choose chart type</h2>
            {CHART_CATEGORIES.map(cat => (
              <button 
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                  category === cat.name ? 'bg-prism-50 text-prism-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content: Grid & Details */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search all charts"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-prism-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</span>
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">Advanced</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">New</Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTypes.map((type) => (
                <button
                  key={type.label}
                  onClick={() => setSelectedType(type.label)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 group relative",
                    selectedType === type.label 
                      ? 'border-prism-500 bg-prism-50/30' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <div className={cn(
                    "w-full aspect-video rounded-xl flex items-center justify-center transition-all overflow-hidden border border-slate-100",
                    selectedType === type.label ? 'bg-white' : 'bg-slate-50'
                  )}>
                    <img 
                      src={`https://picsum.photos/seed/${type.label}/400/225`} 
                      alt={type.label}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[11px]">{type.label}</h4>
                  </div>
                  {selectedType === type.label && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-prism-600 text-white flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Detail Panel */}
          <AnimatePresence>
            {selectedChartInfo && (
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="h-64 bg-slate-50 border-t border-slate-200 p-8 flex gap-12 overflow-hidden shrink-0"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-900">{selectedChartInfo.label}</h3>
                    <Badge variant="info">{selectedChartInfo.category}</Badge>
                  </div>
                  <div className="flex gap-8">
                    <div className="flex-1 space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedChartInfo.description} This visualization is optimized for high-performance data exploration and supports advanced analytics features.
                      </p>
                    </div>
                    <div className="w-64 space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Examples</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-video bg-white rounded-lg border border-slate-200 overflow-hidden">
                          <img src={`https://picsum.photos/seed/${selectedChartInfo.label}1/200/112`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="aspect-video bg-white rounded-lg border border-slate-200 overflow-hidden">
                          <img src={`https://picsum.photos/seed/${selectedChartInfo.label}2/200/112`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-64 flex flex-col justify-end pb-2">
                  <button 
                    onClick={handleCreate}
                    className="w-full py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
                  >
                    Create new chart
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
