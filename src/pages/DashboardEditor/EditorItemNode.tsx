import React, { useState } from 'react';
import { 
  Rows, 
  Columns, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft as ArrowLeftIcon, 
  ArrowRight as ArrowRightIcon,
  GripHorizontal,
  GripVertical,
  MoveHorizontal,
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  FileText,
  Maximize2,
  Minus,
  Sliders,
  Magnet,
  Move,
  CornerUpLeft,
  Folder,
  Heading as HeadingIcon,
  Type,
  Split,
  Bold,
  Italic,
  List,
  Quote,
  Code,
  Sparkles,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  Zap,
  Target,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Layout,
  Calendar,
  Shield,
  Tag,
  Pencil,
  Eye,
  Edit3,
  Check,
  X as CloseIcon,
  Table as TableIcon,
  Image as ImageIcon,
  Video,
  Globe,
  Play,
  Film
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import { cn } from '../../core/utils/utils';
import { 
  DashboardItemData, 
  DashboardItemMeta,
  WIDTH_PRESETS, 
  HEIGHT_PRESETS, 
  getColSpanClass 
} from './types';
import { useEditorDrag } from './EditorDragContext';

// Drop Indicator Bar component (supports horizontal and vertical layout orientations with magnetic snapping)
interface DropIndicatorProps {
  position: 'before' | 'after';
  orientation?: 'horizontal' | 'vertical';
  isSnapped?: boolean;
  snapCol?: number;
  snapSpan?: number;
}

const DropIndicator: React.FC<DropIndicatorProps> = ({ 
  position, 
  orientation = 'vertical',
  isSnapped = false,
  snapCol,
  snapSpan
}) => {
  const colText = snapCol ? `Col ${snapCol}` : '';
  const spanText = snapSpan ? `(${snapSpan}/12)` : '';

  if (orientation === 'horizontal') {
    return (
      <div
        className={cn(
          "absolute top-0 bottom-0 z-40 flex flex-col items-center justify-between pointer-events-none animate-in fade-in duration-100",
          position === 'before' ? "-left-2.5" : "-right-2.5",
          isSnapped && "shadow-[0_0_12px_rgba(99,102,241,0.5)]"
        )}
      >
        <div className={cn(
          "w-3.5 h-3.5 rounded-full shadow-md ring-2 ring-white shrink-0 -mt-1 flex items-center justify-center transition-colors",
          isSnapped ? "bg-indigo-600 ring-indigo-200" : "bg-indigo-600"
        )}>
          {isSnapped && <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />}
        </div>
        <div className={cn(
          "w-1.5 flex-1 rounded-full shadow-sm transition-all",
          isSnapped ? "bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-indigo-600"
        )} />
        <div className={cn(
          "w-3.5 h-3.5 rounded-full shadow-md ring-2 ring-white shrink-0 -mb-1 flex items-center justify-center transition-colors",
          isSnapped ? "bg-indigo-600 ring-indigo-200" : "bg-indigo-600"
        )}>
          {isSnapped && <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
        </div>
        <span
          className={cn(
            "absolute top-6 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap z-50 flex items-center gap-1.5 transition-all",
            isSnapped ? "bg-slate-900 ring-2 ring-indigo-400 shadow-indigo-500/20" : "bg-indigo-600",
            position === 'before' ? "left-2" : "right-2"
          )}
        >
          {isSnapped && <Magnet className="w-3 h-3 text-indigo-400 animate-pulse" />}
          <span>{position === 'before' ? 'Placer à gauche' : 'Placer à droite'}</span>
          {isSnapped && colText && (
            <span className="bg-indigo-600/80 px-1.5 py-0.2 rounded text-[9px] font-mono text-indigo-100">
              {colText} {spanText}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-40 flex items-center gap-1.5 pointer-events-none animate-in fade-in duration-100",
        position === 'before' ? "-top-2.5" : "-bottom-2.5",
        isSnapped && "shadow-[0_0_12px_rgba(99,102,241,0.5)]"
      )}
    >
      <div className={cn(
        "w-3.5 h-3.5 rounded-full shadow-md ring-2 ring-white shrink-0 -ml-1 flex items-center justify-center transition-colors",
        isSnapped ? "bg-indigo-600 ring-indigo-200" : "bg-indigo-600"
      )}>
        {isSnapped && <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />}
      </div>
      <div className={cn(
        "flex-1 h-1.5 rounded-full shadow-sm transition-all",
        isSnapped ? "bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-indigo-600"
      )} />
      <div className={cn(
        "w-3.5 h-3.5 rounded-full shadow-md ring-2 ring-white shrink-0 -mr-1 flex items-center justify-center transition-colors",
        isSnapped ? "bg-indigo-600 ring-indigo-200" : "bg-indigo-600"
      )}>
        {isSnapped && <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
      </div>
      <span
        className={cn(
          "absolute left-6 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap z-50 flex items-center gap-1.5 transition-all",
          isSnapped ? "bg-slate-900 ring-2 ring-indigo-400 shadow-indigo-500/20" : "bg-indigo-600",
          position === 'before' ? "-top-3.5" : "-bottom-3.5"
        )}
      >
        {isSnapped && <Magnet className="w-3 h-3 text-indigo-400 animate-pulse" />}
        <span>{position === 'before' ? 'Placer au-dessus' : 'Placer en dessous'}</span>
        {isSnapped && colText && (
          <span className="bg-indigo-600/80 px-1.5 py-0.2 rounded text-[9px] font-mono text-indigo-100">
            {colText} {spanText}
          </span>
        )}
      </span>
    </div>
  );
};

// Container Drop Inside Highlight
const DropInsideOverlay: React.FC<{ label: string }> = ({ label }) => (
  <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-indigo-600 bg-indigo-500/15 z-30 pointer-events-none flex items-center justify-center animate-in fade-in duration-100 backdrop-blur-[0.5px]">
    <div className="bg-indigo-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
      <Magnet className="w-3.5 h-3.5 text-amber-300" />
      <span>Déposer dans {label} (Aligné grille 12 col)</span>
    </div>
  </div>
);

// Helper to choose chart icon
const getChartIcon = (chartType?: string) => {
  const type = (chartType || '').toLowerCase();
  if (type.includes('line') || type.includes('courbe')) return LineChart;
  if (type.includes('pie') || type.includes('secteur') || type.includes('camembert')) return PieChart;
  if (type.includes('area') || type.includes('aire')) return AreaChart;
  if (type.includes('table') || type.includes('tableau')) return FileText;
  return BarChart;
};

// Helper for Header icons
export const getHeaderIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'trending-up': return TrendingUp;
    case 'bar-chart': return BarChart;
    case 'pie-chart': return PieChart;
    case 'activity': return Activity;
    case 'sparkles': return Sparkles;
    case 'calendar': return Calendar;
    case 'shield': return Shield;
    case 'tag': return Tag;
    case 'file-text': return FileText;
    case 'heading': return HeadingIcon;
    default: return Sparkles;
  }
};

export interface EditorItemNodeProps {
  item: DashboardItemData;
  parentType: 'root' | 'row' | 'column' | 'tabs' | 'tab';
  parentId?: string;
  depth?: number;
  index: number;
  totalSiblings: number;
  selectedItemId?: string | null;
  onSelectItem?: (itemId: string | null) => void;
  onUpdateWidth: (itemId: string, newWidth: number) => void;
  onUpdateHeight: (itemId: string, newHeight: number) => void;
  onRemoveItem: (itemId: string) => void;
  onMoveItem: (itemId: string, direction: 'prev' | 'next') => void;
  onOpenChartPicker: (containerId: string, containerName: string, defaultWidth?: number) => void;
  onAddRowToContainer: (containerId: string) => void;
  onAddColumnToContainer: (containerId: string) => void;
  onAddTabsToContainer?: (containerId: string) => void;
  onAddHeaderToContainer?: (containerId: string) => void;
  onAddMarkdownToContainer?: (containerId: string) => void;
  onAddDividerToContainer?: (containerId: string) => void;
  onAddKpiCardToContainer?: (containerId: string) => void;
  onAddCalloutToContainer?: (containerId: string) => void;
  onAddAccordionToContainer?: (containerId: string) => void;
  onAddMediaToContainer?: (containerId: string) => void;
  onAddTabToTabs?: (tabsId: string, title?: string) => void;
  onUpdateTitle?: (itemId: string, title: string) => void;
  onUpdateContent?: (itemId: string, content: any) => void;
  onUpdateStyle?: (itemId: string, styleUpdates: Partial<DashboardItemMeta>) => void;
  resizingItemId: string | null;
  onStartVerticalResize: (e: React.MouseEvent, itemId: string, currentHeight: number) => void;
  onStartHorizontalResize: (e: React.MouseEvent, itemId: string, currentWidth: number) => void;
  onOpenMoveLayout?: (item: DashboardItemData) => void;
  onExtractToRoot?: (itemId: string) => void;
  canvasGapX?: number;
  canvasGapY?: number;
}

export const getBorderRadiusStyle = (borderRadius?: string | number): string | undefined => {
  if (borderRadius === undefined || borderRadius === null || borderRadius === '') return undefined;
  if (typeof borderRadius === 'number') return `${borderRadius}px`;
  if (!isNaN(Number(borderRadius))) return `${Number(borderRadius)}px`;
  switch (borderRadius) {
    case 'none': return '0px';
    case 'sm': return '2px';
    case 'md': return '6px';
    case 'lg': return '8px';
    case 'xl': return '12px';
    case '2xl': return '16px';
    case '3xl': return '24px';
    case 'full': return '9999px';
    default: return undefined;
  }
};

export const getBorderRadiusClass = (borderRadius?: string | number) => {
  if (typeof borderRadius === 'number' || (borderRadius && !isNaN(Number(borderRadius)))) {
    return '';
  }
  switch (borderRadius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-sm';
    case 'md': return 'rounded-md';
    case 'lg': return 'rounded-lg';
    case 'xl': return 'rounded-xl';
    case '2xl': return 'rounded-2xl';
    case '3xl': return 'rounded-3xl';
    case 'full': return 'rounded-full';
    default: return 'rounded-2xl'; // default
  }
};

export const EditorItemNode: React.FC<EditorItemNodeProps> = ({
  item,
  parentType,
  parentId,
  depth = 0,
  index,
  totalSiblings,
  selectedItemId = null,
  onSelectItem = () => {},
  onUpdateWidth,
  onUpdateHeight,
  onRemoveItem,
  onMoveItem,
  onOpenChartPicker,
  onAddRowToContainer,
  onAddColumnToContainer,
  onAddTabsToContainer,
  onAddHeaderToContainer,
  onAddMarkdownToContainer,
  onAddDividerToContainer,
  onAddKpiCardToContainer,
  onAddCalloutToContainer,
  onAddAccordionToContainer,
  onAddMediaToContainer,
  onAddTabToTabs,
  onUpdateTitle,
  onUpdateContent,
  onUpdateStyle,
  resizingItemId,
  onStartVerticalResize,
  onStartHorizontalResize,
  onOpenMoveLayout,
  onExtractToRoot,
  canvasGapX = 24,
  canvasGapY = 24,
}) => {
  const isSelected = selectedItemId === item.id;
  const width = Math.min(12, Math.max(1, item.meta.width || (item.type === 'column' ? 6 : 12)));
  const height = item.meta.height || (
    item.type === 'chart' ? 360 : 
    item.type === 'header' ? 100 : 
    item.type === 'markdown' ? 220 : 
    item.type === 'divider' ? 50 : 
    item.type === 'kpi_card' ? 170 :
    item.type === 'callout' ? 130 :
    item.type === 'media' ? 320 :
    item.type === 'accordion' ? 380 :
    item.type === 'tabs' ? 440 : 400
  );
  const gridClass = getColSpanClass(width);
  const isInGrid = true;

  // Local tab state for Tabs container
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [tabTitleInput, setTabTitleInput] = useState<string>('');

  // Markdown editor mode
  const [markdownViewMode, setMarkdownViewMode] = useState<'preview' | 'edit'>('preview');

  // Drag and Drop Hook
  const {
    draggedItemId,
    dragOverTarget,
    startDrag,
    endDrag,
    setDragOverTarget,
    canDropOn,
    onDropItem,
    isSnapToGridEnabled,
    draggedItemWidth,
    setActiveSnapGuide
  } = useEditorDrag();

  const isDraggingThis = draggedItemId === item.id;
  const isOverThis = dragOverTarget?.targetId === item.id;
  const currentDropPos = isOverThis ? dragOverTarget.position : null;
  const canAcceptDrop = canDropOn(item.id);

  const isHorizontal = parentType === 'row' || (width < 12 && parentType === 'root');

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggedItemId || !canAcceptDrop) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const relX = e.clientX - rect.left;
    const heightRatio = Math.max(0, Math.min(1, relY / rect.height));
    const widthRatio = Math.max(0, Math.min(1, relX / rect.width));

    let pos: 'before' | 'after' | 'inside';

    if (item.type === 'row' || item.type === 'column' || item.type === 'tabs' || item.type === 'tab') {
      const nearStart = isHorizontal ? widthRatio < 0.35 : heightRatio < 0.35;
      const nearEnd = isHorizontal ? widthRatio > 0.65 : heightRatio > 0.65;

      if (nearStart) {
        pos = 'before';
      } else if (nearEnd) {
        pos = 'after';
      } else {
        pos = 'inside';
      }
    } else {
      if (isHorizontal) {
        pos = widthRatio < 0.5 ? 'before' : 'after';
      } else {
        pos = heightRatio < 0.5 ? 'before' : 'after';
      }
    }

    const span = Math.min(12, Math.max(1, draggedItemWidth || (item.type === 'row' ? 12 : 6)));
    const snapCol = Math.min(12, Math.max(1, Math.round(widthRatio * 12)));

    if (isSnapToGridEnabled) {
      const colStart = pos === 'after' 
        ? Math.min(12 - span + 1, Math.max(1, snapCol)) 
        : Math.max(1, snapCol);

      setActiveSnapGuide({
        colStart,
        colSpan: span,
        isSnapped: true,
        label: `Aimanté à la grille : Col ${colStart}-${Math.min(12, colStart + span - 1)} (${span}/12)`
      });
    }

    if (
      dragOverTarget?.targetId !== item.id || 
      dragOverTarget?.position !== pos || 
      dragOverTarget?.snapColumn !== snapCol
    ) {
      setDragOverTarget({ 
        targetId: item.id, 
        position: pos, 
        snapColumn: snapCol,
        snapSpan: span
      });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverTarget?.targetId === item.id) {
      setDragOverTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!draggedItemId || !canAcceptDrop) return;
    e.preventDefault();
    e.stopPropagation();

    const targetPos = dragOverTarget?.targetId === item.id 
      ? dragOverTarget.position 
      : 'inside';

    onDropItem(item.id, targetPos);
    setDragOverTarget(null);
  };

  // ----------------------------------------------------
  // 1. RENDER: TABS (ONGLETS)
  // ----------------------------------------------------
  if (item.type === 'tabs') {
    const tabsList = item.children || [];
    const safeActiveIdx = Math.max(0, Math.min(tabsList.length - 1, activeTabIdx));
    const activeTabItem = tabsList[safeActiveIdx];
    const activeTabChildren = activeTabItem?.children || [];

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/tabs",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
          minHeight: `${height}px`,
        }}
      >
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            getBorderRadiusClass(item.meta?.borderRadius),
            "shadow-xs overflow-hidden flex flex-col transition-all relative border-2 w-full h-full cursor-pointer",
            !item.meta?.backgroundColor && "bg-white",
            !item.meta?.borderColor && "border-amber-300 hover:border-amber-400",
            isSelected && "ring-2 ring-amber-500 ring-offset-2 border-amber-600 shadow-md",
            currentDropPos === 'inside' && "ring-2 ring-amber-500 border-amber-500"
          )}
          style={{
            minHeight: `${height}px`,
            backgroundColor: item.meta?.backgroundColor || undefined,
            borderColor: item.meta?.borderColor || undefined,
            borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
            borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
          }}
        >
          {currentDropPos === 'inside' && <DropInsideOverlay label="ces Onglets" />}

          {/* Tabs Top Header Bar */}
          <div 
            className={cn(
              "px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 relative transition-colors",
              !item.meta?.headerColor && "bg-amber-50/70 border-amber-100",
              isSelected && !item.meta?.headerColor && "bg-amber-100/60"
            )}
            style={{
              backgroundColor: item.meta?.headerColor || undefined
            }}
          >
            {/* Left: Drag handle & Container title */}
            <div
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'move';
                startDrag(item.id, 'tabs', width);
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                endDrag();
              }}
              className="flex items-center gap-2 min-w-0 cursor-grab active:cursor-grabbing select-none py-1 px-1.5 rounded-lg hover:bg-amber-100 transition-colors"
              title="Cliquer et glisser pour déplacer ce bloc d'onglets"
            >
              <GripVertical className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Folder className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate">
                {item.meta?.title || 'Section à Onglets'}
              </span>
              {isSelected && (
                <span className="text-[9px] font-bold text-white bg-amber-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Sélectionné
                </span>
              )}
            </div>

            {/* Right: Size info badge */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-semibold text-amber-800 bg-white/90 border border-amber-200 px-2 py-0.5 rounded-md shadow-2xs">
                {width}/12 col • {height}px
              </span>
            </div>
          </div>

          {/* Tab Navigation Strip (Buttons / Pills) */}
          <div className="px-4 py-2 bg-slate-50/90 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
            {tabsList.map((tabItem, idx) => {
              const isTabActive = idx === safeActiveIdx;
              const isEditingThisTab = editingTabId === tabItem.id;

              return (
                <div
                  key={tabItem.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTabIdx(idx);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs group/tabbtn",
                    isTabActive 
                      ? "bg-white text-amber-900 border-amber-300 shadow-xs ring-1 ring-amber-300" 
                      : "bg-slate-100/80 text-slate-600 border-slate-200/60 hover:bg-white hover:text-slate-900"
                  )}
                >
                  {isEditingThisTab ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        autoFocus
                        value={tabTitleInput}
                        onChange={(e) => setTabTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (tabTitleInput.trim() && onUpdateTitle) {
                              onUpdateTitle(tabItem.id, tabTitleInput.trim());
                            }
                            setEditingTabId(null);
                          } else if (e.key === 'Escape') {
                            setEditingTabId(null);
                          }
                        }}
                        className="w-24 px-1.5 py-0.5 text-xs bg-white border border-amber-400 rounded outline-none font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tabTitleInput.trim() && onUpdateTitle) {
                            onUpdateTitle(tabItem.id, tabTitleInput.trim());
                          }
                          setEditingTabId(null);
                        }}
                        className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span>{tabItem.meta?.title || `Onglet ${idx + 1}`}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({(tabItem.children || []).length})
                      </span>
                      
                      {/* Rename Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTabTitleInput(tabItem.meta?.title || `Onglet ${idx + 1}`);
                          setEditingTabId(tabItem.id);
                        }}
                        className="opacity-0 group-hover/tabbtn:opacity-100 p-0.5 hover:text-amber-700 rounded transition-opacity"
                        title="Renommer cet onglet"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>

                      {/* Delete Tab button (only if > 1 tab) */}
                      {tabsList.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(tabItem.id);
                          }}
                          className="opacity-0 group-hover/tabbtn:opacity-100 p-0.5 hover:text-rose-600 rounded transition-opacity ml-0.5"
                          title="Supprimer cet onglet"
                        >
                          <CloseIcon className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* + Add New Tab Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onAddTabToTabs) {
                  onAddTabToTabs(item.id, `Onglet ${tabsList.length + 1}`);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-colors shrink-0 shadow-2xs"
              title="Ajouter un nouvel onglet"
            >
              <Plus className="w-3 h-3" />
              <span>Onglet</span>
            </button>
          </div>

          {/* Active Tab Content Area */}
          <div className="p-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
            {!activeTabItem || activeTabChildren.length === 0 ? (
              <div 
                onDragOver={(e) => {
                  if (!draggedItemId || !canAcceptDrop || !activeTabItem) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverTarget({ targetId: activeTabItem.id, position: 'inside' });
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragOverTarget?.targetId === activeTabItem?.id) setDragOverTarget(null);
                }}
                onDrop={(e) => {
                  if (!draggedItemId || !canAcceptDrop || !activeTabItem) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onDropItem(activeTabItem.id, 'inside');
                }}
                className={cn(
                  "flex-1 py-10 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all select-none",
                  dragOverTarget?.targetId === activeTabItem?.id
                    ? "border-amber-600 bg-amber-50 ring-2 ring-amber-400"
                    : "border-amber-200 bg-amber-50/20 hover:bg-amber-50/40"
                )}
              >
                <Folder className="w-7 h-7 text-amber-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">
                  {draggedItemId ? "Déposer ici dans cet onglet" : `Onglet "${activeTabItem?.meta?.title || 'Actif'}" vide`}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  Glissez-déposez des graphiques, lignes ou colonnes pour composer le contenu de cet onglet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-12 items-start w-full flex-1" style={{ columnGap: `${canvasGapX}px`, rowGap: `${canvasGapY}px` }}>
                {activeTabChildren.map((child, childIdx) => (
                  <EditorItemNode
                    key={child.id}
                    item={child}
                    parentType="tab"
                    parentId={activeTabItem.id}
                    depth={depth + 1}
                    index={childIdx}
                    totalSiblings={activeTabChildren.length}
                    selectedItemId={selectedItemId}
                    onSelectItem={onSelectItem}
                    onUpdateWidth={onUpdateWidth}
                    onUpdateHeight={onUpdateHeight}
                    onRemoveItem={onRemoveItem}
                    onMoveItem={onMoveItem}
                    onOpenChartPicker={onOpenChartPicker}
                    onAddRowToContainer={onAddRowToContainer}
                    onAddColumnToContainer={onAddColumnToContainer}
                    onAddTabsToContainer={onAddTabsToContainer}
                    onAddHeaderToContainer={onAddHeaderToContainer}
                    onAddMarkdownToContainer={onAddMarkdownToContainer}
                    onAddDividerToContainer={onAddDividerToContainer}
                    onAddKpiCardToContainer={onAddKpiCardToContainer}
                    onAddCalloutToContainer={onAddCalloutToContainer}
                    onAddAccordionToContainer={onAddAccordionToContainer}
                    onAddMediaToContainer={onAddMediaToContainer}
                    onAddTabToTabs={onAddTabToTabs}
                    onUpdateTitle={onUpdateTitle}
                    onUpdateContent={onUpdateContent}
                    onUpdateStyle={onUpdateStyle}
                    resizingItemId={resizingItemId}
                    onStartVerticalResize={onStartVerticalResize}
                    onStartHorizontalResize={onStartHorizontalResize}
                    onOpenMoveLayout={onOpenMoveLayout}
                    onExtractToRoot={onExtractToRoot}
                    canvasGapX={canvasGapX}
                    canvasGapY={canvasGapY}
                  />
                ))}

                {/* Drop Slot at end of Active Tab */}
                {draggedItemId && canAcceptDrop && activeTabItem && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverTarget({ targetId: activeTabItem.id, position: 'inside' });
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (dragOverTarget?.targetId === activeTabItem.id) setDragOverTarget(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDropItem(activeTabItem.id, 'inside');
                    }}
                    className={cn(
                      "col-span-12 py-2 px-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-[11px] font-bold cursor-pointer animate-in fade-in duration-150",
                      dragOverTarget?.targetId === activeTabItem.id && dragOverTarget.position === 'inside'
                        ? "border-amber-600 bg-amber-100 text-amber-800 ring-2 ring-amber-400"
                        : "border-amber-200 hover:border-amber-400 bg-amber-50/40 text-amber-700 hover:bg-amber-50/80"
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Déposer à la fin de cet onglet</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Horizontal & Vertical Resize Handles */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className={cn(
              "absolute right-0 top-0 bottom-4 w-2 hover:w-3 cursor-col-resize hover:bg-amber-500/50 transition-all z-20 flex items-center justify-center opacity-0 group-hover/tabs:opacity-100",
              resizingItemId === item.id && "opacity-100 bg-amber-600 w-3"
            )}
            title="Ajuster la largeur"
          >
            <div className="w-0.5 h-8 bg-amber-300 rounded" />
          </div>

          <div
            onMouseDown={(e) => onStartVerticalResize(e, item.id, height)}
            className={cn(
              "h-3.5 w-full bg-amber-50/50 hover:bg-amber-200/90 border-t border-amber-100 flex items-center justify-center cursor-row-resize transition-all group/handle select-none shrink-0",
              resizingItemId === item.id && "bg-amber-300"
            )}
            title="Redimensionner la hauteur"
          >
            <GripHorizontal className="w-4 h-2.5 text-amber-400 group-hover/handle:text-amber-800" />
            {resizingItemId === item.id && (
              <span className="absolute bottom-5 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg z-30">
                Hauteur : {height}px
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. RENDER: HEADER (EN-TÊTE DE SECTION)
  // ----------------------------------------------------
  if (item.type === 'header') {
    const HeaderIcon = getHeaderIconComponent(item.meta?.icon);
    const alignment = item.meta?.alignment || 'left';
    const headerLevel = item.meta?.headerLevel || 'h2';

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/header",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
          minHeight: `${height}px`,
        }}
      >
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            getBorderRadiusClass(item.meta?.borderRadius),
            "shadow-xs overflow-hidden flex flex-col justify-between transition-all relative border-2 w-full h-full cursor-pointer p-5",
            !item.meta?.backgroundColor && "bg-white",
            !item.meta?.borderColor && "border-indigo-200 hover:border-indigo-400",
            isSelected && "ring-2 ring-indigo-500 ring-offset-2 border-indigo-600 shadow-md"
          )}
          style={{
            minHeight: `${height}px`,
            backgroundColor: item.meta?.backgroundColor || undefined,
            borderColor: item.meta?.borderColor || undefined,
            borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
            borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
            color: item.meta?.textColor || undefined,
          }}
        >
          {/* Header Drag Handle & Info Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 select-none">
            <div
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'move';
                startDrag(item.id, 'header', width);
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                endDrag();
              }}
              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg text-[10px] font-bold"
            >
              <GripVertical className="w-3 h-3 text-indigo-400" />
              <span>En-tête de section</span>
            </div>

            <div className="flex items-center gap-1.5">
              {item.meta?.badge && (
                <span className={cn(
                  "px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full",
                  item.meta?.badgeColor === 'emerald' && "bg-emerald-100 text-emerald-800",
                  item.meta?.badgeColor === 'amber' && "bg-amber-100 text-amber-800",
                  item.meta?.badgeColor === 'rose' && "bg-rose-100 text-rose-800",
                  item.meta?.badgeColor === 'slate' && "bg-slate-200 text-slate-800",
                  (!item.meta?.badgeColor || item.meta?.badgeColor === 'indigo') && "bg-indigo-100 text-indigo-800"
                )}>
                  {item.meta.badge}
                </span>
              )}
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                {width}/12 col
              </span>
            </div>
          </div>

          {/* Main Visual Header Content */}
          <div className={cn(
            "py-2 flex flex-col",
            alignment === 'center' && "items-center text-center",
            alignment === 'right' && "items-end text-right",
            alignment === 'left' && "items-start text-left"
          )}>
            <div className="flex items-center gap-2.5">
              {HeaderIcon && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <HeaderIcon className="w-4 h-4" />
                </div>
              )}
              <div>
                <h2 className={cn(
                  "font-black tracking-tight text-slate-900",
                  headerLevel === 'h1' && "text-2xl md:text-3xl",
                  headerLevel === 'h2' && "text-xl md:text-2xl",
                  headerLevel === 'h3' && "text-lg md:text-xl",
                  headerLevel === 'h4' && "text-base md:text-lg"
                )}>
                  {item.meta?.title || 'Titre de la section'}
                </h2>
                {item.meta?.subtitle && (
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    {item.meta.subtitle}
                  </p>
                )}
              </div>
            </div>

            {item.meta?.showDivider && (
              <div className="w-full h-0.5 bg-slate-200/80 mt-3 rounded-full" />
            )}
          </div>

          {/* Resize handles */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className="absolute right-0 top-0 bottom-0 w-2 hover:w-3 cursor-col-resize hover:bg-indigo-500/40 opacity-0 group-hover/header:opacity-100"
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. RENDER: TEXT / MARKDOWN (BLOC TEXTE ENRICHI)
  // ----------------------------------------------------
  if (item.type === 'markdown') {
    const rawMarkdown = typeof item.content === 'string' 
      ? item.content 
      : item.content?.markdown || '### 📝 Bloc Texte / Markdown\n\nSaisissez ici votre analyse ou notes structurées.';

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/markdown",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
          minHeight: `${height}px`,
        }}
      >
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            getBorderRadiusClass(item.meta?.borderRadius),
            "shadow-xs overflow-hidden flex flex-col transition-all relative border-2 w-full h-full cursor-pointer",
            !item.meta?.backgroundColor && "bg-white",
            !item.meta?.borderColor && "border-blue-200 hover:border-blue-400",
            isSelected && "ring-2 ring-blue-500 ring-offset-2 border-blue-600 shadow-md"
          )}
          style={{
            minHeight: `${height}px`,
            backgroundColor: item.meta?.backgroundColor || undefined,
            borderColor: item.meta?.borderColor || undefined,
            borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
            borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
          }}
        >
          {/* Markdown Header Bar */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 select-none">
            <div
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'move';
                startDrag(item.id, 'markdown', width);
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                endDrag();
              }}
              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg text-[10px] font-bold"
            >
              <GripVertical className="w-3 h-3 text-blue-400" />
              <Type className="w-3.5 h-3.5" />
              <span>Texte / Markdown</span>
            </div>

            {/* View Mode Toggle: Aperçu vs Édition */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg shadow-2xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMarkdownViewMode('preview');
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded transition-colors",
                  markdownViewMode === 'preview' 
                    ? "bg-blue-600 text-white shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Eye className="w-3 h-3" />
                <span>Aperçu</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMarkdownViewMode('edit');
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded transition-colors",
                  markdownViewMode === 'edit' 
                    ? "bg-blue-600 text-white shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Edit3 className="w-3 h-3" />
                <span>Édition</span>
              </button>
            </div>
          </div>

          {/* Markdown Body: Preview or Textarea */}
          <div className="p-4 flex-1 flex flex-col overflow-y-auto">
            {markdownViewMode === 'edit' ? (
              <div className="flex-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                {/* Markdown Formatting Toolbar */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n**Texte en gras**');
                    }}
                    className="p-1 hover:bg-white rounded text-slate-700 font-bold text-xs"
                    title="Gras"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n*Texte en italique*');
                    }}
                    className="p-1 hover:bg-white rounded text-slate-700 italic text-xs"
                    title="Italique"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n### Titre de section');
                    }}
                    className="p-1 hover:bg-white rounded text-slate-700 text-xs font-bold"
                    title="Titre"
                  >
                    <HeadingIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n- Élément de liste 1\n- Élément de liste 2');
                    }}
                    className="p-1 hover:bg-white rounded text-slate-700 text-xs"
                    title="Liste à puces"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n> Remarque importante');
                    }}
                    className="p-1 hover:bg-white rounded text-slate-700 text-xs"
                    title="Citation"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  value={rawMarkdown}
                  onChange={(e) => {
                    if (onUpdateContent) onUpdateContent(item.id, e.target.value);
                  }}
                  className="flex-1 w-full min-h-[140px] p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white resize-none"
                  placeholder="Écrivez votre texte ou code Markdown ici..."
                />
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown>{rawMarkdown}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Interactive Vertical & Horizontal Resize Handles */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className="absolute right-0 top-0 bottom-4 w-2 hover:w-3 cursor-col-resize hover:bg-blue-500/40 opacity-0 group-hover/markdown:opacity-100"
          />
          <div
            onMouseDown={(e) => onStartVerticalResize(e, item.id, height)}
            className="h-3.5 w-full bg-slate-50 hover:bg-slate-200 border-t border-slate-200 flex items-center justify-center cursor-row-resize select-none"
          >
            <GripHorizontal className="w-4 h-2.5 text-slate-400" />
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 4. RENDER: DIVIDER (SÉPARATEUR / DIVISER)
  // ----------------------------------------------------
  if (item.type === 'divider') {
    const dividerStyle = item.meta?.dividerStyle || 'solid';
    const dividerThickness = item.meta?.dividerThickness || 1;
    const dividerColor = item.meta?.dividerColor || '#cbd5e1';

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/divider py-2",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
        }}
      >
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            "w-full rounded-xl p-2 transition-all relative cursor-pointer flex items-center gap-3",
            isSelected ? "bg-slate-100 ring-2 ring-slate-800 ring-offset-2" : "hover:bg-slate-50"
          )}
        >
          {/* Drag handle */}
          <div
            draggable={true}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData('text/plain', item.id);
              e.dataTransfer.effectAllowed = 'move';
              startDrag(item.id, 'divider', width);
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              endDrag();
            }}
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 select-none p-1"
            title="Déplacer le séparateur"
          >
            <Split className="w-3.5 h-3.5" />
          </div>

          {/* Left Line */}
          <div 
            className="flex-1"
            style={{
              borderTopWidth: `${dividerThickness}px`,
              borderTopStyle: dividerStyle === 'gradient' ? 'solid' : dividerStyle,
              borderColor: dividerColor,
            }}
          />

          {/* Central Label or Icon if specified */}
          {item.meta?.title ? (
            <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
              {item.meta.title}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">Séparateur</span>
          )}

          {/* Right Line */}
          <div 
            className="flex-1"
            style={{
              borderTopWidth: `${dividerThickness}px`,
              borderTopStyle: dividerStyle === 'gradient' ? 'solid' : dividerStyle,
              borderColor: dividerColor,
            }}
          />

          {/* Horizontal resize handle */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className="w-2 hover:w-3 cursor-col-resize h-4 bg-slate-300 rounded opacity-0 group-hover/divider:opacity-100 ml-1"
            title="Ajuster la largeur"
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 4b. RENDER: CARTE KPI (KPI STAT CARD)
  // ----------------------------------------------------
  if (item.type === 'kpi_card') {
    const trend = item.meta?.kpiTrend ?? 12.5;
    const isUp = item.meta?.kpiTrendDirection ? item.meta.kpiTrendDirection === 'up' : trend >= 0;
    const color = item.meta?.kpiColor || 'indigo';

    const colorMap = {
      indigo: { bg: 'bg-indigo-50/70', border: 'border-indigo-200 hover:border-indigo-400', text: 'text-indigo-600', iconBg: 'bg-indigo-600 text-white', badge: 'text-indigo-700 bg-indigo-100' },
      emerald: { bg: 'bg-emerald-50/70', border: 'border-emerald-200 hover:border-emerald-400', text: 'text-emerald-600', iconBg: 'bg-emerald-600 text-white', badge: 'text-emerald-700 bg-emerald-100' },
      amber: { bg: 'bg-amber-50/70', border: 'border-amber-200 hover:border-amber-400', text: 'text-amber-600', iconBg: 'bg-amber-600 text-white', badge: 'text-amber-700 bg-amber-100' },
      rose: { bg: 'bg-rose-50/70', border: 'border-rose-200 hover:border-rose-400', text: 'text-rose-600', iconBg: 'bg-rose-600 text-white', badge: 'text-rose-700 bg-rose-100' },
      blue: { bg: 'bg-blue-50/70', border: 'border-blue-200 hover:border-blue-400', text: 'text-blue-600', iconBg: 'bg-blue-600 text-white', badge: 'text-blue-700 bg-blue-100' },
      purple: { bg: 'bg-purple-50/70', border: 'border-purple-200 hover:border-purple-400', text: 'text-purple-600', iconBg: 'bg-purple-600 text-white', badge: 'text-purple-700 bg-purple-100' },
      slate: { bg: 'bg-slate-50/70', border: 'border-slate-200 hover:border-slate-400', text: 'text-slate-700', iconBg: 'bg-slate-800 text-white', badge: 'text-slate-700 bg-slate-200' },
    };
    const colorStyles = colorMap[color as keyof typeof colorMap] || colorMap.indigo;

    const renderKpiIcon = (iconName?: string) => {
      switch (iconName) {
        case 'dollar': return <DollarSign className="w-5 h-5" />;
        case 'users': return <Users className="w-5 h-5" />;
        case 'shopping-bag': return <ShoppingBag className="w-5 h-5" />;
        case 'activity': return <Activity className="w-5 h-5" />;
        case 'zap': return <Zap className="w-5 h-5" />;
        case 'shield': return <Shield className="w-5 h-5" />;
        case 'target': return <Target className="w-5 h-5" />;
        default: return <TrendingUp className="w-5 h-5" />;
      }
    };

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/kpi",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
          minHeight: `${height}px`,
        }}
      >
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            getBorderRadiusClass(item.meta?.borderRadius),
            "shadow-xs overflow-hidden flex flex-col justify-between transition-all relative border-2 w-full h-full cursor-pointer p-5",
            !item.meta?.backgroundColor && colorStyles.bg,
            !item.meta?.borderColor && colorStyles.border,
            isSelected && "ring-2 ring-indigo-500 ring-offset-2 border-indigo-600 shadow-md"
          )}
          style={{
            minHeight: `${height}px`,
            backgroundColor: item.meta?.backgroundColor || undefined,
            borderColor: item.meta?.borderColor || undefined,
            borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
            borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
          }}
        >
          {/* Top header bar: drag handle & tag */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 select-none">
            <div
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'move';
                startDrag(item.id, 'kpi_card', width);
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                endDrag();
              }}
              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-slate-700 px-1.5 py-0.5 rounded-lg text-[10px] font-bold hover:bg-black/5"
            >
              <GripVertical className="w-3 h-3 text-slate-400" />
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>Carte KPI / Métrique</span>
            </div>

            <span className="text-[10px] font-semibold text-slate-500 bg-white/80 border border-slate-200/80 px-1.5 py-0.5 rounded shadow-2xs">
              {width}/12 col
            </span>
          </div>

          {/* KPI Stat Main Content */}
          <div className="flex items-start justify-between gap-4 py-2">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {item.meta?.title || 'Chiffre d\'affaires'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {item.meta?.kpiValue || '128 450'}
                </span>
                {item.meta?.kpiUnit && (
                  <span className="text-base font-bold text-slate-500">{item.meta.kpiUnit}</span>
                )}
              </div>
            </div>

            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs", colorStyles.iconBg)}>
              {renderKpiIcon(item.meta?.kpiIcon)}
            </div>
          </div>

          {/* Bottom trend & comparison badge */}
          <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span className={cn(
                "flex items-center gap-0.5 px-2 py-0.5 rounded-full font-black text-[11px]",
                isUp ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              )}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
              <span className="text-slate-500 text-[11px]">{item.meta?.kpiTrendLabel || 'vs mois dernier'}</span>
            </div>

            {item.meta?.kpiTarget && (
              <span className="text-[11px] font-medium text-slate-500">{item.meta.kpiTarget}</span>
            )}
          </div>

          {/* Resize handles */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className="absolute right-0 top-0 bottom-0 w-2 hover:w-3 cursor-col-resize hover:bg-indigo-500/40 opacity-0 group-hover/kpi:opacity-100"
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 4c. RENDER: CALLOUT BOX (INSIGHTS & ALERTES)
  // ----------------------------------------------------
  if (item.type === 'callout') {
    const type = item.meta?.calloutType || 'insight';
    const styles = {
      insight: { bg: 'bg-indigo-50/80', border: 'border-indigo-200 hover:border-indigo-400', icon: Lightbulb, iconColor: 'text-indigo-600', title: 'text-indigo-950', badge: 'text-indigo-700 bg-indigo-100' },
      info: { bg: 'bg-blue-50/80', border: 'border-blue-200 hover:border-blue-400', icon: Info, iconColor: 'text-blue-600', title: 'text-blue-950', badge: 'text-blue-700 bg-blue-100' },
      success: { bg: 'bg-emerald-50/80', border: 'border-emerald-200 hover:border-emerald-400', icon: CheckCircle2, iconColor: 'text-emerald-600', title: 'text-emerald-950', badge: 'text-emerald-700 bg-emerald-100' },
      warning: { bg: 'bg-amber-50/80', border: 'border-amber-200 hover:border-amber-400', icon: AlertTriangle, iconColor: 'text-amber-600', title: 'text-amber-950', badge: 'text-amber-700 bg-amber-100' },
      error: { bg: 'bg-rose-50/80', border: 'border-rose-200 hover:border-rose-400', icon: AlertCircle, iconColor: 'text-rose-600', title: 'text-rose-950', badge: 'text-rose-700 bg-rose-100' },
    }[type] || { bg: 'bg-indigo-50/80', border: 'border-indigo-200', icon: Sparkles, iconColor: 'text-indigo-600', title: 'text-indigo-950', badge: 'text-indigo-700 bg-indigo-100' };

    const IconComponent = styles.icon;
    const rawText = item.meta?.calloutText || (typeof item.content === 'string' ? item.content : 'Analyse stratégique : Les performances commerciales dépassent les prévisions de +8.4% ce trimestre.');

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/callout",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
          minHeight: `${height}px`,
        }}
      >
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            getBorderRadiusClass(item.meta?.borderRadius),
            "shadow-xs overflow-hidden flex items-start gap-4 transition-all relative border-2 w-full h-full cursor-pointer p-4.5",
            !item.meta?.backgroundColor && styles.bg,
            !item.meta?.borderColor && styles.border,
            isSelected && "ring-2 ring-indigo-500 ring-offset-2 border-indigo-600 shadow-md"
          )}
          style={{
            minHeight: `${height}px`,
            backgroundColor: item.meta?.backgroundColor || undefined,
            borderColor: item.meta?.borderColor || undefined,
            borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
            borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
          }}
        >
          {/* Drag Handle & Icon */}
          <div
            draggable={true}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData('text/plain', item.id);
              e.dataTransfer.effectAllowed = 'move';
              startDrag(item.id, 'callout', width);
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              endDrag();
            }}
            className={cn("w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs cursor-grab active:cursor-grabbing", styles.iconColor)}
            title="Déplacer cette Boîte d'Insight"
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className={cn("font-bold text-sm tracking-tight", styles.title)}>
                {item.meta?.calloutTitle || item.meta?.title || 'Synthèse & Recommandation'}
              </h4>
              <span className="text-[10px] font-semibold text-slate-500 bg-white/90 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                {width}/12 col
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {rawText}
            </p>
          </div>

          {/* Resize handles */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className="absolute right-0 top-0 bottom-0 w-2 hover:w-3 cursor-col-resize hover:bg-indigo-500/40 opacity-0 group-hover/callout:opacity-100"
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 4d. RENDER: SECTION REPLIABLE (ACCORDION) - Can contain children
  // ----------------------------------------------------
  if (item.type === 'accordion') {
    const children = item.children || [];
    const [isExpanded, setIsExpanded] = useState<boolean>(item.meta?.defaultExpanded !== false);

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/accordion",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
          minHeight: `${height}px`,
        }}
      >
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            getBorderRadiusClass(item.meta?.borderRadius),
            "shadow-xs overflow-hidden flex flex-col transition-all relative border-2 w-full h-full cursor-pointer",
            !item.meta?.backgroundColor && "bg-white",
            !item.meta?.borderColor && (depth === 0 ? "border-purple-300 hover:border-purple-500" : "border-purple-200 bg-purple-50/10 hover:border-purple-400"),
            isSelected && "ring-2 ring-purple-500 ring-offset-2 border-purple-600 shadow-md",
            currentDropPos === 'inside' && "ring-2 ring-purple-500 border-purple-500"
          )}
          style={{
            minHeight: `${height}px`,
            backgroundColor: item.meta?.backgroundColor || undefined,
            borderColor: item.meta?.borderColor || undefined,
            borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
            borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
          }}
        >
          {currentDropPos === 'inside' && <DropInsideOverlay label="cette Section Repliable" />}

          {/* Accordion Header Bar */}
          <div 
            onDragOver={(e) => {
              if (!draggedItemId || !canAcceptDrop) return;
              e.preventDefault();
              e.stopPropagation();
              setDragOverTarget({ targetId: item.id, position: 'inside' });
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragOverTarget?.targetId === item.id) setDragOverTarget(null);
            }}
            onDrop={(e) => {
              if (!draggedItemId || !canAcceptDrop) return;
              e.preventDefault();
              e.stopPropagation();
              onDropItem(item.id, 'inside');
            }}
            className={cn(
              "px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2 relative group/accHeader transition-colors select-none",
              !item.meta?.headerColor && (depth === 0 ? "bg-purple-50/70 border-purple-100" : "bg-purple-50/40 border-purple-100/60"),
              isSelected && !item.meta?.headerColor && "bg-purple-100/60"
            )}
            style={{
              backgroundColor: item.meta?.headerColor || undefined
            }}
          >
            {/* Drag Handle & Title */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.setData('text/plain', item.id);
                  e.dataTransfer.effectAllowed = 'move';
                  startDrag(item.id, 'accordion', width);
                }}
                onDragEnd={(e) => {
                  e.stopPropagation();
                  endDrag();
                }}
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-purple-200/60 transition-colors"
                title="Déplacer cette Section Repliable"
              >
                <GripVertical className="w-4 h-4 text-purple-400 group-hover/accHeader:text-purple-700" />
              </div>

              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Layout className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {item.meta?.title || 'Section Déroulante (Accordéon)'}
                </span>
                {item.meta?.subtitle && (
                  <span className="text-[10px] text-slate-500 truncate block">{item.meta.subtitle}</span>
                )}
              </div>

              <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full shrink-0">
                {children.length} {children.length > 1 ? 'éléments' : 'élément'}
              </span>
            </div>

            {/* Right: Expand/Collapse button & size badge */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-semibold text-purple-700/80 bg-white/90 border border-purple-200 px-2 py-0.5 rounded-md shadow-2xs">
                {width}/12 col
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 transition-colors flex items-center gap-1 text-[11px] font-bold px-2"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Replier</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Déplier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Accordion Body: children container */}
          {isExpanded && (
            <div className="p-3.5 flex-1 flex flex-col min-h-0 overflow-y-auto animate-in fade-in duration-150">
              {children.length === 0 ? (
                <div 
                  onDragOver={(e) => {
                    if (!draggedItemId || !canAcceptDrop) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverTarget({ targetId: item.id, position: 'inside' });
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (dragOverTarget?.targetId === item.id) setDragOverTarget(null);
                  }}
                  onDrop={(e) => {
                    if (!draggedItemId || !canAcceptDrop) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onDropItem(item.id, 'inside');
                  }}
                  className={cn(
                    "flex-1 py-8 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all select-none",
                    currentDropPos === 'inside'
                      ? "border-purple-600 bg-purple-50 ring-2 ring-purple-400"
                      : "border-purple-200 bg-purple-50/20 hover:bg-purple-50/40"
                  )}
                >
                  <Layout className="w-6 h-6 text-purple-400 mb-1.5" />
                  <span className="text-xs font-bold text-slate-700">
                    {draggedItemId ? "Déposer ici dans cet accordéon" : "Section repliable vide"}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                    Glissez des graphiques, lignes ou colonnes pour garnir cette section.
                  </p>
                </div>
              ) : (
                <div 
                  className="grid grid-cols-12 items-start w-full flex-1"
                  style={{ columnGap: `${canvasGapX}px`, rowGap: `${canvasGapY}px` }}
                >
                  {children.map((child, childIdx) => (
                    <EditorItemNode
                      key={child.id}
                      item={child}
                      parentType="column"
                      parentId={item.id}
                      depth={depth + 1}
                      index={childIdx}
                      totalSiblings={children.length}
                      selectedItemId={selectedItemId}
                      onSelectItem={onSelectItem}
                      onUpdateWidth={onUpdateWidth}
                      onUpdateHeight={onUpdateHeight}
                      onRemoveItem={onRemoveItem}
                      onMoveItem={onMoveItem}
                      onOpenChartPicker={onOpenChartPicker}
                      onAddRowToContainer={onAddRowToContainer}
                      onAddColumnToContainer={onAddColumnToContainer}
                      onAddTabsToContainer={onAddTabsToContainer}
                      onAddHeaderToContainer={onAddHeaderToContainer}
                      onAddMarkdownToContainer={onAddMarkdownToContainer}
                      onAddDividerToContainer={onAddDividerToContainer}
                      onAddKpiCardToContainer={onAddKpiCardToContainer}
                      onAddCalloutToContainer={onAddCalloutToContainer}
                      onAddAccordionToContainer={onAddAccordionToContainer}
                      onAddMediaToContainer={onAddMediaToContainer}
                      onAddTabToTabs={onAddTabToTabs}
                      onUpdateTitle={onUpdateTitle}
                      onUpdateContent={onUpdateContent}
                      onUpdateStyle={onUpdateStyle}
                      resizingItemId={resizingItemId}
                      onStartVerticalResize={onStartVerticalResize}
                      onStartHorizontalResize={onStartHorizontalResize}
                      onOpenMoveLayout={onOpenMoveLayout}
                      onExtractToRoot={onExtractToRoot}
                    canvasGapX={canvasGapX}
                    canvasGapY={canvasGapY}
                    />
                  ))}

                  {/* Drop Slot at end */}
                  {draggedItemId && canAcceptDrop && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverTarget({ targetId: item.id, position: 'inside' });
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (dragOverTarget?.targetId === item.id) setDragOverTarget(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDropItem(item.id, 'inside');
                      }}
                      className={cn(
                        "col-span-12 py-2 px-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-[11px] font-bold cursor-pointer animate-in fade-in duration-150",
                        currentDropPos === 'inside'
                          ? "border-purple-600 bg-purple-100 text-purple-800 ring-2 ring-purple-400"
                          : "border-purple-200 hover:border-purple-400 bg-purple-50/40 text-purple-600 hover:bg-purple-50/80"
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Déposer à la fin de cette section repliable</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Resize handles */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className="absolute right-0 top-0 bottom-4 w-2 hover:w-3 cursor-col-resize hover:bg-purple-500/40 opacity-0 group-hover/accordion:opacity-100"
          />
          <div
            onMouseDown={(e) => onStartVerticalResize(e, item.id, height)}
            className="h-3.5 w-full bg-purple-50 hover:bg-purple-200 border-t border-purple-100 flex items-center justify-center cursor-row-resize select-none"
          >
            <GripHorizontal className="w-4 h-2.5 text-purple-400" />
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 4e. RENDER: MEDIA (IMAGE, VIDÉO, EMBED/IFRAME)
  // ----------------------------------------------------
  if (item.type === 'media') {
    const mediaType = item.meta?.mediaType || 'image';
    const url = item.meta?.mediaUrl || (typeof item.content === 'string' ? item.content : '');
    const fit = item.meta?.mediaFit || 'cover';
    const alt = item.meta?.mediaAlt || item.meta?.title || 'Média';
    const caption = item.meta?.mediaCaption || '';
    const aspectRatio = item.meta?.mediaAspectRatio || 'auto';

    const aspectClass = {
      '16/9': 'aspect-video',
      '4/3': 'aspect-4/3',
      '1/1': 'aspect-square',
      '21/9': 'aspect-21/9',
      'auto': '',
    }[aspectRatio] || '';

    const getEmbedUrl = (rawUrl: string) => {
      if (!rawUrl) return '';
      if (rawUrl.includes('youtube.com/watch?v=')) {
        return rawUrl.replace('watch?v=', 'embed/');
      }
      if (rawUrl.includes('youtu.be/')) {
        return rawUrl.replace('youtu.be/', 'www.youtube.com/embed/');
      }
      if (rawUrl.includes('vimeo.com/') && !rawUrl.includes('player.vimeo.com')) {
        return rawUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
      }
      return rawUrl;
    };

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/media",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
          minHeight: `${height}px`,
        }}
      >
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            getBorderRadiusClass(item.meta?.borderRadius),
            "shadow-xs overflow-hidden flex flex-col transition-all relative border-2 w-full h-full cursor-pointer bg-white",
            !item.meta?.borderColor && (depth === 0 ? "border-cyan-200 hover:border-cyan-400" : "border-slate-200 hover:border-cyan-300"),
            isSelected && "ring-2 ring-cyan-500 ring-offset-2 border-cyan-500 shadow-md"
          )}
          style={{
            minHeight: `${height}px`,
            backgroundColor: item.meta?.backgroundColor || undefined,
            borderColor: item.meta?.borderColor || undefined,
            borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
            borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
          }}
        >
          {/* Media Header Toolbar */}
          <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-2 min-w-0">
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.setData('text/plain', item.id);
                  e.dataTransfer.effectAllowed = 'move';
                  startDrag(item.id, 'media', width);
                }}
                onDragEnd={(e) => {
                  e.stopPropagation();
                  endDrag();
                }}
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-slate-200/70 transition-colors"
                title="Déplacer ce bloc média"
              >
                <GripVertical className="w-4 h-4 text-slate-400 hover:text-slate-700" />
              </div>

              <div className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                {mediaType === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                {mediaType === 'video' && <Video className="w-3.5 h-3.5" />}
                {mediaType === 'embed' && <Globe className="w-3.5 h-3.5" />}
              </div>

              <span className="text-xs font-bold text-slate-800 truncate">
                {item.meta?.title || (mediaType === 'image' ? 'Image' : mediaType === 'video' ? 'Vidéo' : 'Intégration Web')}
              </span>

              <span className="text-[9px] font-bold uppercase bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.5 rounded shrink-0">
                {mediaType}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                {width}/12 col • {height}px
              </span>
            </div>
          </div>

          {/* Media Content Display */}
          <div className={cn(
            "flex-1 flex flex-col items-center justify-center relative overflow-hidden",
            !item.meta?.backgroundColor && "bg-slate-50/50",
            aspectClass
          )}>
            {!url ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                <ImageIcon className="w-10 h-10 stroke-1 text-slate-300" />
                <span className="text-xs font-semibold text-slate-600">Aucun média configuré</span>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Cliquez pour configurer l'URL de votre image, vidéo ou intégration dans le panneau latéral.
                </p>
              </div>
            ) : mediaType === 'image' ? (
              <img
                src={url}
                alt={alt}
                referrerPolicy="no-referrer"
                draggable={false}
                className={cn(
                  "w-full h-full select-none",
                  getBorderRadiusClass(item.meta?.borderRadius),
                  fit === 'cover' && "object-cover",
                  fit === 'contain' && "object-contain",
                  fit === 'fill' && "object-fill",
                  fit === 'none' && "object-none"
                )}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
                }}
              />
            ) : mediaType === 'video' ? (
              url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo') ? (
                <iframe
                  src={getEmbedUrl(url)}
                  title={alt}
                  className={cn("w-full h-full border-0 min-h-[220px] pointer-events-none select-none", getBorderRadiusClass(item.meta?.borderRadius))}
                  allowFullScreen
                />
              ) : (
                <video
                  src={url}
                  controls={false}
                  className={cn("w-full h-full object-cover min-h-[220px] pointer-events-none select-none", getBorderRadiusClass(item.meta?.borderRadius))}
                />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-100 text-slate-600 text-center gap-2">
                <Globe className="w-8 h-8 text-cyan-600 opacity-60" />
                <span className="text-xs font-bold text-slate-800">Page Web intégrée (iFrame)</span>
                <span className="text-[11px] text-slate-500 font-mono truncate max-w-xs bg-white px-2 py-1 rounded border border-slate-200">
                  {url}
                </span>
              </div>
            )}
          </div>

          {caption && (
            <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500 italic truncate">{caption}</p>
            </div>
          )}

          {/* Resize handles */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className="absolute right-0 top-0 bottom-4 w-2 hover:w-3 cursor-col-resize hover:bg-cyan-500/40 opacity-0 group-hover/media:opacity-100"
          />
          <div
            onMouseDown={(e) => onStartVerticalResize(e, item.id, height)}
            className="h-3.5 w-full bg-slate-50 hover:bg-slate-200 border-t border-slate-200 flex items-center justify-center cursor-row-resize select-none"
          >
            <GripHorizontal className="w-4 h-2.5 text-slate-400" />
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 5. RENDER: LIGNE (ROW) - Can contain Columns or Charts
  // ----------------------------------------------------
  if (item.type === 'row') {
    const children = item.children || [];

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/row",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
          minHeight: `${height}px`,
        }}
      >
        {/* Drop Indicators */}
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            getBorderRadiusClass(item.meta?.borderRadius),
            "shadow-xs overflow-hidden flex flex-col transition-all relative border-2 w-full h-full cursor-pointer",
            !item.meta?.backgroundColor && "bg-white",
            !item.meta?.borderColor && (depth === 0 ? "border-indigo-300 hover:border-indigo-500" : "border-indigo-200 bg-indigo-50/10 hover:border-indigo-400"),
            isSelected && "ring-2 ring-indigo-500 ring-offset-2 border-indigo-600 shadow-md",
            currentDropPos === 'inside' && "ring-2 ring-indigo-500 border-indigo-500"
          )}
          style={{
            minHeight: `${height}px`,
            backgroundColor: item.meta?.backgroundColor || undefined,
            borderColor: item.meta?.borderColor || undefined,
            borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
            borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
          }}
        >
          {currentDropPos === 'inside' && <DropInsideOverlay label="cette Ligne" />}

          {/* Row Header Bar - Simplified & Intuitive */}
          <div 
            onDragOver={(e) => {
              if (!draggedItemId || !canAcceptDrop) return;
              e.preventDefault();
              e.stopPropagation();
              setDragOverTarget({ targetId: item.id, position: 'inside' });
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragOverTarget?.targetId === item.id) setDragOverTarget(null);
            }}
            onDrop={(e) => {
              if (!draggedItemId || !canAcceptDrop) return;
              e.preventDefault();
              e.stopPropagation();
              onDropItem(item.id, 'inside');
            }}
            className={cn(
              "px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 relative group/rowheader transition-colors",
              !item.meta?.headerColor && (depth === 0 ? "bg-indigo-50/70 border-indigo-100" : "bg-indigo-50/40 border-indigo-100/60"),
              isSelected && !item.meta?.headerColor && "bg-indigo-100/60",
              currentDropPos === 'inside' && "bg-indigo-100 ring-2 ring-indigo-500 ring-inset"
            )}
            style={{
              backgroundColor: item.meta?.headerColor || undefined
            }}
          >
            {/* Row Header Resize Grip on right edge */}
            <div
              onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
              className={cn(
                "absolute right-0 top-0 bottom-0 w-2.5 hover:w-3.5 cursor-col-resize hover:bg-indigo-500/40 transition-all z-20 flex items-center justify-center select-none",
                resizingItemId === item.id && "bg-indigo-600 w-3.5 opacity-100"
              )}
              title="Glissez le bord pour ajuster la largeur fine (grille 1 à 12)"
            >
              <div className="w-0.5 h-4 bg-indigo-400 rounded" />
              {resizingItemId === item.id && (
                <span className="absolute -top-7 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1 z-30 font-mono whitespace-nowrap">
                  <Magnet className="w-3 h-3 text-indigo-400" />
                  <span>{width}/12 col ({Math.round((width / 12) * 100)}%)</span>
                </span>
              )}
            </div>

            {/* Left: Drag Handle & Badge (Draggable) */}
            <div
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'move';
                startDrag(item.id, 'row', width);
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                endDrag();
              }}
              className="flex items-center gap-2 min-w-0 cursor-grab active:cursor-grabbing select-none group/draghandle py-1 px-1.5 -ml-1.5 rounded-lg hover:bg-indigo-100/70 transition-colors"
              title="Cliquer et glisser pour déplacer / réorganiser cette Ligne"
            >
              <GripVertical className="w-4 h-4 text-indigo-400 group-hover/draghandle:text-indigo-700 shrink-0" />
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Rows className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate">
                {item.meta?.title || `Ligne ${depth > 0 ? `(Niv. ${depth + 1})` : ''}`}
              </span>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full shrink-0">
                {children.length} {children.length > 1 ? 'éléments' : 'élément'}
              </span>
              {isSelected && (
                <span className="text-[9px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Sélectionné
                </span>
              )}
            </div>

            {/* Right: Clean informative size & selection badge */}
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <span className="text-[10px] font-semibold text-indigo-700/80 bg-white/90 border border-indigo-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                {width}/12 col • {height}px
              </span>
            </div>
          </div>

          {/* Row Body: 12-column grid container for child elements */}
          <div className="p-3.5 flex-1 flex flex-col min-h-0 overflow-y-auto">
            {children.length === 0 ? (
              /* Empty Row Drop Zone & Selection Prompt */
              <div 
                onDragOver={(e) => {
                  if (!draggedItemId || !canAcceptDrop) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverTarget({ targetId: item.id, position: 'inside' });
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragOverTarget?.targetId === item.id) {
                    setDragOverTarget(null);
                  }
                }}
                onDrop={(e) => {
                  if (!draggedItemId || !canAcceptDrop) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onDropItem(item.id, 'inside');
                }}
                className={cn(
                  "flex-1 py-8 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all select-none",
                  currentDropPos === 'inside'
                    ? "border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-400"
                    : "border-indigo-200/80 bg-indigo-50/20 hover:bg-indigo-50/40"
                )}
              >
                <Rows className="w-6 h-6 text-indigo-400 mb-1.5" />
                <span className="text-xs font-bold text-slate-700">
                  {draggedItemId ? "Déposer ici pour insérer dans cette Ligne" : "Ligne vide"}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                  Glissez-déposez des éléments ici ou configurez le contenu depuis le panneau latéral droit.
                </p>
              </div>
            ) : (
              <div 
                className="grid grid-cols-12 items-start flex-1 w-full"
                style={{ columnGap: `${canvasGapX}px`, rowGap: `${canvasGapY}px` }}
              >
                {children.map((child, childIdx) => (
                  <EditorItemNode
                    key={child.id}
                    item={child}
                    parentType="row"
                    parentId={item.id}
                    depth={depth + 1}
                    index={childIdx}
                    totalSiblings={children.length}
                    selectedItemId={selectedItemId}
                    onSelectItem={onSelectItem}
                    onUpdateWidth={onUpdateWidth}
                    onUpdateHeight={onUpdateHeight}
                    onRemoveItem={onRemoveItem}
                    onMoveItem={onMoveItem}
                    onOpenChartPicker={onOpenChartPicker}
                    onAddRowToContainer={onAddRowToContainer}
                    onAddColumnToContainer={onAddColumnToContainer}
                    onAddTabsToContainer={onAddTabsToContainer}
                    onAddHeaderToContainer={onAddHeaderToContainer}
                    onAddMarkdownToContainer={onAddMarkdownToContainer}
                    onAddDividerToContainer={onAddDividerToContainer}
                    onAddKpiCardToContainer={onAddKpiCardToContainer}
                    onAddCalloutToContainer={onAddCalloutToContainer}
                    onAddAccordionToContainer={onAddAccordionToContainer}
                    onAddMediaToContainer={onAddMediaToContainer}
                    onAddTabToTabs={onAddTabToTabs}
                    onUpdateTitle={onUpdateTitle}
                    onUpdateContent={onUpdateContent}
                    onUpdateStyle={onUpdateStyle}
                    resizingItemId={resizingItemId}
                    onStartVerticalResize={onStartVerticalResize}
                    onStartHorizontalResize={onStartHorizontalResize}
                    onOpenMoveLayout={onOpenMoveLayout}
                    onExtractToRoot={onExtractToRoot}
                    canvasGapX={canvasGapX}
                    canvasGapY={canvasGapY}
                  />
                ))}

                {/* Inner Drop Slot at end of Row when dragging */}
                {draggedItemId && canAcceptDrop && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverTarget({ targetId: item.id, position: 'inside' });
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (dragOverTarget?.targetId === item.id) setDragOverTarget(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDropItem(item.id, 'inside');
                    }}
                    className={cn(
                      "col-span-12 py-2 px-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-[11px] font-bold cursor-pointer animate-in fade-in duration-150",
                      currentDropPos === 'inside'
                        ? "border-indigo-600 bg-indigo-100/90 text-indigo-800 ring-2 ring-indigo-400"
                        : "border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 text-indigo-600 hover:bg-indigo-50/80"
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Déposer à la fin de cette Ligne</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Horizontal and Vertical Resize Handles */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className={cn(
              "absolute right-0 top-0 bottom-4 w-2 hover:w-3 cursor-col-resize hover:bg-indigo-500/50 transition-all z-20 flex items-center justify-center opacity-0 group-hover/row:opacity-100",
              resizingItemId === item.id && "opacity-100 bg-indigo-600 w-3"
            )}
            title="Ajuster la largeur"
          >
            <div className="w-0.5 h-8 bg-indigo-300 rounded" />
          </div>

          <div
            onMouseDown={(e) => onStartVerticalResize(e, item.id, height)}
            className={cn(
              "h-3.5 w-full bg-indigo-50/50 hover:bg-indigo-200/90 border-t border-indigo-100 flex items-center justify-center cursor-row-resize transition-all group/handle select-none shrink-0",
              resizingItemId === item.id && "bg-indigo-300"
            )}
            title="Redimensionner la hauteur"
          >
            <GripHorizontal className="w-4 h-2.5 text-indigo-400 group-hover/handle:text-indigo-800" />
            {resizingItemId === item.id && (
              <span className="absolute bottom-5 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg z-30">
                Hauteur : {height}px
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 6. RENDER: COLONNE (COLUMN) - Can contain child elements
  // ----------------------------------------------------
  if (item.type === 'column') {
    const children = item.children || [];

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "min-w-0 flex flex-col transition-all duration-150 relative group/col",
          isInGrid ? cn(gridClass, "w-full") : "w-full",
          isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
        )}
        style={{
          gridColumn: `span ${width} / span ${width}`,
          minHeight: `${height}px`,
        }}
      >
        {currentDropPos === 'before' && (
          <DropIndicator 
            position="before" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}
        {currentDropPos === 'after' && (
          <DropIndicator 
            position="after" 
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
            isSnapped={isSnapToGridEnabled}
            snapCol={dragOverTarget?.snapColumn}
            snapSpan={dragOverTarget?.snapSpan}
          />
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          className={cn(
            getBorderRadiusClass(item.meta?.borderRadius),
            "shadow-xs overflow-hidden flex flex-col transition-all relative border-2 w-full h-full cursor-pointer",
            !item.meta?.backgroundColor && "bg-white",
            !item.meta?.borderColor && (depth === 0 ? "border-emerald-300 hover:border-emerald-500" : "border-emerald-200 bg-emerald-50/10 hover:border-emerald-400"),
            isSelected && "ring-2 ring-emerald-500 ring-offset-2 border-emerald-600 shadow-md",
            currentDropPos === 'inside' && "ring-2 ring-emerald-500 border-emerald-500"
          )}
          style={{
            minHeight: `${height}px`,
            backgroundColor: item.meta?.backgroundColor || undefined,
            borderColor: item.meta?.borderColor || undefined,
            borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
            borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
          }}
        >
          {currentDropPos === 'inside' && <DropInsideOverlay label="cette Colonne" />}

          {/* Column Header Bar */}
          <div 
            onDragOver={(e) => {
              if (!draggedItemId || !canAcceptDrop) return;
              e.preventDefault();
              e.stopPropagation();
              setDragOverTarget({ targetId: item.id, position: 'inside' });
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragOverTarget?.targetId === item.id) setDragOverTarget(null);
            }}
            onDrop={(e) => {
              if (!draggedItemId || !canAcceptDrop) return;
              e.preventDefault();
              e.stopPropagation();
              onDropItem(item.id, 'inside');
            }}
            className={cn(
              "px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 relative group/colheader transition-colors",
              !item.meta?.headerColor && (depth === 0 ? "bg-emerald-50/70 border-emerald-100" : "bg-emerald-50/40 border-emerald-100/60"),
              isSelected && !item.meta?.headerColor && "bg-emerald-100/60",
              currentDropPos === 'inside' && "bg-emerald-100 ring-2 ring-emerald-500 ring-inset"
            )}
            style={{
              backgroundColor: item.meta?.headerColor || undefined
            }}
          >
            {/* Header Drag Handle */}
            <div
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'move';
                startDrag(item.id, 'column', width);
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                endDrag();
              }}
              className="flex items-center gap-2 min-w-0 cursor-grab active:cursor-grabbing select-none group/draghandle py-1 px-1.5 -ml-1.5 rounded-lg hover:bg-emerald-100/70 transition-colors"
              title="Déplacer cette Colonne"
            >
              <GripVertical className="w-4 h-4 text-emerald-400 group-hover/draghandle:text-emerald-700 shrink-0" />
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Columns className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate">
                {item.meta?.title || `Colonne ${depth > 0 ? `(Niv. ${depth + 1})` : ''}`}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full shrink-0">
                {children.length} {children.length > 1 ? 'éléments' : 'élément'}
              </span>
              {isSelected && (
                <span className="text-[9px] font-bold text-white bg-emerald-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Sélectionné
                </span>
              )}
            </div>

            {/* Right: size badge */}
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <span className="text-[10px] font-semibold text-emerald-700/80 bg-white/90 border border-emerald-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                {width}/12 col • {height}px
              </span>
            </div>
          </div>

          {/* Column Body: 12-column grid container */}
          <div className="p-3.5 flex-1 flex flex-col min-h-0 overflow-y-auto">
            {children.length === 0 ? (
              <div 
                onDragOver={(e) => {
                  if (!draggedItemId || !canAcceptDrop) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverTarget({ targetId: item.id, position: 'inside' });
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragOverTarget?.targetId === item.id) setDragOverTarget(null);
                }}
                onDrop={(e) => {
                  if (!draggedItemId || !canAcceptDrop) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onDropItem(item.id, 'inside');
                }}
                className={cn(
                  "flex-1 py-8 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all select-none",
                  currentDropPos === 'inside'
                    ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-400"
                    : "border-emerald-200/80 bg-emerald-50/20 hover:bg-emerald-50/40"
                )}
              >
                <Columns className="w-6 h-6 text-emerald-400 mb-1.5" />
                <span className="text-xs font-bold text-slate-700">
                  {draggedItemId ? "Déposer ici pour insérer dans cette Colonne" : "Colonne vide"}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                  Glissez-déposez des éléments ici ou configurez le contenu depuis le panneau latéral droit.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-12 items-start w-full flex-1" style={{ columnGap: `${canvasGapX}px`, rowGap: `${canvasGapY}px` }}>
                {children.map((child, childIdx) => (
                  <EditorItemNode
                    key={child.id}
                    item={child}
                    parentType="column"
                    parentId={item.id}
                    depth={depth + 1}
                    index={childIdx}
                    totalSiblings={children.length}
                    selectedItemId={selectedItemId}
                    onSelectItem={onSelectItem}
                    onUpdateWidth={onUpdateWidth}
                    onUpdateHeight={onUpdateHeight}
                    onRemoveItem={onRemoveItem}
                    onMoveItem={onMoveItem}
                    onOpenChartPicker={onOpenChartPicker}
                    onAddRowToContainer={onAddRowToContainer}
                    onAddColumnToContainer={onAddColumnToContainer}
                    onAddTabsToContainer={onAddTabsToContainer}
                    onAddHeaderToContainer={onAddHeaderToContainer}
                    onAddMarkdownToContainer={onAddMarkdownToContainer}
                    onAddDividerToContainer={onAddDividerToContainer}
                    onAddKpiCardToContainer={onAddKpiCardToContainer}
                    onAddCalloutToContainer={onAddCalloutToContainer}
                    onAddAccordionToContainer={onAddAccordionToContainer}
                    onAddMediaToContainer={onAddMediaToContainer}
                    onAddTabToTabs={onAddTabToTabs}
                    onUpdateTitle={onUpdateTitle}
                    onUpdateContent={onUpdateContent}
                    onUpdateStyle={onUpdateStyle}
                    resizingItemId={resizingItemId}
                    onStartVerticalResize={onStartVerticalResize}
                    onStartHorizontalResize={onStartHorizontalResize}
                    onOpenMoveLayout={onOpenMoveLayout}
                    onExtractToRoot={onExtractToRoot}
                    canvasGapX={canvasGapX}
                    canvasGapY={canvasGapY}
                  />
                ))}

                {/* Inner Drop Slot at end of Column */}
                {draggedItemId && canAcceptDrop && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverTarget({ targetId: item.id, position: 'inside' });
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (dragOverTarget?.targetId === item.id) setDragOverTarget(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDropItem(item.id, 'inside');
                    }}
                    className={cn(
                      "col-span-12 py-2 px-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-[11px] font-bold cursor-pointer animate-in fade-in duration-150",
                      currentDropPos === 'inside'
                        ? "border-emerald-600 bg-emerald-100/90 text-emerald-800 ring-2 ring-emerald-400"
                        : "border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 text-emerald-600 hover:bg-emerald-50/80"
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Déposer à la fin de cette Colonne</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resize handles */}
          <div
            onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
            className={cn(
              "absolute right-0 top-0 bottom-4 w-2 hover:w-3 cursor-col-resize hover:bg-emerald-500/50 transition-all z-20 flex items-center justify-center opacity-0 group-hover/col:opacity-100",
              resizingItemId === item.id && "opacity-100 bg-emerald-600 w-3"
            )}
            title="Ajuster la largeur"
          >
            <div className="w-0.5 h-8 bg-emerald-300 rounded" />
          </div>

          <div
            onMouseDown={(e) => onStartVerticalResize(e, item.id, height)}
            className={cn(
              "h-3.5 w-full bg-emerald-50/50 hover:bg-emerald-200/90 border-t border-emerald-100 flex items-center justify-center cursor-row-resize transition-all group/handle select-none shrink-0",
              resizingItemId === item.id && "bg-emerald-300"
            )}
            title="Redimensionner la hauteur"
          >
            <GripHorizontal className="w-4 h-2.5 text-emerald-400 group-hover/handle:text-emerald-800" />
            {resizingItemId === item.id && (
              <span className="absolute bottom-5 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg z-30">
                Hauteur : {height}px
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 7. RENDER: GRAPHIQUE (CHART) - Leaf node
  // ----------------------------------------------------
  const IconComponent = getChartIcon(item.content?.chart_type || item.content?.viz_type);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "min-w-0 flex flex-col transition-all duration-150 relative group/chart",
        isInGrid ? cn(gridClass, "w-full") : "w-full",
        isDraggingThis && "opacity-30 scale-[0.99] pointer-events-none"
      )}
      style={{
        gridColumn: isInGrid ? `span ${width} / span ${width}` : undefined,
        width: !isInGrid && width < 12 ? `${Math.round((width / 12) * 100)}%` : undefined,
        minHeight: `${height}px`,
        height: `${height}px`,
      }}
    >
      {/* Drop Indicators */}
      {currentDropPos === 'before' && (
        <DropIndicator 
          position="before" 
          orientation={isHorizontal ? 'horizontal' : 'vertical'}
          isSnapped={isSnapToGridEnabled}
          snapCol={dragOverTarget?.snapColumn}
          snapSpan={dragOverTarget?.snapSpan}
        />
      )}
      {currentDropPos === 'after' && (
        <DropIndicator 
          position="after" 
          orientation={isHorizontal ? 'horizontal' : 'vertical'}
          isSnapped={isSnapToGridEnabled}
          snapCol={dragOverTarget?.snapColumn}
          snapSpan={dragOverTarget?.snapSpan}
        />
      )}

      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelectItem(item.id);
        }}
        className={cn(
          "border", getBorderRadiusClass(item.meta?.borderRadius), "shadow-xs overflow-hidden flex flex-col flex-1 relative w-full h-full cursor-pointer transition-all",
          !item.meta?.backgroundColor && "bg-white",
          !item.meta?.borderColor && (isSelected ? "border-slate-800" : "border-slate-200 hover:border-slate-300"),
          isSelected && "ring-2 ring-slate-800 ring-offset-2 shadow-md"
        )}
        style={{
          minHeight: `${height}px`,
          height: `${height}px`,
          backgroundColor: item.meta?.backgroundColor || undefined,
          borderColor: item.meta?.borderColor || undefined,
          borderWidth: item.meta?.borderWidth !== undefined ? `${item.meta.borderWidth}px` : undefined,
          borderStyle: item.meta?.borderStyle || undefined,
            borderRadius: getBorderRadiusStyle(item.meta?.borderRadius),
            padding: item.meta?.padding !== undefined ? `${item.meta.padding}px` : undefined,
            margin: item.meta?.margin !== undefined ? `${item.meta.margin}px` : undefined,
        }}
      >
        {/* Chart Header Bar */}
        <div 
          className={cn(
            "px-3.5 py-2 border-b flex flex-wrap items-center justify-between gap-2 transition-colors",
            !item.meta?.headerColor && (isSelected ? "bg-slate-100/90 border-slate-300" : "bg-slate-50 border-slate-200")
          )}
          style={{
            backgroundColor: item.meta?.headerColor || undefined
          }}
        >
          {/* Left: Drag Handle, Chart icon & name */}
          <div
            draggable={true}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData('text/plain', item.id);
              e.dataTransfer.effectAllowed = 'move';
              startDrag(item.id, 'chart', width);
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              endDrag();
            }}
            className="flex items-center gap-2 min-w-0 cursor-grab active:cursor-grabbing select-none group/draghandle py-0.5 px-1 -ml-1 rounded-md hover:bg-slate-200/70 transition-colors"
            title="Déplacer ce Graphique"
          >
            <GripVertical className="w-4 h-4 text-slate-400 group-hover/draghandle:text-slate-700 shrink-0" />
            <div className="w-6 h-6 rounded-md bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900 truncate max-w-[160px] sm:max-w-xs">
              {item.content?.name || item.meta?.title || 'Graphique'}
            </span>
            {item.content?.chart_type && (
              <span className="text-[9px] font-bold uppercase bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline-block">
                {item.content.chart_type}
              </span>
            )}
            {isSelected && (
              <span className="text-[9px] font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Sélectionné
              </span>
            )}
          </div>

          {/* Right: size badge */}
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
              {width}/12 col • {height}px
            </span>
          </div>
        </div>

        {/* Chart Visual Content */}
        <div className="p-3 flex-1 flex flex-col min-h-0">
          <div 
            className="w-full min-w-0 overflow-hidden flex-1"
            style={{ minHeight: `${Math.max(220, height - 60)}px` }}
          >
            <DashboardChart chart={item.content} />
          </div>
        </div>

        {/* Resize Handles */}
        <div
          onMouseDown={(e) => onStartHorizontalResize(e, item.id, width)}
          className={cn(
            "absolute right-0 top-0 bottom-4 w-2 hover:w-3 cursor-col-resize hover:bg-slate-400/40 transition-all z-20 flex items-center justify-center opacity-0 group-hover/chart:opacity-100",
            resizingItemId === item.id && "opacity-100 bg-slate-600 w-3"
          )}
          title="Ajuster la largeur"
        >
          <div className="w-0.5 h-6 bg-slate-300 rounded" />
        </div>

        <div
          onMouseDown={(e) => onStartVerticalResize(e, item.id, height)}
          className={cn(
            "h-3.5 w-full bg-slate-50 hover:bg-slate-200 border-t border-slate-200 flex items-center justify-center cursor-row-resize transition-all group/handle select-none",
            resizingItemId === item.id && "bg-accent/20"
          )}
          title="Redimensionner la hauteur"
        >
          <GripHorizontal className="w-4 h-2.5 text-slate-400 group-hover/handle:text-slate-700" />
          {resizingItemId === item.id && (
            <span className="absolute bottom-5 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1 z-30 font-mono">
              <Magnet className="w-3 h-3 text-indigo-400" />
              <span>Hauteur : {height}px</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
