export type DashboardItemType = 'chart' | 'row' | 'column' | 'tabs' | 'tab' | 'header' | 'markdown' | 'divider' | 'kpi_card' | 'callout' | 'accordion' | 'media';

export interface DashboardItemMeta {
  width: number; // 3 (1/4), 4 (1/3), 6 (1/2), 8 (2/3), or 12 (full)
  height?: number; // custom height in pixels (e.g. 320, 420, 560)
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number; // 0, 1, 2, 3, 4
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  headerColor?: string;
  headerTextColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | number | string;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
  padding?: number; // custom padding in pixels
  margin?: number; // custom margin in pixels
  
  // Header specific properties
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4';
  alignment?: 'left' | 'center' | 'right';
  icon?: string; // 'bar-chart', 'sparkles', 'activity', 'trending-up', 'layers', 'calendar', 'shield', 'none'
  badge?: string;
  badgeColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan' | 'purple';
  showDivider?: boolean;

  // Tabs specific properties
  activeTabId?: string;
  tabStyle?: 'pills' | 'underline' | 'boxed';

  // Divider specific properties
  dividerStyle?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  dividerThickness?: 1 | 2 | 4;
  dividerColor?: string;
  spacing?: 'sm' | 'md' | 'lg';

  // KPI Card specific properties
  kpiValue?: string;
  kpiUnit?: string;
  kpiTrend?: number; // percentage change e.g. +14.2 or -3.5
  kpiTrendLabel?: string; // e.g. "vs mois dernier"
  kpiTrendDirection?: 'up' | 'down' | 'neutral';
  kpiColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate';
  kpiTarget?: string; // e.g. "Cible: 120 000 €"
  kpiIcon?: string; // 'trending-up', 'dollar', 'users', 'shopping-bag', 'activity', 'zap', 'shield', 'target'

  // Callout Box specific properties
  calloutType?: 'info' | 'success' | 'warning' | 'error' | 'insight';
  calloutTitle?: string;
  calloutText?: string;
  calloutIcon?: string;

  // Accordion specific properties
  defaultExpanded?: boolean;

  // Media (Image / Video / Audio / Embed / Webpage) specific properties
  mediaType?: 'image' | 'video' | 'embed';
  mediaUrl?: string;
  mediaAlt?: string;
  mediaFit?: 'cover' | 'contain' | 'fill' | 'none';
  mediaCaption?: string;
  mediaAspectRatio?: 'auto' | '16/9' | '4/3' | '1/1' | '21/9';
  mediaAutoPlay?: boolean;
  mediaLoop?: boolean;
  mediaMuted?: boolean;
}

export interface DashboardItemData {
  id: string;
  type: DashboardItemType;
  content?: any;
  children?: DashboardItemData[];
  meta: DashboardItemMeta;
}

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'item-' + Math.random().toString(36).substring(2, 11);
};

export const WIDTH_PRESETS = [
  { label: '1/4', width: 3, desc: '25% (3 col)' },
  { label: '1/3', width: 4, desc: '33% (4 col)' },
  { label: '1/2', width: 6, desc: '50% (6 col)' },
  { label: '2/3', width: 8, desc: '66% (8 col)' },
  { label: 'Plein', width: 12, desc: '100% (12 col)' },
];

export const HEIGHT_PRESETS = [
  { label: '280px', height: 280, desc: 'Compact (280px)' },
  { label: '380px', height: 380, desc: 'Standard (380px)' },
  { label: '500px', height: 500, desc: 'Grand (500px)' },
  { label: '640px', height: 640, desc: 'Maxi (640px)' },
];

export const getColSpanClass = (width: number = 12) => {
  const w = Math.min(12, Math.max(1, width));
  switch (w) {
    case 1: return 'col-span-1';
    case 2: return 'col-span-2';
    case 3: return 'col-span-3';
    case 4: return 'col-span-4';
    case 5: return 'col-span-5';
    case 6: return 'col-span-6';
    case 7: return 'col-span-7';
    case 8: return 'col-span-8';
    case 9: return 'col-span-9';
    case 10: return 'col-span-10';
    case 11: return 'col-span-11';
    case 12:
    default:
      return 'col-span-12';
  }
};


