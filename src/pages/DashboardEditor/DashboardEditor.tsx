import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  Search, 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart, 
  FileText, 
  Layers,
  ExternalLink,
  Rows,
  Columns,
  LayoutGrid,
  X,
  ChevronRight,
  Magnet,
  Paintbrush,
  Palette,
  Folder,
  Heading as HeadingIcon,
  Type,
  Split,
  Activity,
  Lightbulb,
  Layout,
  Image as ImageIcon
} from 'lucide-react';
import { getCharts as getLocalCharts, saveDashboard as saveLocalDashboard, getDashboard as getLocalDashboard } from '../../core/utils/db';
import { hifadihService } from '../../lib/hifadihService';
import { toast } from 'sonner';
import { cn } from '../../core/utils/utils';
import { Skeleton, DashboardEditorCanvasSkeleton } from '../../components/ui/Skeleton';
import { DashboardItemData, DashboardItemMeta, generateId } from './types';
import { EditorItemNode } from './EditorItemNode';
import { 
  addChildNode, 
  updateNode, 
  deleteNode, 
  moveNode,
  moveNodeRelativeTo,
  moveNodeToRoot,
  findNode,
  findParentInfo,
  moveNodeToContainer,
  extractNodeToRoot
} from './treeUtils';
import { updateItemWidthWithCollision } from './collisionUtils';
import { EditorDragProvider, useEditorDrag } from './EditorDragContext';
import { LayoutConfigPanel, CanvasConfig } from './LayoutConfigPanel';
import { GridOverlay } from './GridOverlay';
import { MoveLayoutModal } from './MoveLayoutModal';

// Snap-To-Grid Control Button in Header
const SnapToGridToggle: React.FC = () => {
  const { isSnapToGridEnabled, toggleSnapToGrid } = useEditorDrag();

  return (
    <button
      onClick={toggleSnapToGrid}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border shadow-2xs cursor-pointer",
        isSnapToGridEnabled 
          ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 ring-1 ring-indigo-300" 
          : "bg-white border-border text-muted-foreground hover:text-foreground hover:bg-slate-50"
      )}
      title="Activer ou désactiver l'aimantation automatique à la grille 12 colonnes"
    >
      <Magnet className={cn("w-3.5 h-3.5", isSnapToGridEnabled ? "text-indigo-600" : "text-muted-foreground")} />
      <span className="hidden sm:inline">Aimantation grille</span>
      <span className={cn(
        "w-2 h-2 rounded-full",
        isSnapToGridEnabled ? "bg-indigo-600 animate-pulse" : "bg-slate-300"
      )} />
    </button>
  );
};

// Drop Zone at bottom of Root Canvas when an item is being dragged
const RootDropZone: React.FC<{ onDropToRoot: (id: string) => void }> = ({ onDropToRoot }) => {
  const { draggedItemId, endDrag } = useEditorDrag();
  const [isOver, setIsOver] = useState(false);

  if (!draggedItemId) return null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedItemId) {
          onDropToRoot(draggedItemId);
        }
        setIsOver(false);
        endDrag();
      }}
      className={cn(
        "w-full mt-6 py-5 px-6 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 cursor-pointer text-center animate-in fade-in duration-150",
        isOver
          ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-200 scale-[1.01]"
          : "border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/60 text-indigo-700"
      )}
    >
      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
        <Plus className="w-4 h-4" />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold">Déposer ici pour placer à la fin de la racine</p>
        <p className="text-[11px] text-slate-500">Permet d'extraire une ligne, colonne ou graphique vers le niveau principal</p>
      </div>
    </div>
  );
};

// Helper to choose appropriate chart icon
const getChartIcon = (chartType?: string) => {
  const type = (chartType || '').toLowerCase();
  if (type.includes('line') || type.includes('ligne') || type.includes('courbe')) return LineChart;
  if (type.includes('pie') || type.includes('secteur') || type.includes('camembert')) return PieChart;
  if (type.includes('area') || type.includes('aire')) return AreaChart;
  if (type.includes('table') || type.includes('tableau')) return FileText;
  return BarChart;
};

