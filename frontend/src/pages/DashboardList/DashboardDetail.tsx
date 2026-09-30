import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Settings, 
  Palette, 
  Layout as LayoutIcon, 
  Save, 
  Share2, 
  Maximize2, 
  Plus,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Check,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  Activity,
  Zap,
  Shield,
  Target,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Image as ImageIcon,
  Video,
  Play,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  cardStyle: 'flat' | 'elevated' | 'bordered';
  layout: 'grid' | 'masonry' | 'columns';
}

const COLORS = [
  { name: 'Noir/Blanc', value: '#000000' },
  { name: 'Muted', value: '#64748b' },
  { name: 'Accent', value: 'var(--accent)' },
];

const BACKGROUNDS = [
  { name: 'Système', value: 'bg-background' },
  { name: 'Muted', value: 'bg-muted' },
];

import { getDashboard as getLocalDashboard, executeQuery } from '../../core/utils/db';
import { hifadihService } from '../../lib/hifadihService';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import ReactMarkdown from 'react-markdown';
import { mapLegacyToHifadihLayout, denormalizeLayout } from '../../core/utils/dashboardLayout';
import { AIBriefing } from '../../components/dashboard/AIBriefing';
import { cn } from '../../core/utils/utils';
import { toast } from 'sonner';
import { exportToPDF } from '../../lib/pdfExport';
import { FileText } from 'lucide-react';
import { DashboardDetailSkeleton } from '../../components/ui/Skeleton';

// ... (rest of imports)

const GRID_CLASSES: Record<number, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
};

