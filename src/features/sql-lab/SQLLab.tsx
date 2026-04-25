import React, { useState } from 'react';
import { Play, Save, Database, Code, ShieldCheck, AlertCircle, Copy } from 'lucide-react';
import { biService } from '../../services/biService';
import { toast } from 'sonner';

export const SQLLab = () => {
  const [sql, setSql] = useState("SELECT category, SUM(amount) as total FROM transactions GROUP BY category");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // On utilise l'API raw query du backend
      const res = await biService.runRawQuery(sql);
      setResults(res);
      toast.success("Requête exécutée avec succès");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'exécution");
      toast.error("Échec de la requête");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Code size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Expert SQL Lab</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Laboratoire SQL Manuel</h1>
          <p className="text-slate-500 mt-2 text-lg">Contrôle total sur vos données avec injection de sécurité automatique.</p>
        </div>

        <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                <ShieldCheck size={16} /> RLS ACTIF
            </div>
            <button
                onClick={handleRun}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={18} />}
                Exécuter (Ctrl+Enter)
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-800">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="ml-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">query.sql</span>
                    </div>
                    <button className="text-slate-400 hover:text-white transition-colors"><Copy size={14} /></button>
                </div>
                <textarea
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    className="w-full h-[300px] bg-transparent text-indigo-300 font-mono p-8 outline-none resize-none leading-relaxed text-sm"
                    placeholder="Entrez votre SQL ici..."
                />
            </div>

            {error && (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 text-rose-800">
                    <AlertCircle className="shrink-0 mt-1" size={20} />
                    <div className="space-y-1">
                        <p className="font-bold">Erreur de Syntaxe ou d'Exécution</p>
                        <p className="text-sm opacity-80 font-mono">{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Résultats de la requête</h3>
                    {results && <span className="text-xs text-slate-400 font-medium">{results.data.length} lignes retournées</span>}
                </div>

                <div className="overflow-x-auto">
                    {results ? (
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
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="px-8 py-4 text-sm text-slate-600 border-b border-slate-50">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-slate-300 gap-4">
                            <Database size={48} className="opacity-20" />
                            <p className="font-medium">Exécutez une requête pour voir les données</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="p-8 bg-indigo-600 text-white rounded-[40px] shadow-2xl shadow-indigo-500/20">
                <h3 className="text-xl font-bold mb-4">Aide Expert</h3>
                <ul className="space-y-4 text-sm opacity-90">
                    <li className="flex gap-3">
                        <span className="font-bold text-indigo-200">01.</span>
                        Le système injecte automatiquement un filtre RLS basé sur votre rôle.
                    </li>
                    <li className="flex gap-3">
                        <span className="font-bold text-indigo-200">02.</span>
                        Les datasets disponibles sont accessibles via `transactions`.
                    </li>
                    <li className="flex gap-3">
                        <span className="font-bold text-indigo-200">03.</span>
                        Vous pouvez utiliser toutes les fonctions SQL du moteur (SQLite/Postgres).
                    </li>
                </ul>
            </div>

            <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Requêtes enregistrées</h3>
                <div className="space-y-3">
                    {["Ventes par mois", "Top 10 Clients", "Anomalies de stock"].map(q => (
                        <button key={q} className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 transition-all text-sm text-slate-600 font-medium border border-transparent hover:border-slate-100">
                            {q}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
