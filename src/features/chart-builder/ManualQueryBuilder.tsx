import React, { useState, useEffect } from 'react';
import { Settings, Filter, List, ArrowDownAZ as ArrowDownWideZap, Play, Save, ChevronRight, BarChart2 } from 'lucide-react';
import { biService } from '../../services/biService';
import { toast } from 'sonner';

export const ManualQueryBuilder = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState<string[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    biService.getDatasets().then(setDatasets);
  }, []);

  const handleRun = async () => {
    if (!selectedDataset) return;
    setIsLoading(true);
    try {
      const res = await biService.runQuery({
        dataset: selectedDataset.name,
        metrics,
        dimensions,
        filters
      });
      setResults(res);
    } catch (err) {
      toast.error("Erreur d'exécution");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 bg-white min-h-screen">
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Query Builder Manuel</h1>
          <p className="text-slate-500 mt-1">Configurez précisément votre analyse sans assistant.</p>
        </div>
        <button
          onClick={handleRun}
          disabled={isLoading || !selectedDataset}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50"
        >
          {isLoading ? "Chargement..." : "Lancer l'Analyse"}
          <Play size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Configuration */}
        <div className="space-y-10">
          {/* Dataset Selector */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Settings size={12} /> Dataset Source
            </label>
            <select
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium"
              onChange={(e) => setSelectedDataset(datasets.find(d => d.name === e.target.value))}
            >
              <option value="">Sélectionnez un dataset...</option>
              {datasets.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          {/* Metrics */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ArrowDownWideZap size={12} /> Métriques (Y-Axis)
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedDataset?.metrics.map((m: any) => (
                <button
                  key={m.name}
                  onClick={() => setMetrics(prev => prev.includes(m.name) ? prev.filter(x => x !== m.name) : [...prev, m.name])}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    metrics.includes(m.name) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <List size={12} /> Dimensions (X-Axis)
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedDataset?.columns.map((c: any) => (
                <button
                  key={c.name}
                  onClick={() => setDimensions(prev => prev.includes(c.name) ? prev.filter(x => x !== c.name) : [...prev, c.name])}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    dimensions.includes(c.name) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Placeholder */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Filter size={12} /> Filtres
            </label>
            <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-xs font-bold hover:border-slate-200 transition-all">
              + Ajouter un filtre
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-8">
            {!results && (
              <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[48px] bg-slate-50/30">
                <BarChart2 size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium">Configurez votre requête pour voir les résultats</p>
              </div>
            )}

            {results && (
                <div className="space-y-8">
                    <div className="p-8 bg-slate-900 rounded-[32px] overflow-hidden text-emerald-400 font-mono text-xs">
                        <span className="text-slate-500 mb-2 block uppercase tracking-widest">SQL Généré</span>
                        {results.sql}
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        {Object.keys(results.data[0] || {}).map(col => (
                                            <th key={col} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.data.map((row: any, i: number) => (
                                        <tr key={i}>
                                            {Object.values(row).map((val: any, j) => (
                                                <td key={j} className="px-8 py-4 text-sm text-slate-600 border-b border-slate-50">{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
