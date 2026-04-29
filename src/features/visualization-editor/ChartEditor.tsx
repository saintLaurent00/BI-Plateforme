import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  ChevronLeft, 
  ChevronRight,
  Play, 
  Save, 
  Plus, 
  Settings2, 
  Layers, 
  Activity,
  TrendingUp,
  AlertCircle,
  GripVertical,
  X,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  ChevronDown,
  Hash,
  Layout as LayoutIcon,
  Minus,
  Maximize2,
  Minimize2,
  Table as TableIcon,
  Info,
  Check,
  Palette,
  Sparkles,
  Loader2,
  Search
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { 
  FormSection, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormActions, 
  FormButton,
  FormLabel
} from '../../components/ui/FormElements';
import { executeQuery, getTables, getTableSchema, saveChart } from '../../core/utils/db';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Modal } from '../../components/ui/Modal';
import { D3Chart } from '../../components/charts/D3Chart';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AIInsight } from '../../components/dashboard/AIInsight';
import { aiService } from '../../lib/ai-service';
import { toast } from 'sonner';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const FieldItem = ({ id, name, type, index }: any) => (
  <Draggable draggableId={id} index={index}>
    {(provided, snapshot) => (
      <div 
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border shadow-sm cursor-grab active:cursor-grabbing group transition-all mb-2",
          snapshot.isDragging ? "bg-accent text-accent-foreground border-accent shadow-lg ring-4 ring-accent/10" : "bg-background hover:border-accent hover:shadow-md hover:bg-muted/30"
        )}
      >
        <GripVertical className={cn(
          "w-3 h-3 transition-colors",
          snapshot.isDragging ? "text-accent-foreground/60" : "text-muted-foreground/30 group-hover:text-muted-foreground"
        )} />
        <div className={cn(
          "w-6 h-6 rounded flex items-center justify-center text-[8px] font-black uppercase tracking-tighter transition-all shrink-0",
          snapshot.isDragging ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
        )}>
          {type.substring(0, 3)}
        </div>
        <span className={cn(
          "text-xs font-semibold truncate flex-1 tracking-tight",
          snapshot.isDragging ? "text-white" : "text-muted-foreground group-hover:text-foreground"
        )}>{name}</span>
      </div>
    )}
  </Draggable>
);

interface Metric {
  column: string;
  agg: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'NONE';
  alias: string;
}

const MetricItem = ({ metric, onRemove, onUpdateAgg }: { metric: Metric, onRemove: () => void, onUpdateAgg: (agg: string) => void }) => (
  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-background border border-border rounded-xl shadow-sm group hover:border-accent transition-all animate-in fade-in slide-in-from-left-2 duration-300">
    <select 
      value={metric.agg}
      onChange={(e) => onUpdateAgg(e.target.value)}
      className="text-[9px] font-black text-accent bg-accent/5 border-none outline-none rounded-lg px-1.5 py-0.5 cursor-pointer uppercase tracking-widest hover:bg-accent/10 transition-colors"
    >
      <option value="SUM">SUM</option>
      <option value="AVG">AVG</option>
      <option value="COUNT">COUNT</option>
      <option value="MIN">MIN</option>
      <option value="MAX">MAX</option>
      <option value="NONE">NONE</option>
    </select>
    <span className="text-[11px] font-bold text-foreground truncate max-w-[120px]">{metric.column}</span>
    <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all">
      <X className="w-3 h-3" />
    </button>
  </div>
);

