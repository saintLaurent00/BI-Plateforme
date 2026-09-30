import React, { useState } from 'react';
import {
  X,
  Rows,
  Columns,
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  FileText,
  Sliders,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Move,
  CornerUpLeft,
  ShieldCheck,
  Palette,
  Paintbrush,
  LayoutGrid,
  Check,
  Grid,
  RotateCcw,
  Folder,
  Heading as HeadingIcon,
  Type,
  Split,
  Bold,
  Italic,
  List,
  Quote,
  Code,
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon
} from 'lucide-react';
import { DashboardItemData, DashboardItemMeta, WIDTH_PRESETS, HEIGHT_PRESETS } from './types';
import { cn } from '../../core/utils/utils';

export interface CanvasConfig {
  backgroundColor: string;
  pattern: 'dots' | 'grid' | 'none';
  maxWidth: string;
  gapX: number; // horizontal gap in pixels
  gapY: number; // vertical gap in pixels
}

export const LAYOUT_BG_PRESETS = [
  { label: 'Transparent', value: 'transparent', preview: 'bg-transparent border border-dashed border-slate-300' },
  { label: 'Blanc Pur', value: '#ffffff', preview: 'bg-white border border-slate-200 shadow-2xs' },
  { label: 'Ardoise Clair', value: '#f8fafc', preview: 'bg-slate-50 border border-slate-200 shadow-2xs' },
  { label: 'Gris Neutre', value: '#f1f5f9', preview: 'bg-slate-100 border border-slate-200' },
  { label: 'Crème Chaud', value: '#fafaf9', preview: 'bg-stone-50 border border-stone-200' },
  { label: 'Indigo Pastel', value: '#eef2ff', preview: 'bg-indigo-50 border border-indigo-200' },
  { label: 'Émeraude Pastel', value: '#ecfdf5', preview: 'bg-emerald-50 border border-emerald-200' },
  { label: 'Ambre Pastel', value: '#fffbeb', preview: 'bg-amber-50 border border-amber-200' },
  { label: 'Rose Pastel', value: '#fff1f2', preview: 'bg-rose-50 border border-rose-200' },
  { label: 'Cyan Pastel', value: '#ecfeff', preview: 'bg-cyan-50 border border-cyan-200' },
  { label: 'Violet Pastel', value: '#f5f3ff', preview: 'bg-purple-50 border border-purple-200' },
  { label: 'Ardoise Sombre', value: '#1e293b', preview: 'bg-slate-800 text-white border border-slate-700' },
  { label: 'Indigo Nuit', value: '#0f172a', preview: 'bg-slate-900 text-white border border-slate-800' },
  { label: 'Noir Pur', value: '#09090b', preview: 'bg-black text-white border border-neutral-900' },
];