const RecursiveElement = ({ element, theme, parentType }: { element: any; theme: ThemeConfig; parentType?: string }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  // Ensure activeTab is within bounds
  React.useEffect(() => {
    if (element.type === 'tabs' && element.children && activeTab >= element.children.length) {
      setActiveTab(Math.max(0, (element.children.length || 0) - 1));
    }
  }, [element.children, activeTab]);

  const width = Math.min(12, Math.max(1, element.meta?.width || (element.type === 'column' ? 6 : 12)));
  const gridClass = GRID_CLASSES[width] || 'col-span-12';
  const isInGrid = true;

  return (
    <div 
      className={cn(
        "transition-all duration-500",
        element.type === 'chart' ? (
          cn(
            "group relative overflow-hidden rounded-none transition-all duration-500",
            theme.cardStyle === 'elevated' ? 'p-8 shadow-xl bg-background border border-border hover:border-accent/10 transition-all' : 
            theme.cardStyle === 'bordered' ? 'p-8 border border-border bg-background hover:border-accent/20' : 'p-8 bg-background border border-border/10'
          )
        ) : element.type === 'row' || element.type === 'column' || element.type === 'tabs' ? '' : 'p-8',
        isInGrid ? cn(gridClass, "min-w-0") : "w-full"
      )}
      style={{ 
        backgroundColor: element.meta?.backgroundColor || undefined,
        borderColor: element.meta?.borderColor || undefined,
        borderWidth: element.meta?.borderWidth !== undefined ? `${element.meta.borderWidth}px` : undefined,
        borderStyle: element.meta?.borderStyle || undefined,
        gridColumn: `span ${width} / span ${width}`,
        minHeight: (element.type === 'chart' || element.type === 'row' || element.type === 'column') ? (element.meta?.height || (element.type === 'chart' ? 360 : undefined)) : undefined,
      }}
    >
      {element.type === 'header' && (
        <div className={cn(
          "relative group/header py-4",
          element.meta?.alignment === 'center' && "text-center items-center flex flex-col",
          element.meta?.alignment === 'right' && "text-right items-end flex flex-col"
        )}>
          <div className="flex items-center gap-3">
            <h2 className={cn(
              "font-black text-foreground tracking-tight leading-tight",
              element.meta?.headerLevel === 'h1' && "text-3xl md:text-4xl",
              (!element.meta?.headerLevel || element.meta?.headerLevel === 'h2') && "text-2xl md:text-3xl",
              element.meta?.headerLevel === 'h3' && "text-xl md:text-2xl",
              element.meta?.headerLevel === 'h4' && "text-lg md:text-xl"
            )}>
              {element.meta?.title || element.content || 'En-tête'}
            </h2>
            {element.meta?.badge && (
              <span className={cn(
                "px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-full",
                element.meta?.badgeColor === 'emerald' && "bg-emerald-100 text-emerald-800",
                element.meta?.badgeColor === 'amber' && "bg-amber-100 text-amber-800",
                element.meta?.badgeColor === 'rose' && "bg-rose-100 text-rose-800",
                element.meta?.badgeColor === 'slate' && "bg-slate-200 text-slate-800",
                (!element.meta?.badgeColor || element.meta?.badgeColor === 'indigo') && "bg-indigo-100 text-indigo-800"
              )}>
                {element.meta.badge}
              </span>
            )}
          </div>
          {element.meta?.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{element.meta.subtitle}</p>
          )}
          {element.meta?.showDivider !== false && (
            <div className="w-full h-px bg-border mt-3" />
          )}
        </div>
      )}

      {element.type === 'markdown' && (
        <div className="prose prose-slate dark:prose-invert prose-base max-w-none bg-muted/20 backdrop-blur-sm p-6 rounded-xl border border-border">
          <ReactMarkdown>{typeof element.content === 'string' ? element.content : (element.content?.markdown || '')}</ReactMarkdown>
        </div>
      )}

      {element.type === 'divider' && (
        <div className="py-4 flex items-center gap-3">
          <div 
            className="flex-1"
            style={{
              borderTopWidth: `${element.meta?.dividerThickness || 1}px`,
              borderTopStyle: element.meta?.dividerStyle === 'gradient' ? 'solid' : (element.meta?.dividerStyle || 'solid'),
              borderColor: element.meta?.dividerColor || 'var(--border, #e2e8f0)',
            }}
          />
          {element.meta?.title && (
            <span className="text-xs font-bold text-muted-foreground px-3 py-0.5 rounded-full border border-border bg-background">
              {element.meta.title}
            </span>
          )}
          <div 
            className="flex-1"
            style={{
              borderTopWidth: `${element.meta?.dividerThickness || 1}px`,
              borderTopStyle: element.meta?.dividerStyle === 'gradient' ? 'solid' : (element.meta?.dividerStyle || 'solid'),
              borderColor: element.meta?.dividerColor || 'var(--border, #e2e8f0)',
            }}
          />
        </div>
      )}

      {element.type === 'chart' && element.content && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h4 className="font-black text-foreground text-xl tracking-tight">{element.content.name}</h4>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="info" className="bg-muted border-border text-muted-foreground font-black uppercase tracking-widest text-[9px] px-3 py-1">{element.content.chart_type}</Badge>
            </div>
          </div>
          <div className="h-full min-h-[300px] overflow-hidden rounded-none">
            <DashboardChart chart={element.content} />
          </div>
        </div>
      )}

      {(element.type === 'row' || element.type === 'column') && (
        <div className="grid grid-cols-12 gap-6 items-start w-full h-full">
          {element.children?.map((child: any) => (
            <RecursiveElement key={child.id} element={child} theme={theme} parentType={element.type} />
          ))}
        </div>
      )}

      {element.type === 'tabs' && (
        <div className="space-y-6">
          <div className="flex gap-2 border-b border-border overflow-x-auto">
            {element.children?.map((tab: any, i: number) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-5 py-2.5 text-sm font-bold transition-all border-b-2 cursor-pointer",
                  activeTab === i ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.meta?.title || `Onglet ${i + 1}`}
              </button>
            ))}
          </div>
          {element.children?.[activeTab] && (
            <div className="grid grid-cols-12 gap-6 items-start w-full animate-in fade-in duration-200">
              {element.children[activeTab].children?.map((child: any) => (
                <RecursiveElement key={child.id} element={child} theme={theme} parentType="column" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* KPI STAT CARD */}
      {element.type === 'kpi_card' && (() => {
        const trend = element.meta?.kpiTrend ?? 12.5;
        const isUp = element.meta?.kpiTrendDirection ? element.meta.kpiTrendDirection === 'up' : trend >= 0;
        const color = element.meta?.kpiColor || 'indigo';

        const colorMap = {
          indigo: { bg: 'bg-indigo-50/70 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-900', text: 'text-indigo-600 dark:text-indigo-400', iconBg: 'bg-indigo-600 text-white' },
          emerald: { bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900', text: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-600 text-white' },
          amber: { bg: 'bg-amber-50/70 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900', text: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-600 text-white' },
          rose: { bg: 'bg-rose-50/70 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-900', text: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-600 text-white' },
          blue: { bg: 'bg-blue-50/70 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900', text: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-600 text-white' },
          purple: { bg: 'bg-purple-50/70 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-900', text: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-600 text-white' },
          slate: { bg: 'bg-slate-50/70 dark:bg-slate-900/30', border: 'border-slate-200 dark:border-slate-800', text: 'text-slate-700 dark:text-slate-300', iconBg: 'bg-slate-800 text-white' },
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
          <div className={cn("p-6 rounded-2xl border transition-all shadow-xs relative overflow-hidden", colorStyles.bg, colorStyles.border)}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  {element.meta?.title || 'Indicateur KPI'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                    {element.meta?.kpiValue || '128 450'}
                  </span>
                  {element.meta?.kpiUnit && (
                    <span className="text-lg font-bold text-muted-foreground">{element.meta.kpiUnit}</span>
                  )}
                </div>
              </div>

              <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", colorStyles.iconBg)}>
                {renderKpiIcon(element.meta?.kpiIcon)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <span className={cn(
                  "flex items-center gap-0.5 px-2 py-0.5 rounded-full font-black text-[11px]",
                  isUp ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                )}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
                <span className="text-muted-foreground text-[11px]">{element.meta?.kpiTrendLabel || 'vs mois dernier'}</span>
              </div>

              {element.meta?.kpiTarget && (
                <span className="text-[11px] font-medium text-muted-foreground">{element.meta.kpiTarget}</span>
              )}
            </div>
          </div>
        );
      })()}

      {/* CALLOUT BOX (INSIGHTS & ALERTES) */}
      {element.type === 'callout' && (() => {
        const type = element.meta?.calloutType || 'insight';
        const styles = {
          insight: { bg: 'bg-indigo-50/80 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800', icon: Lightbulb, iconColor: 'text-indigo-600 dark:text-indigo-400', title: 'text-indigo-950 dark:text-indigo-200' },
          info: { bg: 'bg-blue-50/80 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-800', icon: Info, iconColor: 'text-blue-600 dark:text-blue-400', title: 'text-blue-950 dark:text-blue-200' },
          success: { bg: 'bg-emerald-50/80 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle2, iconColor: 'text-emerald-600 dark:text-emerald-400', title: 'text-emerald-950 dark:text-emerald-200' },
          warning: { bg: 'bg-amber-50/80 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800', icon: AlertTriangle, iconColor: 'text-amber-600 dark:text-amber-400', title: 'text-amber-950 dark:text-amber-200' },
          error: { bg: 'bg-rose-50/80 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800', icon: AlertCircle, iconColor: 'text-rose-600 dark:text-rose-400', title: 'text-rose-950 dark:text-rose-200' },
        }[type] || { bg: 'bg-indigo-50/80', border: 'border-indigo-200', icon: Sparkles, iconColor: 'text-indigo-600', title: 'text-indigo-950' };

        const IconComponent = styles.icon;
        const rawText = element.meta?.calloutText || (typeof element.content === 'string' ? element.content : 'Analyse stratégique : Les performances commerciales dépassent les prévisions de +8.4% ce trimestre.');

        return (
          <div className={cn("p-5 rounded-2xl border flex items-start gap-4 shadow-xs", styles.bg, styles.border)}>
            <div className={cn("w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-center shrink-0 shadow-2xs", styles.iconColor)}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className={cn("font-bold text-sm tracking-tight", styles.title)}>
                {element.meta?.calloutTitle || element.meta?.title || 'Synthèse & Recommandation'}
              </h4>
              <p className="text-xs md:text-sm text-foreground/80 leading-relaxed">
                {rawText}
              </p>
            </div>
          </div>
        );
      })()}

      {/* ACCORDION (SECTION REPLIABLE) */}
      {element.type === 'accordion' && (() => {
        const [isExpanded, setIsExpanded] = React.useState(element.meta?.defaultExpanded !== false);

        return (
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <LayoutIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{element.meta?.title || 'Section Déroulante'}</h3>
                  {element.meta?.subtitle && (
                    <p className="text-xs text-muted-foreground">{element.meta.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold">
                  {(element.children || []).length} {(element.children || []).length > 1 ? 'éléments' : 'élément'}
                </span>
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="p-6 border-t border-border bg-muted/10 grid grid-cols-12 gap-6 items-start w-full animate-in fade-in duration-200">
                {(element.children || []).map((child: any) => (
                  <RecursiveElement key={child.id} element={child} theme={theme} parentType="column" />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* MEDIA COMPONENT (IMAGE, VIDEO, EMBED/IFRAME) */}
      {element.type === 'media' && (() => {
        const mediaType = element.meta?.mediaType || 'image';
        const url = element.meta?.mediaUrl || (typeof element.content === 'string' ? element.content : '');
        const fit = element.meta?.mediaFit || 'cover';
        const alt = element.meta?.mediaAlt || element.meta?.title || 'Média';
        const caption = element.meta?.mediaCaption || '';
        const aspectRatio = element.meta?.mediaAspectRatio || 'auto';

        const aspectClass = {
          '16/9': 'aspect-video',
          '4/3': 'aspect-4/3',
          '1/1': 'aspect-square',
          '21/9': 'aspect-21/9',
          'auto': '',
        }[aspectRatio] || '';

        // Helper to format youtube or embed urls
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
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col w-full h-full">
            {element.meta?.title && (
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {mediaType === 'image' && <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                  {mediaType === 'video' && <Video className="w-4 h-4 text-muted-foreground" />}
                  {mediaType === 'embed' && <Globe className="w-4 h-4 text-muted-foreground" />}
                  <h4 className="font-bold text-sm text-foreground">{element.meta.title}</h4>
                </div>
                {element.meta?.subtitle && (
                  <span className="text-xs text-muted-foreground">{element.meta.subtitle}</span>
                )}
              </div>
            )}

            <div className={cn("flex-1 min-h-[160px] bg-muted/20 flex items-center justify-center relative overflow-hidden", aspectClass)}>
              {!url ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-xs font-semibold">Aucun média configuré</span>
                </div>
              ) : mediaType === 'image' ? (
                <img
                  src={url}
                  alt={alt}
                  referrerPolicy="no-referrer"
                  className={cn(
                    "w-full h-full object-center",
                    fit === 'cover' && "object-cover",
                    fit === 'contain' && "object-contain",
                    fit === 'fill' && "object-fill",
                    fit === 'none' && "object-none"
                  )}
                  onError={(e) => {
                    // Fallback on broken image
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              ) : mediaType === 'video' ? (
                url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo') ? (
                  <iframe
                    src={getEmbedUrl(url)}
                    title={alt}
                    className="w-full h-full border-0 min-h-[260px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={url}
                    controls
                    autoPlay={element.meta?.mediaAutoPlay}
                    loop={element.meta?.mediaLoop}
                    muted={element.meta?.mediaMuted}
                    className="w-full h-full object-cover min-h-[240px]"
                  />
                )
              ) : (
                <iframe
                  src={url}
                  title={alt}
                  className="w-full h-full border-0 min-h-[300px]"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              )}
            </div>

            {caption && (
              <div className="px-4 py-2 bg-muted/30 border-t border-border/60 text-center">
                <p className="text-xs text-muted-foreground italic">{caption}</p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export const DashboardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [dashboard, setDashboard] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [theme, setTheme] = React.useState<ThemeConfig>({
    primaryColor: '#6366f1',
    backgroundColor: 'bg-slate-50',
    cardStyle: 'elevated',
    layout: 'grid'
  });

  useEffect(() => {
    if (id) {
      loadDashboard(id);
    }
  }, [id]);

  const loadDashboard = async (dashboardId: string) => {
    setIsLoading(true);
    
    try {
      // Try Hifadih Service first
      const d = await hifadihService.getDashboard(dashboardId);
      
      if (d) {
        // Handle layout transformation if it's from a external source (like our former legacy platform)
        if (d.position_json) {
          const position = typeof d.position_json === 'string' ? JSON.parse(d.position_json) : d.position_json;
          const normalized = mapLegacyToHifadihLayout(position);
          setDashboard({
            ...d,
            layout: denormalizeLayout(normalized)
          });
        } else {
          setDashboard(d);
        }
      } else {
        // Fallback to local
        const local = await getLocalDashboard(dashboardId);
        setDashboard(local);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      try {
        const local = await getLocalDashboard(dashboardId);
        setDashboard(local);
      } catch (localErr) {
        console.error('Failed to load local dashboard:', localErr);
      }
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return <DashboardDetailSkeleton />;
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-xl font-bold text-foreground">Dashboard not found</h2>
        <button onClick={() => navigate('/dashboards')} className="btn-primary">Back to Dashboards</button>
      </div>
    );
  }

  const handleSave = () => {
    setIsCustomizing(false);
  };

  const handleExportPDF = async () => {
    try {
      toast.loading("Génération du PDF...", { id: 'export-pdf' });
      const fileName = `${dashboard.name || 'Dashboard'}_${new Date().toISOString().split('T')[0]}.pdf`;
      await exportToPDF('dashboard-content', { fileName });
      toast.success("PDF exporté avec succès", { id: 'export-pdf' });
    } catch (err) {
      console.error('PDF Export failed:', err);
      toast.error("L'exportation PDF a échoué", { id: 'export-pdf' });
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className={`min-h-full transition-colors duration-500`} style={{ backgroundColor: dashboard.backgroundColor || 'transparent' }}>
      {/* Dashboard Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 px-8 py-5 flex items-center justify-between shadow-sm pdf-export-hide">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboards')}
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-none transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-10 w-px bg-border" />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight">{dashboard.name}</h1>
              <Badge variant="success" className="bg-accent/10 text-accent border-accent/20 font-black uppercase tracking-widest text-[9px]">Live Asset</Badge>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              <span>Modified {new Date(dashboard.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted/50 p-1 rounded-none border border-border">
            <button 
              onClick={handleExportPDF}
              className="p-2 text-muted-foreground hover:text-accent hover:bg-background rounded-none transition-all"
              title="Export as PDF"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsCustomizing(true)}
              className="p-2 text-muted-foreground hover:text-accent hover:bg-background rounded-none transition-all"
              title="Customize Theme"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleFullScreen}
              className="p-2 text-muted-foreground hover:text-accent hover:bg-background rounded-none transition-all"
              title="Full Screen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
          <div className="h-8 w-px bg-border mx-1" />
          <button className="p-2.5 text-muted-foreground hover:text-accent hover:bg-background rounded-none transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate(`/dashboard-editor/${id}`)}
            className="btn-primary flex items-center gap-2 px-6 py-3 shadow-xl shadow-accent/20 transition-all active:scale-95"
          >
            <LayoutIcon className="w-4 h-4" />
            Edit Mode
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div 
        id="dashboard-content" 
        className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen transition-colors"
        style={{
          backgroundColor: dashboard.canvas_background || dashboard.canvasConfig?.backgroundColor || undefined,
        }}
      >
        <div 
          className="grid grid-cols-12 items-start w-full"
          style={{
            gap: dashboard.canvasConfig?.gap || '24px',
          }}
        >
          {dashboard.layout?.map((element: any) => (
            <RecursiveElement key={element.id} element={element} theme={theme} parentType="root" />
          ))}
        </div>
      </div>

      {/* Theme Customization Sidebar */}
      <AnimatePresence>
        {isCustomizing && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomizing(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Dashboard Theme</h3>
                <button 
                  onClick={() => setIsCustomizing(false)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Primary Color */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Primary Color</label>
                  <div className="grid grid-cols-3 gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setTheme({ ...theme, primaryColor: color.value })}
                        className={`h-10 rounded-none transition-all flex items-center justify-center ${
                          theme.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-accent scale-105' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {theme.primaryColor === color.value && <Check className="w-4 h-4 text-background" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Background</label>
                  <div className="space-y-2">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.value}
                        onClick={() => setTheme({ ...theme, backgroundColor: bg.value })}
                        className={`w-full px-4 py-3 rounded-none border text-sm font-medium flex items-center justify-between transition-all ${
                          theme.backgroundColor === bg.value 
                            ? 'border-accent bg-accent/10 text-accent' 
                            : 'border-border text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        {bg.name}
                        {theme.backgroundColor === bg.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Style */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Card Style</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['flat', 'elevated', 'bordered'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setTheme({ ...theme, cardStyle: style })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium capitalize flex items-center justify-between transition-all ${
                          theme.cardStyle === style 
                            ? 'border-accent bg-accent/10 text-accent' 
                            : 'border-border text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        {style}
                        {theme.cardStyle === style && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Layout</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['grid', 'masonry', 'columns'] as const).map((layout) => (
                      <button
                        key={layout}
                        onClick={() => setTheme({ ...theme, layout: layout })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium capitalize flex items-center justify-between transition-all ${
                          theme.layout === layout 
                            ? 'border-accent bg-accent/10 text-accent' 
                            : 'border-border text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        {layout}
                        {theme.layout === layout && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border">
                <button 
                  onClick={handleSave}
                  className="btn-primary w-full py-3 shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Apply Theme
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
