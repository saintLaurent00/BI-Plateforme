import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Layout as LayoutIcon, 
  Type, 
  Minus, 
  GripVertical, 
  X, 
  BarChart, 
  Columns as ColumnsIcon, 
  Rows, 
  Hash,
  FileText,
  Divide,
  Layers,
  Settings2,
  Palette,
  Table as TableIcon,
  Search,
  Eye
} from 'lucide-react';
import { DndProvider, useDrag, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getCharts, saveDashboard, getDashboard } from '../lib/db';
import { supersetService } from '../services/supersetService';
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
  mapSupersetLayoutToPrism,
  mapPrismLayoutToSuperset
} from '../lib/dashboardLayout';
import ReactMarkdown from 'react-markdown';

import { animate, onScroll, stagger, createLayout, createDraggable } from 'animejs';

const ITEM_TYPE = 'DASHBOARD_ITEM';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface LayoutElement {
  id: string;
  type: 'chart' | 'header' | 'markdown' | 'divider' | 'row' | 'column' | 'tabs' | 'tab';
  content?: any;
  children?: LayoutElement[];
  meta?: {
    width?: number; // 1-12 for grid
    height?: number; // pixels
    title?: string;
    backgroundColor?: string;
  };
}

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

const DropZone = ({ 
  parentId, 
  index, 
  moveItem,
  layout,
  className,
  horizontal = false
}: { 
  parentId: string; 
  index: number; 
  moveItem: (id: string, sourceParentId: string, targetParentId: string, targetIndex: number, newItem?: any) => void;
  layout: Layout;
  className?: string;
  horizontal?: boolean;
}) => {
  const [{ isOver, canDrop, isDragging }, drop] = useDrop({
    accept: ITEM_TYPE,
    canDrop: (item: any) => {
      // Don't allow dropping an item into itself
      if (item.id === parentId) return false;
      
      // Get the type of the item being dragged
      const itemType = item.newItem ? item.newItem.type : layout[item.id]?.type;
      const p = layout[parentId];
      if (!p) return false;
      
      // Basic hierarchy validation
      const basicValid = isValidChild(itemType, p.type);
      if (!basicValid) return false;

      // Special check: don't allow dropping a parent into its own child (circularity)
      // This is unlikely in this UI but good practice
      let currentParent = p;
      while (currentParent) {
        if (currentParent.id === item.id) return false;
        const nextParentId = currentParent.parents[0];
        currentParent = nextParentId ? layout[nextParentId] : null as any;
      }

      return true;
    },
    drop: (item: any, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) return; // Nested drop zone handled it
      
      moveItem(item.id, item.parentId, parentId, index, item.newItem);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
      isDragging: !!monitor.getItem(),
    }),
  });

  // Dynamic sizing based on drag state to provide a "landing pad"
  const sizeClass = isDragging 
    ? (horizontal ? "w-32 -mx-16" : "h-32 -my-16") 
    : (horizontal ? "w-4" : "h-4");

  return (
    <div 
      ref={drop as any}
      className={cn(
        "transition-all duration-300 flex items-center justify-center relative z-40 group/dz",
        sizeClass,
        className
      )}
    >
      {/* Target Line - More prominent during hover */}
      <div className={cn(
        "transition-all duration-500 rounded-full",
        isOver && canDrop 
          ? (horizontal ? "w-1.5 h-full bg-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.2)]" : "h-1.5 w-full bg-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.2)]") 
          : (isDragging ? (horizontal ? "w-1 h-1/2 bg-slate-200" : "h-1 w-1/2 bg-slate-200") : "opacity-0 invisible")
      )} />
      
      {/* Magnetic Pulse effect when eligible */}
      {isDragging && canDrop && !isOver && (
        <div className={cn(
          "absolute inset-0 bg-slate-900/5 animate-pulse rounded-sm pointer-events-none",
          horizontal ? "mx-4" : "my-4"
        )} />
      )}
      
      {/* Drop Badge */}
      <AnimatePresence>
        {isOver && canDrop && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: horizontal ? 0 : 20, x: horizontal ? 20 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bg-slate-900 px-5 py-2.5 rounded-full border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 z-50 whitespace-nowrap"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Déposer Ici</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DashboardItem = ({ 
  id, 
  index, 
  layout, 
  moveItem, 
  removeElement, 
  updateElement, 
  updateElementMeta,
  setLayout,
  parentType
}: { 
  id: string; 
  index: number;
  layout: Layout;
  moveItem: (id: string, sourceParentId: string, targetParentId: string, targetIndex: number, newItem?: any) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: any) => void;
  updateElementMeta: (id: string, meta: any) => void;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
  parentType?: string;
}) => {
  const item = layout[id];
  if (!item) return null;

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { id, parentId: item.parents[0], type: item.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [activeTab, setActiveTab] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        ease: 'outQuart',
        delay: index * 100
      });
    }
  }, []);

  const handleResize = (delta: number, direction: 'h' | 'v') => {
    if (!containerRef.current) return;
    
    if (direction === 'h') {
      const containerWidth = containerRef.current.parentElement?.clientWidth || 1200;
      const unitWidth = containerWidth / 12;
      const currentWidth = item.meta?.width || 12;
      const newWidth = Math.max(1, Math.min(12, Math.round((currentWidth * unitWidth + delta) / unitWidth)));
      if (newWidth !== currentWidth) {
        updateElementMeta(item.id, { width: newWidth });
      }
    } else {
      const currentHeight = item.meta?.height || 300;
      const newHeight = Math.max(100, currentHeight + delta);
      updateElementMeta(item.id, { height: newHeight });
    }
  };

  const gridClass = GRID_CLASSES[item.meta?.width || 12];

  return (
    <div className={cn(
      parentType === 'row' ? gridClass : "w-full", 
      "flex dashboard-item-container transition-all duration-500", 
      parentType === 'row' ? "flex-row" : "flex-col",
      isDragging && "z-50 pointer-events-none"
    )}>
      <DropZone 
        parentId={item.parents[0]} 
        index={index} 
        moveItem={moveItem} 
        layout={layout} 
        horizontal={parentType === 'row'} 
        className={parentType === 'row' ? "h-full" : "w-full"}
      />
      <div 
        ref={(el) => {
          preview(el);
          (containerRef as any).current = el;
        }}
        className={cn(
          "group relative rounded-sm border transition-all duration-500 flex-1",
          isDragging ? "opacity-30 grayscale blur-[1px] rotate-1 scale-[0.98] shadow-none" : "opacity-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]",
          item.type === 'row' || item.type === 'column' || item.type === 'tabs' 
            ? "p-2 bg-slate-50 border-slate-200" 
            : "p-5 bg-white border-slate-200 hover:border-slate-800 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]",
        )}
        style={{ 
          backgroundColor: item.meta?.backgroundColor || undefined,
          height: (item.type === 'chart' || item.type === 'row' || item.type === 'column') ? (item.meta?.height || undefined) : undefined
        }}
      >
        {/* Cell indicator for Excel feel */}
        <div className="absolute top-0 left-0 -translate-y-full flex items-center gap-2 py-1 px-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-white px-2 py-1 border border-slate-200 border-b-0 italic uppercase tracking-[0.2em] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            {['A','B','C','D','E','F','G'][index % 7]}{index + 1}
          </div>
        </div>
        {/* Contextual Toolbar */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-30">
          <div 
            ref={drag as any}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors cursor-grab active:cursor-grabbing flex items-center gap-1"
          >
            <GripVertical className="w-3.5 h-3.5" />
            <span className="text-[8px] font-black sr-only">DÉPLACER</span>
          </div>
          <div className="w-px h-4 bg-slate-100 mx-0.5" />
          <div className="flex items-center gap-1 px-1">
            <Palette className="w-3 h-3 text-slate-400" />
            <input 
              type="color" 
              value={item.meta?.backgroundColor || '#ffffff'}
              onChange={(e) => updateElementMeta(item.id, { backgroundColor: e.target.value })}
              className="w-3.5 h-3.5 rounded-full cursor-pointer border-none bg-transparent"
            />
          </div>
          <div className="w-px h-4 bg-slate-100 mx-0.5" />
          <button 
            onClick={() => removeElement(item.id)}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Resize Handles */}
        {parentType === 'row' && (
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-slate-900/30 z-20"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.pageX;
              const onMouseMove = (moveE: MouseEvent) => {
                handleResize(moveE.pageX - startX, 'h');
              };
              const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
              };
              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);
            }}
          />
        )}

        {(item.type === 'chart' || item.type === 'row' || item.type === 'column') && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-slate-900/30 z-20"
            onMouseDown={(e) => {
              e.preventDefault();
              const startY = e.pageY;
              const onMouseMove = (moveE: MouseEvent) => {
                handleResize(moveE.pageY - startY, 'v');
              };
              const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
              };
              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);
            }}
          />
        )}

        {/* Element Content Rendering */}
        {item.type === 'header' && (
          <div className="relative group/header">
            <input 
              type="text"
              value={item.content}
              onChange={(e) => updateElement(item.id, { content: e.target.value })}
              placeholder="Section Title"
              className="w-full text-3xl font-bold text-slate-900 outline-none bg-transparent placeholder:text-slate-200 tracking-tight"
            />
            <div className="h-1 w-12 bg-accent rounded-full mt-2 transition-all group-hover/header:w-24" />
          </div>
        )}

        {item.type === 'markdown' && (
          <div className="space-y-4">
            <textarea 
              value={item.content}
              onChange={(e) => updateElement(item.id, { content: e.target.value })}
              placeholder="Markdown content..."
              className="w-full min-h-[80px] p-3 bg-black/5 rounded-lg text-xs font-mono outline-none focus:ring-1 ring-slate-900/20 transition-all"
            />
            <div className="prose prose-slate prose-xs max-w-none p-3 border border-black/5 rounded-lg">
              <ReactMarkdown>{item.content || '*Markdown preview*'}</ReactMarkdown>
            </div>
          </div>
        )}

        {item.type === 'divider' && (
          <div className="py-2">
            <div className="h-px bg-slate-200 w-full" />
          </div>
        )}

        {item.type === 'chart' && item.content && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h4 className="font-bold text-slate-900 text-base tracking-tight">{item.content.name}</h4>
                <span className="text-[10px] text-muted-foreground font-serif italic tracking-wide">Live Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Badge variant="info" className="text-[9px] font-black uppercase tracking-widest bg-slate-50 border-slate-100 text-slate-500">{item.content.chart_type}</Badge>
              </div>
            </div>
            <div className="h-64 overflow-hidden rounded-2xl border border-slate-50 bg-slate-50/30">
              <DashboardChart chart={item.content} />
            </div>
          </div>
        )}

        {(item.type === 'row' || item.type === 'column') && (
          <div className="flex-1 flex flex-col min-h-0 relative group/container mt-4">
            {/* Container Label */}
            <div className="absolute -top-4 left-6 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-white z-10 flex items-center gap-2 shadow-2xl opacity-0 group-hover/container:opacity-100 transition-all duration-300 -translate-y-2 group-hover/container:translate-y-0">
              {item.type === 'row' ? <Rows className="w-3.5 h-3.5" /> : <ColumnsIcon className="w-3.5 h-3.5" />}
              {item.type === 'row' ? 'LIGNE' : 'COLONNE'}
            </div>

        <div className={cn(
          "min-h-[140px] rounded-lg border-2 border-dashed transition-all duration-700 flex-1 relative",
          item.type === 'row' ? "grid grid-cols-12 gap-6 p-6" : "flex flex-col gap-6 p-6",
          "border-slate-200/40 bg-slate-50/20 hover:border-slate-400 group-hover:bg-white/50"
        )}>
          {item.children.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Zone de Drop</span>
              </div>
            </div>
          )}
              {item.children.map((childId, i) => (
                <DashboardItem 
                  key={childId} 
                  id={childId} 
                  index={i} 
                  layout={layout}
                  moveItem={moveItem}
                  removeElement={removeElement}
                  updateElement={updateElement}
                  updateElementMeta={updateElementMeta}
                  setLayout={setLayout}
                  parentType={item.type}
                />
              ))}
              <DropZone parentId={item.id} index={item.children.length} moveItem={moveItem} layout={layout} horizontal={item.type === 'row'} />
            </div>
          </div>
        )}

        {item.type === 'tabs' && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 border-b border-slate-200 px-1">
              {item.children.map((tabId, i) => {
                const tab = layout[tabId];
                if (!tab) return null;
                return (
                  <div 
                    key={tabId}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold transition-all border-b-2 cursor-pointer group/tab",
                      activeTab === i ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                    onClick={() => setActiveTab(i)}
                  >
                    <input 
                      type="text"
                      value={tab.meta?.title || `Tab ${i + 1}`}
                      onChange={(e) => updateElementMeta(tabId, { title: e.target.value })}
                      className="bg-transparent outline-none w-16 focus:w-24 transition-all"
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeElement(tabId);
                      }}
                      className="opacity-0 group-hover/tab:opacity-100 hover:text-red-500 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              <button 
                onClick={() => {
                  const newTabId = generateId();
                  updateElement(item.id, { children: [...item.children, newTabId] });
                  setLayout(prev => ({
                    ...prev,
                    [newTabId]: {
                      id: newTabId,
                      type: 'tab',
                      children: [],
                      parents: [item.id],
                      meta: { title: 'New Tab' }
                    }
                  }));
                  setActiveTab(item.children.length);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            
            {item.children[activeTab] && (
              <div className="p-1">
                <div className={cn(
                  "min-h-[120px] rounded-lg border border-dashed p-2 transition-all border-slate-200 bg-slate-100/30"
                )}>
                  {layout[item.children[activeTab]]?.children.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Empty row</span>
                    </div>
                  )}
                  {layout[item.children[activeTab]]?.children.map((childId, i) => (
                    <DashboardItem 
                      key={childId} 
                      id={childId} 
                      index={i} 
                      layout={layout}
                      moveItem={moveItem}
                      removeElement={removeElement}
                      updateElement={updateElement}
                      updateElementMeta={updateElementMeta}
                      setLayout={setLayout}
                      parentType="column"
                    />
                  ))}
                  <DropZone parentId={item.children[activeTab]} index={layout[item.children[activeTab]]?.children.length || 0} moveItem={moveItem} layout={layout} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

const SidebarItem = ({ type, label, icon: Icon }: { type: string, label: string, icon: any }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      const id = generateId();
      const newItem = {
        id,
        type: type.toLowerCase(),
        children: [],
        parents: [],
        meta: {
          width: 12,
          height: type === 'chart' ? 300 : (type === 'row' || type === 'column' ? 150 : undefined),
          backgroundColor: 'transparent',
          title: type === 'tab' ? 'Tab title' : (type === 'tabs' ? 'Tabs' : undefined)
        },
        content: type === 'header' ? 'New Header' : (type === 'markdown' ? '# New Section' : undefined)
      };
      return { id, parentId: 'NEW', newItem };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-5 bg-white border border-slate-100 rounded-sm cursor-grab active:cursor-grabbing transition-all duration-300 hover:border-slate-800 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group relative overflow-hidden sidebar-item",
        isDragging ? "opacity-40 scale-90 blur-[0.5px]" : "opacity-100"
      )}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 group-hover:-translate-y-1">
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-[0.2em] transition-colors">{label}</span>
      
      <div className="absolute bottom-2 right-1/2 translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <div className="w-1 h-1 rounded-full bg-slate-300" />
      </div>
    </div>
  );
};

const SidebarChartItem = ({ chart }: { chart: any }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      const id = generateId();
      const newItem = {
        id,
        type: 'chart',
        children: [],
        parents: [],
        meta: {
          width: 12,
          height: 300,
          backgroundColor: 'transparent'
        },
        content: chart
      };
      return { id, parentId: 'NEW', newItem };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={cn(
        "flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-sm cursor-grab active:cursor-grabbing transition-all duration-300 hover:border-slate-800 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group relative overflow-hidden sidebar-item",
        isDragging ? "opacity-40 scale-95 blur-[0.5px]" : "opacity-100"
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shrink-0">
        <BarChart className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-slate-800 truncate group-hover:text-slate-900 transition-colors tracking-tight">{chart.name || chart.slice_name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="info" className="text-[8px] font-black uppercase tracking-widest bg-slate-50 border-slate-100 text-slate-400 px-1.5 py-0.5">{chart.chart_type || chart.viz_type}</Badge>
          <span className="text-[9px] text-slate-300 truncate font-serif italic">{chart.dataset_name || 'Enterprise Data'}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <div className="w-1 h-1 rounded-full bg-slate-300" />
      </div>
    </div>
  );
};

const DashboardEditorInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [charts, setCharts] = useState<any[]>([]);
  const [layout, setLayout] = useState<Layout>({});
  const [dashboardName, setDashboardName] = useState('New Dashboard');
  const [dashboardBg, setDashboardBg] = useState('#f8fafc');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { isSomethingDragging } = useDragLayer((monitor) => ({
    isSomethingDragging: monitor.isDragging(),
  }));

  const gridRef = React.useRef<HTMLDivElement>(null);
  const autoLayoutRef = React.useRef<any>(null);

  useEffect(() => {
    if (!isLoading) {
      animate('.dashboard-item-container', {
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.98, 1],
        delay: stagger(60),
        ease: 'outQuart',
        duration: 1000
      });
    }
    loadData();
  }, [id, isLoading]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      onScroll({
        container: scrollContainerRef.current,
        onUpdate: (self) => {
          const headers = document.querySelectorAll('.excel-column-header, .excel-row-header');
          headers.forEach(h => {
            (h as HTMLElement).style.boxShadow = self.progress > 0.01 ? '0 4px 12px rgba(15,23,42,0.08)' : 'none';
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    animate('.dashboard-item-container', {
      scale: [0.98, 1],
      duration: 400,
      ease: 'outQuart'
    });
  }, [layout]);

  useEffect(() => {
    if (gridRef.current && !autoLayoutRef.current && !isLoading) {
      autoLayoutRef.current = createLayout(gridRef.current, {
        duration: 500,
        ease: 'outQuart',
        children: '.dashboard-item-container'
      });
    }
  }, [isLoading]);

  React.useLayoutEffect(() => {
    if (autoLayoutRef.current) {
      autoLayoutRef.current.record();
    }
  });

  useEffect(() => {
    if (autoLayoutRef.current) {
      autoLayoutRef.current.animate();
    }
  }, [layout]);

  const loadData = async () => {
    try {
      const localCharts = await getCharts();
      let supersetCharts: any[] = [];
      try {
        const { result } = await supersetService.getCharts();
        supersetCharts = result;
      } catch (err) {
        console.error('Failed to load charts from Superset:', err);
      }
      setCharts([...localCharts, ...supersetCharts]);
      
      if (id) {
        const isSupersetId = id && !isNaN(Number(id));
        if (isSupersetId) {
          try {
            // Try Superset first
            const d = await supersetService.getDashboard(id);
            if (d) {
              setDashboardName(d.name);
              const position = typeof d.position_json === 'string' ? JSON.parse(d.position_json) : d.position_json;
              setLayout(normalizeLayout(denormalizeLayout(mapSupersetLayoutToPrism(position))));
              setDashboardBg(d.backgroundColor || '#f8fafc');
            }
          } catch (err) {
            console.error('Failed to load dashboard from Superset, falling back to local:', err);
            const d = await getDashboard(id);
            if (d) {
              setDashboardName(d.name);
              setLayout(normalizeLayout(d.layout || []));
              setDashboardBg(d.backgroundColor || '#f8fafc');
            }
          }
        } else {
          // Local dashboard (likely a UUID)
          const d = await getDashboard(id);
          if (d) {
            setDashboardName(d.name);
            setLayout(normalizeLayout(d.layout || []));
            setDashboardBg(d.backgroundColor || '#f8fafc');
          }
        }
      } else {
        setLayout(normalizeLayout([]));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveItem = (id: string, sourceParentId: string, targetParentId: string, targetIndex: number, newItem?: any) => {
    setLayout(prev => moveItem(prev, id, sourceParentId, targetParentId, targetIndex, newItem));
  };

  const removeElement = (elementId: string) => {
    setLayout(prev => {
      const item = prev[elementId];
      if (!item) return prev;
      const parentId = item.parents[0];
      if (!parentId) return prev;
      
      const next = { ...prev };
      delete next[elementId];
      next[parentId] = {
        ...next[parentId],
        children: next[parentId].children.filter(id => id !== elementId)
      };
      return next;
    });
  };

  const updateElement = (elementId: string, updates: Partial<LayoutItem>) => {
    setLayout(prev => ({
      ...prev,
      [elementId]: { ...prev[elementId], ...updates }
    }));
  };

  const updateElementMeta = (elementId: string, metaUpdates: any) => {
    setLayout(prev => ({
      ...prev,
      [elementId]: { 
        ...prev[elementId], 
        meta: { ...(prev[elementId].meta || {}), ...metaUpdates } 
      }
    }));
  };

  const handleSave = async () => {
    if (!dashboardName) return;
    setIsSaving(true);
    try {
      const isSuperset = id && !isNaN(Number(id));
      
      if (isSuperset) {
        await supersetService.updateDashboard(Number(id), {
          dashboard_title: dashboardName,
          position_json: JSON.stringify(mapPrismLayoutToSuperset(layout)),
        });
      } else {
        await saveDashboard({
          id: id || generateId(),
          name: dashboardName,
          layout: denormalizeLayout(layout),
          backgroundColor: dashboardBg
        });
      }
      setIsSaveModalOpen(false);
      navigate('/dashboards');
    } catch (err) {
      console.error('Failed to save dashboard:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const [sidebarTab, setSidebarTab] = useState<'charts' | 'elements'>('charts');

  useEffect(() => {
    animate('.sidebar-item', {
      opacity: [0, 1],
      translateX: [20, 0],
      delay: stagger(40),
      ease: 'outQuad',
      duration: 400
    });
  }, [sidebarTab]);

  return (
    <div className="flex h-full bg-slate-100">
        {/* Main Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className={cn(
            "h-16 border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-500",
            isSomethingDragging ? "bg-slate-900 border-slate-800" : "bg-white/80 backdrop-blur-md"
          )}>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/dashboards')}
                className={cn(
                  "p-2.5 rounded-xl transition-all active:scale-90",
                  isSomethingDragging ? "text-slate-500 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <input 
                  type="text" 
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className={cn(
                    "bg-transparent border-none text-base font-bold outline-none focus:ring-0 p-0 transition-colors",
                    isSomethingDragging ? "text-white" : "text-slate-900 placeholder:text-slate-300"
                  )}
                  placeholder="Untitled Dashboard"
                />
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                    isSomethingDragging ? "text-slate-500" : "text-slate-400"
                  )}>Draft Mode</span>
                  <div className={cn(
                    "w-1 h-1 rounded-full animate-pulse",
                    isSomethingDragging ? "bg-white" : "bg-slate-900"
                  )} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="color" 
                  value={dashboardBg}
                  onChange={(e) => setDashboardBg(e.target.value)}
                  className="w-4 h-4 rounded-full cursor-pointer border-none bg-transparent"
                />
              </div>
              <div className="h-6 w-px bg-slate-100 mx-2" />
              <button 
                onClick={() => navigate(`/dashboards/${id}`)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-accent font-bold transition-all"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button 
                onClick={() => navigate('/dashboards')}
                className="px-5 py-2 text-slate-500 text-sm font-bold hover:text-slate-900 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-2 px-8 py-2.5 bg-accent text-accent-foreground rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-xl shadow-accent/10 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Publish
              </button>
            </div>
          </header>

          <div ref={scrollContainerRef} className="flex-1 overflow-auto relative bg-slate-100" style={{ backgroundColor: dashboardBg }}>
            <div className="min-h-full w-[2000px] flex">
              {/* Row Headers */}
              <div className="w-10 bg-slate-50 border-r border-slate-200 sticky left-0 z-20 flex flex-col pt-10 excel-row-header">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="h-20 flex items-center justify-center text-[10px] font-mono text-slate-400 border-b border-slate-100 italic">
                    {i + 1}
                  </div>
                ))}
              </div>

              <div className={cn("flex-1 flex flex-col relative excel-grid min-h-[150vh] bg-[#fdfdfd]", isSomethingDragging && "excel-grid-active")}>
                {/* Column Headers */}
                <div className="h-10 bg-slate-50 border-b border-slate-200 sticky top-0 z-20 flex shadow-sm excel-column-header">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'].map((col) => (
                    <div key={col} className={cn(
                      "w-40 flex items-center justify-center text-[10px] font-bold border-r border-slate-200 transition-colors",
                      isSomethingDragging ? "bg-slate-900 text-white border-slate-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {col}
                    </div>
                  ))}
                </div>

                <div ref={gridRef} className="p-20 min-h-screen relative overflow-auto">
                  <div className="max-w-[1600px] transition-all relative pb-64 min-h-[800px]">
                    {layout[DASHBOARD_GRID_ID]?.children.length === 0 ? (
                      <div className="relative h-[600px]">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center border-2 border-slate-200 rounded-sm bg-white/50 backdrop-blur-sm shadow-[0_30px_90px_rgba(0,0,0,0.03)] border-dashed border-spacing-8 pointer-events-none">
                          <div className="w-20 h-20 rounded-sm bg-slate-900 flex items-center justify-center mb-8 shadow-2xl">
                            <Plus className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Prism Sheet Intelligence</h3>
                          <p className="text-xs text-slate-400 mt-4 max-w-sm leading-relaxed font-bold uppercase tracking-widest opacity-60">
                            Glissez-déposez des graphiques ou des lignes pour commencer votre analyse.
                          </p>
                        </div>
                        {/* THE MISSING DROP TARGET FOR EMPTY STATE */}
                        <DropZone 
                          parentId={DASHBOARD_GRID_ID} 
                          index={0}
                          moveItem={handleMoveItem}
                          layout={layout}
                          className="absolute inset-0 !h-full !w-full !m-0 opacity-0 hover:opacity-100 transition-opacity z-10"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0">
                        {layout[DASHBOARD_GRID_ID]?.children.map((childId, index) => (
                          <DashboardItem 
                            key={childId}
                            id={childId}
                            index={index}
                            layout={layout}
                            moveItem={handleMoveItem}
                            removeElement={removeElement}
                            updateElement={updateElement}
                            updateElementMeta={updateElementMeta}
                            setLayout={setLayout}
                            parentType="column"
                          />
                        ))}
                        <DropZone 
                          parentId={DASHBOARD_GRID_ID} 
                          index={layout[DASHBOARD_GRID_ID]?.children.length || 0}
                          moveItem={handleMoveItem}
                          layout={layout}
                          className="min-h-[200px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Excel-like Bottom Bar */}
          <div className="h-8 bg-slate-100 border-t border-slate-200 flex items-center px-4 gap-0.5 shrink-0 z-30">
            <div className="flex items-center">
              <div className="px-4 h-8 flex items-center bg-white border-x border-slate-200 text-[10px] font-black text-slate-900 border-t-2 border-t-slate-900 -mt-[1px] shadow-sm">
                FEUILLE 1
              </div>
              <button className="px-4 h-8 flex items-center text-[10px] font-black text-slate-400 hover:bg-slate-200 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-3 px-4 text-[9px] font-mono text-slate-400 tracking-widest uppercase">
              <span className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                Prêt
              </span>
              <div className="w-px h-3 bg-slate-200" />
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <aside className="w-80 bg-white border-l border-slate-100 flex flex-col shrink-0 sticky top-0 h-screen shadow-[-20px_0_50px_rgba(0,0,0,0.02)]">
          <div className="flex p-2 bg-slate-50/50 m-6 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setSidebarTab('elements')}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                sidebarTab === 'elements' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Layout
            </button>
            <button 
              onClick={() => setSidebarTab('charts')}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                sidebarTab === 'charts' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Charts
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
            {sidebarTab === 'elements' ? (
              <div className="space-y-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8 px-2">Éléments de Structure</span>
                      <div className="grid grid-cols-2 gap-4">
                        {ELEMENT_TYPES.map((el) => (
                          <SidebarItem key={el.type} type={el.type} label={el.label} icon={el.icon} />
                        ))}
                      </div>
                    </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Graphiques Disponibles</span>
                  <button 
                    onClick={() => navigate('/chart/add')}
                    className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                  >
                    <Plus className="w-3 h-3" />
                    Nouveau
                  </button>
                </div>
                <div className="relative mb-8 px-2">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Rechercher un graphique..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-4 px-2">
                  {charts.map((chart) => (
                    <SidebarChartItem key={chart.id} chart={chart} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Save Modal */}
        <AnimatePresence>
          {isSaveModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSaveModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Save Dashboard</h3>
                    <button onClick={() => setIsSaveModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Dashboard Name</label>
                      <input 
                        type="text" 
                        value={dashboardName}
                        onChange={(e) => setDashboardName(e.target.value)}
                        placeholder="Enter dashboard name..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-slate-900 transition-all"
                        autoFocus
                      />
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                        <LayoutIcon className="w-5 h-5 text-slate-900" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900">Ready to publish?</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Saving will update the dashboard for all users. You can continue editing after saving.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button 
                    onClick={() => setIsSaveModalOpen(false)}
                    className="flex-1 py-3 text-slate-600 text-sm font-bold hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || !dashboardName}
                    className="flex-[2] py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Dashboard
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