export const LAYOUT_BORDER_PRESETS = [
  { label: 'Par défaut', value: '' },
  { label: 'Aucune', value: 'transparent' },
  { label: 'Ardoise discrète', value: '#e2e8f0' },
  { label: 'Ardoise soutenue', value: '#94a3b8' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Émeraude', value: '#10b981' },
  { label: 'Ambre', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Sombre', value: '#334155' },
  { label: 'Noir', value: '#09090b' },
];

export const CANVAS_BG_PRESETS = [
  { label: 'Gris de travail (Défaut)', value: '#f1f5f9', hex: '#f1f5f9', desc: 'Clair & équilibré' },
  { label: 'Blanc Studio', value: '#ffffff', hex: '#ffffff', desc: 'Pureté & minimalisme' },
  { label: 'Ardoise légère', value: '#f8fafc', hex: '#f8fafc', desc: 'Très subtil' },
  { label: 'Crème chaud papier', value: '#fafaf9', hex: '#fafaf9', desc: 'Chaleureux & naturel' },
  { label: 'Gris soutenu', value: '#e2e8f0', hex: '#e2e8f0', desc: 'Forte démarcation des cartes' },
  { label: 'Blueprint Technique', value: '#1e293b', hex: '#1e293b', desc: 'Mode ingénierie sombre' },
  { label: 'Indigo Nuit Dark', value: '#0f172a', hex: '#0f172a', desc: 'Mode sombre moderne' },
  { label: 'Noir OLED absolu', value: '#09090b', hex: '#09090b', desc: 'Noir profond pro' },
  { label: 'Vert Forêt Sombre', value: '#064e3b', hex: '#064e3b', desc: 'Ambiance nature & luxe' },
  { label: 'Violet Minuit', value: '#1e1b4b', hex: '#1e1b4b', desc: 'Style créatif' },
];

interface LayoutConfigPanelProps {
  item: DashboardItemData | null;
  parentInfo: {
    parent: DashboardItemData | null;
    index: number;
    siblings: DashboardItemData[];
  } | null;
  onClose: () => void;
  onUpdateWidth: (id: string, width: number) => void;
  onUpdateHeight: (id: string, height: number) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateContent?: (id: string, content: any) => void;
  onUpdateStyle: (id: string, styleUpdates: Partial<DashboardItemMeta>) => void;
  onMoveItem: (id: string, direction: 'prev' | 'next') => void;
  onRemoveItem: (id: string) => void;
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
  onOpenChartPicker: (containerId: string, containerName: string, defaultWidth?: number) => void;
  onReplaceChart?: (id: string) => void;
  onOpenMoveLayout?: (item: DashboardItemData) => void;
  onExtractToRoot?: (itemId: string) => void;
  canvasConfig: CanvasConfig;
  onUpdateCanvasConfig: (updates: Partial<CanvasConfig>) => void;
  activeTab?: 'item' | 'canvas';
  onTabChange?: (tab: 'item' | 'canvas') => void;
}

const getChartIcon = (chartType?: string) => {
  const type = (chartType || '').toLowerCase();
  if (type.includes('line') || type.includes('courbe')) return LineChart;
  if (type.includes('pie') || type.includes('secteur')) return PieChart;
  if (type.includes('area') || type.includes('aire')) return AreaChart;
  if (type.includes('table') || type.includes('tableau')) return FileText;
  return BarChart;
};

export const LayoutConfigPanel: React.FC<LayoutConfigPanelProps> = ({
  item,
  parentInfo,
  onClose,
  onUpdateWidth,
  onUpdateHeight,
  onUpdateTitle,
  onUpdateContent,
  onUpdateStyle,
  onMoveItem,
  onRemoveItem,
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
  onOpenChartPicker,
  onReplaceChart,
  onOpenMoveLayout,
  onExtractToRoot,
  canvasConfig,
  onUpdateCanvasConfig,
  activeTab: controlledTab,
  onTabChange
}) => {
  const [internalTab, setInternalTab] = useState<'item' | 'canvas'>(item ? 'item' : 'canvas');
  const activeTab = item ? (controlledTab || internalTab) : 'canvas';

  const setTab = (tab: 'item' | 'canvas') => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const isRow = item?.type === 'row';
  const isCol = item?.type === 'column';
  const isChart = item?.type === 'chart';
  const isTabs = item?.type === 'tabs';
  const isHeader = item?.type === 'header';
  const isMarkdown = item?.type === 'markdown';
  const isDivider = item?.type === 'divider';
  const isKpi = item?.type === 'kpi_card';
  const isCallout = item?.type === 'callout';
  const isAccordion = item?.type === 'accordion';
  const isMedia = item?.type === 'media';

  const width = item?.meta?.width || (isRow ? 12 : isKpi ? 4 : isCallout ? 12 : 6);
  const height = item?.meta?.height || (
    isChart ? 360 : 
    isHeader ? 100 : 
    isMarkdown ? 220 : 
    isDivider ? 50 : 
    isKpi ? 170 :
    isCallout ? 130 :
    isAccordion ? 380 :
    isTabs ? 440 : 400
  );
  const title = item?.meta?.title || (isChart ? (item.content?.name || '') : '');
  const children = item?.children || [];

  const currentBgColor = item?.meta?.backgroundColor || '';
  const currentBorderColor = item?.meta?.borderColor || '';
  const currentBorderStyle = item?.meta?.borderStyle || 'solid';
  const currentBorderWidth = item?.meta?.borderWidth ?? (item ? 1 : 0);
  const currentHeaderColor = item?.meta?.headerColor || '';

  const parentType = parentInfo?.parent ? parentInfo.parent.type : 'root';
  const isParentRow = parentType === 'row';
  const index = parentInfo ? parentInfo.index : 0;
  const totalSiblings = parentInfo ? parentInfo.siblings.length : 1;

  const ChartIcon = isChart ? getChartIcon(item?.content?.chart_type || item?.content?.viz_type) : null;

  const rawMarkdown = isMarkdown ? (
    typeof item.content === 'string' ? item.content : item.content?.markdown || ''
  ) : '';

  return (
    <aside className="w-88 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl shrink-0 z-30 animate-in slide-in-from-right duration-200">
      {/* Top Header with Mode Tabs */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl gap-1">
          {item && (
            <button
              type="button"
              onClick={() => setTab('item')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === 'item'
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {isRow ? 'Ligne' : 
                 isCol ? 'Colonne' : 
                 isTabs ? 'Onglets' : 
                 isHeader ? 'En-tête' : 
                 isMarkdown ? 'Markdown' : 
                 isDivider ? 'Séparateur' : 
                 isKpi ? 'Carte KPI' :
                 isCallout ? 'Insight' :
                 isAccordion ? 'Accordéon' :
                 isChart ? 'Graphique' : 'Élément'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setTab('canvas')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'canvas'
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <Paintbrush className="w-3.5 h-3.5 text-amber-600" />
            <span>Fond de la Page</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
          title="Fermer la configuration"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ITEM / LAYOUT CONFIGURATION                       */}
      {/* ======================================================== */}
      {activeTab === 'item' && item && (
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-slate-800">
          {/* Header Summary Box */}
          <div className={cn(
            "p-3 rounded-xl border flex items-center gap-3",
            isRow && "bg-indigo-50/70 border-indigo-200",
            isCol && "bg-emerald-50/70 border-emerald-200",
            isTabs && "bg-amber-50/70 border-amber-200",
            isHeader && "bg-indigo-50/70 border-indigo-200",
            isMarkdown && "bg-blue-50/70 border-blue-200",
            isDivider && "bg-slate-100 border-slate-200",
            isKpi && "bg-indigo-50/70 border-indigo-200",
            isCallout && "bg-blue-50/70 border-blue-200",
            isAccordion && "bg-purple-50/70 border-purple-200",
            isChart && "bg-slate-100/80 border-slate-200"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs font-bold text-white",
              isRow && "bg-indigo-600",
              isCol && "bg-emerald-600",
              isTabs && "bg-amber-600",
              isHeader && "bg-indigo-600",
              isMarkdown && "bg-blue-600",
              isDivider && "bg-slate-700",
              isKpi && "bg-indigo-600",
              isCallout && "bg-blue-600",
              isAccordion && "bg-purple-600",
              isChart && "bg-slate-800"
            )}>
              {isRow && <Rows className="w-4 h-4" />}
              {isCol && <Columns className="w-4 h-4" />}
              {isTabs && <Folder className="w-4 h-4" />}
              {isHeader && <HeadingIcon className="w-4 h-4" />}
              {isMarkdown && <Type className="w-4 h-4" />}
              {isDivider && <Split className="w-4 h-4" />}
              {isKpi && <Activity className="w-4 h-4" />}
              {isCallout && <Lightbulb className="w-4 h-4" />}
              {isAccordion && <Layout className="w-4 h-4" />}
              {isChart && ChartIcon && <ChartIcon className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {isRow ? 'Conteneur Ligne' : 
                 isCol ? 'Conteneur Colonne' : 
                 isTabs ? 'Bloc à Onglets' : 
                 isHeader ? 'En-tête de section' : 
                 isMarkdown ? 'Bloc Texte / Markdown' : 
                 isDivider ? 'Séparateur' : 
                 isKpi ? 'Carte KPI / Stat' :
                 isCallout ? 'Boîte d\'Insight / Alerte' :
                 isAccordion ? 'Section Repliable' : 'Composant Graphique'}
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">
                {title || (
                  isRow ? 'Ligne sans titre' : 
                  isCol ? 'Colonne sans titre' : 
                  isTabs ? 'Onglets' : 
                  isHeader ? 'En-tête' : 
                  isMarkdown ? 'Markdown' : 
                  isDivider ? 'Séparateur' : 
                  isKpi ? (item.meta?.kpiValue ? `${item.meta?.title || 'KPI'}: ${item.meta.kpiValue}` : 'Carte KPI') :
                  isCallout ? (item.meta?.calloutTitle || 'Boîte d\'Insight') :
                  isAccordion ? (item.meta?.title || 'Accordéon') : 'Graphique'
                )}
              </p>
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* HEADER SPECIFIC SETTINGS                           */}
          {/* -------------------------------------------------- */}
          {isHeader && (
            <div className="space-y-4 p-3.5 bg-indigo-50/40 border border-indigo-200/80 rounded-xl">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <HeadingIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Options de l'En-tête</span>
              </h4>

              {/* Titre Principal */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Titre Principal</label>
                <input
                  type="text"
                  value={item.meta?.title || ''}
                  onChange={(e) => onUpdateTitle(item.id, e.target.value)}
                  placeholder="Ex: Performance Commerciale"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              {/* Sous-titre */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Sous-titre / Description</label>
                <input
                  type="text"
                  value={item.meta?.subtitle || ''}
                  onChange={(e) => onUpdateStyle(item.id, { subtitle: e.target.value })}
                  placeholder="Ex: Suivi des marges et objectifs par région"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              {/* Niveau de Titre (H1 à H4) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Taille du Titre</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['h1', 'h2', 'h3', 'h4'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => onUpdateStyle(item.id, { headerLevel: lvl })}
                      className={cn(
                        "py-1 text-xs font-bold rounded border uppercase transition-colors",
                        (item.meta?.headerLevel || 'h2') === lvl
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignement */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Alignement</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'left', label: 'Gauche', icon: AlignLeft },
                    { id: 'center', label: 'Centre', icon: AlignCenter },
                    { id: 'right', label: 'Droite', icon: AlignRight },
                  ].map((align) => {
                    const Icon = align.icon;
                    return (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => onUpdateStyle(item.id, { alignment: align.id as any })}
                        className={cn(
                          "py-1 text-[11px] font-bold rounded border flex items-center justify-center gap-1 transition-colors",
                          (item.meta?.alignment || 'left') === align.id
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{align.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badge Text & Color */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Badge</label>
                  <input
                    type="text"
                    value={item.meta?.badge || ''}
                    onChange={(e) => onUpdateStyle(item.id, { badge: e.target.value })}
                    placeholder="Ex: LIVE, 2026"
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Couleur Badge</label>
                  <select
                    value={item.meta?.badgeColor || 'indigo'}
                    onChange={(e) => onUpdateStyle(item.id, { badgeColor: e.target.value as any })}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="emerald">Émeraude (Vert)</option>
                    <option value="amber">Ambre (Orange)</option>
                    <option value="rose">Rose (Rouge)</option>
                    <option value="slate">Gris Ardoise</option>
                  </select>
                </div>
              </div>

              {/* Divider Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={item.meta?.showDivider ?? true}
                  onChange={(e) => onUpdateStyle(item.id, { showDivider: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span className="text-xs font-semibold text-slate-700">Afficher la ligne de séparation inférieure</span>
              </label>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* MARKDOWN SPECIFIC SETTINGS                         */}
          {/* -------------------------------------------------- */}
          {isMarkdown && (
            <div className="space-y-3 p-3.5 bg-blue-50/40 border border-blue-200/80 rounded-xl">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-600" />
                <span>Contenu Markdown</span>
              </h4>

              {/* Shortcuts Toolbar */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n**Texte en gras**');
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700 text-xs font-bold"
                  title="Gras"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n*Texte en italique*');
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700 text-xs"
                  title="Italique"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n### Titre');
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700 text-xs"
                  title="Titre"
                >
                  <HeadingIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n- Élément 1\n- Élément 2');
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700 text-xs"
                  title="Liste"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateContent) onUpdateContent(item.id, rawMarkdown + '\n> Note ou citation');
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-700 text-xs"
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
                rows={6}
                className="w-full p-2.5 font-mono text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                placeholder="Rédigez votre texte markdown..."
              />
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* DIVIDER SPECIFIC SETTINGS                          */}
          {/* -------------------------------------------------- */}
          {isDivider && (
            <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-slate-600" />
                <span>Options du Séparateur</span>
              </h4>

              {/* Libellé central */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Texte / Libellé central (facultatif)</label>
                <input
                  type="text"
                  value={item.meta?.title || ''}
                  onChange={(e) => onUpdateTitle(item.id, e.target.value)}
                  placeholder="Ex: Détails opérationnels ou laisser vide"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

              {/* Style de trait */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Style de trait</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['solid', 'dashed', 'dotted'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateStyle(item.id, { dividerStyle: st })}
                      className={cn(
                        "py-1 text-xs font-bold rounded border capitalize transition-colors",
                        (item.meta?.dividerStyle || 'solid') === st
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {st === 'solid' ? 'Plein' : st === 'dashed' ? 'Tirets' : 'Points'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Épaisseur */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Épaisseur</label>
                <div className="grid grid-cols-3 gap-1">
                  {([1, 2, 4] as const).map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() => onUpdateStyle(item.id, { dividerThickness: th })}
                      className={cn(
                        "py-1 text-xs font-bold rounded border transition-colors",
                        (item.meta?.dividerThickness || 1) === th
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {th}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* TABS SPECIFIC SETTINGS                             */}
          {/* -------------------------------------------------- */}
          {isTabs && (
            <div className="space-y-3 p-3.5 bg-amber-50/40 border border-amber-200/80 rounded-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gestion des Onglets ({children.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (onAddTabToTabs) onAddTabToTabs(item.id, `Onglet ${children.length + 1}`);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ajouter</span>
                </button>
              </div>

              {/* List of tabs */}
              <div className="space-y-1.5">
                {children.map((tab, idx) => (
                  <div key={tab.id} className="flex items-center justify-between p-2 bg-white border border-amber-200 rounded-lg">
                    <span className="text-xs font-bold text-slate-800">
                      {tab.meta?.title || `Onglet ${idx + 1}`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {(tab.children || []).length} élément(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* KPI CARD SPECIFIC SETTINGS                         */}
          {/* -------------------------------------------------- */}
          {isKpi && (
            <div className="space-y-4 p-3.5 bg-indigo-50/40 border border-indigo-200/80 rounded-xl">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Paramètres de la Métrique KPI</span>
              </h4>

              {/* Titre & Valeur */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Libellé / Titre</label>
                  <input
                    type="text"
                    value={item.meta?.title || ''}
                    onChange={(e) => onUpdateTitle(item.id, e.target.value)}
                    placeholder="Chiffre d'affaires"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Valeur Principale</label>
                  <input
                    type="text"
                    value={item.meta?.kpiValue || ''}
                    onChange={(e) => onUpdateStyle(item.id, { kpiValue: e.target.value })}
                    placeholder="128 450"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              {/* Unité & Cible */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Unité / Devise</label>
                  <input
                    type="text"
                    value={item.meta?.kpiUnit || ''}
                    onChange={(e) => onUpdateStyle(item.id, { kpiUnit: e.target.value })}
                    placeholder="€, $, %, u."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Objectif / Cible</label>
                  <input
                    type="text"
                    value={item.meta?.kpiTarget || ''}
                    onChange={(e) => onUpdateStyle(item.id, { kpiTarget: e.target.value })}
                    placeholder="Obj: 120 000 €"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tendance & Direction */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Tendance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={item.meta?.kpiTrend ?? ''}
                    onChange={(e) => onUpdateStyle(item.id, { kpiTrend: parseFloat(e.target.value) || 0 })}
                    placeholder="12.5"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Direction</label>
                  <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateStyle(item.id, { kpiTrendDirection: 'up' })}
                      className={cn(
                        "flex-1 py-1 text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-colors",
                        (item.meta?.kpiTrendDirection || 'up') === 'up'
                          ? "bg-emerald-100 text-emerald-800"
                          : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>Hausse</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStyle(item.id, { kpiTrendDirection: 'down' })}
                      className={cn(
                        "flex-1 py-1 text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-colors",
                        item.meta?.kpiTrendDirection === 'down'
                          ? "bg-rose-100 text-rose-800"
                          : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <TrendingDown className="w-3 h-3" />
                      <span>Baisse</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Libellé de tendance */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Période de comparaison</label>
                <input
                  type="text"
                  value={item.meta?.kpiTrendLabel || ''}
                  onChange={(e) => onUpdateStyle(item.id, { kpiTrendLabel: e.target.value })}
                  placeholder="vs mois dernier"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              {/* Thème de Couleur & Icône */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Couleur du Thème</label>
                <div className="grid grid-cols-7 gap-1">
                  {[
                    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600' },
                    { id: 'emerald', label: 'Vert', bg: 'bg-emerald-600' },
                    { id: 'amber', label: 'Ambre', bg: 'bg-amber-600' },
                    { id: 'rose', label: 'Rose', bg: 'bg-rose-600' },
                    { id: 'blue', label: 'Bleu', bg: 'bg-blue-600' },
                    { id: 'purple', label: 'Violet', bg: 'bg-purple-600' },
                    { id: 'slate', label: 'Gris', bg: 'bg-slate-700' },
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      title={col.label}
                      onClick={() => onUpdateStyle(item.id, { kpiColor: col.id as any })}
                      className={cn(
                        "h-6 rounded-md transition-all flex items-center justify-center",
                        col.bg,
                        (item.meta?.kpiColor || 'indigo') === col.id ? "ring-2 ring-offset-1 ring-slate-800 scale-105" : "opacity-80 hover:opacity-100"
                      )}
                    >
                      {(item.meta?.kpiColor || 'indigo') === col.id && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Choix de l'icône */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Icône d'illustration</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'trending-up', label: 'Croissance', icon: TrendingUp },
                    { id: 'dollar', label: 'Finance', icon: DollarSign },
                    { id: 'users', label: 'Clients', icon: Users },
                    { id: 'shopping-bag', label: 'Ventes', icon: ShoppingBag },
                    { id: 'activity', label: 'Activité', icon: Activity },
                    { id: 'zap', label: 'Énergie', icon: Zap },
                    { id: 'shield', label: 'Sécurité', icon: Shield },
                    { id: 'target', label: 'Cible', icon: Target },
                  ].map((ic) => {
                    const IconComp = ic.icon;
                    const isSelected = (item.meta?.kpiIcon || 'trending-up') === ic.id;
                    return (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => onUpdateStyle(item.id, { kpiIcon: ic.id as any })}
                        className={cn(
                          "py-1.5 px-2 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-1 transition-all",
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span className="truncate">{ic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* CALLOUT BOX SPECIFIC SETTINGS                      */}
          {/* -------------------------------------------------- */}
          {isCallout && (
            <div className="space-y-4 p-3.5 bg-blue-50/40 border border-blue-200/80 rounded-xl">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                <span>Paramètres de la Boîte d'Insight / Alerte</span>
              </h4>

              {/* Type d'insight */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Type de message</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'insight', label: 'Insight IA', icon: Lightbulb, color: 'text-indigo-600' },
                    { id: 'info', label: 'Information', icon: Info, color: 'text-blue-600' },
                    { id: 'success', label: 'Succès', icon: CheckCircle2, color: 'text-emerald-600' },
                    { id: 'warning', label: 'Attention', icon: AlertTriangle, color: 'text-amber-600' },
                    { id: 'error', label: 'Critique', icon: AlertCircle, color: 'text-rose-600' },
                  ].map((ct) => {
                    const IconC = ct.icon;
                    const isCur = (item.meta?.calloutType || 'insight') === ct.id;
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => onUpdateStyle(item.id, { calloutType: ct.id as any })}
                        className={cn(
                          "py-1.5 px-2 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all",
                          isCur
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <IconC className={cn("w-3.5 h-3.5", isCur ? "text-white" : ct.color)} />
                        <span>{ct.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Titre du Callout */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Titre de l'Alerte / Insight</label>
                <input
                  type="text"
                  value={item.meta?.calloutTitle || item.meta?.title || ''}
                  onChange={(e) => {
                    onUpdateTitle(item.id, e.target.value);
                    onUpdateStyle(item.id, { calloutTitle: e.target.value });
                  }}
                  placeholder="Synthèse & Recommandation"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              {/* Texte du Callout */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Texte / Explication</label>
                <textarea
                  rows={3}
                  value={item.meta?.calloutText || (typeof item.content === 'string' ? item.content : '')}
                  onChange={(e) => {
                    if (onUpdateContent) onUpdateContent(item.id, e.target.value);
                    onUpdateStyle(item.id, { calloutText: e.target.value });
                  }}
                  placeholder="Indiquez ici les détails de l'insight..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 leading-relaxed custom-scrollbar"
                />
              </div>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* ACCORDION SPECIFIC SETTINGS                        */}
          {/* -------------------------------------------------- */}
          {isAccordion && (
            <div className="space-y-4 p-3.5 bg-purple-50/40 border border-purple-200/80 rounded-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-purple-600" />
                  <span>Section Repliable (Accordéon)</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">
                  {children.length} élément(s)
                </span>
              </div>

              {/* Titre et sous-titre */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Titre de la section</label>
                  <input
                    type="text"
                    value={item.meta?.title || ''}
                    onChange={(e) => onUpdateTitle(item.id, e.target.value)}
                    placeholder="Section Déroulante"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Sous-titre / Note</label>
                  <input
                    type="text"
                    value={item.meta?.subtitle || ''}
                    onChange={(e) => onUpdateStyle(item.id, { subtitle: e.target.value })}
                    placeholder="Détails analytiques approfondis"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* État par défaut */}
              <div className="flex items-center justify-between p-2 bg-white border border-purple-200 rounded-lg">
                <span className="text-xs font-medium text-slate-700">Déplié par défaut</span>
                <input
                  type="checkbox"
                  checked={item.meta?.defaultExpanded !== false}
                  onChange={(e) => onUpdateStyle(item.id, { defaultExpanded: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* MEDIA SPECIFIC SETTINGS                            */}
          {/* -------------------------------------------------- */}
          {isMedia && (
            <div className="space-y-4 p-3.5 bg-fuchsia-50/40 border border-fuchsia-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <ImageIcon className="w-4 h-4 text-fuchsia-600" />
                <h4 className="text-xs font-bold text-fuchsia-900">Multimédia</h4>
              </div>

              {/* URL du média */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">URL de l'image / vidéo</label>
                <input
                  type="text"
                  value={item.meta?.mediaUrl || ''}
                  onChange={(e) => onUpdateStyle(item.id, { mediaUrl: e.target.value })}
                  placeholder="https://exemple.com/image.jpg"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              {/* Titre */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Titre (optionnel)</label>
                <input
                  type="text"
                  value={item.meta?.title || ''}
                  onChange={(e) => onUpdateTitle(item.id, e.target.value)}
                  placeholder="Titre de l'image"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              {/* Ajustement de l'image */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Ajustement (Object Fit)</label>
                <select
                  value={item.meta?.mediaFit || 'cover'}
                  onChange={(e) => onUpdateStyle(item.id, { mediaFit: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                >
                  <option value="cover">Remplir (Cover)</option>
                  <option value="contain">Ajuster (Contain)</option>
                  <option value="fill">Étirer (Fill)</option>
                  <option value="none">Taille réelle (None)</option>
                </select>
              </div>
            </div>
          )}

          {/* SECTION: TITRE POUR LES CONTENEURS (LIGNE, COLONNE, ONGLETS) */}
          {(isRow || isCol || isTabs) && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Titre / Libellé</span>
                <span className="text-[10px] text-slate-400 font-normal">Facultatif</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => onUpdateTitle(item.id, e.target.value)}
                placeholder={isRow ? "Ex: Section Ventes & KPIs" : isCol ? "Ex: Colonne Métriques" : "Nom des onglets"}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          )}

          {/* SECTION: LARGEUR SUR LA GRILLE 12 COLONNES */}
          {!isDivider && (
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Largeur sur la grille</span>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {width}/12 ({Math.round((width / 12) * 100)}%)
                </span>
              </label>

              <div className="grid grid-cols-5 gap-1.5">
                {WIDTH_PRESETS.map((p) => {
                  const isCur = width === p.width;
                  return (
                    <button
                      key={p.width}
                      type="button"
                      onClick={() => onUpdateWidth(item.id, p.width)}
                      className={cn(
                        "py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 cursor-pointer",
                        isCur
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <span>{p.label}</span>
                      <span className={cn("text-[9px] font-normal", isCur ? "text-indigo-200" : "text-slate-400")}>
                        {p.width} col
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: HAUTEUR */}
          {!isDivider && !isRow && !isCol && !isTabs && (
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Hauteur du bloc</span>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {height}px
                </span>
              </label>
              
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={isHeader ? 60 : 120}
                  max={800}
                  step={10}
                  value={height}
                  onChange={(e) => onUpdateHeight(item.id, parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* SECTION: COULEUR DE FOND DU LAYOUT */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-slate-800">Couleur de fond</label>
              </div>
              {currentBgColor && (
                <button
                  type="button"
                  onClick={() => onUpdateStyle(item.id, { backgroundColor: undefined })}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Défaut</span>
                </button>
              )}
            </div>

            {/* Quick Palette Swatches */}
            <div className="grid grid-cols-7 gap-2">
              {LAYOUT_BG_PRESETS.map((p) => {
                const isSelected = (!currentBgColor && p.value === 'transparent') || currentBgColor.toLowerCase() === p.value.toLowerCase();
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onUpdateStyle(item.id, { backgroundColor: p.value === 'transparent' ? undefined : p.value })}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all relative cursor-pointer",
                      p.preview,
                      isSelected ? "ring-2 ring-indigo-600 ring-offset-2 scale-110 shadow-sm" : "hover:scale-105"
                    )}
                    title={p.label}
                  >
                    {isSelected && (
                      <Check className={cn("w-3.5 h-3.5 font-bold", p.value === '#000000' || p.value === '#09090b' || p.value === '#0f172a' || p.value === '#1e293b' ? "text-white" : "text-indigo-600")} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Hex input */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="color"
                value={currentBgColor && currentBgColor.startsWith('#') ? currentBgColor : '#ffffff'}
                onChange={(e) => onUpdateStyle(item.id, { backgroundColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer overflow-hidden p-0 bg-transparent block"
              />
              <input
                type="text"
                value={currentBgColor || ''}
                onChange={(e) => onUpdateStyle(item.id, { backgroundColor: e.target.value })}
                placeholder="Code Hex (ex: #f8fafc)"
                className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* SECTION: BORDURES ET ESPACEMENTS */}
          <div className="space-y-4 pt-3 border-t border-slate-200">
            {/* Border Radius en Pixels */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Arrondi des coins (Border Radius)</span>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {typeof item.meta?.borderRadius === 'number'
                    ? `${item.meta.borderRadius}px`
                    : item.meta?.borderRadius === 'none'
                    ? '0px'
                    : item.meta?.borderRadius === 'sm'
                    ? '2px'
                    : item.meta?.borderRadius === 'md'
                    ? '6px'
                    : item.meta?.borderRadius === 'lg'
                    ? '8px'
                    : item.meta?.borderRadius === 'xl'
                    ? '12px'
                    : item.meta?.borderRadius === '2xl'
                    ? '16px'
                    : item.meta?.borderRadius === '3xl'
                    ? '24px'
                    : item.meta?.borderRadius === 'full'
                    ? '99px'
                    : item.meta?.borderRadius
                    ? (isNaN(Number(item.meta.borderRadius)) ? String(item.meta.borderRadius) : `${item.meta.borderRadius}px`)
                    : '12px'}
                </span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={64}
                  step={2}
                  value={
                    typeof item.meta?.borderRadius === 'number'
                      ? item.meta.borderRadius
                      : item.meta?.borderRadius === 'none'
                      ? 0
                      : item.meta?.borderRadius === 'sm'
                      ? 2
                      : item.meta?.borderRadius === 'md'
                      ? 6
                      : item.meta?.borderRadius === 'lg'
                      ? 8
                      : item.meta?.borderRadius === 'xl' || !item.meta?.borderRadius
                      ? 12
                      : item.meta?.borderRadius === '2xl'
                      ? 16
                      : item.meta?.borderRadius === '3xl'
                      ? 24
                      : item.meta?.borderRadius === 'full'
                      ? 64
                      : parseInt(String(item.meta.borderRadius), 10) || 12
                  }
                  onChange={(e) => onUpdateStyle(item.id, { borderRadius: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-600"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={
                    typeof item.meta?.borderRadius === 'number'
                      ? item.meta.borderRadius
                      : item.meta?.borderRadius === 'none'
                      ? 0
                      : item.meta?.borderRadius === 'sm'
                      ? 2
                      : item.meta?.borderRadius === 'md'
                      ? 6
                      : item.meta?.borderRadius === 'lg'
                      ? 8
                      : item.meta?.borderRadius === 'xl' || !item.meta?.borderRadius
                      ? 12
                      : item.meta?.borderRadius === '2xl'
                      ? 16
                      : item.meta?.borderRadius === '3xl'
                      ? 24
                      : item.meta?.borderRadius === 'full'
                      ? 99
                      : parseInt(String(item.meta.borderRadius), 10) || 12
                  }
                  onChange={(e) => onUpdateStyle(item.id, { borderRadius: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-right outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500 font-bold">px</span>
              </div>

              {/* Raccourcis Rapides */}
              <div className="grid grid-cols-5 gap-1 pt-1">
                {[
                  { label: '0px', val: 0 },
                  { label: '8px', val: 8 },
                  { label: '16px', val: 16 },
                  { label: '24px', val: 24 },
                  { label: '32px', val: 32 },
                ].map((preset) => {
                  const currentVal =
                    typeof item.meta?.borderRadius === 'number'
                      ? item.meta.borderRadius
                      : item.meta?.borderRadius === 'none'
                      ? 0
                      : item.meta?.borderRadius === 'md'
                      ? 6
                      : item.meta?.borderRadius === 'xl' || !item.meta?.borderRadius
                      ? 12
                      : item.meta?.borderRadius === '2xl'
                      ? 16
                      : parseInt(String(item.meta?.borderRadius), 10) || 0;
                  const isSelected = currentVal === preset.val;
                  return (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => onUpdateStyle(item.id, { borderRadius: preset.val })}
                      className={cn(
                        "py-1 rounded text-[10px] font-bold border text-center transition-all cursor-pointer",
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Padding */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Marge interne (Padding)</span>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {item.meta?.padding ?? 20}px
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={64}
                step={4}
                value={item.meta?.padding ?? 20}
                onChange={(e) => onUpdateStyle(item.id, { padding: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Marge externe (Margin)</span>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {item.meta?.margin ?? 0}px
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={64}
                step={4}
                value={item.meta?.margin ?? 0}
                onChange={(e) => onUpdateStyle(item.id, { margin: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* SECTION: AJOUT D'ÉLÉMENTS DANS CE CONTENEUR */}
          {(isRow || isCol || isTabs) && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ajouter dans ce conteneur</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChartPicker(item.id, title || 'Conteneur', 6)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  <BarChart className="w-4 h-4 text-slate-700" />
                  <span>Graphique</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddRowToContainer(item.id)}
                  className="p-2.5 bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs font-bold text-indigo-900 transition-colors cursor-pointer"
                >
                  <Rows className="w-4 h-4 text-indigo-600" />
                  <span>Ligne</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddColumnToContainer(item.id)}
                  className="p-2.5 bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900 transition-colors cursor-pointer"
                >
                  <Columns className="w-4 h-4 text-emerald-600" />
                  <span>Colonne</span>
                </button>

                {onAddTabsToContainer && (
                  <button
                    type="button"
                    onClick={() => onAddTabsToContainer(item.id)}
                    className="p-2.5 bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-900 transition-colors cursor-pointer"
                  >
                    <Folder className="w-4 h-4 text-amber-600" />
                    <span>Onglets</span>
                  </button>
                )}

                {onAddHeaderToContainer && (
                  <button
                    type="button"
                    onClick={() => onAddHeaderToContainer(item.id)}
                    className="p-2.5 bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs font-bold text-indigo-900 transition-colors cursor-pointer"
                  >
                    <HeadingIcon className="w-4 h-4 text-indigo-600" />
                    <span>En-tête</span>
                  </button>
                )}

                {onAddMarkdownToContainer && (
                  <button
                    type="button"
                    onClick={() => onAddMarkdownToContainer(item.id)}
                    className="p-2.5 bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-900 transition-colors cursor-pointer"
                  >
                    <Type className="w-4 h-4 text-blue-600" />
                    <span>Texte / MD</span>
                  </button>
                )}

                {onAddDividerToContainer && (
                  <button
                    type="button"
                    onClick={() => onAddDividerToContainer(item.id)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                  >
                    <Split className="w-4 h-4 text-slate-600" />
                    <span>Séparateur</span>
                  </button>
                )}

                {onAddKpiCardToContainer && (
                  <button
                    type="button"
                    onClick={() => onAddKpiCardToContainer(item.id)}
                    className="p-2.5 bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs font-bold text-indigo-900 transition-colors cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>Carte KPI</span>
                  </button>
                )}

                {onAddCalloutToContainer && (
                  <button
                    type="button"
                    onClick={() => onAddCalloutToContainer(item.id)}
                    className="p-2.5 bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-900 transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span>Insight</span>
                  </button>
                )}

                {onAddAccordionToContainer && (
                  <button
                    type="button"
                    onClick={() => onAddAccordionToContainer(item.id)}
                    className="p-2.5 bg-purple-50/60 hover:bg-purple-100/80 border border-purple-200 rounded-xl flex items-center gap-2 text-xs font-bold text-purple-900 transition-colors cursor-pointer"
                  >
                    <Layout className="w-4 h-4 text-purple-600" />
                    <span>Accordéon</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DANGER ZONE: SUPPRESSION */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => onRemoveItem(item.id)}
              className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer cet élément</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CANVAS / GLOBAL PAGE CONFIGURATION                */}
      {/* ======================================================== */}
      {activeTab === 'canvas' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-slate-800">
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <Paintbrush className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">Arrière-plan & Style Global</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Personnalisez la couleur de fond et la texture pour l'ensemble du tableau de bord.
              </p>
            </div>
          </div>

          {/* Preset Canvas Backgrounds */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Palettes de fond recommandées</label>
            <div className="space-y-1.5">
              {CANVAS_BG_PRESETS.map((bg) => {
                const isSelected = canvasConfig.backgroundColor.toLowerCase() === bg.value.toLowerCase();
                return (
                  <button
                    key={bg.value}
                    type="button"
                    onClick={() => onUpdateCanvasConfig({ backgroundColor: bg.value })}
                    className={cn(
                      "w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left",
                      isSelected
                        ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/50 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg border border-slate-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: bg.hex }}
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{bg.label}</span>
                        <span className="text-[10px] text-slate-400">{bg.desc}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex Color Picker */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-800">Couleur personnalisée libre</label>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="color"
                value={canvasConfig.backgroundColor.startsWith('#') ? canvasConfig.backgroundColor : '#f1f5f9'}
                onChange={(e) => onUpdateCanvasConfig({ backgroundColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer overflow-hidden p-0 bg-transparent block"
              />
              <input
                type="text"
                value={canvasConfig.backgroundColor}
                onChange={(e) => onUpdateCanvasConfig({ backgroundColor: e.target.value })}
                placeholder="#f1f5f9"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Pattern Texture */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-800">Motif d'arrière-plan (Texture)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dots', label: 'Points' },
                { id: 'grid', label: 'Quadrillage' },
                { id: 'none', label: 'Uni' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onUpdateCanvasConfig({ pattern: p.id as any })}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer",
                    canvasConfig.pattern === p.id
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page Width & Size */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Largeur de la Page (Toile)</span>
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {canvasConfig.maxWidth || '1400px'}
              </span>
            </label>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '1200 px', value: '1200px' },
                { label: '1400 px', value: '1400px' },
                { label: '1600 px', value: '1600px' },
                { label: '1920 px', value: '1920px' },
                { label: '100% (Plein)', value: '100%' },
              ].map((preset) => {
                const isSelected = canvasConfig.maxWidth === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onUpdateCanvasConfig({ maxWidth: preset.value })}
                    className={cn(
                      "py-1.5 rounded-xl text-[11px] font-bold border text-center transition-all cursor-pointer",
                      isSelected
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Pixel Slider & Input */}
            {canvasConfig.maxWidth !== '100%' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={800}
                    max={2500}
                    step={50}
                    value={parseInt(canvasConfig.maxWidth || '1400', 10) || 1400}
                    onChange={(e) => onUpdateCanvasConfig({ maxWidth: `${e.target.value}px` })}
                    className="w-full accent-amber-600"
                  />
                  <input
                    type="number"
                    min={600}
                    max={3840}
                    step={10}
                    value={parseInt(canvasConfig.maxWidth || '1400', 10) || 1400}
                    onChange={(e) => onUpdateCanvasConfig({ maxWidth: `${e.target.value}px` })}
                    className="w-20 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-right outline-none focus:border-amber-500"
                  />
                  <span className="text-xs text-slate-500 font-bold">px</span>
                </div>
              </div>
            )}
          </div>

          {/* Gap & Spacing */}
          <div className="space-y-4 pt-3 border-t border-slate-200">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Espacement Horizontal (px)</span>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {canvasConfig.gapX ?? 24}px
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={64}
                step={4}
                value={canvasConfig.gapX ?? 24}
                onChange={(e) => onUpdateCanvasConfig({ gapX: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Espacement Vertical (px)</span>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {canvasConfig.gapY ?? 24}px
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={64}
                step={4}
                value={canvasConfig.gapY ?? 24}
                onChange={(e) => onUpdateCanvasConfig({ gapY: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-600"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
