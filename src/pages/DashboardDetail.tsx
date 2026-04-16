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
  Check
} from 'lucide-react';
import { Badge } from '../components/Badge';

interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  cardStyle: 'flat' | 'elevated' | 'bordered';
  layout: 'grid' | 'masonry' | 'columns';
}

const COLORS = [
  { name: 'Prism Blue', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#475569' },
  { name: 'Violet', value: '#8b5cf6' },
];

const BACKGROUNDS = [
  { name: 'Default', value: 'bg-slate-50' },
  { name: 'Pure White', value: 'bg-white' },
  { name: 'Soft Gray', value: 'bg-gray-50' },
  { name: 'Dark Slate', value: 'bg-slate-900' },
];

import { getDashboard as getLocalDashboard, executeQuery } from '../lib/db';
import { supersetService } from '../services/supersetService';
import { DashboardChart } from '../components/DashboardChart';
import ReactMarkdown from 'react-markdown';
import { mapSupersetLayoutToPrism, denormalizeLayout } from '../lib/dashboardLayout';

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

  const gridClass = GRID_CLASSES[element.meta?.width || 12];

  return (
    <div 
      className={cn(
        "transition-all duration-500",
        element.type === 'chart' ? (
          cn(
            "group relative overflow-hidden rounded-[32px] transition-all duration-500",
            theme.cardStyle === 'elevated' ? 'p-8 shadow-2xl shadow-slate-200/50 bg-white hover:-translate-y-1' : 
            theme.cardStyle === 'bordered' ? 'p-8 border border-slate-100 bg-white hover:border-accent/20' : 'p-8 bg-white'
          )
        ) : element.type === 'row' || element.type === 'column' || element.type === 'tabs' ? '' : 'p-8',
        parentType === 'row' ? gridClass : "w-full"
      )}
      style={{ 
        backgroundColor: element.meta?.backgroundColor || undefined,
        height: (element.type === 'chart' || element.type === 'row' || element.type === 'column') ? (element.meta?.height || undefined) : undefined
      }}
    >
      {element.type === 'header' && (
        <div className="relative group/header py-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{element.content}</h2>
          <div className="h-1.5 w-16 bg-accent rounded-full mt-4 transition-all group-hover/header:w-32" />
        </div>
      )}

      {element.type === 'markdown' && (
        <div className="prose prose-slate prose-lg max-w-none bg-white/50 backdrop-blur-sm p-8 rounded-[32px] border border-white/20">
          <ReactMarkdown>{element.content}</ReactMarkdown>
        </div>
      )}

      {element.type === 'divider' && (
        <div className="py-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full" />
        </div>
      )}

      {element.type === 'chart' && element.content && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h4 className="font-black text-slate-900 text-xl tracking-tight">{element.content.name}</h4>
              <span className="text-[10px] text-slate-400 font-serif italic tracking-wide mt-1">Enterprise Intelligence Unit</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Badge variant="info" className="bg-slate-50 border-slate-100 text-slate-500 font-black uppercase tracking-widest text-[9px] px-3 py-1">{element.content.chart_type}</Badge>
            </div>
          </div>
          <div className="h-full min-h-[300px] overflow-hidden rounded-2xl">
            <DashboardChart chart={element.content} />
          </div>
        </div>
      )}

      {(element.type === 'row' || element.type === 'column') && (
        <div className={cn(
          "grid gap-6",
          element.type === 'row' ? "grid-cols-12" : "flex flex-col"
        )}>
          {element.children?.map((child: any) => (
            <RecursiveElement key={child.id} element={child} theme={theme} parentType={element.type} />
          ))}
        </div>
      )}

      {element.type === 'tabs' && (
        <div className="space-y-6">
          <div className="flex gap-2 border-b border-slate-200">
            {element.children?.map((tab: any, i: number) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-6 py-3 text-sm font-bold transition-all border-b-2",
                  activeTab === i ? "border-prism-500 text-prism-600" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.meta?.title || `Tab ${i + 1}`}
              </button>
            ))}
          </div>
          {element.children?.[activeTab] && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              {element.children[activeTab].children?.map((child: any) => (
                <RecursiveElement key={child.id} element={child} theme={theme} parentType="column" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

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
      // Try Superset first
      const d = await supersetService.getDashboard(dashboardId);
      
      // If Superset returns a dashboard, we need to handle its layout
      // Superset layout is in position_json (stringified)
      if (d.position_json) {
        const position = typeof d.position_json === 'string' ? JSON.parse(d.position_json) : d.position_json;
        const normalized = mapSupersetLayoutToPrism(position);
        setDashboard({
          ...d,
          layout: denormalizeLayout(normalized)
        });
      } else {
        setDashboard(d);
      }
    } catch (err) {
      console.error('Failed to load dashboard from Superset, falling back to local:', err);
      try {
        const local = await getLocalDashboard(dashboardId);
        setDashboard(local);
      } catch (localErr) {
        console.error('Failed to load local dashboard:', localErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prism-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-xl font-bold text-slate-900">Dashboard not found</h2>
        <button onClick={() => navigate('/dashboards')} className="btn-primary">Back to Dashboards</button>
      </div>
    );
  }

  const handleSave = () => {
    setIsCustomizing(false);
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
    <div className={`min-h-full transition-colors duration-500`} style={{ backgroundColor: dashboard.backgroundColor || '#f8fafc' }}>
      {/* Dashboard Header */}
      <header className="bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboards')}
            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white/50 rounded-2xl transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-10 w-px bg-slate-200/50" />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{dashboard.name}</h1>
              <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black uppercase tracking-widest text-[9px]">Live Asset</Badge>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span>Enterprise Intelligence</span>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <span>Modified {new Date(dashboard.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
            <button 
              onClick={() => setIsCustomizing(true)}
              className="p-2 text-slate-500 hover:text-accent hover:bg-white rounded-xl transition-all"
              title="Customize Theme"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleFullScreen}
              className="p-2 text-slate-500 hover:text-accent hover:bg-white rounded-xl transition-all"
              title="Full Screen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
          <div className="h-8 w-px bg-slate-200/50 mx-1" />
          <button className="p-2.5 text-slate-500 hover:text-accent hover:bg-white rounded-2xl transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate(`/dashboard-editor/${id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <LayoutIcon className="w-4 h-4" />
            Edit Mode
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-6">
        {dashboard.layout?.map((element: any) => (
          <RecursiveElement key={element.id} element={element} theme={theme} parentType="column" />
        ))}
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
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Dashboard Theme</h3>
                <button 
                  onClick={() => setIsCustomizing(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Primary Color */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Color</label>
                  <div className="grid grid-cols-3 gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTheme({ ...theme, primaryColor: color.value })}
                        className={`h-10 rounded-xl transition-all flex items-center justify-center ${
                          theme.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-slate-900 scale-105' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {theme.primaryColor === color.value && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Background</label>
                  <div className="space-y-2">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.value}
                        onClick={() => setTheme({ ...theme, backgroundColor: bg.value })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium flex items-center justify-between transition-all ${
                          theme.backgroundColor === bg.value 
                            ? 'border-prism-600 bg-prism-50 text-prism-600' 
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card Style</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['flat', 'elevated', 'bordered'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setTheme({ ...theme, cardStyle: style })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium capitalize flex items-center justify-between transition-all ${
                          theme.cardStyle === style 
                            ? 'border-prism-600 bg-prism-50 text-prism-600' 
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Layout</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['grid', 'masonry', 'columns'] as const).map((layout) => (
                      <button
                        key={layout}
                        onClick={() => setTheme({ ...theme, layout: layout })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium capitalize flex items-center justify-between transition-all ${
                          theme.layout === layout 
                            ? 'border-prism-600 bg-prism-50 text-prism-600' 
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {layout}
                        {theme.layout === layout && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100">
                <button 
                  onClick={handleSave}
                  className="w-full py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-prism-200 active:scale-95"
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
