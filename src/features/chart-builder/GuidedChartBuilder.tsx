import React, { useState, useEffect, useRef } from 'react';
import * as anime from 'animejs';
const anime_default = (anime as any).default || anime;
import { biService } from '../../services/biService';
import {
  Database,
  Activity,
  TrendingUp,
  BarChart3,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Play,
  Save,
  LayoutDashboard,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { saveChart } from '../../lib/db';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const InsightPanel = ({ insights }: { insights: any[] }) => {
  useEffect(() => {
    anime_default({
      targets: '.insight-card',
      translateX: [100, 0],
      opacity: [0, 1],
      delay: anime_default.stagger(100),
      easing: 'easeOutExpo'
    });
  }, [insights]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">AI Insights</h3>
      {insights.map((insight, i) => (
        <div
          key={i}
          className="insight-card p-6 bg-indigo-900 text-white rounded-[24px] shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
            <Sparkles size={40} />
          </div>
          <p className="font-medium leading-relaxed relative z-10">{insight.message}</p>
        </div>
      ))}
    </div>
  );
};

export const GuidedChartBuilder = () => {
  const [step, setStep] = useState(1);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    biService.getDatasets().then(setDatasets);
  }, []);

  useEffect(() => {
    if (step === 4) {
      handleRunQuery();
    }

    anime_default({
      targets: '.step-content',
      opacity: [0, 1],
      translateX: [20, 0],
      easing: 'easeOutExpo',
      duration: 800
    });
  }, [step]);

  const handleRunQuery = async () => {
    if (!selectedDataset) return;
    setIsLoading(true);
    try {
      const result = await biService.runQuery({
        dataset: selectedDataset.name,
        metrics: selectedMetrics,
        dimensions: selectedDimensions
      });
      setQueryResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!queryResult) return;
    setIsSaving(true);
    try {
      const chartId = crypto.randomUUID();
      await saveChart({
        id: chartId,
        name: `Analyse ${selectedDataset.name} par ${selectedDimensions[0]}`,
        tableName: selectedDataset.name,
        chartType: 'Bar',
        xAxis: selectedDimensions,
        yAxis: selectedMetrics,
        config: {
          generatedFrom: 'GuidedChartBuilder'
        }
      });
      toast.success("Analyse sauvegardée !");
      setTimeout(() => navigate('/dashboard-builder'), 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMetric = (m: string) => {
    setSelectedMetrics(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const toggleDimension = (d: string) => {
    setSelectedDimensions(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto p-8 space-y-12 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Sparkles size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Flux d'Intelligence Guidé</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {step === 4 ? "Votre Insight est prêt" : "Créer une nouvelle analyse"}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {step === 1 && "Étape 1: Choisissez votre source de données"}
            {step === 2 && "Étape 2: Que voulez-vous mesurer ?"}
            {step === 3 && "Étape 3: Comment voulez-vous segmenter les données ?"}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-slate-200">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                step === s ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'text-slate-400'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="step-content min-h-[400px]">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {datasets.map(ds => (
              <button
                key={ds.name}
                onClick={() => {
                  setSelectedDataset(ds);
                  setStep(2);
                }}
                className="group p-8 bg-white border border-slate-200 rounded-[40px] text-left hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                  <Database size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 capitalize">{ds.name}</h3>
                <p className="text-slate-500 mt-2">{ds.columns.length} colonnes • {ds.metrics.length} metrics</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDataset?.metrics.map((m: any) => (
                <button
                  key={m.name}
                  onClick={() => toggleMetric(m.name)}
                  className={`p-8 rounded-[32px] border-2 text-left transition-all ${
                    selectedMetrics.includes(m.name)
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-600/5'
                      : 'border-white bg-white hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                    selectedMetrics.includes(m.name) ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <TrendingUp size={20} />
                  </div>
                  <h4 className="font-bold text-lg text-slate-900">{m.name.replace('_', ' ')}</h4>
                  <p className="text-sm text-slate-500 mt-2">{m.expression}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center pt-12">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 px-6 py-3 rounded-xl hover:bg-slate-100 transition-all">
                <ArrowLeft size={18} /> Retour
              </button>
              <button
                disabled={selectedMetrics.length === 0}
                onClick={() => setStep(3)}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-lg transition-all"
              >
                Suivant <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDataset?.columns.map((col: any) => (
                <button
                  key={col.name}
                  onClick={() => toggleDimension(col.name)}
                  className={`p-8 rounded-[32px] border-2 text-left transition-all ${
                    selectedDimensions.includes(col.name)
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-600/5'
                      : 'border-white bg-white hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                    selectedDimensions.includes(col.name) ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Activity size={20} />
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 capitalize">{col.name}</h4>
                  <p className="text-sm text-slate-500 mt-2">{col.type}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center pt-12">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 px-6 py-3 rounded-xl hover:bg-slate-100 transition-all">
                <ArrowLeft size={18} /> Retour
              </button>
              <button
                disabled={selectedDimensions.length === 0}
                onClick={() => setStep(4)}
                className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
              >
                Générer l'analyse <Sparkles size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
            {isLoading ? (
              <div className="h-[500px] flex flex-col items-center justify-center gap-8 bg-white rounded-[48px] border border-slate-100 shadow-sm">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <Activity size={32} />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-slate-900 font-black uppercase tracking-widest text-sm">Query intelligence en cours...</p>
                  <p className="text-slate-400 text-sm">Extraction des patterns en temps réel</p>
                </div>
              </div>
            ) : queryResult && (
              <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/40 transition-all">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                      <BarChart3 size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-2xl text-slate-900 tracking-tight">Distribution par {selectedDimensions.join(', ')}</h4>
                      <p className="text-slate-400 text-sm font-medium mt-1">Basé sur {selectedMetrics.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all">Exporter</button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-2"
                    >
                      {isSaving ? <Activity className="animate-spin" size={18} /> : <LayoutDashboard size={18} />}
                      Ajouter au Dashboard
                    </button>
                  </div>
                </div>

                <div className="h-[400px] w-full" ref={chartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={queryResult.data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey={selectedDimensions[0]}
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
                      />
                      <Tooltip
                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar
                        dataKey={selectedMetrics[0]}
                        radius={[12, 12, 0, 0]}
                        animationDuration={1500}
                      >
                        {queryResult.data.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            </div>

            <div className="space-y-8">
              {queryResult?.insights && <InsightPanel insights={queryResult.insights} />}
            </div>

            <div className="lg:col-span-3 flex justify-center pt-12">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedMetrics([]);
                  setSelectedDimensions([]);
                  setQueryResult(null);
                }}
                className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 bg-white border border-slate-200 px-10 py-5 rounded-3xl transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Plus size={20} /> Nouvelle Analyse
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