const DropZone = ({ id, label, icon: Icon, items = [], onRemove, onUpdateAgg, isMetric = false }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-muted/50 flex items-center justify-center">
          <Icon className="w-2.5 h-2.5 text-muted-foreground/60" />
        </div>
        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{label}</span>
      </div>
    </div>
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            "min-h-[72px] p-2.5 border-2 border-dashed rounded-2xl flex flex-wrap gap-2 transition-all duration-300",
            snapshot.isDraggingOver 
              ? "bg-accent/5 border-accent ring-4 ring-accent/5" 
              : "bg-muted/10 border-border/40 hover:border-border/80"
          )}
        >
            {items.length === 0 ? (
              <div key="empty-zone" className="m-auto flex flex-col items-center gap-1.5 py-2 opacity-10">
                <Plus className="w-4 h-4 text-muted-foreground" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Drop Zone</span>
              </div>
            ) : (
              items.map((item: any, i: number) => {
                const itemKey = isMetric 
                  ? `${item.column}-${item.agg}-${item.alias}-${i}`
                  : `${item}-${i}`;
                
                return isMetric ? (
                  <MetricItem 
                    key={itemKey} 
                    metric={item} 
                    onRemove={() => onRemove(item)} 
                    onUpdateAgg={(agg) => onUpdateAgg(item, agg)} 
                  />
                ) : (
                  <div key={itemKey} className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-xl shadow-sm group hover:border-accent transition-all animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-[11px] font-bold text-foreground">{item}</span>
                    <button onClick={() => onRemove(item)} className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-none">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 hover:bg-muted/30 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            isOpen ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground/60 group-hover:text-muted-foreground"
          )}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={cn(
            "text-sm font-bold transition-colors",
            isOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {title}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground/40 transition-transform duration-300",
          isOpen && "rotate-180 text-accent"
        )} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 pt-2 px-1 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CHART_CATEGORIES = [
  { name: 'Évolution', icon: TrendingUp },
  { name: 'Distribution', icon: BarChartIcon },
  { name: 'Classement', icon: BarChartIcon },
  { name: 'Part du tout', icon: PieChartIcon },
  { name: 'Flux', icon: Activity },
  { name: 'Corrélation', icon: Activity },
  { name: 'Hiérarchie', icon: Layers },
  { name: 'Indicateurs', icon: Hash },
  { name: 'Cartographie', icon: LayoutIcon },
  { name: 'Tables', icon: TableIcon },
];

const CHART_TYPES = [
  // Évolution
  { label: 'Ligne', type: 'Line', category: 'Évolution', icon: LineChartIcon },
  { label: 'Surface (Area)', type: 'Area', category: 'Évolution', icon: TrendingUp },
  { label: 'Timeline', type: 'Timeline', category: 'Évolution', icon: TrendingUp },
  { label: 'Stacked Area', type: 'StackedArea', category: 'Évolution', icon: TrendingUp },
  
  // Distribution
  { label: 'Histogramme', type: 'Bar', category: 'Distribution', icon: BarChartIcon },
  { label: 'Boîte à moustaches', type: 'BoxPlot', category: 'Distribution', icon: BarChartIcon },
  { label: 'Nuage de mots', type: 'WordCloud', category: 'Distribution', icon: Layers },
  
  // Classement
  { label: 'Barres', type: 'Bar', category: 'Classement', icon: BarChartIcon },
  { label: 'Barres Horizontales', type: 'HorizontalBar', category: 'Classement', icon: BarChartIcon },
  { label: 'Ranking Bar', type: 'Bar', category: 'Classement', icon: BarChartIcon },
  
  // Part du tout
  { label: 'Secteur (Pie)', type: 'Pie', category: 'Part du tout', icon: PieChartIcon },
  { label: 'Donut', type: 'Donut', category: 'Part du tout', icon: PieChartIcon },
  { label: 'Treemap', type: 'Treemap', category: 'Part du tout', icon: LayoutIcon },
  { label: 'Sunburst', type: 'Sunburst', category: 'Part du tout', icon: PieChartIcon },
  { label: 'Marimekko', type: 'Marimekko', category: 'Part du tout', icon: BarChartIcon },
  
  // Flux
  { label: 'Sankey', type: 'Sankey', category: 'Flux', icon: Activity },
  { label: 'Cascade (Waterfall)', type: 'Waterfall', category: 'Flux', icon: BarChartIcon },
  { label: 'Waterfall Horizontal', type: 'WaterfallHorizontal', category: 'Flux', icon: BarChartIcon },
  { label: 'Entonnoir (Funnel)', type: 'Funnel', category: 'Flux', icon: Activity },
  
  // Corrélation
  { label: 'Nuage de points', type: 'Scatter', category: 'Corrélation', icon: Activity },
  { label: 'Bulles (Bubble)', type: 'Bubble', category: 'Corrélation', icon: Activity },
  { label: 'Heatmap', type: 'Heatmap', category: 'Corrélation', icon: LayoutIcon },
  { label: 'Coordonnées Parallèles', type: 'ParallelCoordinates', category: 'Corrélation', icon: Activity },
  
  // Hiérarchie
  { label: 'Arbre (Tree)', type: 'Tree', category: 'Hiérarchie', icon: Layers },
  { label: 'Dendrogramme', type: 'Dendrogram', category: 'Hiérarchie', icon: Layers },
  { label: 'Radial Tree', type: 'RadialTree', category: 'Hiérarchie', icon: Layers },
  
  // Indicateurs
  { label: 'KPI Big Number', type: 'Bar', category: 'Indicateurs', icon: Hash },
  { label: 'Jauge (Gauge)', type: 'Gauge', category: 'Indicateurs', icon: Activity },
  { label: 'Bullet Chart', type: 'Bullet', category: 'Indicateurs', icon: BarChartIcon },
];

export const ChartEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const [activeConfigTab, setActiveConfigTab] = React.useState<'data' | 'customize'>('data');
  const [activePreviewTab, setActivePreviewTab] = React.useState<'preview' | 'data' | 'sql'>('preview');
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [chartSearch, setChartSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Évolution');
  
  const [datasets, setDatasets] = React.useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = React.useState<{ name: string, id: string | number, source: 'local' | 'superset' }>({
    name: searchParams.get('dataset') || searchParams.get('table') || '',
    id: searchParams.get('datasetId') || searchParams.get('table') || '',
    source: (searchParams.get('source') as any) || 'local'
  });
  const [schema, setSchema] = React.useState<any[]>([]);
  const [xAxis, setXAxis] = React.useState<string[]>(() => {
    const val = searchParams.get('xAxis');
    return val ? [val] : [];
  });
  const [yAxis, setYAxis] = React.useState<Metric[]>(() => {
    const val = searchParams.get('yAxis');
    if (!val) return [];
    return val.split(',').map(v => ({ column: v, agg: 'SUM', alias: v }));
  });
  const [chartType, setChartType] = React.useState<any>(searchParams.get('type') || 'Bar');
  const [chartLabel, setChartLabel] = React.useState<string>(searchParams.get('label') || searchParams.get('type') || 'Bar');
  const [results, setResults] = React.useState<any[]>([]);
  const [sampleRows, setSampleRows] = React.useState<any[]>([]);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = React.useState(false);
  const [chartName, setChartName] = React.useState('');
  
  const [calcColName, setCalcColName] = React.useState('');
  const [calcColSql, setCalcColSql] = React.useState('');
  const [isRecommending, setIsRecommending] = React.useState(false);

  const handleRecommend = async () => {
    if (!schema.length) return;
    setIsRecommending(true);
    try {
      const rec = await aiService.getChartRecommendation(schema);
      if (rec) {
        setChartType(rec.chartType || 'Bar');
        if (rec.xAxis && schema.find(s => s.name === rec.xAxis)) {
          setXAxis([rec.xAxis]);
        }
        if (rec.yAxis && schema.find(s => s.name === rec.yAxis)) {
          setYAxis([{ column: rec.yAxis, agg: 'SUM', alias: rec.yAxis }]);
        }
        toast.success(`Hifadih AI recommande : ${rec.chartType}`, {
          description: rec.reasoning
        });
      }
    } catch (err) {
      console.error('Recommendation failed:', err);
      toast.error('Hifadih AI n\'a pas pu générer de recommandation.');
    } finally {
      setIsRecommending(false);
    }
  };

  // Customization options
  const [customConfig, setCustomConfig] = React.useState({
    showLegend: true,
    showGrid: true,
    colorScheme: 'Superset Colors',
    labelType: 'Category Name',
    numberFormat: 'Adaptive formatting',
    showCellBars: true,
    pageLength: 10,
    searchBox: true,
    customScript: `// D3 Custom Script
// Available variables: d3, svg, data, width, height, margin, xAxis, yAxis, config, showTooltip, moveTooltip, hideTooltip

const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`);
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Example: Simple Bar Chart
const x = d3.scaleBand()
  .domain(data.map(d => String(d[xAxis])))
  .range([0, innerWidth])
  .padding(0.1);

const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d[yAxis[0]])])
  .range([innerHeight, 0]);

g.append('g')
  .attr('transform', \`translate(0,\${innerHeight})\`)
  .call(d3.axisBottom(x));

g.append('g').call(d3.axisLeft(y));

g.selectAll('rect')
  .data(data)
  .enter().append('rect')
  .attr('x', d => x(String(d[xAxis])))
  .attr('y', d => y(d[yAxis[0]]))
  .attr('width', x.bandwidth())
  .attr('height', d => innerHeight - y(d[yAxis[0]]))
  .attr('fill', '#6366f1')
  .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
  .on('mousemove', moveTooltip)
  .on('mouseout', hideTooltip);`
  });

  React.useEffect(() => {
    if (id) {
      loadChartData(id);
    } else {
      loadData();
    }
  }, [id]);

  const loadChartData = async (chartId: string) => {
    try {
      const { getChart } = await import('../../core/utils/db');
      const chart = await getChart(chartId);
      if (chart) {
        setChartName(chart.name || '');
        setSelectedDataset({
            name: chart.table_name,
            id: chart.table_name,
            source: 'local'
        });
        setChartType(chart.chart_type);
        setXAxis(chart.x_axis || []);
        setYAxis(chart.y_axis || []);
        setCustomConfig(prev => ({ ...prev, ...(chart.config || {}) }));
        setChartLabel(chart.name || chart.chart_type);
      }
    } catch (err) {
      console.error('Failed to load chart data:', err);
      toast.error('Impossible de charger les données du graphique.');
    }
  };

  React.useEffect(() => {
    if (selectedDataset.name) {
      loadSchema(selectedDataset);
    }
  }, [selectedDataset.id]);

  // Auto-run query when axes change
  React.useEffect(() => {
    if (xAxis.length > 0 && yAxis.length > 0) {
      handleRun();
    } else {
      setResults([]);
    }
  }, [xAxis, yAxis, chartType]);

  const loadData = async () => {
    const t = await getTables();
    const ds = t.map(name => ({ name, id: name, source: 'local' as const }));
    setDatasets(ds);
  };

  const loadSchema = async (ds: any) => {
    if (ds.source === 'local') {
        const s = await getTableSchema(ds.id);
        setSchema(s);
        
        // Fetch sample rows
        try {
          const sample = await executeQuery(`SELECT * FROM "${ds.id}" LIMIT 100;`);
          setSampleRows(sample);
        } catch (err) {
          setSampleRows([]);
        }
    } else {
        // Mock schema for remote
        setSchema([
          { name: 'date', type: 'TIMESTAMP' },
          { name: 'sales', type: 'FLOAT' },
          { name: 'quantity', type: 'INT' },
          { name: 'category', type: 'VARCHAR' }
        ]);
        setSampleRows([]);
    }
  };

  const generateSql = () => {
    if (!selectedDataset.name || xAxis.length === 0 || yAxis.length === 0) return '';
    const x = xAxis[0];
    const y = yAxis.map(m => {
      const isCalc = m?.column?.startsWith?.('__calc__');
      const colExpr = isCalc 
        ? schema.find(s => s.name === m.column)?.sql 
        : `"${m.column}"`;
      
      if (m.agg === 'NONE') return `${colExpr} as "${m.alias}"`;
      return `${m.agg}(${colExpr}) as "${m.alias}"`;
    }).join(', ');
    
    const groupBy = xAxis.map(col => {
      const isCalc = col?.startsWith?.('__calc__');
      const colExpr = isCalc 
        ? schema.find(s => s.name === col)?.sql 
        : `"${col}"`;
      return colExpr;
    }).join(', ');

    return `SELECT ${groupBy}, ${y} FROM "${selectedDataset.name}" GROUP BY ${groupBy} LIMIT 1000;`;
  };

  const handleRun = async () => {
    const sql = generateSql();
    if (!sql) return;

    setIsExecuting(true);
    setError(null);
    try {
      const res = await executeQuery(sql);
      setResults(res);
      setActivePreviewTab('preview');
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chartName) {
      setIsSaveModalOpen(true);
      return;
    }

    try {
      await saveChart({
        id: id || crypto.randomUUID(),
        name: chartName,
        tableName: selectedDataset.name,
        chartType,
        xAxis,
        yAxis,
        config: customConfig
      });
      setIsSaveModalOpen(false);
      navigate('/charts');
    } catch (err) {
      console.error('Failed to save chart:', err);
    }
  };

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === 'fields') {
      if (destination.droppableId === 'xAxis') {
        setXAxis([draggableId]);
      } else if (destination.droppableId === 'yAxis') {
        if (!yAxis.find(m => m.column === draggableId)) {
          setYAxis([...yAxis, { 
            column: draggableId, 
            agg: 'SUM', 
            alias: draggableId 
          }]);
        }
      }
    }
  };

  const handleAddCalculatedColumn = () => {
    if (!calcColName || !calcColSql) return;
    const newCol = {
      name: `__calc__${calcColName}`,
      displayName: calcColName,
      type: 'calculated',
      sql: calcColSql
    };
    setSchema([...schema, newCol]);
    setCalcColName('');
    setCalcColSql('');
    setIsCalcModalOpen(false);
  };

  const getChartImageUrl = (label: string, width: number, height: number) => {
    const seed = label.toLowerCase().replace(/\s+/g, '-');
    const tags = `data-visualization,chart,graph,dashboard,${seed}`;
    return `https://loremflickr.com/${width}/${height}/${tags}?lock=${label.length}`;
  };

  const filteredGalleryTypes = CHART_TYPES.filter(t => 
    (t.category === selectedCategory) &&
    (t.label.toLowerCase().includes(chartSearch.toLowerCase()))
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
        {/* Left Sidebar: Source & Fields */}
        <aside className="w-72 bg-muted/20 border-r border-border flex flex-col shrink-0 z-30">
          <div className="p-6 border-b border-border space-y-5 bg-background">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Source de Données</label>
              <Badge variant="success" className="text-[8px] px-1.5 py-0">LIVE</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted border border-border/50 rounded-2xl group hover:border-accent/30 transition-all cursor-default shadow-sm shadow-black/5">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-0.5">Dataset Actif</p>
                <span className="text-sm font-bold text-foreground truncate block">{selectedDataset.name}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            {/* Metrics Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Mesures Calculées</label>
                </div>
                <button 
                  onClick={() => setIsCalcModalOpen(true)}
                  className="w-6 h-6 flex items-center justify-center bg-accent/5 text-accent hover:bg-accent hover:text-accent-foreground rounded-lg transition-all shadow-sm shadow-accent/10"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {schema.filter(s => s.type === 'number' || s.type === 'calculated').map((col, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={`${col.name}-${i}`} 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-background hover:shadow-md hover:border-border/60 border border-transparent group cursor-default transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-accent/5 flex items-center justify-center text-[7px] font-black text-accent uppercase tracking-tighter border border-accent/20">fx</div>
                    <span className="text-xs font-semibold text-muted-foreground truncate flex-1 group-hover:text-foreground transition-colors">{col.displayName || col.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Columns Section */}
            <Droppable droppableId="fields">
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Champs Disponibles</label>
                  </div>
                  <div className="space-y-1">
                    {schema.map((col, index) => (
                      <FieldItem 
                        key={`${col.name}-${index}`} 
                        id={`${col.name}-${index}`}
                        name={col.displayName || col.name} 
                        type={col.type} 
                        index={index}
                      />
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </aside>

        {/* Middle Panel: Configuration */}
        <aside className="w-80 bg-background border-r border-border flex flex-col shrink-0 z-20">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/5">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Paramètres</h2>
            <div className="flex p-0.5 bg-muted rounded-lg border border-border">
              <button 
                onClick={() => setActiveConfigTab('data')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  activeConfigTab === 'data' ? "bg-background text-accent shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setActiveConfigTab('customize')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  activeConfigTab === 'customize' ? "bg-background text-accent shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {activeConfigTab === 'data' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Visualization Type */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Visualisation</label>
                  <button 
                    onClick={() => setIsGalleryOpen(true)}
                    className="w-full flex items-center gap-4 p-4 bg-muted/20 border border-border rounded-2xl hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all text-left group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-accent/10 transition-colors" />
                    <div className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                      <BarChartIcon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                      <h4 className="text-sm font-black text-foreground tracking-tight flex items-center gap-2">
                        {chartLabel}
                        <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:translate-x-1 transition-transform" />
                      </h4>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">D3.js Core Library</p>
                    </div>
                  </button>
                </div>

                {/* Time Section */}
                <div className="space-y-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-bold text-foreground">Time</h3>
                  <div className="space-y-4">
                    <FormSection label="Time Column">
                      <FormSelect className="py-2.5 px-4 h-auto text-xs">
                        <option>No filter</option>
                        {schema.filter(s => s.type === 'date' || s.type === 'timestamp').map((s, i) => (
                          <option key={`${s.name}-${i}`} value={s.name}>{s.name}</option>
                        ))}
                      </FormSelect>
                    </FormSection>
                    <FormSection label="Time Grain">
                      <FormSelect className="py-2.5 px-4 h-auto text-xs">
                        <option>Day</option>
                        <option>Week</option>
                        <option>Month</option>
                        <option>Year</option>
                      </FormSelect>
                    </FormSection>
                    <FormSection label="Time Range">
                      <FormButton variant="secondary" className="w-full text-left justify-start px-4 py-2.5 rounded-2xl h-auto tracking-normal lowercase first-letter:uppercase font-medium">
                        Last week
                      </FormButton>
                    </FormSection>
                  </div>
                </div>

                {/* Query Section */}
                <div className="space-y-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">Query</h3>
                    <div className="flex bg-muted p-0.5 rounded-lg border border-border">
                      <button className="px-3 py-1 text-[10px] font-bold bg-background text-accent rounded-md shadow-sm">Aggregate</button>
                      <button className="px-3 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground">Raw records</button>
                    </div>
                  </div>

                  <DropZone 
                    id="xAxis"
                    label="Axe X (Dimension / Temps)" 
                    icon={Activity} 
                    items={xAxis} 
                    onRemove={() => setXAxis([])} 
                  />
                  
                  <DropZone 
                    id="yAxis"
                    label="Métriques (Valeurs)" 
                    icon={TrendingUp} 
                    items={yAxis} 
                    isMetric={true}
                    onRemove={(item: Metric) => setYAxis(yAxis.filter(i => i.alias !== item.alias))} 
                    onUpdateAgg={(item: Metric, agg: string) => {
                      setYAxis(yAxis.map(m => m.alias === item.alias ? { ...m, agg: agg as any } : m));
                    }}
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Filters</label>
                    <div className="p-4 border-2 border-dashed border-border rounded-xl bg-muted/30 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground/60 italic">Drop columns/metrics here</span>
                    </div>
                  </div>

                  <FormSection label="Row Limit">
                    <FormSelect className="py-2.5 px-4 h-auto text-xs">
                      <option>1000</option>
                      <option>5000</option>
                      <option>10000</option>
                    </FormSelect>
                  </FormSection>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                <CollapsibleSection title="General" icon={Settings2} defaultOpen={true}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Show Legend</span>
                    <input 
                      type="checkbox" 
                      checked={customConfig.showLegend}
                      onChange={(e) => setCustomConfig({ ...customConfig, showLegend: e.target.checked })}
                      className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Show Grid</span>
                    <input 
                      type="checkbox" 
                      checked={customConfig.showGrid}
                      onChange={(e) => setCustomConfig({ ...customConfig, showGrid: e.target.checked })}
                      className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Show cell bars</span>
                    <input 
                      type="checkbox" 
                      checked={customConfig.showCellBars}
                      onChange={(e) => setCustomConfig({ ...customConfig, showCellBars: e.target.checked })}
                      className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Axes" icon={Activity}>
                  <div className="space-y-4">
                    <FormSection label="X-Axis Label">
                      <FormInput placeholder="Auto" className="py-2.5 px-4 h-auto text-xs rounded-xl" />
                    </FormSection>
                    <FormSection label="Y-Axis Label">
                      <FormInput placeholder="Auto" className="py-2.5 px-4 h-auto text-xs rounded-xl" />
                    </FormSection>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Tooltips" icon={Info}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Enable Tooltips</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent" />
                  </div>
                  <FormSection label="Value Format" className="mt-4">
                    <FormSelect className="py-2.5 px-4 h-auto text-xs rounded-xl">
                      <option>Default</option>
                      <option>Currency</option>
                      <option>Percentage</option>
                    </FormSelect>
                  </FormSection>
                </CollapsibleSection>

                <CollapsibleSection title="Colors" icon={Palette}>
                  <FormSection label="Color Scheme">
                    <FormSelect 
                      value={customConfig.colorScheme}
                      onChange={(e) => setCustomConfig({ ...customConfig, colorScheme: e.target.value })}
                      className="py-2.5 px-4 h-auto text-xs rounded-xl"
                    >
                      <option>Superset Colors</option>
                      <option>Hifadih Theme</option>
                      <option>Vibrant</option>
                    </FormSelect>
                  </FormSection>
                </CollapsibleSection>

                {chartType === 'Custom D3' && (
                  <CollapsibleSection title="Custom Configuration" icon={Settings2} defaultOpen={true}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          D3.js Script
                        </label>
                        <textarea 
                          value={customConfig.customScript}
                          onChange={(e) => setCustomConfig({ 
                            ...customConfig, 
                            customScript: e.target.value 
                          })}
                          className="w-full h-64 px-3 py-2 bg-muted/50 text-accent font-mono text-[10px] rounded-lg outline-none border border-border focus:border-accent"
                          spellCheck={false}
                        />
                        <p className="text-[9px] text-muted-foreground italic">
                          Use d3, svg, data, width, height, margin, xAxis, yAxis to render.
                        </p>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content: Preview & Tools */}
        <main className="flex-1 flex flex-col min-w-0 bg-muted/5 relative">
          {/* Top Navbar */}
          <header className="h-16 bg-background border-b border-border flex items-center justify-between px-8 shrink-0 z-10">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/charts')}
                className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all"
              >
                <div className="p-2 rounded-xl group-hover:bg-muted transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold tracking-tight">Retour</span>
              </button>
              <div className="h-6 w-px bg-border" />
              <div className="flex flex-col">
                <input 
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  placeholder="Nom du graphique sans titre"
                  className="bg-transparent border-none focus:ring-0 p-0 text-sm font-black tracking-tight text-foreground placeholder:text-muted-foreground/30 min-w-[200px]"
                />
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Draft Mode</span>
                  <div className="w-1 h-1 rounded-full bg-slate-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Auto-saving</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleRecommend}
                disabled={isRecommending}
                className="flex items-center gap-2 px-4 py-2 bg-accent/5 text-accent hover:bg-accent hover:text-accent-foreground rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 group border border-accent/20"
              >
                {isRecommending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                IA Suggest
              </button>
              <div className="h-6 w-px bg-border" />
              <FormButton variant="primary" onClick={handleSave} className="px-6 py-2.5 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-lg shadow-accent/20">
                <Save className="w-4 h-4" />
                Sauvegarder
              </FormButton>
            </div>
          </header>

          <div className="flex-1 overflow-hidden flex flex-col p-8 gap-8">
            {/* Toolbar */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex p-1 bg-background rounded-2xl border border-border shadow-sm">
                <button 
                  onClick={() => setActivePreviewTab('preview')}
                  className={cn(
                    "px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all",
                    activePreviewTab === 'preview' ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Visualisation
                </button>
                <button 
                  onClick={() => setActivePreviewTab('data')}
                  className={cn(
                    "px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all",
                    activePreviewTab === 'data' ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Données de Sortie
                </button>
                <button 
                  onClick={() => setActivePreviewTab('sql')}
                  className={cn(
                    "px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all",
                    activePreviewTab === 'sql' ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Requête SQL
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1.5 rounded-lg border border-border/50">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  {results.length} lignes extraites
                </div>
                <button 
                  onClick={handleRun}
                  disabled={isExecuting}
                  className="p-2.5 bg-background text-accent hover:bg-accent hover:text-white rounded-xl transition-all border border-border shadow-sm group active:scale-95"
                >
                  <Play className={cn("w-4 h-4 transition-transform group-hover:scale-110", isExecuting && "animate-spin")} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium tracking-tight leading-relaxed">{error}</p>
              </motion.div>
            )}

            {/* Main Preview Container */}
            <div className="flex-1 bg-background border border-border rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col relative group">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.2]" />
              
              <div className="flex-1 overflow-hidden p-12 z-10">
                <AnimatePresence mode="wait">
                  {activePreviewTab === 'preview' && (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="w-full h-full"
                    >
                      {results.length > 0 ? (
                        <D3Chart 
                          type={chartType}
                          data={results}
                          xAxis={xAxis[0]}
                          yAxis={yAxis.map(m => m.alias)}
                          config={{
                            ...customConfig,
                            margin: { top: 40, right: 40, bottom: 60, left: 60 }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                          <div className="w-24 h-24 rounded-full bg-accent/5 flex items-center justify-center animate-pulse">
                            <Layers className="w-10 h-10 text-accent/20" />
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-lg font-black text-foreground tracking-tight">En attente de données</h3>
                            <p className="text-sm text-muted-foreground/60 max-w-[280px]">Ajoutez des métriques et des dimensions pour générer votre visualisation dynamique.</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activePreviewTab === 'data' && (
                    <motion.div 
                      key="data"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full h-full overflow-auto custom-scrollbar"
                    >
                      {results.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr>
                              {Object.keys(results[0]).map(key => (
                                <th key={key} className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border sticky top-0 bg-background/80 backdrop-blur-md">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {results.map((row, i) => (
                              <tr key={i} className="hover:bg-muted/30 transition-colors">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="p-4 text-xs font-medium text-foreground/80">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">No data results yet. Run the query to see output.</div>
                      )}
                    </motion.div>
                  )}

                  {activePreviewTab === 'sql' && (
                    <motion.div 
                      key="sql"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full h-full p-8 font-mono text-sm leading-relaxed text-accent bg-accent/5 rounded-[32px] overflow-auto select-all"
                    >
                      <div className="flex items-center gap-2 text-accent/40 mb-6 pb-4 border-b border-accent/10">
                        <Database className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Query Generator Engine</span>
                      </div>
                      <pre className="whitespace-pre-wrap">{generateSql() || '-- No query defined yet. Add axes to generate SQL.'}</pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>

        <Modal 
          isOpen={isGalleryOpen} 
          onClose={() => setIsGalleryOpen(false)}
          title="Sélectionner une visualisation technique"
          maxWidth="6xl"
        >
          <div className="flex h-[70vh] -m-6 divide-x divide-border">
            {/* Sidebar Categories */}
            <div className="w-64 flex flex-col bg-muted/10">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Filtrer..." 
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs outline-none focus:border-accent"
                    value={chartSearch}
                    onChange={(e) => setChartSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                {CHART_CATEGORIES.map(cat => (
                  <button 
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all",
                      selectedCategory === cat.name ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <cat.icon className="w-4 h-4 shrink-0" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Gallery */}
            <div className="flex-1 overflow-y-auto p-8 bg-background">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGalleryTypes.map(t => (
                  <button 
                    key={t.label}
                    onClick={() => {
                      setChartType(t.type);
                      setChartLabel(t.label);
                      setIsGalleryOpen(false);
                    }}
                    className={cn(
                      "group p-4 rounded-3xl border-2 transition-all text-left space-y-4 hover:shadow-2xl hover:shadow-accent/10 active:scale-95",
                      chartType === t.type ? "border-accent bg-accent/5" : "border-border bg-background hover:border-accent/40"
                    )}
                  >
                    <div className="aspect-[16/10] bg-muted rounded-2xl overflow-hidden border border-border relative">
                      <img 
                        src={getChartImageUrl(t.label, 400, 250)} 
                        alt={t.label}
                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      {chartType === t.type && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-xl scale-110">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-foreground tracking-tight">{t.label}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">D3.js</span>
                        <div className="w-0.5 h-0.5 rounded-full bg-border"></div>
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{t.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>

        {/* Save Chart Modal */}
        <Modal 
          isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        title="Save Chart"
      >
        <form onSubmit={handleSave} className="space-y-8">
          <FormSection label="Chart Name">
            <FormInput 
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              placeholder="e.g. Sales by Region" 
              required
            />
          </FormSection>

          <FormActions>
            <FormButton variant="secondary" type="button" onClick={() => setIsSaveModalOpen(false)} className="flex-1">
              Cancel
            </FormButton>
            <FormButton type="submit" className="flex-1">
              Save Chart
            </FormButton>
          </FormActions>
        </form>
      </Modal>

      {/* Calculated Column Modal */}
      <Modal 
        isOpen={isCalcModalOpen} 
        onClose={() => setIsCalcModalOpen(false)} 
        title="Add Calculated Column"
      >
        <div className="space-y-8">
          <FormSection label="Column Name">
            <FormInput 
              value={calcColName}
              onChange={(e) => setCalcColName(e.target.value)}
              placeholder="e.g. total_revenue" 
            />
          </FormSection>
          <FormSection label="SQL Expression">
            <FormTextarea 
              value={calcColSql}
              onChange={(e) => setCalcColSql(e.target.value)}
              placeholder="e.g. price * quantity" 
              className="h-32"
            />
          </FormSection>
          <FormActions>
            <FormButton variant="secondary" type="button" onClick={() => setIsCalcModalOpen(false)} className="flex-1">
              Cancel
            </FormButton>
            <FormButton onClick={handleAddCalculatedColumn} className="flex-1">
              Add Column
            </FormButton>
          </FormActions>
        </div>
      </Modal>
    </DragDropContext>
  );
};
