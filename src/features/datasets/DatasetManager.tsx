import React, { useState, useEffect } from 'react';
import { Database, Plus, ChevronRight, Table, ArrowRight, Eye, Save, Trash2, Edit3, X, Check, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

export const DatasetManager = () => {
  const [step, setStep] = useState(1);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [joins, setJoins] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [datasetName, setDatasetName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Charger les tables physiques
    axios.get('/api/database/tables', { headers: { 'X-User': 'admin' }})
      .then(res => setTables(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleTableToggle = (table: string) => {
    setSelectedTables(prev =>
      prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table]
    );
  };

  const discoverJoins = async () => {
    if (selectedTables.length < 2) {
      loadColumns();
      return;
    }
    try {
      const res = await axios.post('/api/database/discover-joins', selectedTables, { headers: { 'X-User': 'admin' }});
      setJoins(res.data);
      setStep(2);
    } catch (err) {
      toast.error("Erreur de découverte des relations");
    }
  };

  const loadColumns = async () => {
    const allCols: any[] = [];
    for (const table of selectedTables) {
      const res = await axios.get(`/api/database/columns/${table}`, { headers: { 'X-User': 'admin' }});
      res.data.forEach((c: any) => {
        allCols.push({ ...c, table, label: c.name, is_visible: true, expression: null });
      });
    }
    setColumns(allCols);
    setStep(3);
  };

  const addCalculatedField = () => {
    setColumns([...columns, {
        name: `calc_${columns.length}`,
        table: "Calculated",
        label: "Nouveau Champ",
        type: "string",
        expression: "CASE WHEN ...",
        is_visible: true
    }]);
  };

  const addMetric = () => {
    setMetrics([...metrics, {
        name: `metric_${metrics.length}`,
        expression: "SUM(...)"
    }]);
  };

  const handleSave = async () => {
    const dataset = {
        name: datasetName,
        kind: selectedTables.length > 1 ? "virtual" : "physical",
        table_name: selectedTables[0],
        columns: columns.map(c => ({
            name: c.name,
            label: c.label,
            type: c.type.toLowerCase().includes('int') ? 'number' : 'string',
            is_visible: c.is_visible,
            expression: c.expression
        })),
        metrics: metrics.map(m => ({
            name: m.name,
            expression: m.expression
        }))
    };

    try {
        await axios.post('/api/datasets', dataset, { headers: { 'X-User': 'admin' }});
        toast.success("Structure de Dataset enregistrée !");

        if (dataset.kind === "virtual") {
            const select = columns.filter(c => c.is_visible).map(c => `${c.table === "Calculated" ? c.expression : c.table + "." + c.name} AS "${c.label}"`).join(",\n  ");
            const from = selectedTables[0];
            const joinClauses = joins.map(j => `JOIN ${j.right_table} ON ${j.left_table}.${j.left_on} = ${j.right_table}.${j.right_on}`).join("\n");
            const baseSql = `SELECT\n  ${select}\nFROM ${from}\n${joinClauses}`;
            navigate('/sql-lab', { state: { sql: baseSql } });
        } else {
            navigate('/datasets');
        }
    } catch (err) {
        toast.error("Erreur lors de la création");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Configurateur de Dataset</h1>
          <div className="flex items-center gap-4 mt-4">
            {[1, 2, 3].map(s => (
                <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-indigo-600' : 'text-slate-300'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-white'}`}>{s}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {s === 1 && "Sélection"}
                        {s === 2 && "Relations"}
                        {s === 3 && "Configuration"}
                    </span>
                    {s < 3 && <ChevronRight size={14} className="text-slate-300" />}
                </div>
            ))}
          </div>
        </div>

        {step === 3 && (
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Nom du dataset..."
                    className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                />
                <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
                    <Save size={18} /> Finaliser le Dataset
                </button>
            </div>
        )}
      </div>

      <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/40 min-h-[600px] overflow-hidden flex flex-col">
        {step === 1 && (
            <div className="p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tables.map(table => (
                        <button
                            key={table}
                            onClick={() => handleTableToggle(table)}
                            className={`p-8 rounded-[32px] border-2 transition-all text-left group ${
                                selectedTables.includes(table) ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50/30 hover:border-slate-200'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                                selectedTables.includes(table) ? 'bg-indigo-600 text-white rotate-12 scale-110' : 'bg-white text-slate-400 group-hover:text-slate-600'
                            }`}>
                                <Table size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 capitalize">{table}</h3>
                            <p className="text-xs text-slate-500 mt-2">Table Physique</p>
                        </button>
                    ))}
                    <button className="p-8 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all">
                        <Plus size={32} />
                        <span className="font-bold text-sm">Nouvelle Connexion</span>
                    </button>
                </div>

                {selectedTables.length > 0 && (
                    <div className="flex justify-center pt-8 border-t border-slate-50">
                        <button
                            onClick={discoverJoins}
                            className="flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl active:scale-95"
                        >
                            Suivant : Configurer les Relations <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        )}

        {step === 2 && (
            <div className="flex-1 flex flex-col">
                <div className="p-12 space-y-8 flex-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900">Intelligence de Relation</h2>
                        <button className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">+ Ajouter une Jointure Manuelle</button>
                    </div>

                    <div className="space-y-4">
                        {joins.length === 0 ? (
                            <div className="p-12 text-center bg-slate-50 rounded-[32px] border border-slate-100">
                                <p className="text-slate-400 font-medium italic">Aucune relation automatique détectée. {selectedTables.length > 1 ? "Veuillez en définir une manuellement." : "Dataset simple détecté."}</p>
                            </div>
                        ) : (
                            joins.map((j, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 bg-white border-2 border-slate-50 rounded-[24px] shadow-sm">
                                    <div className="flex-1 flex items-center justify-center gap-4 p-4 bg-slate-50 rounded-2xl font-bold text-slate-600">
                                        <Table size={16} /> {j.left_table}.{j.left_on}
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                                        =
                                    </div>
                                    <div className="flex-1 flex items-center justify-center gap-4 p-4 bg-slate-50 rounded-2xl font-bold text-slate-600">
                                        <Table size={16} /> {j.right_table}.{j.right_on}
                                    </div>
                                    <button className="p-4 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="p-8 border-t border-slate-100 flex justify-between">
                    <button onClick={() => setStep(1)} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors">Retour</button>
                    <button onClick={loadColumns} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">Suivant : Configurer les colonnes</button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="flex-1 flex flex-col">
                <div className="p-12 space-y-8 flex-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900">Dictionnaire de Données</h2>
                        <div className="flex gap-4">
                            <button onClick={addCalculatedField} className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100">+ Ajouter un champ calculé</button>
                            <button onClick={addMetric} className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">+ Ajouter une métrique</button>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-slate-100 rounded-[32px]">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Visibilité</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Source (Table)</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Expression / Nom</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Label (Interface)</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {columns.map((c, i) => (
                                    <tr key={i} className={`border-t border-slate-50 transition-colors ${c.is_visible ? 'bg-white' : 'bg-slate-50/50 opacity-40'}`}>
                                        <td className="px-8 py-4">
                                            <button
                                                onClick={() => {
                                                    const next = [...columns];
                                                    next[i].is_visible = !next[i].is_visible;
                                                    setColumns(next);
                                                }}
                                                className={`w-10 h-6 rounded-full transition-all relative ${c.is_visible ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${c.is_visible ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-tighter italic">{c.table}</td>
                                        <td className="px-8 py-4 text-sm font-mono text-indigo-500">
                                            {c.table === "Calculated" ? (
                                                <input
                                                    className="bg-indigo-50 p-2 rounded w-full outline-none"
                                                    value={c.expression}
                                                    onChange={(e) => {
                                                        const next = [...columns];
                                                        next[i].expression = e.target.value;
                                                        setColumns(next);
                                                    }}
                                                />
                                            ) : c.name}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={c.label}
                                                    onChange={(e) => {
                                                        const next = [...columns];
                                                        next[i].label = e.target.value;
                                                        setColumns(next);
                                                    }}
                                                    className="bg-transparent border-b border-transparent focus:border-indigo-200 outline-none text-sm font-bold text-slate-700 w-full"
                                                />
                                                <Edit3 size={14} className="text-slate-300" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase">{c.type}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {metrics.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Métriques Sémantiques</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {metrics.map((m, i) => (
                                    <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 shadow-sm">
                                        <input
                                            className="font-bold text-slate-900 outline-none w-1/3"
                                            value={m.name}
                                            onChange={(e) => {
                                                const next = [...metrics];
                                                next[i].name = e.target.value;
                                                setMetrics(next);
                                            }}
                                        />
                                        <input
                                            className="flex-1 font-mono text-xs text-emerald-600 bg-emerald-50 p-3 rounded-xl outline-none"
                                            value={m.expression}
                                            onChange={(e) => {
                                                const next = [...metrics];
                                                next[i].expression = e.target.value;
                                                setMetrics(next);
                                            }}
                                        />
                                        <button onClick={() => setMetrics(metrics.filter((_, idx) => idx !== i))}><X size={16} className="text-slate-300" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-8 border-t border-slate-100 flex justify-between bg-slate-50/50">
                    <button onClick={() => setStep(2)} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors">Retour</button>
                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                            <Eye size={18} /> Aperçu des Données
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
