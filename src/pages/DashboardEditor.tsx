import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Layout as LayoutIcon, 
  Type, 
  GripVertical, 
  X, 
  BarChart, 
  Columns as ColumnsIcon, 
  Rows, 
  FileText,
  Divide,
  Layers,
  Palette,
  Search,
  Eye,
  Trash2
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getCharts, saveDashboard, getDashboard } from '../lib/db';
import { DashboardChart } from '../components/DashboardChart';
import { Badge } from '../components/Badge';
import { 
  isValidChild, 
  Layout, 
  LayoutItem, 
  DASHBOARD_GRID_ID, 
  normalizeLayout, 
  denormalizeLayout, 
  moveItem,
  createItem
} from '../lib/dashboardLayout';
import { cn } from '../lib/utils';

const ITEM_TYPE = 'DASHBOARD_ITEM';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const ELEMENT_TYPES = [
  { type: 'header', icon: Type, label: 'En-tête' },
  { type: 'markdown', icon: FileText, label: 'Texte Libre' },
  { type: 'divider', icon: Divide, label: 'Séparateur' },
  { type: 'row', icon: Rows, label: 'Ligne' },
  { type: 'column', icon: ColumnsIcon, label: 'Colonne' },
  { type: 'tabs', icon: Layers, label: 'Onglets' },
];

const GRID_CLASSES: Record<number, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
};

/**
 * DropZone Component: Simplified and Robust
 */
