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
  Palette
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { executeQuery, getTables, getTableSchema, saveChart } from '../lib/db';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { D3Chart } from '../components/D3Chart';
import { HighchartsChart } from '../components/HighchartsChart';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const FieldItem = ({ id, name, type, index }: any) => (
  <Draggable draggableId={id} index={index}>
    {(provided) => (
      <div 
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100 hover:border-accent hover:shadow-xl hover:shadow-accent/5 cursor-grab active:cursor-grabbing group transition-all mb-3"
      >
        <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase tracking-tighter group-hover:bg-accent group-hover:text-accent-foreground transition-all">
          {type.substring(0, 3)}
        </div>
        <span className="text-xs text-slate-600 font-bold truncate flex-1 group-hover:text-slate-900">{name}</span>
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
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm group hover:border-accent transition-all">
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
    <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{metric.column}</span>
    <button onClick={onRemove} className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
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
              : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
          )}
        >
          {items.length === 0 ? (
            <div className="m-auto flex flex-col items-center gap-2 opacity-20">
              <Plus className="w-5 h-5 text-slate-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Drop Zone</span>
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
                <div key={item} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm group hover:border-accent transition-all">
                  <span className="text-xs font-bold text-slate-700">{item}</span>
                  <button onClick={() => onRemove(item)} className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
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
  const [engine, setEngine] = React.useState<'d3' | 'highcharts'>('d3');
  
  const [calcColName, setCalcColName] = React.useState('');
  const [calcColSql, setCalcColSql] = React.useState('');

  // Customization options
  const [customConfig, setCustomConfig] = React.useState({
    showLegend: true,
    showGrid: true,
    colorScheme: 'Superset Colors',
    labelType: 'Category Name',
    numberFormat: 'Adaptive formatting',
    showCellBars: true,
    pageLength: 10,
    searchBox: true
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
      <div className="flex h-full bg-slate-50 overflow-hidden">
        {/* Left Sidebar: Source & Fields */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chart Source</label>
              <button className="p-1 text-slate-400 hover:text-slate-900">
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Database className="w-4 h-4 text-prism-600" />
              <span className="text-sm font-bold text-slate-700 truncate">{selectedTable}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {/* Metrics Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metrics</label>
                <button 
                  onClick={() => setIsCalcModalOpen(true)}
                  className="p-1 text-prism-600 hover:bg-prism-50 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                {schema.filter(s => s.type === 'number' || s.type === 'calculated').map((col, i) => (
                  <div key={col.name} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 group cursor-default">
                    <div className="w-5 h-5 rounded bg-prism-50 flex items-center justify-center text-[8px] font-bold text-prism-600 uppercase">fx</div>
                    <span className="text-xs font-medium text-slate-600 truncate flex-1">{col.displayName || col.name}</span>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Columns</label>
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
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="flex p-2 bg-slate-50/50 m-4 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setActiveConfigTab('data')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                activeConfigTab === 'data' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Data
            </button>
            <button 
              onClick={() => setActiveConfigTab('customize')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                activeConfigTab === 'customize' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visualization Type</label>
                    <button onClick={() => navigate('/chart/add')} className="text-[10px] font-bold text-prism-600 hover:underline">View all charts</button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-prism-600 text-white flex items-center justify-center">
                      <BarChartIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900">{chartType} Chart</h4>
                      <p className="text-[10px] text-slate-500">D3.js Rendering</p>
                    </div>
                  </div>
                </div>

                {/* Time Section */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Time</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Column</label>
                      <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                        <option>No filter</option>
                        {schema.filter(s => s.type === 'date' || s.type === 'timestamp').map(s => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Grain</label>
                      <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                        <option>Day</option>
                        <option>Week</option>
                        <option>Month</option>
                        <option>Year</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Range</label>
                      <button className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-left text-slate-600 hover:border-prism-500 transition-all">
                        Last week
                      </button>
                    </div>
                  </div>
                </div>

                {/* Query Section */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Query</h3>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                      <button className="px-3 py-1 text-[10px] font-bold bg-white text-prism-600 rounded-md shadow-sm">Aggregate</button>
                      <button className="px-3 py-1 text-[10px] font-bold text-slate-400">Raw records</button>
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filters</label>
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">Drop columns/metrics here</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Row Limit</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                      <option>1000</option>
                      <option>5000</option>
                      <option>10000</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Customize Tab Content */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-prism-600" />
                      Chart Options
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">Show Legend</span>
                        <input 
                          type="checkbox" 
                          checked={customConfig.showLegend}
                          onChange={(e) => setCustomConfig({ ...customConfig, showLegend: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-prism-600 focus:ring-prism-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">Show Grid</span>
                        <input 
                          type="checkbox" 
                          checked={customConfig.showGrid}
                          onChange={(e) => setCustomConfig({ ...customConfig, showGrid: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-prism-600 focus:ring-prism-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Color Scheme</label>
                        <select 
                          value={customConfig.colorScheme}
                          onChange={(e) => setCustomConfig({ ...customConfig, colorScheme: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                        >
                          <option>Superset Colors</option>
                          <option>Prism Theme</option>
                          <option>Vibrant</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-prism-600" />
                      Visual Formatting
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">Show cell bars</span>
                        <input 
                          type="checkbox" 
                          checked={customConfig.showCellBars}
                          onChange={(e) => setCustomConfig({ ...customConfig, showCellBars: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-prism-600 focus:ring-prism-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50/50">
            <button 
              onClick={handleRun}
              disabled={isExecuting || xAxis.length === 0 || yAxis.length === 0}
              className="w-full py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className={cn("w-4 h-4", isExecuting && "animate-spin")} />
              Update Chart
            </button>
          </div>
        </aside>

        {/* Main Panel: Preview & Results */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Topbar */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/charts')}
                className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">{chartName || 'Untitled Intelligence'}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Draft Visualization</span>
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/sql-lab')}
                className="px-4 py-2 text-slate-500 text-xs font-bold hover:text-slate-900 transition-all flex items-center gap-2"
              >
                <Database className="w-3.5 h-3.5" />
                SQL Lab
              </button>
              <div className="h-6 w-px bg-slate-100 mx-1"></div>
              <button 
                onClick={() => handleSave()}
                className="flex items-center gap-2 px-8 py-2.5 bg-accent text-accent-foreground rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-xl shadow-accent/10 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Publish
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setActivePreviewTab('preview')}
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-widest transition-all pb-4 -mb-4 border-b-2",
                        activePreviewTab === 'preview' ? "border-prism-500 text-prism-600" : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Results
                    </button>
                    <button 
                      onClick={() => setActivePreviewTab('data')}
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-widest transition-all pb-4 -mb-4 border-b-2",
                        activePreviewTab === 'data' ? "border-prism-500 text-prism-600" : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Samples
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{results.length} rows</span>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">0.123s</span>
                  </div>
                </div>

                <div className="flex-1 min-h-0 p-6">
                  {activePreviewTab === 'preview' ? (
                    <div className="w-full h-full">
                      {error ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                          <h4 className="font-bold text-slate-900">Query Error</h4>
                          <p className="text-sm text-slate-500 max-w-md mt-2">{error}</p>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                            <BarChartIcon className="w-8 h-8 text-slate-200" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">No data to display</h4>
                            <p className="text-xs text-slate-500 mt-1">Configure your query and click "Update Chart"</p>
                          </div>
                        </div>
                      ) : (
                        <D3Chart 
                          data={results}
                          type={chartType}
                          xAxis={xAxis[0]}
                          yAxis={yAxis.map(m => m.alias)}
                          config={customConfig}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full overflow-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                          <tr>
                            {schema.map(col => (
                              <th key={col.name} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                {col.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(activePreviewTab === 'data' ? sampleRows : results).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              {schema.map(col => (
                                <td key={col.name} className="px-4 py-3 text-xs text-slate-600 border-b border-slate-50">
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
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
                  <button 
                    onClick={handleRun}
                    disabled={isExecuting || xAxis.length === 0 || yAxis.length === 0}
                    className="flex items-center gap-2 px-8 py-2 bg-prism-600 text-white rounded-xl text-xs font-bold hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 disabled:opacity-50 active:scale-95"
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
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Chart Name</label>
            <input 
              type="text" 
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              placeholder="e.g. Sales by Region" 
              className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none"
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsSaveModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
            >
              Save Chart
            </button>
          </div>
        </form>
      </Modal>

      {/* Calculated Column Modal */}
      <Modal 
        isOpen={isCalcModalOpen} 
        onClose={() => setIsCalcModalOpen(false)} 
        title="Add Calculated Column"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Column Name</label>
            <input 
              type="text" 
              value={calcColName}
              onChange={(e) => setCalcColName(e.target.value)}
              placeholder="e.g. total_revenue" 
              className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">SQL Expression</label>
            <textarea 
              value={calcColSql}
              onChange={(e) => setCalcColSql(e.target.value)}
              placeholder="e.g. price * quantity" 
              className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none h-32 resize-none"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsCalcModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddCalculatedColumn}
              className="flex-1 py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
            >
              Add Column
            </button>
          </div>
        </div>
      </Modal>
    </DragDropContext>
  );
};
