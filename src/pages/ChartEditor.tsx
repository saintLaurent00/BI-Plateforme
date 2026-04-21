import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  ChevronLeft, 
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
  Loader2
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { 
  FormSection, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormActions, 
  FormButton,
  FormLabel
} from '../components/FormElements';
import { executeQuery, getTables, getTableSchema, saveChart } from '../lib/db';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { D3Chart } from '../components/D3Chart';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { KwakuInsight } from '../components/KwakuInsight';
import { kwakuService } from '../services/kwakuService';
import { toast } from 'sonner';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const FieldItem = ({ id, name, type, index }: any) => (
  <Draggable draggableId={id} index={index}>
    {(provided) => (
      <div 
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-xl hover:shadow-accent/5 cursor-grab active:cursor-grabbing group transition-all mb-3"
      >
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground" />
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[8px] font-black text-muted-foreground uppercase tracking-tighter group-hover:bg-accent group-hover:text-accent-foreground transition-all">
          {type.substring(0, 3)}
        </div>
        <span className="text-xs text-muted-foreground font-bold truncate flex-1 group-hover:text-foreground">{name}</span>
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
  <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-xl shadow-sm group hover:border-accent transition-all">
    <select 
      value={metric.agg}
      onChange={(e) => onUpdateAgg(e.target.value)}
      className="text-[9px] font-black text-accent bg-accent/5 border-none outline-none rounded-lg px-2 py-0.5 cursor-pointer uppercase tracking-widest"
    >
      <option value="SUM">SUM</option>
      <option value="AVG">AVG</option>
      <option value="COUNT">COUNT</option>
      <option value="MIN">MIN</option>
      <option value="MAX">MAX</option>
      <option value="NONE">NONE</option>
    </select>
    <span className="text-xs font-bold text-foreground truncate max-w-[100px]">{metric.column}</span>
    <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all">
      <X className="w-3 h-3" />
    </button>
  </div>
);

const DropZone = ({ id, label, icon: Icon, items = [], onRemove, onUpdateAgg, isMetric = false }: any) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      </div>
    </div>
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            "min-h-[80px] p-3 border-2 border-dashed rounded-[24px] flex flex-wrap gap-2 transition-all duration-500",
            snapshot.isDraggingOver 
              ? "bg-accent/5 border-accent ring-8 ring-accent/5 scale-[1.02]" 
              : "bg-muted/30 border-border hover:border-border/80"
          )}
        >
          {items.length === 0 ? (
            <div className="m-auto flex flex-col items-center gap-2 opacity-20">
              <Plus className="w-5 h-5 text-muted-foreground" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Drop Zone</span>
            </div>
          ) : (
            items.map((item: any, i: number) => (
              isMetric ? (
                <MetricItem 
                  key={item.alias} 
                  metric={item} 
                  onRemove={() => onRemove(item)} 
                  onUpdateAgg={(agg) => onUpdateAgg(item, agg)} 
                />
              ) : (
                <div key={item} className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-xl shadow-sm group hover:border-accent transition-all">
                  <span className="text-xs font-bold text-foreground">{item}</span>
                  <button onClick={() => onRemove(item)} className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            ))
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

export const ChartEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeConfigTab, setActiveConfigTab] = React.useState<'data' | 'customize'>('data');
  const [activePreviewTab, setActivePreviewTab] = React.useState<'preview' | 'data' | 'sql'>('preview');
  
  const [tables, setTables] = React.useState<string[]>([]);
  const [selectedTable, setSelectedTable] = React.useState<string>(searchParams.get('table') || '');
  const [schema, setSchema] = React.useState<any[]>([]);
  const [xAxis, setXAxis] = React.useState<string[]>([]);
  const [yAxis, setYAxis] = React.useState<Metric[]>([]);
  const [chartType, setChartType] = React.useState<any>(searchParams.get('type') || 'Bar');
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
      const rec = await kwakuService.getChartRecommendation(schema);
      if (rec) {
        setChartType(rec.chartType || 'Bar');
        if (rec.xAxis && schema.find(s => s.name === rec.xAxis)) {
          setXAxis([rec.xAxis]);
        }
        if (rec.yAxis && schema.find(s => s.name === rec.yAxis)) {
          setYAxis([{ column: rec.yAxis, agg: 'SUM', alias: rec.yAxis }]);
        }
        toast.success(`Kwaku recommande : ${rec.chartType}`, {
          description: rec.reasoning
        });
      }
    } catch (err) {
      console.error('Recommendation failed:', err);
      toast.error('Kwaku n\'a pas pu générer de recommandation.');
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
    loadTables();
  }, []);

  React.useEffect(() => {
    if (selectedTable) {
      loadSchema(selectedTable);
    }
  }, [selectedTable]);

  // Auto-run query when axes change
  React.useEffect(() => {
    if (xAxis.length > 0 && yAxis.length > 0) {
      handleRun();
    } else {
      setResults([]);
    }
  }, [xAxis, yAxis, chartType]);

  const loadTables = async () => {
    const t = await getTables();
    setTables(t);
    if (!selectedTable && t.length > 0) {
      setSelectedTable(t[0]);
    }
  };

  const loadSchema = async (tableName: string) => {
    const s = await getTableSchema(tableName);
    setSchema(s);
    
    // Fetch sample rows
    try {
      const sample = await executeQuery(`SELECT * FROM "${tableName}" LIMIT 100;`);
      setSampleRows(sample);
    } catch (err) {
      setSampleRows([]);
    }
  };

  const generateSql = () => {
    if (!selectedTable || xAxis.length === 0 || yAxis.length === 0) return '';
    const x = xAxis[0];
    const y = yAxis.map(m => {
      const colExpr = m.column.startsWith('__calc__') 
        ? schema.find(s => s.name === m.column)?.sql 
        : `"${m.column}"`;
      
      if (m.agg === 'NONE') return `${colExpr} as "${m.alias}"`;
      return `${m.agg}(${colExpr}) as "${m.alias}"`;
    }).join(', ');
    
    const groupBy = xAxis.map(col => {
      const colExpr = col.startsWith('__calc__') 
        ? schema.find(s => s.name === col)?.sql 
        : `"${col}"`;
      return colExpr;
    }).join(', ');

    return `SELECT ${groupBy}, ${y} FROM "${selectedTable}" GROUP BY ${groupBy} LIMIT 1000;`;
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
        id: crypto.randomUUID(),
        name: chartName,
        tableName: selectedTable,
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full bg-background overflow-hidden">
        {/* Left Sidebar: Source & Fields */}
        <aside className="w-64 bg-background border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Chart Source</label>
              <button className="p-1 text-muted-foreground hover:text-foreground">
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
              <Database className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-foreground truncate">{selectedTable}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {/* Metrics Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Metrics</label>
                <button 
                  onClick={() => setIsCalcModalOpen(true)}
                  className="p-1 text-accent hover:bg-accent/10 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                {schema.filter(s => s.type === 'number' || s.type === 'calculated').map((col, i) => (
                  <div key={col.name} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/30 group cursor-default">
                    <div className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center text-[8px] font-bold text-accent uppercase">fx</div>
                    <span className="text-xs font-medium text-muted-foreground truncate flex-1">{col.displayName || col.name}</span>
                  </div>
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
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Columns</label>
                  <div className="space-y-0.5">
                    {schema.map((col, index) => (
                      <FieldItem 
                        key={col.name} 
                        id={col.name}
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
        <aside className="w-80 bg-background border-r border-border flex flex-col shrink-0">
          <div className="flex p-2 bg-muted/30 m-4 rounded-2xl border border-border">
            <button 
              onClick={() => setActiveConfigTab('data')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                activeConfigTab === 'data' ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Data
            </button>
            <button 
              onClick={() => setActiveConfigTab('customize')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                activeConfigTab === 'customize' ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Style
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {activeConfigTab === 'data' ? (
              <>
                {/* Visualization Type */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type de Visualisation</label>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                    <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                      <BarChartIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground">{chartType} Chart</h4>
                      <p className="text-[10px] text-muted-foreground">D3.js Rendering</p>
                    </div>
                  </div>
                </div>

                {/* Time Section */}
                <div className="space-y-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-bold text-foreground">Time</h3>
                  <div className="space-y-4">
                    <FormSection label="Time Column">
                      <FormSelect className="py-2.5 px-4 h-auto text-xs">
                        <option>No filter</option>
                        {schema.filter(s => s.type === 'date' || s.type === 'timestamp').map(s => (
                          <option key={s.name} value={s.name}>{s.name}</option>
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
                    label="X-Axis (Dimension)" 
                    icon={Activity} 
                    items={xAxis} 
                    onRemove={() => setXAxis([])} 
                  />
                  
                  <DropZone 
                    id="yAxis"
                    label="Metrics" 
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
              </>
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
                      <option>Prism Theme</option>
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

          <div className="p-6 border-t border-border bg-muted/30">
            <button 
              onClick={handleRun}
              disabled={isExecuting || xAxis.length === 0 || yAxis.length === 0}
              className="btn-primary w-full py-3 shadow-lg shadow-accent/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className={cn("w-4 h-4", isExecuting && "animate-spin")} />
              Update Chart
            </button>
          </div>
        </aside>

        {/* Main Panel: Preview & Results */}
        <main className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Topbar */}
          <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/charts')}
                className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-foreground tracking-tight">{chartName || 'Untitled Intelligence'}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">Draft Visualization</span>
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/sql-lab')}
                className="px-4 py-2 text-muted-foreground text-xs font-bold hover:text-foreground transition-all flex items-center gap-2"
              >
                <Database className="w-3.5 h-3.5" />
                SQL Lab
              </button>
              <div className="h-6 w-px bg-border mx-1"></div>
              <button 
                onClick={() => handleSave()}
                className="btn-primary px-8 py-2.5 shadow-xl shadow-accent/10"
              >
                <Save className="w-4 h-4" />
                Publish
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-muted/10">
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <div className="bg-background rounded-2xl shadow-sm border border-border flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setActivePreviewTab('preview')}
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-widest transition-all pb-4 -mb-4 border-b-2",
                        activePreviewTab === 'preview' ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Résultats
                    </button>
                    <button 
                      onClick={() => setActivePreviewTab('data')}
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-widest transition-all pb-4 -mb-4 border-b-2",
                        activePreviewTab === 'data' ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Échantillons
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{results.length} lignes</span>
                  </div>
                </div>

                <div className="flex-1 min-h-0 p-6">
                  {activePreviewTab === 'preview' ? (
                    <div className="w-full h-full">
                      {error ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                          <h4 className="font-bold text-foreground">Query Error</h4>
                          <p className="text-sm text-muted-foreground max-w-md mt-2">{error}</p>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <BarChartIcon className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">No data to display</h4>
                            <p className="text-xs text-muted-foreground mt-1">Configure your query and click "Update Chart"</p>
                          </div>
                        </div>
                      ) : (
                        <D3Chart 
                          data={results}
                          type={chartType === 'Custom D3' ? 'CustomD3' : chartType}
                          xAxis={xAxis[0]}
                          yAxis={yAxis.map(m => m.alias)}
                          config={customConfig}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full overflow-auto border border-border rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-muted z-10">
                          <tr>
                            {schema.map(col => (
                              <th key={col.name} className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border">
                                {col.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(activePreviewTab === 'data' ? sampleRows : results).map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                              {schema.map(col => (
                                <td key={col.name} className="px-4 py-3 text-xs text-foreground/80 border-b border-border/50">
                                  {String(row[col.name])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-center">
                  <button 
                    onClick={handleRun}
                    disabled={isExecuting || xAxis.length === 0 || yAxis.length === 0}
                    className="btn-primary"
                  >
                    {isExecuting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                    Update Chart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

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