export const DashboardEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dashboardId, setDashboardId] = useState<string>(id && id !== 'new' ? id : generateId());
  const [dashboardName, setDashboardName] = useState<string>('Nouveau tableau de bord');
  const [items, setItems] = useState<DashboardItemData[]>([]);
  const [availableCharts, setAvailableCharts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sidebar tab: 'charts' (Graphiques) or 'layouts' (Ligne & Colonne)
  const [sidebarTab, setSidebarTab] = useState<'charts' | 'layouts'>('charts');

  // Canvas & Page Configuration State
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
    backgroundColor: '#f1f5f9',
    pattern: 'dots',
    maxWidth: '1400px',
    gapX: 24,
    gapY: 24,
  });

  // Config Inspector Panel State
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState<boolean>(true);
  const [configPanelTab, setConfigPanelTab] = useState<'item' | 'canvas'>('item');

  // Currently selected item for layout configuration panel
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = selectedItemId ? findNode(items, selectedItemId) : null;
  const selectedItemParentInfo = selectedItemId ? findParentInfo(items, selectedItemId) : null;

  // Active resizing item tracker
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);

  // Modal for picking a chart to add to a specific container (row, column, or root)
  const [targetForChartPicker, setTargetForChartPicker] = useState<{
    containerId?: string;
    containerName: string;
    defaultWidth?: number;
  } | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState<string>('');

  // Modal for moving a layout (row, column, or chart) to another container or root
  const [movingLayoutItem, setMovingLayoutItem] = useState<DashboardItemData | null>(null);

  // Load existing dashboard and available charts
  useEffect(() => {
    loadAllData();
  }, [id]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch available charts from local DB and remote hifadihService
      const [localCharts, remoteRes] = await Promise.all([
        getLocalCharts().catch(() => []),
        hifadihService.getCharts().catch(() => ({ result: [] }))
      ]);

      const combinedCharts: any[] = [...localCharts];
      const remoteList = remoteRes?.result || [];

      remoteList.forEach((remote: any) => {
        if (!combinedCharts.find(c => String(c.id) === String(remote.id))) {
          combinedCharts.push({
            ...remote,
            name: remote.slice_name || remote.name || 'Graphique sans titre',
            chart_type: remote.viz_type || remote.chart_type || 'Bar',
            table_name: remote.datasource_name || remote.table_name || 'Données',
          });
        }
      });

      setAvailableCharts(combinedCharts);

      // 2. Load existing dashboard if editing
      if (id && id !== 'new') {
        let loadedDashboard: any = null;
        try {
          loadedDashboard = await hifadihService.getDashboard(id);
        } catch (e) {
          // ignore
        }

        if (!loadedDashboard) {
          loadedDashboard = await getLocalDashboard(id);
        }

        if (loadedDashboard) {
          setDashboardId(String(loadedDashboard.id));
          setDashboardName(loadedDashboard.name || loadedDashboard.dashboard_title || 'Tableau de bord');
          
          if (loadedDashboard.canvas_background || loadedDashboard.canvasConfig) {
            setCanvasConfig(prev => ({
              ...prev,
              ...(loadedDashboard.canvasConfig || {}),
              backgroundColor: loadedDashboard.canvas_background || loadedDashboard.canvasConfig?.backgroundColor || prev.backgroundColor
            }));
          }

          // Parse layout recursively
          const rawLayout = loadedDashboard.layout || [];
          
          const normalizeItem = (item: any): DashboardItemData => {
            const isRowOrCol = item.type === 'row' || item.type === 'column';
            return {
              id: item.id || generateId(),
              type: item.type || 'chart',
              content: item.content || (!isRowOrCol ? item : undefined),
              children: Array.isArray(item.children) ? item.children.map(normalizeItem) : (isRowOrCol ? [] : undefined),
              meta: {
                width: item.meta?.width || (item.type === 'row' ? 12 : 6),
                height: item.meta?.height || (item.type === 'chart' ? 380 : 420),
                title: item.meta?.title || item.content?.name || (item.type === 'row' ? 'Ligne' : item.type === 'column' ? 'Colonne' : ''),
                backgroundColor: item.meta?.backgroundColor,
                borderColor: item.meta?.borderColor,
                borderWidth: item.meta?.borderWidth,
                borderStyle: item.meta?.borderStyle,
                headerColor: item.meta?.headerColor,
                borderRadius: item.meta?.borderRadius,
                shadow: item.meta?.shadow,
                textColor: item.meta?.textColor,
              }
            };
          };

          if (Array.isArray(rawLayout)) {
            // Check if there is a local draft with resized columns in localStorage
            const draftKey = `hifadih_dashboard_editor_draft_${id || 'new'}`;
            const localDraft = localStorage.getItem(draftKey);
            if (localDraft) {
              try {
                const parsed = JSON.parse(localDraft);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setItems(parsed.map(normalizeItem));
                  return;
                }
              } catch (e) {}
            }
            setItems(rawLayout.map(normalizeItem));
          }
        }
      } else {
        // New dashboard: check draft
        const draftKey = `hifadih_dashboard_editor_draft_new`;
        const localDraft = localStorage.getItem(draftKey);
        if (localDraft) {
          try {
            const parsed = JSON.parse(localDraft);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setItems(parsed);
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Erreur de chargement:', err);
      toast.error('Impossible de charger les données du tableau de bord');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // Layout and Chart Add Handlers
  // ----------------------------------------------------

  // Add a new Row (either at root or inside a Column/Row)
  const handleAddRow = (containerId?: string) => {
    const newRow: DashboardItemData = {
      id: generateId(),
      type: 'row',
      children: [],
      meta: {
        width: 12,
        height: 400,
        title: 'Ligne'
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newRow));
      toast.success('Ligne insérée dans le conteneur');
    } else {
      setItems(prev => [...prev, newRow]);
      toast.success('Ligne ajoutée au tableau de bord');
    }
  };

  // Add a new Column (either at root or inside a Row/Column)
  const handleAddColumn = (containerId?: string) => {
    const newCol: DashboardItemData = {
      id: generateId(),
      type: 'column',
      children: [],
      meta: {
        width: containerId ? 6 : 6, // 50% by default so two fit side-by-side
        height: 420,
        title: 'Colonne'
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newCol));
      toast.success('Colonne insérée dans le conteneur');
    } else {
      setItems(prev => [...prev, newCol]);
      toast.success('Colonne ajoutée au tableau de bord');
    }
  };

  // Add a chart (either at root or inside a container)
  const handleAddChart = (chart: any, containerId?: string, customWidth?: number) => {
    const newItem: DashboardItemData = {
      id: generateId(),
      type: 'chart',
      content: chart,
      meta: {
        width: customWidth || (containerId ? 6 : 12),
        height: 380,
        title: chart.name || chart.slice_name || 'Graphique'
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newItem));
      toast.success(`"${chart.name}" inséré dans le layout`);
    } else {
      setItems(prev => [...prev, newItem]);
      toast.success(`"${chart.name}" ajouté au tableau de bord`);
    }

    setTargetForChartPicker(null);
  };

  // Add a new Tabs container
  const handleAddTabs = (containerId?: string) => {
    const tab1Id = generateId();
    const tab2Id = generateId();
    const newTabs: DashboardItemData = {
      id: generateId(),
      type: 'tabs',
      children: [
        {
          id: tab1Id,
          type: 'tab',
          children: [],
          meta: {
            width: 12,
            title: 'Onglet 1',
          }
        },
        {
          id: tab2Id,
          type: 'tab',
          children: [],
          meta: {
            width: 12,
            title: 'Onglet 2',
          }
        }
      ],
      meta: {
        width: 12,
        height: 440,
        title: 'Section à Onglets',
        activeTabId: tab1Id,
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newTabs));
      toast.success('Section à onglets insérée dans le conteneur');
    } else {
      setItems(prev => [...prev, newTabs]);
      toast.success('Section à onglets ajoutée au tableau de bord');
    }
  };

  // Add a new Header item
  const handleAddHeader = (containerId?: string) => {
    const newHeader: DashboardItemData = {
      id: generateId(),
      type: 'header',
      content: 'Titre de la section',
      meta: {
        width: 12,
        height: 100,
        title: 'Titre de la section',
        subtitle: 'Sous-titre explicatif et contexte',
        headerLevel: 'h2',
        alignment: 'left',
        icon: 'sparkles',
        badge: 'KPIs',
        badgeColor: 'indigo',
        showDivider: true,
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newHeader));
      toast.success('En-tête inséré dans le conteneur');
    } else {
      setItems(prev => [...prev, newHeader]);
      toast.success('En-tête ajouté au tableau de bord');
    }
  };

  // Add a new Text/Markdown item
  const handleAddMarkdown = (containerId?: string) => {
    const defaultMarkdown = `### 📊 Synthèse & Analyses Clés\n\n- **Performance** : Progression de +12% ce mois-ci.\n- **Points clés** : Forte dynamique sur les canaux digitaux.\n\n> *Note : Données synchronisées en temps réel.*`;

    const newMarkdown: DashboardItemData = {
      id: generateId(),
      type: 'markdown',
      content: defaultMarkdown,
      meta: {
        width: 12,
        height: 220,
        title: 'Bloc Texte / Markdown',
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newMarkdown));
      toast.success('Bloc Markdown inséré dans le conteneur');
    } else {
      setItems(prev => [...prev, newMarkdown]);
      toast.success('Bloc Markdown ajouté au tableau de bord');
    }
  };

  // Add a new Divider item
  const handleAddDivider = (containerId?: string) => {
    const newDivider: DashboardItemData = {
      id: generateId(),
      type: 'divider',
      meta: {
        width: 12,
        height: 50,
        title: '',
        dividerStyle: 'solid',
        dividerThickness: 1,
        dividerColor: '#cbd5e1',
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newDivider));
      toast.success('Séparateur inséré dans le conteneur');
    } else {
      setItems(prev => [...prev, newDivider]);
      toast.success('Séparateur ajouté au tableau de bord');
    }
  };

  // Add a new KPI Card item
  const handleAddKpiCard = (containerId?: string) => {
    const newKpi: DashboardItemData = {
      id: generateId(),
      type: 'kpi_card',
      meta: {
        width: 4,
        height: 170,
        title: 'Chiffre d\'affaires',
        kpiValue: '128 450',
        kpiUnit: '€',
        kpiTrend: 12.5,
        kpiTrendDirection: 'up',
        kpiTrendLabel: 'vs mois dernier',
        kpiTarget: 'Obj: 120 000 €',
        kpiColor: 'indigo',
        kpiIcon: 'trending-up',
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newKpi));
      toast.success('Carte KPI insérée dans le conteneur');
    } else {
      setItems(prev => [...prev, newKpi]);
      toast.success('Carte KPI ajoutée au tableau de bord');
    }
  };

  // Add a new Callout Box item
  const handleAddCallout = (containerId?: string) => {
    const newCallout: DashboardItemData = {
      id: generateId(),
      type: 'callout',
      content: 'Analyse stratégique : Les performances commerciales dépassent les prévisions de +8.4% ce trimestre grâce à l\'expansion régionale.',
      meta: {
        width: 12,
        height: 130,
        calloutType: 'insight',
        calloutTitle: 'Synthèse & Recommandation',
        calloutText: 'Analyse stratégique : Les performances commerciales dépassent les prévisions de +8.4% ce trimestre grâce à l\'expansion régionale.',
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newCallout));
      toast.success('Boîte d\'Insight insérée dans le conteneur');
    } else {
      setItems(prev => [...prev, newCallout]);
      toast.success('Boîte d\'Insight ajoutée au tableau de bord');
    }
  };

  // Add a new Accordion item
  const handleAddAccordion = (containerId?: string) => {
    const newAccordion: DashboardItemData = {
      id: generateId(),
      type: 'accordion',
      children: [],
      meta: {
        width: 12,
        height: 380,
        title: 'Section Déroulante (Détails & Analyses)',
        subtitle: 'Cliquez pour afficher ou masquer ce bloc',
        defaultExpanded: true,
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newAccordion));
      toast.success('Section repliable insérée dans le conteneur');
    } else {
      setItems(prev => [...prev, newAccordion]);
      toast.success('Section repliable ajoutée au tableau de bord');
    }
  };

  // Add a new Media item
  const handleAddMedia = (containerId?: string) => {
    const newMedia: DashboardItemData = {
      id: generateId(),
      type: 'media',
      meta: {
        width: 12,
        height: 400,
        mediaType: 'image',
        mediaUrl: '',
        title: 'Contenu Multimédia',
        subtitle: 'Insérez une image ou une vidéo',
        mediaFit: 'cover'
      }
    };

    if (containerId) {
      setItems(prev => addChildNode(prev, containerId, newMedia));
      toast.success('Contenu multimédia inséré dans le conteneur');
    } else {
      setItems(prev => [...prev, newMedia]);
      toast.success('Contenu multimédia ajouté au tableau de bord');
    }
  };

  // Add a new tab to an existing Tabs container
  const handleAddTabToTabs = (tabsId: string, customTitle?: string) => {
    const newTab: DashboardItemData = {
      id: generateId(),
      type: 'tab',
      children: [],
      meta: {
        width: 12,
        title: customTitle || 'Nouvel Onglet',
      }
    };

    setItems(prev => updateNode(prev, tabsId, tabsItem => ({
      ...tabsItem,
      children: [...(tabsItem.children || []), newTab]
    })));
    toast.success('Nouvel onglet ajouté');
  };

  // Update item content (e.g. for markdown or custom payload)
  const handleUpdateContent = (itemId: string, content: any) => {
    setItems(prev => updateNode(prev, itemId, item => ({
      ...item,
      content
    })));
  };

  // ----------------------------------------------------
  // Tree Manipulation Handlers: Resize, Move, Delete
  // ----------------------------------------------------

  // Update item width (1 to 12 columns) with collision detection & automatic pushing of adjacent siblings
  const handleUpdateWidth = (itemId: string, newWidth: number) => {
    setItems(prev => {
      const { updatedNodes } = updateItemWidthWithCollision(prev, itemId, newWidth);
      try {
        const draftKey = `hifadih_dashboard_editor_draft_${id || 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify(updatedNodes));
      } catch (e) {}
      return updatedNodes;
    });
  };

  // Move layout or item to a target container or root with collision handling
  const handleMoveToContainer = (
    sourceId: string, 
    targetContainerId: string | 'root', 
    position: 'start' | 'end' | number = 'end'
  ) => {
    setItems(prev => {
      const updated = moveNodeToContainer(prev, sourceId, targetContainerId, position);
      try {
        const draftKey = `hifadih_dashboard_editor_draft_${id || 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    toast.success('Layout déplacé avec succès');
  };

  // Extract nested node to root level
  const handleExtractToRoot = (sourceId: string) => {
    setItems(prev => {
      const updated = extractNodeToRoot(prev, sourceId);
      try {
        const draftKey = `hifadih_dashboard_editor_draft_${id || 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    toast.success('Layout extrait vers le niveau principal');
  };

  // Update item height (pixels)
  const handleUpdateHeight = (itemId: string, newHeight: number) => {
    setItems(prev => updateNode(prev, itemId, item => ({
      ...item,
      meta: {
        ...item.meta,
        height: Math.max(160, Math.min(1400, newHeight))
      }
    })));
  };

  // Update item title
  const handleUpdateTitle = (itemId: string, newTitle: string) => {
    setItems(prev => updateNode(prev, itemId, item => ({
      ...item,
      meta: {
        ...item.meta,
        title: newTitle
      }
    })));
  };

  // Update item layout styling (backgroundColor, borderColor, borderWidth, borderStyle, headerColor)
  const handleUpdateStyle = (itemId: string, styleUpdates: Partial<DashboardItemMeta>) => {
    setItems(prev => {
      const updated = updateNode(prev, itemId, item => ({
        ...item,
        meta: {
          ...item.meta,
          ...styleUpdates
        }
      }));
      try {
        const draftKey = `hifadih_dashboard_editor_draft_${id || 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Update whole canvas page config (backgroundColor, pattern, maxWidth, gap)
  const handleUpdateCanvasConfig = (updates: Partial<CanvasConfig>) => {
    setCanvasConfig(prev => {
      const next = { ...prev, ...updates };
      try {
        const draftKey = `hifadih_dashboard_editor_canvas_${id || 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Remove item anywhere in the tree
  const handleRemoveItem = (itemId: string) => {
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
    setItems(prev => deleteNode(prev, itemId));
    toast.info('Élément supprimé');
  };

  // Move item relative to its siblings
  const handleMoveItem = (itemId: string, direction: 'prev' | 'next') => {
    setItems(prev => moveNode(prev, itemId, direction));
  };

  // Drag and drop rearrange handler
  const handleDropItem = (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    setItems(prev => {
      const updated = moveNodeRelativeTo(prev, sourceId, targetId, position);
      try {
        const draftKey = `hifadih_dashboard_editor_draft_${id || 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    toast.success('Disposition mise à jour');
  };

  // Drag and drop to root level handler
  const handleDropToRoot = (sourceId: string) => {
    setItems(prev => {
      const updated = moveNodeToRoot(prev, sourceId, false);
      try {
        const draftKey = `hifadih_dashboard_editor_draft_${id || 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    toast.success('Élément déplacé au niveau principal');
  };

  // ----------------------------------------------------
  // Interactive Drag Resizing Handlers
  // ----------------------------------------------------

  // Continuous vertical drag resize
  const handleStartVerticalResize = (
    e: React.MouseEvent, 
    itemId: string, 
    currentHeight: number = 400
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingItemId(itemId);

    const startY = e.clientY;
    const startH = currentHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newH = Math.max(180, Math.min(1400, Math.round((startH + deltaY) / 10) * 10));
      handleUpdateHeight(itemId, newH);
    };

    const onMouseUp = () => {
      setResizingItemId(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Continuous horizontal drag resize (changes width 1..12 cols)
  const handleStartHorizontalResize = (
    e: React.MouseEvent,
    itemId: string,
    currentWidth: number = 12
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingItemId(itemId);

    const startX = e.clientX;
    const startW = currentWidth;
    
    // Dynamically calculate column width from the parent grid/container
    const targetEl = (e.currentTarget as HTMLElement).closest('.grid') || (e.currentTarget as HTMLElement).parentElement;
    const parentWidth = targetEl ? targetEl.getBoundingClientRect().width : 1000;
    const colWidth = Math.max(25, parentWidth / 12);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const colDelta = Math.round(deltaX / colWidth);
      const newW = Math.max(1, Math.min(12, startW + colDelta));
      handleUpdateWidth(itemId, newW);
    };

    const onMouseUp = () => {
      setResizingItemId(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      try {
        setItems(latest => {
          const draftKey = `hifadih_dashboard_editor_draft_${id || 'new'}`;
          localStorage.setItem(draftKey, JSON.stringify(latest));
          return latest;
        });
      } catch (err) {
        console.error('Failed to store resized columns in localStorage:', err);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // ----------------------------------------------------
  // Save Dashboard
  // ----------------------------------------------------
  const handleSave = async () => {
    if (!dashboardName.trim()) {
      toast.error('Veuillez indiquer un titre pour le tableau de bord');
      return;
    }

    setIsSaving(true);
    try {
      const dashboardPayload = {
        id: dashboardId,
        name: dashboardName.trim(),
        dashboard_title: dashboardName.trim(),
        layout: items,
        canvas_background: canvasConfig.backgroundColor,
        canvasConfig: canvasConfig,
        created_at: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      // 1. Save to SQLite database
      await saveLocalDashboard(dashboardPayload);

      // 2. Sync to localStorage hifadih_dashboards
      try {
        const stored = localStorage.getItem('hifadih_dashboards');
        const list = stored ? JSON.parse(stored) : [];
        const existingIndex = list.findIndex((d: any) => String(d.id) === String(dashboardId));
        if (existingIndex >= 0) {
          list[existingIndex] = { ...list[existingIndex], ...dashboardPayload };
        } else {
          list.push(dashboardPayload);
        }
        localStorage.setItem('hifadih_dashboards', JSON.stringify(list));
      } catch (e) {
        console.warn('Erreur de synchronisation locale:', e);
      }

      toast.success('Tableau de bord enregistré avec succès !');

      if (!id || id === 'new') {
        navigate(`/dashboard-editor/${dashboardId}`, { replace: true });
      }
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      toast.error('Impossible d\'enregistrer le tableau de bord');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter available charts for sidebar
  const filteredCharts = availableCharts.filter(c => {
    const name = (c.name || c.slice_name || '').toLowerCase();
    const table = (c.table_name || c.datasource_name || '').toLowerCase();
    const type = (c.chart_type || c.viz_type || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || table.includes(q) || type.includes(q);
  });

  // Modal filtered charts
  const modalFilteredCharts = availableCharts.filter(c => {
    const name = (c.name || c.slice_name || '').toLowerCase();
    const table = (c.table_name || c.datasource_name || '').toLowerCase();
    const type = (c.chart_type || c.viz_type || '').toLowerCase();
    const q = modalSearchTerm.toLowerCase();
    return name.includes(q) || table.includes(q) || type.includes(q);
  });

  return (
    <EditorDragProvider items={items} onDropItem={handleDropItem}>
      <div className="flex flex-col h-screen bg-slate-100 text-foreground overflow-hidden font-sans select-none">
        {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
        {/* Left: Back button & Dashboard Title */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate('/dashboards')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tableaux de bord</span>
          </button>

          <div className="h-6 w-px bg-border shrink-0" />

          {/* Editable Title */}
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Titre du tableau de bord..."
              className="text-base font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:bg-slate-50 px-2 py-1 rounded-md outline-none transition-colors w-64 md:w-80 truncate"
            />
          </div>
        </div>

        {/* Right: Actions (Aimantation, Fond de Page, Aperçu & Enregistrer) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <SnapToGridToggle />

          {/* Button: Fond & Style de Page Canevas */}
          <button
            type="button"
            onClick={() => {
              setSelectedItemId(null);
              setConfigPanelTab('canvas');
              setIsConfigPanelOpen(true);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs",
              !selectedItemId && isConfigPanelOpen && configPanelTab === 'canvas'
                ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                : "text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
            )}
            title="Personnaliser la couleur et le style de fond de toute la page"
          >
            <Paintbrush className="w-3.5 h-3.5 text-amber-600" />
            <span>Fond de Page</span>
            <div
              className="w-3.5 h-3.5 rounded-full border border-slate-300 ml-0.5 shadow-2xs"
              style={{ backgroundColor: canvasConfig.backgroundColor }}
            />
          </button>

          <Link
            to={`/dashboard/${dashboardId}`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-border hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Aperçu</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground/60 ml-0.5" />
          </Link>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-accent hover:bg-accent/90 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </header>

      {/* Main Body: Left Sidebar + Center Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 md:w-96 bg-white border-r border-border flex flex-col shrink-0 z-10">
          {/* Two Main Tabs: Graphiques and Dispositions */}
          <div className="grid grid-cols-2 p-1.5 m-3 bg-slate-100 rounded-xl gap-1 shrink-0">
            <button
              onClick={() => setSidebarTab('charts')}
              className={cn(
                "flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all",
                sidebarTab === 'charts' 
                  ? "bg-white text-foreground shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart className="w-3.5 h-3.5" />
              <span>Graphiques ({availableCharts.length})</span>
            </button>

            <button
              onClick={() => setSidebarTab('layouts')}
              className={cn(
                "flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all",
                sidebarTab === 'layouts' 
                  ? "bg-white text-foreground shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dispositions</span>
            </button>
          </div>

          {/* TAB 1: GRAPHIQUES */}
          {sidebarTab === 'charts' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un graphique..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-border rounded-lg outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Chart List */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 custom-scrollbar">
                {isLoading ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-3 bg-white border border-border rounded-xl space-y-2">
                        <div className="flex items-start gap-3">
                          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <Skeleton className="h-3.5 w-3/4" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-2.5 w-10" />
                              <Skeleton className="h-2.5 w-16" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredCharts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    Aucun graphique trouvé.
                  </div>
                ) : (
                  filteredCharts.map((chart) => {
                    const IconComponent = getChartIcon(chart.chart_type || chart.viz_type);

                    return (
                      <div
                        key={chart.id || chart.name}
                        className="p-3 bg-white border border-border hover:border-accent/40 rounded-xl transition-all shadow-2xs hover:shadow-xs group flex flex-col gap-2"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-accent/10 text-slate-600 group-hover:text-accent flex items-center justify-center shrink-0 transition-colors">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {chart.name || chart.slice_name || 'Graphique sans titre'}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                              <span className="font-semibold uppercase bg-slate-100 px-1.5 py-0.2 rounded text-[9px]">
                                {chart.chart_type || chart.viz_type || 'Bar'}
                              </span>
                              <span className="truncate">
                                {chart.table_name || chart.datasource_name || 'Données'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Add Button */}
                        <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                          <button
                            onClick={() => handleAddChart(chart)}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-accent bg-accent/10 hover:bg-accent hover:text-white rounded-md transition-colors"
                            title="Ajouter au tableau de bord"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ajouter</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DISPOSITIONS */}
          {sidebarTab === 'layouts' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {/* Introduction Banner */}
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl">
                <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-indigo-600" />
                  <span>Conteneurs & Dispositions</span>
                </h3>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Glissez-déposez ou cliquez sur "+ Ajouter" pour insérer des structures riches.
                </p>
              </div>

              {/* 1. LIGNE */}
              <div 
                onClick={() => handleAddRow()}
                className="p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Rows className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Ligne</h4>
                      <p className="text-[10px] text-slate-500">Conteneur horizontal 12 col</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>

              {/* 2. COLONNE */}
              <div 
                onClick={() => handleAddColumn()}
                className="p-3 bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Columns className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Colonne</h4>
                      <p className="text-[10px] text-slate-500">Conteneur vertical flexible</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>

              {/* 3. ONGLETS / TABS */}
              <div 
                onClick={() => handleAddTabs()}
                className="p-3 bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Folder className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Onglets (Tabs)</h4>
                      <p className="text-[10px] text-slate-500">Navigation par sous-pages</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>

              {/* 4. EN-TÊTE / HEADER */}
              <div 
                onClick={() => handleAddHeader()}
                className="p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <HeadingIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">En-tête de section</h4>
                      <p className="text-[10px] text-slate-500">Titre H1-H4, sous-titre & badge</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>

              {/* 5. TEXTE / MARKDOWN */}
              <div 
                onClick={() => handleAddMarkdown()}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Type className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Texte / Markdown</h4>
                      <p className="text-[10px] text-slate-500">Notes, analyses & synthèses</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>

              {/* 6. DIVISEUR / SÉPARATEUR */}
              <div 
                onClick={() => handleAddDivider()}
                className="p-3 bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-slate-700 group-hover:text-white transition-colors">
                      <Split className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Séparateur (Diviser)</h4>
                      <p className="text-[10px] text-slate-500">Ligne de démarcation élégante</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-slate-700 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>

              {/* 7. CARTE KPI / MÉTRIQUE */}
              <div 
                onClick={() => handleAddKpiCard()}
                className="p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Carte KPI / Stat</h4>
                      <p className="text-[10px] text-slate-500">Métrique clé, tendance & cible</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>

              {/* 8. BOÎTE D'INSIGHT / ALERTE */}
              <div 
                onClick={() => handleAddCallout()}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Boîte d'Insight / Alerte</h4>
                      <p className="text-[10px] text-slate-500">Synthèse IA, alertes & astuces</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>

              {/* 9. SECTION REPLIABLE (ACCORDÉON) */}
              <div 
                onClick={() => handleAddAccordion()}
                className="p-3 bg-white border border-slate-200 hover:border-purple-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Layout className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Section Repliable (Accordéon)</h4>
                      <p className="text-[10px] text-slate-500">Bloc déroulant pour épurer la vue</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>

              {/* 10. MULTIMÉDIA (IMAGE/VIDÉO) */}
              <div 
                onClick={() => handleAddMedia()}
                className="p-3 bg-white border border-slate-200 hover:border-fuchsia-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center font-bold text-xs group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Multimédia</h4>
                      <p className="text-[10px] text-slate-500">Images, vidéos, contenu externe</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-fuchsia-700 bg-fuchsia-50 px-2 py-0.5 rounded-full group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                    + Ajouter
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Center Canvas Workspace */}
        <main 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedItemId(null);
              setConfigPanelTab('canvas');
              setIsConfigPanelOpen(true);
            }
          }}
          className={cn(
            "flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar flex flex-col items-center transition-colors duration-200",
            canvasConfig.pattern === 'dots' && "bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]",
            canvasConfig.pattern === 'grid' && "bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]"
          )}
          style={{
            backgroundColor: canvasConfig.backgroundColor,
          }}
        >
          <div 
            className="w-full relative transition-all"
            style={{
              maxWidth: canvasConfig.maxWidth,
            }}
          >
            {/* Visual 12-Column Snapping Grid Overlay (shows during drag-and-drop or resize) */}
            <GridOverlay />

            {isLoading ? (
              <DashboardEditorCanvasSkeleton />
            ) : items.length === 0 ? (
              /* Friendly Empty State */
              <div className="py-20 px-6 border-2 border-dashed border-slate-300 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Votre tableau de bord est vide</h3>
                <p className="text-xs text-muted-foreground max-w-md mt-1 leading-relaxed">
                  Sélectionnez des graphiques ou des dispositions dans le volet latéral pour commencer à composer votre tableau de bord.
                </p>
              </div>
            ) : (
              /* 12-Column Responsive Dashboard Grid with recursive EditorItemNode */
              <div 
                className="grid grid-cols-12 items-start w-full"
                style={{
                  columnGap: `${canvasConfig.gapX ?? 24}px`,
                  rowGap: `${canvasConfig.gapY ?? 24}px`,
                }}
              >
                {items.map((item, index) => (
                  <EditorItemNode
                    key={item.id}
                    item={item}
                    parentType="root"
                    depth={0}
                    index={index}
                    totalSiblings={items.length}
                    selectedItemId={selectedItemId}
                    onSelectItem={(id) => {
                      setSelectedItemId(id);
                      setConfigPanelTab('item');
                      setIsConfigPanelOpen(true);
                    }}
                    onUpdateWidth={handleUpdateWidth}
                    onUpdateHeight={handleUpdateHeight}
                    onRemoveItem={handleRemoveItem}
                    onMoveItem={handleMoveItem}
                    onOpenChartPicker={(containerId, containerName, defaultWidth) => {
                      setTargetForChartPicker({ containerId, containerName, defaultWidth });
                    }}
                    onAddRowToContainer={handleAddRow}
                    onAddColumnToContainer={handleAddColumn}
                    onAddTabsToContainer={handleAddTabs}
                    onAddHeaderToContainer={handleAddHeader}
                    onAddMarkdownToContainer={handleAddMarkdown}
                    onAddDividerToContainer={handleAddDivider}
                    onAddKpiCardToContainer={handleAddKpiCard}
                    onAddCalloutToContainer={handleAddCallout}
                    onAddAccordionToContainer={handleAddAccordion}
                    onAddMediaToContainer={handleAddMedia}
                    onAddTabToTabs={handleAddTabToTabs}
                    onUpdateTitle={handleUpdateTitle}
                    onUpdateContent={handleUpdateContent}
                    onUpdateStyle={handleUpdateStyle}
                    resizingItemId={resizingItemId}
                    onStartVerticalResize={handleStartVerticalResize}
                    onStartHorizontalResize={handleStartHorizontalResize}
                    onOpenMoveLayout={(item) => setMovingLayoutItem(item)}
                    onExtractToRoot={handleExtractToRoot}
                    canvasGapX={canvasConfig.gapX}
                    canvasGapY={canvasConfig.gapY}
                  />
                ))}
              </div>
            )}

            {/* Root Level Drop Zone */}
            <RootDropZone onDropToRoot={handleDropToRoot} />
          </div>
        </main>

        {/* Right Configuration Inspector Panel (displays when opened or an item is selected) */}
        {isConfigPanelOpen && (
          <LayoutConfigPanel
            item={selectedItem}
            parentInfo={selectedItemParentInfo}
            onClose={() => {
              setIsConfigPanelOpen(false);
              setSelectedItemId(null);
            }}
            onUpdateWidth={handleUpdateWidth}
            onUpdateHeight={handleUpdateHeight}
            onUpdateTitle={handleUpdateTitle}
            onUpdateContent={handleUpdateContent}
            onUpdateStyle={handleUpdateStyle}
            onMoveItem={handleMoveItem}
            onRemoveItem={handleRemoveItem}
            onAddRowToContainer={handleAddRow}
            onAddColumnToContainer={handleAddColumn}
            onAddTabsToContainer={handleAddTabs}
            onAddHeaderToContainer={handleAddHeader}
            onAddMarkdownToContainer={handleAddMarkdown}
            onAddDividerToContainer={handleAddDivider}
            onAddKpiCardToContainer={handleAddKpiCard}
            onAddCalloutToContainer={handleAddCallout}
            onAddAccordionToContainer={handleAddAccordion}
            onAddMediaToContainer={handleAddMedia}
            onAddTabToTabs={handleAddTabToTabs}
            onOpenChartPicker={(containerId, containerName, defaultWidth) => {
              setTargetForChartPicker({ containerId, containerName, defaultWidth });
            }}
            onReplaceChart={(id) => {
              const current = findNode(items, id);
              const pInfo = findParentInfo(items, id);
              setTargetForChartPicker({
                containerId: pInfo?.parent?.id,
                containerName: current?.content?.name || 'Remplacement',
                defaultWidth: current?.meta?.width
              });
            }}
            onOpenMoveLayout={(item) => setMovingLayoutItem(item)}
            onExtractToRoot={handleExtractToRoot}
            canvasConfig={canvasConfig}
            onUpdateCanvasConfig={handleUpdateCanvasConfig}
            activeTab={configPanelTab}
            onTabChange={(tab) => setConfigPanelTab(tab)}
          />
        )}
      </div>

      {/* POPUP MODAL: Pick a Chart for Container (Row, Column or Root) */}
      {targetForChartPicker && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sélectionner un graphique</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Destination : <span className="font-semibold text-slate-800">{targetForChartPicker.containerName}</span>
                </p>
              </div>
              <button
                onClick={() => setTargetForChartPicker(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou table..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-border rounded-lg outline-none focus:border-accent transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Chart List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-96 custom-scrollbar">
              {modalFilteredCharts.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Aucun graphique ne correspond à votre recherche.
                </div>
              ) : (
                modalFilteredCharts.map(chart => {
                  const IconComponent = getChartIcon(chart.chart_type || chart.viz_type);

                  return (
                    <div
                      key={chart.id || chart.name}
                      onClick={() => handleAddChart(chart, targetForChartPicker.containerId, targetForChartPicker.defaultWidth)}
                      className="p-3 bg-white border border-border hover:border-accent hover:bg-accent/5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-accent/10 text-slate-600 group-hover:text-accent flex items-center justify-center shrink-0 transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {chart.name || chart.slice_name || 'Graphique sans titre'}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                            <span className="font-semibold uppercase bg-slate-100 px-1.5 py-0.2 rounded text-[9px]">
                              {chart.chart_type || chart.viz_type || 'Bar'}
                            </span>
                            <span className="truncate">
                              {chart.table_name || chart.datasource_name || 'Table'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-accent bg-accent/10 group-hover:bg-accent group-hover:text-white rounded-lg transition-colors shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insérer</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-border bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                {modalFilteredCharts.length} graphique{modalFilteredCharts.length > 1 ? 's' : ''} disponible{modalFilteredCharts.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setTargetForChartPicker(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Move Layout to another container or root */}
      {movingLayoutItem && (
        <MoveLayoutModal
          isOpen={!!movingLayoutItem}
          onClose={() => setMovingLayoutItem(null)}
          item={movingLayoutItem}
          allItems={items}
          onMoveToContainer={handleMoveToContainer}
          onMoveStep={handleMoveItem}
          onExtractToRoot={handleExtractToRoot}
          isNested={(() => {
            const pInfo = findParentInfo(items, movingLayoutItem.id);
            return !!pInfo?.parent;
          })()}
          canMoveUp={(() => {
            const pInfo = findParentInfo(items, movingLayoutItem.id);
            return (pInfo?.index ?? 0) > 0;
          })()}
          canMoveDown={(() => {
            const pInfo = findParentInfo(items, movingLayoutItem.id);
            return (pInfo?.index ?? 0) < (pInfo?.siblings.length ?? 0) - 1;
          })()}
        />
      )}
    </div>
    </EditorDragProvider>
  );
};
