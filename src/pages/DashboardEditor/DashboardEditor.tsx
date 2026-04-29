import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight,
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
import { getCharts, saveDashboard, getDashboard } from '../../core/utils/db';
import { getChartPlugin } from '../../../plugins';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import { Badge } from '../../components/ui/Badge';
import { 
  isValidChild, 
  Layout, 
  LayoutItem, 
  DASHBOARD_GRID_ID, 
  normalizeLayout, 
  denormalizeLayout, 
  moveItem,
  createItem
} from '../../core/utils/dashboardLayout';
import { cn } from '../../core/utils/utils';

import { Stepper } from '../../components/ui/Stepper';

const ITEM_TYPE = 'DASHBOARD_ITEM';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const ELEMENT_TYPES = [
  { type: 'row', icon: Rows, label: 'Row', description: 'Create a horizontal section' },
  { type: 'column', icon: ColumnsIcon, label: 'Column', description: 'Stack items vertically' },
  { type: 'tabs', icon: Layers, label: 'Tabs', description: 'Group content in tabs' },
  { type: 'header', icon: Type, label: 'Header', description: 'Add a section title' },
  { type: 'markdown', icon: FileText, label: 'Markdown', description: 'Rich text content' },
  { type: 'divider', icon: Divide, label: 'Divider', description: 'Horizontal separator' },
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

  if (!isDraggingSomething) return null;

  return (
    <div 
      ref={drop as any}
      className={cn(
        "transition-all duration-300 relative group/drop",
        // Increase hit area significantly during drag
        horizontal ? "w-24 h-full -mx-12 z-[100]" : "h-24 w-full -my-12 z-[100]",
      )}
    >
      <div className={cn(
        "absolute inset-0 transition-all duration-300 pointer-events-none flex items-center justify-center",
        isDraggingSomething ? "opacity-100" : "opacity-0"
      )}>
        {/* Modern Superset-like indicator */}
        <div className={cn(
          "bg-accent/20 transition-all duration-300 rounded-full",
          horizontal 
            ? "w-1 h-[70%] my-auto" 
            : "h-1 w-[80%] mx-auto",
          isOver && "bg-accent w-1.5 h-[90%] scale-110 shadow-[0_0_30px_rgba(6,182,212,0.9)]"
        )} />
        
        {isOver && canDrop && (
          <div className="absolute inset-0 bg-accent/5 rounded-3xl animate-pulse" />
        )}
      </div>
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
  const isResizing = useRef<'h' | 'v' | 'both' | null>(null);
  const startPos = useRef<{ x: number, y: number, w: number, h: number } | null>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id, parentId: item.parents[0], type: item.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleResizeStart = (e: React.MouseEvent, direction: 'h' | 'v' | 'both') => {
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
    
    const cursorMap: Record<string, string> = { h: 'col-resize', v: 'row-resize', both: 'nwse-resize' };
    document.body.style.cursor = cursorMap[direction];
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing.current || !startPos.current || !containerRef.current) return;

    const direction = isResizing.current;
    const updates: any = {};

    if (direction === 'h' || direction === 'both') {
      const parentWidth = containerRef.current.parentElement?.clientWidth || 1200;
      const unit = parentWidth / 12;
      const dx = e.clientX - startPos.current.x;
      const dw = Math.round(dx / unit);
      const newWidth = Math.max(1, Math.min(12, startPos.current.w + dw));
      if (newWidth !== item.meta?.width) {
        updates.width = newWidth;
      }
    }

    if (direction === 'v' || direction === 'both') {
      const dy = e.clientY - startPos.current.y;
      const newHeight = Math.max(80, startPos.current.h + dy);
      if (newHeight !== item.meta?.height) {
        updates.height = newHeight;
      }
    }

    if (Object.keys(updates).length > 0) {
      onUpdateMeta(item.id, updates);
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
        "group relative flex-1 border transition-all duration-300 backdrop-blur-xl",
        item.type === 'row' || item.type === 'column' || item.type === 'tabs' 
          ? "bg-muted/10 border-border/40 p-4 rounded-3xl" 
          : "bg-background/60 border-border/50 p-6 rounded-[32px] hover:border-accent hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-0.5",
      )}
      style={{ 
        height: (item.type === 'chart' || item.type === 'row' || item.type === 'column' || item.type === 'markdown') ? (item.meta?.height || (item.type === 'markdown' ? 150 : 300)) : undefined,
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
      }}
      >
        {/* Design Accents from BI code */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/50 via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-full" />

        {/* Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all z-50">
          <button ref={drag as any} className="p-3 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing bg-background shadow-xl border border-border rounded-xl ring-1 ring-black/5 hover:scale-110 transition-transform">
            <GripVertical className="w-5 h-5" />
          </button>
          <button onClick={() => onRemove(item.id)} className="p-3 text-muted-foreground hover:text-rose-500 bg-background shadow-xl border border-border rounded-xl ring-1 ring-black/5 hover:scale-110 transition-transform">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Resize Handles - Superset style */}
        {(item.type === 'chart' || item.type === 'row' || item.type === 'column' || item.type === 'markdown') && (
          <>
            {/* Bottom handle (Height) */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-4 cursor-row-resize hover:bg-accent/40 z-50 rounded-b-[32px] transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'v')}
            />
            
            {/* Right handle (Width) - Only if in a row */}
            {parentType === 'row' && (
              <div 
                className="absolute top-0 right-0 bottom-0 w-4 cursor-col-resize hover:bg-accent/40 z-50 rounded-r-[32px] transition-colors"
                onMouseDown={(e) => handleResizeStart(e, 'h')}
              />
            )}

            {/* Corner handle (Both) */}
            <div 
              className="absolute bottom-3 right-3 w-8 h-8 cursor-nwse-resize flex items-end justify-end p-1 opacity-0 group-hover:opacity-100 transition-opacity z-[60]"
              onMouseDown={(e) => handleResizeStart(e, 'both')}
            >
              <div className="w-4 h-4 border-r-2 border-b-2 border-muted-foreground/30 rounded-br-sm group-hover:border-accent transition-colors" />
            </div>
          </>
        )}

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
            "grid gap-4 relative min-h-[100px]",
            item.type === 'row' ? "grid-cols-12" : "grid-cols-1"
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

/**
 * TrashZone Component: Drag here to delete
 */
const TrashZone = ({ onDrop }: { onDrop: (id: string) => void }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: any) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && monitor.getItem()?.parentId !== 'NEW',
    }),
  });

  if (!canDrop && !isOver) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      ref={drop as any}
      className={cn(
        "h-20 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2",
        isOver ? "bg-rose-500/10 border-rose-500 scale-[1.02]" : "border-rose-500/20 bg-rose-500/5"
      )}
    >
      <Trash2 className={cn("w-5 h-5", isOver ? "text-rose-500 animate-bounce" : "text-rose-500/50")} />
      <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Supprimer</span>
    </motion.div>
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
  const [step, setStep] = useState(1);

  const [, dropMain] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      // Drop on background appends to the main grid
      handleMoveItem(item.id, item.parentId, DASHBOARD_GRID_ID, layout[DASHBOARD_GRID_ID]?.children.length || 0, item.newItem);
    }
  });

  const steps = [
    { id: 1, label: 'Informations' },
    { id: 2, label: 'Design' }
  ];

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
      {/* Sidebar - Only visible in Design Step */}
      <AnimatePresence>
        {step === 2 && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 bg-background border-r border-border flex flex-col shadow-sm z-20"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => setStep(1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
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
                <div className="flex flex-col gap-4">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Disposition</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {ELEMENT_TYPES.filter(el => ['row', 'column', 'tabs'].includes(el.type)).map((el) => (
                        <SidebarItem key={el.type} type={el.type} label={el.label} description={el.description} icon={el.icon} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Contenu</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {ELEMENT_TYPES.filter(el => !['row', 'column', 'tabs'].includes(el.type)).map((el) => (
                        <SidebarItem key={el.type} type={el.type} label={el.label} description={el.description} icon={el.icon} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {charts.map((chart) => (
                    <SidebarChartItem key={chart.id} chart={chart} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border space-y-4">
              <TrashZone onDrop={removeElement} />
              <button 
                onClick={handleSave}
                disabled={isSaving || !dashboardName}
                className="btn-primary w-full py-3.5"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-muted/10 overflow-hidden relative">
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            {step === 2 && (
              <h1 className="text-sm font-bold text-foreground truncate max-w-[200px]">{dashboardName}</h1>
            )}
            {step === 1 && (
               <button onClick={() => navigate('/dashboards')} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          <Stepper steps={steps} currentStep={step} className="max-w-md hidden lg:block" />

          <div className="flex items-center gap-4">
            {step === 1 ? (
              <button 
                disabled={!dashboardName}
                onClick={() => setStep(2)}
                className="btn-primary px-6 py-2"
              >
                Passer au Design
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground h-auto bg-muted px-2 py-1 rounded border border-border">MODE DESIGN</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}
          </div>
        </header>

        <div 
          ref={dropMain as any}
          className="flex-1 overflow-y-auto relative custom-scrollbar bg-muted/10 group/grid"
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex items-center justify-center p-12"
              >
                <div className="max-w-xl w-full bg-background border border-border shadow-2xl rounded-[48px] p-16 space-y-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:bg-accent/10 transition-colors" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <LayoutIcon className="w-5 h-5 text-accent" />
                      </div>
                      <Badge variant="info" className="text-[10px] uppercase font-black tracking-widest px-3">Initialisation</Badge>
                    </div>
                    <h2 className="text-4xl font-black text-foreground tracking-tight leading-[0.9]">Identité du Rapport</h2>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">Définissez le nom de votre tableau de bord stratégique pour commencer la phase de conception.</p>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="group">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-3 ml-1 transition-colors group-focus-within:text-accent">Désignation</label>
                      <input 
                        type="text" 
                        value={dashboardName}
                        onChange={(e) => setDashboardName(e.target.value)}
                        className="w-full text-2xl font-bold bg-muted border border-border rounded-3xl px-8 py-5 focus:bg-background focus:ring-8 focus:ring-accent/5 focus:border-accent outline-none transition-all placeholder:text-muted-foreground/20"
                        placeholder="Ex: Analyse Executive Q1..."
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="pt-4 relative z-10">
                    <button 
                      disabled={!dashboardName}
                      onClick={() => setStep(2)}
                      className="w-full btn-primary py-5 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-accent/20 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
                    >
                      Configurer le Design
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest mt-6">Propulsé par Hifadih BI Engine</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-12 min-h-full"
              >
                <div className="max-w-7xl mx-auto pb-64">
                  {layout[DASHBOARD_GRID_ID]?.children.length === 0 ? (
                    <div className="min-h-[500px] border-2 border-dashed border-border/40 rounded-[48px] flex flex-col items-center justify-center text-muted-foreground gap-6 bg-background shadow-inner transition-all hover:bg-muted/5 group">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Plus className="w-10 h-10 opacity-10" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Espace de travail vide</p>
                        <p className="text-xs text-muted-foreground/60 mt-2 font-medium">Glissez des éléments depuis la barre latérale</p>
                      </div>
                      <DropZone parentId={DASHBOARD_GRID_ID} index={0} onDrop={handleMoveItem} layout={layout} />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 relative">
                      {/* Vertical Grid Lines for visual rhythm */}
                      <div className="absolute inset-y-0 left-0 right-0 grid grid-cols-12 gap-4 pointer-events-none opacity-[0.02]">
                        {[...Array(12)].map((_, i) => <div key={i} className="border-x border-foreground" />)}
                      </div>
                      
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ type, label, description, icon: Icon }: { type: string, label: string, description?: string, icon: any }) => {
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
        "flex flex-col gap-2 p-4 bg-background border border-border rounded-2xl cursor-grab active:cursor-grabbing transition-all hover:border-accent hover:shadow-xl hover:-translate-y-1 group",
        isDragging && "opacity-30"
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
      </div>
      <div>
        <span className="text-[10px] font-black text-foreground uppercase tracking-wider block">{label}</span>
        {description && <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{description}</p>}
      </div>
    </div>
  );
};

const SidebarChartItem = ({ chart }: { chart: any }) => {
  const plugin = getChartPlugin(chart.chart_type);
  const metadata = plugin?.metadata;

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
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
        {metadata?.thumbnail ? (
          <img src={metadata.thumbnail} alt={chart.name} className="w-full h-full object-cover" />
        ) : (
          <BarChart className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
        )}
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
