import React, { useState, useEffect } from 'react';
import * as anime from 'animejs';
const anime_default = (anime as any).default || anime;
import { LayoutDashboard, Plus, Move, Trash2, Save, BarChart3, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { getCharts, saveDashboard } from '../../lib/db';
import { biService } from '../../services/biService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const Widget = ({ w, onRemove }: { w: any, onRemove: (id: string) => void }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await biService.runQuery({
          dataset: w.tableName,
          metrics: w.yAxis,
          dimensions: w.xAxis
        });
        setData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [w]);

  return (
    <div
      className={`widget-${w.id} col-span-1 lg:col-span-6 bg-white p-8 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/40 group relative hover:-translate-y-2 transition-all duration-500`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <h4 className="font-bold text-xl text-slate-900 tracking-tight">{w.title}</h4>
            <p className="text-slate-400 text-xs font-medium italic">Données en direct</p>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors"><Move size={18} /></button>
          <button onClick={() => onRemove(w.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"><Trash2 size={18} /></button>
        </div>
      </div>

      <div className="h-64 w-full flex items-center justify-center">
        {isLoading ? (
          <Activity className="animate-spin text-indigo-200" size={40} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey={w.xAxis[0]} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <Bar dataKey={w.yAxis[0]} radius={[8, 8, 0, 0]}>
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                ))}
              </Bar>
              <Tooltip
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                cursor={{fill: '#f8fafc'}}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export const SimpleDashboardBuilder = () => {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [availableCharts, setAvailableCharts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    const charts = await getCharts();
    setAvailableCharts(charts);
  };

  const addWidget = (chart: any) => {
    const newWidget = {
      id: Math.random().toString(36).substr(2, 9),
      chartId: chart.id,
      title: chart.name,
      tableName: chart.table_name || chart.tableName,
      xAxis: chart.x_axis || chart.xAxis,
      yAxis: chart.y_axis || chart.yAxis,
      type: chart.chart_type
    };
    setWidgets([...widgets, newWidget]);
    setIsAdding(false);

    setTimeout(() => {
      anime_default({
        targets: `.widget-${newWidget.id}`,
        scale: [0.9, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: 'easeOutElastic(1, .8)'
      });

      toast.success(`Analyse "${chart.name}" ajoutée au dashboard`);
    }, 0);
  };

  const removeWidget = (id: string) => {
    anime_default({
      targets: `.widget-${id}`,
      scale: 0.8,
      opacity: 0,
      duration: 400,
      easing: 'easeInBack',
      complete: () => {
        setWidgets(prev => prev.filter(w => w.id !== id));
      }
    });
  };

  const handlePublish = async () => {
    const id = crypto.randomUUID();
    await saveDashboard({
      id,
      name: "Nouveau Dashboard Intelligence",
      layout: widgets.map(w => ({
        id: w.id,
        type: 'chart',
        content: { id: w.chartId, name: w.title },
        meta: { width: 6, height: 350 }
      })),
      backgroundColor: '#f8fafc'
    });
    toast.success("Dashboard publié avec succès !");
    navigate(`/dashboards/${id}`);
  };

  return (
    <div className="p-12 space-y-12 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Expérience Dashboard Intelligence</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Votre Espace Décisionnel</h1>
          <p className="text-slate-500 text-lg">Assemblez vos insights pour construire votre vue stratégique.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            {isAdding ? "Fermer" : "Ajouter un Widget"}
          </button>
          {widgets.length > 0 && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
            >
              <Save size={20} /> Publier le Dashboard
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white rounded-[32px] border border-slate-200 shadow-xl"
          >
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {availableCharts.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-slate-400">Aucune analyse disponible. Créez-en une avec le BI Builder !</p>
                  <button
                    onClick={() => navigate('/chart-builder')}
                    className="mt-4 text-indigo-600 font-bold hover:underline"
                  >
                    Aller au BI Builder
                  </button>
                </div>
              ) : (
                availableCharts.map(chart => (
                  <button
                    key={chart.id}
                    onClick={() => addWidget(chart)}
                    className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 mb-4 group-hover:text-indigo-600 transition-colors">
                      <BarChart3 size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 truncate">{chart.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{chart.chart_type}</p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {widgets.length === 0 ? (
        <div className="h-[500px] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[60px] bg-white/40 backdrop-blur-sm">
          <div className="w-32 h-32 bg-white rounded-[40px] shadow-xl flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
            <LayoutDashboard size={64} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Votre dashboard est vide</h3>
          <p className="text-slate-400 mt-4 max-w-sm text-center leading-relaxed font-medium">
            Cliquez sur "Ajouter un Widget" pour commencer à assembler vos briques d'intelligence.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {widgets.map(w => (
            <Widget key={w.id} w={w} onRemove={removeWidget} />
          ))}
        </div>
      )}
    </div>
  );
};
