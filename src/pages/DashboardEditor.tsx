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
  Search
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getCharts, saveDashboard, getDashboard } from '../lib/db';
import { DashboardChart } from '../components/DashboardChart';
import { Badge } from '../components/Badge';
import ReactMarkdown from 'react-markdown';

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
  { type: 'header', icon: Type, label: 'Header' },
  { type: 'markdown', icon: FileText, label: 'Markdown' },
  { type: 'divider', icon: Divide, label: 'Divider' },
  { type: 'row', icon: Rows, label: 'Row' },
  { type: 'column', icon: ColumnsIcon, label: 'Column' },
  { type: 'tabs', icon: Layers, label: 'Tabs' },
];

const GRID_CLASSES: Record<number, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
};

const RecursiveElement = ({ 
  element, 
  index, 
  removeElement, 
  updateElement, 
  updateElementMeta,
  parentType
}: { 
  element: LayoutElement; 
  index: number;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: any) => void;
  updateElementMeta: (id: string, meta: any) => void;
  parentType?: string;
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Ensure activeTab is within bounds
  useEffect(() => {
    if (element.type === 'tabs' && element.children && activeTab >= element.children.length) {
      setActiveTab(Math.max(0, (element.children.length || 0) - 1));
    }
  }, [element.children, activeTab]);

  const handleResize = (delta: number, direction: 'h' | 'v') => {
    if (!containerRef.current) return;
    
    if (direction === 'h') {
      const containerWidth = containerRef.current.parentElement?.clientWidth || 1200;
      const unitWidth = containerWidth / 12;
      const currentWidth = element.meta?.width || 12;
      const newWidth = Math.max(1, Math.min(12, Math.round((currentWidth * unitWidth + delta) / unitWidth)));
      if (newWidth !== currentWidth) {
        updateElementMeta(element.id, { width: newWidth });
      }
    } else {
      const currentHeight = element.meta?.height || 300;
      const newHeight = Math.max(100, currentHeight + delta);
      updateElementMeta(element.id, { height: newHeight });
    }
  };

  const gridClass = GRID_CLASSES[element.meta?.width || 12];

  return (
    <Draggable draggableId={element.id} index={index}>
      {(provided) => (
        <div 
          ref={(el) => {
            provided.innerRef(el);
            (containerRef as any).current = el;
          }}
          {...provided.draggableProps}
          className={cn(
            "group relative rounded-[32px] border transition-all duration-500",
            element.type === 'row' || element.type === 'column' || element.type === 'tabs' 
              ? "p-3 bg-slate-50/10 border-slate-200/30" 
              : "p-8 bg-white border-slate-100 premium-shadow hover:-translate-y-1",
            parentType === 'row' ? gridClass : "w-full"
          )}
          style={{ 
            backgroundColor: element.meta?.backgroundColor || undefined,
            height: (element.type === 'chart' || element.type === 'row' || element.type === 'column') ? (element.meta?.height || undefined) : undefined
          }}
        >
          {/* Contextual Toolbar */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-30">
            <div 
              {...provided.dragHandleProps}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
            <div className="w-px h-4 bg-slate-100 mx-0.5" />
            <div className="flex items-center gap-1 px-1">
              <Palette className="w-3 h-3 text-slate-400" />
              <input 
                type="color" 
                value={element.meta?.backgroundColor || '#ffffff'}
                onChange={(e) => updateElementMeta(element.id, { backgroundColor: e.target.value })}
                className="w-3.5 h-3.5 rounded-full cursor-pointer border-none bg-transparent"
              />
            </div>
            <div className="w-px h-4 bg-slate-100 mx-0.5" />
            <button 
              onClick={() => removeElement(element.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Resize Handles */}
          {parentType === 'row' && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-prism-500/50 z-20"
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

          {(element.type === 'chart' || element.type === 'row' || element.type === 'column') && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-prism-500/50 z-20"
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
          {element.type === 'header' && (
            <div className="relative group/header">
              <input 
                type="text"
                value={element.content}
                onChange={(e) => updateElement(element.id, { content: e.target.value })}
                placeholder="Section Title"
                className="w-full text-3xl font-bold text-slate-900 outline-none bg-transparent placeholder:text-slate-200 tracking-tight"
              />
              <div className="h-1 w-12 bg-accent rounded-full mt-2 transition-all group-hover/header:w-24" />
            </div>
          )}

          {element.type === 'markdown' && (
            <div className="space-y-4">
              <textarea 
                value={element.content}
                onChange={(e) => updateElement(element.id, { content: e.target.value })}
                placeholder="Markdown content..."
                className="w-full min-h-[80px] p-3 bg-black/5 rounded-lg text-xs font-mono outline-none focus:ring-1 ring-prism-500/20 transition-all"
              />
              <div className="prose prose-slate prose-xs max-w-none p-3 border border-black/5 rounded-lg">
                <ReactMarkdown>{element.content || '*Markdown preview*'}</ReactMarkdown>
              </div>
            </div>
          )}

          {element.type === 'divider' && (
            <div className="py-2">
              <div className="h-px bg-slate-200 w-full" />
            </div>
          )}

          {element.type === 'chart' && element.content && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h4 className="font-bold text-slate-900 text-base tracking-tight">{element.content.name}</h4>
                  <span className="text-[10px] text-muted-foreground font-serif italic tracking-wide">Live Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Badge variant="info" className="text-[9px] font-black uppercase tracking-widest bg-slate-50 border-slate-100 text-slate-500">{element.content.chart_type}</Badge>
                </div>
              </div>
              <div className="h-64 overflow-hidden rounded-2xl border border-slate-50 bg-slate-50/30">
                <DashboardChart chart={element.content} />
              </div>
            </div>
          )}

          {(element.type === 'row' || element.type === 'column') && (
            <div className="flex-1 flex flex-col min-h-0 relative group/container">
              {/* Container Label */}
              <div className="absolute -top-3 left-6 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 z-10 flex items-center gap-2 shadow-sm opacity-0 group-hover/container:opacity-100 transition-all duration-300">
                {element.type === 'row' ? <Rows className="w-3 h-3" /> : <ColumnsIcon className="w-3 h-3" />}
                {element.type}
              </div>

              <Droppable droppableId={element.id} type="DEFAULT">
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "min-h-[140px] rounded-[40px] border-2 border-dashed transition-all duration-500 flex-1 relative",
                      element.type === 'row' ? "grid grid-cols-12 gap-8 p-8" : "flex flex-col gap-8 p-8",
                      snapshot.isDraggingOver 
                        ? "bg-prism-500/[0.03] border-prism-400 ring-[12px] ring-prism-500/[0.02] scale-[1.002]" 
                        : "border-slate-200/20 bg-slate-50/10 hover:border-slate-300/40"
                    )}
                  >
                    {(!element.children || element.children.length === 0) && !snapshot.isDraggingOver && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-4 opacity-10">
                          <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-slate-400" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Drop Zone</span>
                        </div>
                      </div>
                    )}
                    {element.children?.map((child, i) => (
                      <RecursiveElement 
                        key={child.id} 
                        element={child} 
                        index={i} 
                        removeElement={removeElement}
                        updateElement={updateElement}
                        updateElementMeta={updateElementMeta}
                        parentType={element.type}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}

          {element.type === 'tabs' && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 border-b border-slate-200 px-1">
                {element.children?.map((tab, i) => (
                  <div 
                    key={tab.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold transition-all border-b-2 cursor-pointer group/tab",
                      activeTab === i ? "border-prism-500 text-prism-600" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                    onClick={() => setActiveTab(i)}
                  >
                    <input 
                      type="text"
                      value={tab.meta?.title || `Tab ${i + 1}`}
                      onChange={(e) => {
                        const newChildren = [...(element.children || [])];
                        newChildren[i] = { 
                          ...newChildren[i], 
                          meta: { ...newChildren[i].meta, title: e.target.value } 
                        };
                        updateElement(element.id, { children: newChildren });
                      }}
                      className="bg-transparent outline-none w-16 focus:w-24 transition-all"
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newChildren = (element.children || []).filter(c => c.id !== tab.id);
                        updateElement(element.id, { children: newChildren });
                      }}
                      className="opacity-0 group-hover/tab:opacity-100 hover:text-red-500 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const newTab: LayoutElement = {
                      id: crypto.randomUUID(),
                      type: 'tab',
                      children: [],
                      meta: { title: 'Tab title' }
                    };
                    updateElement(element.id, { children: [...(element.children || []), newTab] });
                    setActiveTab((element.children?.length || 0));
                  }}
                  className="p-1.5 text-slate-400 hover:text-prism-600 hover:bg-slate-100 rounded transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              {element.children?.[activeTab] && (
                <div className="p-1">
                  <Droppable droppableId={element.children[activeTab].id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "min-h-[120px] rounded-lg border border-dashed p-2 transition-all",
                          snapshot.isDraggingOver ? "bg-prism-50/50 border-prism-300" : "border-slate-200 bg-slate-100/30"
                        )}
                      >
                        {(!element.children[activeTab].children || element.children[activeTab].children.length === 0) && !snapshot.isDraggingOver && (
                          <div className="flex-1 flex items-center justify-center py-8">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Empty row</span>
                          </div>
                        )}
                        {element.children[activeTab].children?.map((child, i) => (
                          <RecursiveElement 
                            key={child.id} 
                            element={child} 
                            index={i} 
                            removeElement={removeElement}
                            updateElement={updateElement}
                            updateElementMeta={updateElementMeta}
                            parentType="column" // Tabs act as a column container for their active content
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

export const DashboardEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [charts, setCharts] = useState<any[]>([]);
  const [layout, setLayout] = useState<LayoutElement[]>([]);
  const [dashboardName, setDashboardName] = useState('New Dashboard');
  const [dashboardBg, setDashboardBg] = useState('#f8fafc');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const c = await getCharts();
      setCharts(c);
      
      if (id) {
        const d = await getDashboard(id);
        if (d) {
          setDashboardName(d.name);
          setLayout(d.layout || []);
          setDashboardBg(d.backgroundColor || '#f8fafc');
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // Real implementation of tree manipulation
    const getElementFromTree = (elements: LayoutElement[], id: string): LayoutElement | null => {
      for (const el of elements) {
        if (el.id === id) return el;
        if (el.children) {
          const found = getElementFromTree(el.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const removeElementFromTree = (elements: LayoutElement[], id: string): LayoutElement[] => {
      return elements.filter(el => el.id !== id).map(el => ({
        ...el,
        children: el.children ? removeElementFromTree(el.children, id) : undefined
      }));
    };

    const addElementToTree = (elements: LayoutElement[], parentId: string, element: LayoutElement, index: number): LayoutElement[] => {
      if (parentId === 'layout') {
        const next = [...elements];
        next.splice(index, 0, element);
        return next;
      }
      return elements.map(el => {
        if (el.id === parentId) {
          const nextChildren = [...(el.children || [])];
          nextChildren.splice(index, 0, element);
          return { ...el, children: nextChildren };
        }
        if (el.children) {
          return { ...el, children: addElementToTree(el.children, parentId, element, index) };
        }
        return el;
      });
    };

    let movingElement: LayoutElement | null = null;

    if (source.droppableId.startsWith('sidebar-')) {
      const type = draggableId.startsWith('element-') ? draggableId.replace('element-', '') as any : 'chart';
      movingElement = {
        id: crypto.randomUUID(),
        type,
        content: draggableId.startsWith('element-') ? (type === 'header' ? 'New Header' : '') : charts.find(c => c.id === draggableId),
        children: (type === 'row' || type === 'column' || type === 'tabs' || type === 'tab') ? [] : undefined,
        meta: { 
          backgroundColor: 'transparent', 
          title: type === 'tab' ? 'Tab title' : (type === 'tabs' ? 'Tabs' : undefined),
          width: 12, // Default to full width
          height: 300 // Default height for charts
        }
      };
      
      // If adding a Tabs element, it needs at least one Tab child
      if (type === 'tabs') {
        movingElement.children = [{
          id: crypto.randomUUID(),
          type: 'tab',
          children: [],
          meta: { title: 'Tab 1' }
        }];
      }

      // If adding a Row or Column, give it a default height
      if (type === 'row' || type === 'column') {
        movingElement.meta = {
          ...movingElement.meta,
          height: 150
        };
      }
    } else {
      movingElement = getElementFromTree(layout, draggableId);
    }

    if (movingElement) {
      let newLayout = layout;
      if (!source.droppableId.startsWith('sidebar-')) {
        newLayout = removeElementFromTree(layout, draggableId);
      }
      newLayout = addElementToTree(newLayout, destination.droppableId, movingElement, destination.index);
      setLayout(newLayout);
    }
  };

  const removeElement = (elementId: string) => {
    const removeFromTree = (elements: LayoutElement[]): LayoutElement[] => {
      return elements.filter(e => e.id !== elementId).map(e => ({
        ...e,
        children: e.children ? removeFromTree(e.children) : undefined
      }));
    };
    setLayout(removeFromTree(layout));
  };

  const updateElement = (elementId: string, updates: Partial<LayoutElement>) => {
    const updateInTree = (elements: LayoutElement[]): LayoutElement[] => {
      return elements.map(e => {
        if (e.id === elementId) return { ...e, ...updates };
        if (e.children) return { ...e, children: updateInTree(e.children) };
        return e;
      });
    };
    setLayout(updateInTree(layout));
  };

  const updateElementMeta = (elementId: string, metaUpdates: any) => {
    const updateInTree = (elements: LayoutElement[]): LayoutElement[] => {
      return elements.map(e => {
        if (e.id === elementId) return { ...e, meta: { ...(e.meta || {}), ...metaUpdates } };
        if (e.children) return { ...e, children: updateInTree(e.children) };
        return e;
      });
    };
    setLayout(updateInTree(layout));
  };

  const handleSave = async () => {
    if (!dashboardName) return;
    setIsSaving(true);
    try {
      await saveDashboard({
        id: id || crypto.randomUUID(),
        name: dashboardName,
        layout,
        backgroundColor: dashboardBg
      });
      setIsSaveModalOpen(false);
      navigate('/dashboards');
    } catch (err) {
      console.error('Failed to save dashboard:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const [sidebarTab, setSidebarTab] = useState<'charts' | 'elements'>('charts');

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full bg-slate-100">
        {/* Main Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/dashboards')}
                className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <input 
                  type="text" 
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className="bg-transparent border-none text-base font-bold outline-none focus:ring-0 p-0 text-slate-900 placeholder:text-slate-300"
                  placeholder="Untitled Dashboard"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Draft Mode</span>
                  <div className="w-1 h-1 rounded-full bg-prism-500 animate-pulse" />
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

          <div className="flex-1 overflow-y-auto p-12 relative" style={{ backgroundColor: dashboardBg }}>
            {/* Grid Overlay when dragging */}
            <Droppable droppableId="layout" type="DEFAULT">
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "min-h-full w-full max-w-7xl mx-auto space-y-8 transition-all relative pb-64",
                    snapshot.isDraggingOver ? 'bg-prism-500/[0.02] rounded-[40px] ring-2 ring-prism-500/10 ring-dashed p-12' : ''
                  )}
                >
                  {snapshot.isDraggingOver && (
                    <div className="absolute inset-0 grid grid-cols-12 gap-6 pointer-events-none opacity-[0.03] p-12">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-full border-x border-prism-500 bg-prism-500/5" />
                      ))}
                    </div>
                  )}
                  
                  {layout.length === 0 ? (
                    <div className="h-[600px] flex flex-col items-center justify-center text-center border-4 border-dashed border-slate-200/30 rounded-[60px] bg-white/40 backdrop-blur-md shadow-inner">
                      <div className="w-32 h-32 rounded-[40px] bg-white flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <Plus className="w-12 h-12 text-prism-500" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Design your dashboard</h3>
                      <p className="text-sm text-slate-400 mt-4 max-w-sm leading-relaxed font-medium">
                        Drag and drop layout elements or charts from the sidebar to start building your data intelligence platform.
                      </p>
                    </div>
                  ) : (
                    layout.map((element, index) => (
                      <RecursiveElement 
                        key={element.id} 
                        element={element} 
                        index={index} 
                        removeElement={removeElement}
                        updateElement={updateElement}
                        updateElementMeta={updateElementMeta}
                        parentType="column" // Root layout acts as a column
                      />
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <aside className="w-80 bg-white border-l border-slate-100 flex flex-col shrink-0 sticky top-0 h-screen">
          <div className="flex p-2 bg-slate-50/50 m-4 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setSidebarTab('elements')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                sidebarTab === 'elements' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Layout
            </button>
            <button 
              onClick={() => setSidebarTab('charts')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                sidebarTab === 'charts' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Charts
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            {sidebarTab === 'elements' ? (
              <div className="space-y-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Structure Elements</span>
                  <Droppable droppableId="sidebar-elements" isDropDisabled={true}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="grid grid-cols-2 gap-3"
                      >
                        {ELEMENT_TYPES.map((el, index) => (
                          <Draggable key={el.type} draggableId={`element-${el.type}`} index={index}>
                            {(provided) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all cursor-grab active:cursor-grabbing group"
                              >
                                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                                  <el.icon className="w-5 h-5 text-slate-400 group-hover:text-accent-foreground" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 uppercase tracking-wider">{el.label}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Available Charts</span>
                  <button className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                    <Plus className="w-3 h-3" />
                    New Chart
                  </button>
                </div>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Search charts..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:border-accent transition-all"
                  />
                </div>
                <Droppable droppableId="sidebar-charts" isDropDisabled={true}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-4"
                    >
                      {charts.map((chart, index) => (
                        <Draggable key={chart.id} draggableId={chart.id} index={index}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all cursor-grab active:cursor-grabbing group"
                            >
                              <div className="flex gap-4">
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 shrink-0">
                                  <BarChart className="w-6 h-6 text-slate-300 group-hover:text-accent-foreground" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <h5 className="text-xs font-bold text-slate-900 truncate tracking-tight">{chart.name}</h5>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <Badge variant="info" className="text-[8px] font-black uppercase tracking-widest bg-slate-50 border-slate-100 text-slate-400 px-1.5 py-0">{chart.chart_type}</Badge>
                                    <span className="text-[9px] text-slate-300 truncate font-serif italic">{chart.dataset_name || 'Sales Data'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
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
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-prism-500 transition-all"
                        autoFocus
                      />
                    </div>
                    
                    <div className="p-4 bg-prism-50 rounded-2xl border border-prism-100 flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                        <LayoutIcon className="w-5 h-5 text-prism-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-prism-900">Ready to publish?</h4>
                        <p className="text-[10px] text-prism-600 mt-1 leading-relaxed">
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
                    className="flex-[2] py-3 bg-prism-600 text-white rounded-xl text-sm font-bold hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
    </DragDropContext>
  );
};