const DropZone = ({ 
  parentId, 
  index, 
  onDrop,
  layout,
  horizontal = false
}: { 
  parentId: string; 
  index: number; 
  onDrop: (id: string, sourceParentId: string, targetParentId: string, targetIndex: number, newItem?: any) => void;
  layout: Layout;
  horizontal?: boolean;
}) => {
  const [{ isOver, canDrop, isDraggingSomething }, drop] = useDrop({
    accept: ITEM_TYPE,
    canDrop: (item: any) => {
      if (item.id === parentId) return false;
      const itemType = item.newItem ? item.newItem.type : layout[item.id]?.type;
      const p = layout[parentId];
      if (!p) return false;
      return isValidChild(itemType, p.type);
    },
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      onDrop(item.id, item.parentId, parentId, index, item.newItem);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
      isDraggingSomething: !!monitor.getItem(),
    }),
  });

  return (
    <div 
      ref={drop as any}
      className={cn(
        "transition-all duration-300 relative z-10",
        horizontal ? "w-4 -mx-2 h-full" : "h-4 -my-2 w-full",
        isDraggingSomething ? "z-20" : "z-10"
      )}
    >
      <AnimatePresence>
        {isDraggingSomething && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute inset-0 transition-colors duration-200 rounded-full",
              isOver 
                ? (canDrop ? "bg-accent/30" : "bg-rose-500/20") 
                : (canDrop ? "bg-accent/5" : "transparent")
            )}
          >
            {isOver && canDrop && (
              <motion.div 
                layoutId="drop-indicator"
                className={cn(
                  "absolute bg-accent shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                  horizontal 
                    ? "left-1/2 -translate-x-1/2 top-4 bottom-4 w-1 rounded-full" 
                    : "top-1/2 -translate-y-1/2 left-4 right-4 h-1 rounded-full"
                )}
              />
            )}
            {isOver && !canDrop && (
              <div className="absolute inset-0 flex items-center justify-center">
                <X className="w-3 h-3 text-rose-500 opacity-50" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * DashboardItem: Modular and clean
 */
const DashboardItem = ({ 
  id, 
  index, 
  layout, 
  onDrop, 
  onRemove, 
  onUpdate, 
  onUpdateMeta,
  parentType
}: { 
  id: string; 
  index: number;
  layout: Layout;
  onDrop: (id: string, sourceParentId: string, targetParentId: string, targetIndex: number, newItem?: any) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onUpdateMeta: (id: string, meta: any) => void;
  parentType?: string;
}) => {
  const item = layout[id];
  if (!item) return null;

  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<'h' | 'v' | null>(null);
  const startPos = useRef<{ x: number, y: number, w: number, h: number } | null>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id, parentId: item.parents[0], type: item.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleResizeStart = (e: React.MouseEvent, direction: 'h' | 'v') => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = direction;
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      w: item.meta?.width || 12,
      h: item.meta?.height || 300
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = direction === 'h' ? 'col-resize' : 'row-resize';
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing.current || !startPos.current || !containerRef.current) return;

    if (isResizing.current === 'h') {
      const parentWidth = containerRef.current.parentElement?.clientWidth || 1200;
      const unit = parentWidth / 12;
      const dx = e.clientX - startPos.current.x;
      const dw = Math.round(dx / unit);
      const newWidth = Math.max(1, Math.min(12, startPos.current.w + dw));
      if (newWidth !== item.meta?.width) {
        onUpdateMeta(item.id, { width: newWidth });
      }
    } else {
      const dy = e.clientY - startPos.current.y;
      const newHeight = Math.max(50, startPos.current.h + dy);
      onUpdateMeta(item.id, { height: newHeight });
    }
  };

  const handleResizeEnd = () => {
    isResizing.current = null;
    startPos.current = null;
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'default';
  };

  const gridClass = GRID_CLASSES[item.meta?.width || 12];

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col relative transition-all duration-300",
        parentType === 'row' ? gridClass : "w-full",
        isDragging ? "opacity-20 scale-95" : "opacity-100"
      )}
    >
      <DropZone 
        parentId={item.parents[0]} 
        index={index} 
        onDrop={onDrop} 
        layout={layout} 
        horizontal={parentType === 'row'} 
      />
      
      <div className={cn(
        "group relative flex-1 border transition-all duration-300",
        item.type === 'row' || item.type === 'column' || item.type === 'tabs' 
          ? "bg-muted/30 border-border p-4 rounded-xl" 
          : "bg-background border-border p-6 rounded-xl hover:border-accent hover:shadow-xl hover:shadow-accent/5",
      )}
      style={{ height: (item.type === 'chart' || item.type === 'row' || item.type === 'column') ? (item.meta?.height || 300) : undefined }}
      >
        {/* Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <button ref={drag as any} className="p-1.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing bg-background border border-border rounded-lg shadow-sm">
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onRemove(item.id)} className="p-1.5 text-muted-foreground hover:text-rose-500 bg-background border border-border rounded-lg shadow-sm">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Resize Handles */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-accent/10 transition-all z-40"
          onMouseDown={(e) => handleResizeStart(e, 'h')}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-row-resize opacity-0 group-hover:opacity-100 hover:bg-accent/10 transition-all z-40"
          onMouseDown={(e) => handleResizeStart(e, 'v')}
        />
        <div 
          className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 z-50"
          onMouseDown={(e) => handleResizeStart(e, 'v')} // Using v for now, or could implement dual
        />

        {/* Content */}
        {item.type === 'header' && (
          <input 
            value={item.content}
            onChange={(e) => onUpdate(item.id, { content: e.target.value })}
            className="w-full text-3xl font-bold bg-transparent outline-none tracking-tight text-foreground"
            placeholder="Titre de section..."
          />
        )}

        {item.type === 'markdown' && (
          <textarea 
            value={item.content}
            onChange={(e) => onUpdate(item.id, { content: e.target.value })}
            className="w-full min-h-[100px] p-4 bg-muted border-none rounded-lg text-sm text-foreground/80 outline-none focus:bg-background focus:ring-1 focus:ring-accent/20 transition-all resize-none"
            placeholder="Saisissez votre texte Markdown ici..."
          />
        )}

        {item.type === 'divider' && <div className="py-4"><div className="w-full h-px bg-border" /></div>}

        {item.type === 'chart' && item.content && (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h4 className="text-base font-bold text-foreground">{item.content.name}</h4>
              <p className="text-[10px] text-muted-foreground">{item.content.chart_type} • {item.content.table_name}</p>
            </div>
            <div className="flex-1 min-h-[200px]">
              <DashboardChart chart={item.content} />
            </div>
          </div>
        )}

        {(item.type === 'row' || item.type === 'column') && (
          <div className={cn(
            "flex gap-4 relative min-h-[60px]",
            item.type === 'row' ? "flex-row flex-wrap" : "flex-col"
          )}>
            {item.children.map((childId, i) => (
              <DashboardItem 
                key={childId} 
                id={childId} 
                index={i} 
                layout={layout}
                onDrop={onDrop}
                onRemove={onRemove}
                onUpdate={onUpdate}
                onUpdateMeta={onUpdateMeta}
                parentType={item.type}
              />
            ))}
            <DropZone parentId={item.id} index={item.children.length} onDrop={onDrop} layout={layout} horizontal={item.type === 'row'} />
          </div>
        )}

        {item.type === 'tabs' && (
          <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-1 border-b border-border overflow-x-auto custom-scrollbar">
              {item.children.map((tabId, i) => (
                <div key={tabId} className="flex items-center group/tab relative">
                  <button
                    onClick={() => setActiveTab(i)}
                    className={cn(
                      "px-4 py-2 text-xs font-bold transition-all border-b-2 pr-8 whitespace-nowrap",
                      activeTab === i ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {activeTab === i ? (
                      <input 
                        value={layout[tabId]?.meta?.title || ''}
                        onChange={(e) => onUpdateMeta(tabId, { title: e.target.value })}
                        className="bg-transparent border-none focus:ring-0 p-0 w-24 text-accent font-bold"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      layout[tabId]?.meta?.title || `Onglet ${i + 1}`
                    )}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.children.length > 1) {
                        onRemove(tabId);
                        if (activeTab >= item.children.length - 1) setActiveTab(Math.max(0, item.children.length - 2));
                      }
                    }}
                    className="absolute right-2 p-1 text-muted-foreground hover:text-rose-500 opacity-0 group-hover/tab:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newTabId = generateId();
                  onUpdate(item.id, { 
                    children: [...item.children, newTabId] 
                  });
                  onUpdate(newTabId, {
                    id: newTabId,
                    type: 'tab',
                    children: [],
                    parents: [item.id],
                    meta: { title: `Onglet ${item.children.length + 1}` }
                  });
                }}
                className="p-2 text-muted-foreground hover:text-accent transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {item.children[activeTab] && (
                <div className="flex flex-col gap-4 min-h-[100px]">
                   {layout[item.children[activeTab]]?.children.map((childId, i) => (
                    <DashboardItem 
                      key={childId} 
                      id={childId} 
                      index={i} 
                      layout={layout}
                      onDrop={onDrop}
                      onRemove={onRemove}
                      onUpdate={onUpdate}
                      onUpdateMeta={onUpdateMeta}
                      parentType="column"
                    />
                  ))}
                  <DropZone parentId={item.children[activeTab]} index={layout[item.children[activeTab]]?.children.length || 0} onDrop={onDrop} layout={layout} />
                  {layout[item.children[activeTab]]?.children.length === 0 && (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl p-8 text-muted-foreground/40 italic text-xs">
                      Glissez des éléments ici
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardEditorInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [layout, setLayout] = useState<Layout>({});
  const [charts, setCharts] = useState<any[]>([]);
  const [dashboardName, setDashboardName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'elements' | 'charts'>('elements');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const availableCharts = await getCharts();
    setCharts(availableCharts);

    if (id && id !== 'new') {
      const dashboard = await getDashboard(id);
      if (dashboard) {
        setDashboardName(dashboard.name);
        setLayout(normalizeLayout(dashboard.layout || []));
      }
    } else {
      // Start truly fresh with just the root grid
      setLayout(normalizeLayout([]));
    }
  };

  const handleMoveItem = (id: string, sourceParentId: string, targetParentId: string, targetIndex: number, newItem?: any) => {
    setLayout(prev => moveItem(prev, id, sourceParentId, targetParentId, targetIndex, newItem));
  };

  const removeElement = (id: string) => {
    setLayout(prev => {
      const next = { ...prev };
      const item = next[id];
      if (!item) return prev;
      
      const parentId = item.parents[0];
      if (parentId && next[parentId]) {
        next[parentId].children = next[parentId].children.filter(cid => cid !== id);
      }
      
      delete next[id];
      return next;
    });
  };

  const updateElement = (id: string, updates: any) => {
    setLayout(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const updateElementMeta = (id: string, meta: any) => {
    setLayout(prev => ({
      ...prev,
      [id]: { ...prev[id], meta: { ...prev[id].meta, ...meta } }
    }));
  };

  const handleSave = async () => {
    if (!dashboardName) return;
    setIsSaving(true);
    try {
      const nestedLayout = denormalizeLayout(layout);
      await saveDashboard({
        id: id === 'new' ? generateId() : id,
        name: dashboardName,
        layout: nestedLayout
      });
      navigate('/dashboards');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-72 bg-background border-r border-border flex flex-col shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate('/dashboards')} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Éditeur</h1>
          </div>

          <div className="flex p-1 bg-muted/30 rounded-xl mb-6 border border-border">
            <button 
              onClick={() => setSidebarTab('elements')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                sidebarTab === 'elements' ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Éléments
            </button>
            <button 
              onClick={() => setSidebarTab('charts')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                sidebarTab === 'charts' ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Graphiques
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          {sidebarTab === 'elements' ? (
            <div className="grid grid-cols-2 gap-3">
              {ELEMENT_TYPES.map((el) => (
                <SidebarItem key={el.type} type={el.type} label={el.label} icon={el.icon} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {charts.map((chart) => (
                <SidebarChartItem key={chart.id} chart={chart} />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border">
          <button 
            onClick={handleSave}
            disabled={isSaving || !dashboardName}
            className="btn-primary w-full py-3.5"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-muted/10 overflow-hidden relative">
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-8 shrink-0">
          <input 
            type="text" 
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="text-lg font-bold bg-transparent border-none focus:ring-0 p-0 text-foreground w-96"
            placeholder="Nom du tableau de bord..."
          />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground h-auto bg-muted px-2 py-1 rounded border border-border">V2.0 ALPHA</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-64">
            {layout[DASHBOARD_GRID_ID]?.children.length === 0 ? (
              <div className="min-h-[400px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground gap-4 bg-background/50">
                <Plus className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">Déposez des éléments ici pour commencer</p>
                <DropZone parentId={DASHBOARD_GRID_ID} index={0} onDrop={handleMoveItem} layout={layout} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {layout[DASHBOARD_GRID_ID]?.children.map((childId, index) => (
                  <DashboardItem 
                    key={childId}
                    id={childId}
                    index={index}
                    layout={layout}
                    onDrop={handleMoveItem}
                    onRemove={removeElement}
                    onUpdate={updateElement}
                    onUpdateMeta={updateElementMeta}
                  />
                ))}
                <DropZone parentId={DASHBOARD_GRID_ID} index={layout[DASHBOARD_GRID_ID]?.children.length || 0} onDrop={handleMoveItem} layout={layout} />
              </div>
            )}
          </div>
        </div>

        {/* Brand Overlay */}
        <div className="absolute bottom-10 right-10 flex flex-col items-end pointer-events-none opacity-5">
          <span className="text-6xl font-black text-foreground leading-none">KWAKU</span>
          <span className="text-[10px] font-mono tracking-[0.5em] text-foreground mt-2 italic">INTELLIGENCE_ENGINE</span>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ type, label, icon: Icon }: { type: string, label: string, icon: any }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ id: generateId(), parentId: 'NEW', newItem: createItem(type) }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-4 bg-background border border-border rounded-xl cursor-grab active:cursor-grabbing transition-all hover:border-accent hover:shadow-md",
        isDragging && "opacity-30"
      )}
    >
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
};

const SidebarChartItem = ({ chart }: { chart: any }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ id: generateId(), parentId: 'NEW', newItem: createItem('chart', chart) }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={cn(
        "flex items-center gap-3 p-3 bg-background border border-border rounded-xl cursor-grab active:cursor-grabbing transition-all hover:border-accent hover:shadow-md group",
        isDragging && "opacity-30"
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <BarChart className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-foreground truncate">{chart.name}</p>
        <p className="text-[9px] text-muted-foreground truncate">{chart.chart_type} • {chart.table_name}</p>
      </div>
    </div>
  );
};

export const DashboardEditor = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardEditorInner />
    </DndProvider>
  );
};
