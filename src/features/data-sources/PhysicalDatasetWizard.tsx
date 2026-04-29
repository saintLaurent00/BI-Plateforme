import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database as DatabaseIcon, 
  Table as TableIcon, 
  Link2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Check, 
  Eye, 
  EyeOff, 
  Settings2,
  Trash2,
  Plus,
  ArrowRight,
  CheckCircle2,
  Server
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTables, getTableSchema, executeQuery } from '../../core/utils/db';
import { Badge } from '../../components/ui/Badge';
import { Stepper } from '../../components/ui/Stepper';
import { FormSection, FormInput, FormSelect, FormActions, FormButton } from '../../components/ui/FormElements';
import { cn } from '../../core/utils/utils';
import { toast } from 'sonner';

export const PhysicalDatasetWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [databases, setDatabases] = React.useState<any[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = React.useState<string>('');
  const [tables, setTables] = React.useState<string[]>([]);
  const [selectedTables, setSelectedTables] = React.useState<string[]>([]);
  const [joins, setJoins] = React.useState<any[]>([]);
  const [columns, setColumns] = React.useState<any[]>([]);
  const [datasetName, setDatasetName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [dataPreview, setDataPreview] = React.useState<any[]>([]);
  const [defaultWhere, setDefaultWhere] = React.useState<string>('');
  const [activeSubTab, setActiveSubTab] = React.useState<'cols' | 'metrics' | 'calcs'>('cols');

  const steps = React.useMemo(() => {
    if (selectedTables.length <= 1) {
      return [
        { id: 1, label: 'Sources', description: 'Base & Tables' },
        { id: 3, label: 'Colonnes', description: 'Catalogue & Métriques' },
        { id: 4, label: 'Finalisation', description: 'Filtres & Sauvegarde' }
      ];
    }
    return [
      { id: 1, label: 'Sources', description: 'Base & Tables' },
      { id: 2, label: 'Relations', description: 'Jointures automatiques' },
      { id: 3, label: 'Colonnes', description: 'Catalogage et Renommage' },
      { id: 4, label: 'Finalisation', description: 'Nommage et Sauvegarde' }
    ];
  }, [selectedTables.length]);

  React.useEffect(() => {
    loadDatabases();
  }, []);

  React.useEffect(() => {
    if (selectedDatabaseId) {
      loadTables(selectedDatabaseId);
    } else {
        setTables([]);
    }
  }, [selectedDatabaseId]);

  const loadDatabases = async () => {
    setDatabases([{ id: 'local', database_name: 'Base Locale (SQLite)' }]);
  };

  const loadTables = async (dbId: string) => {
    setIsLoading(true);
    try {
        if (dbId === 'local') {
            const t = await getTables();
            setTables(t);
        } else {
            const t = await getTables(); 
            setTables(t);
        }
    } catch (e) {
        setTables([]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleTableToggle = (tableName: string) => {
    setSelectedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName) 
        : [...prev, tableName]
    );
  };

  const detectJoins = async () => {
    setIsLoading(true);
    const schemas: Record<string, any[]> = {};
    for (const table of selectedTables) {
      schemas[table] = await getTableSchema(table);
    }

    const detectedJoins: any[] = [];
    if (selectedTables.length > 1) {
      const baseTable = selectedTables[0];
      for (let i = 1; i < selectedTables.length; i++) {
        const targetTable = selectedTables[i];
        const targetIdCol = `${targetTable.toLowerCase().replace(/s$/, '')}_id`;
        const link = schemas[baseTable].find(c => c.name.toLowerCase() === targetIdCol);
        
        if (link) {
          detectedJoins.push({
            leftTable: baseTable,
            rightTable: targetTable,
            leftCol: link.name,
            rightCol: 'id',
            type: 'inner'
          });
        } else {
            const commonCol = schemas[baseTable].find(c1 => 
                c1.name !== 'id' && schemas[targetTable].find(c2 => c2.name === c1.name)
            );
            if (commonCol) {
                detectedJoins.push({
                    leftTable: baseTable,
                    rightTable: targetTable,
                    leftCol: commonCol.name,
                    rightCol: commonCol.name,
                    type: 'inner'
                });
            }
        }
      }
    }
    setJoins(detectedJoins);
    setIsLoading(false);
    setStep(3);
  };

  const loadColumns = async () => {
    setIsLoading(true);
    const allCols: any[] = [];
    for (const table of selectedTables) {
      const schema = await getTableSchema(table);
      schema.forEach(col => {
        allCols.push({
          table,
          originalName: col.name,
          displayName: col.name,
          type: col.type,
          visible: true
        });
      });
    }
    setColumns(allCols);
    
    try {
        const sample = await executeQuery(`SELECT * FROM "${selectedTables[0]}" LIMIT 5`);
        setDataPreview(sample);
    } catch (e) {
        setDataPreview([]);
    }
    
    setIsLoading(false);
    setStep(4);
  };

  const handleSave = async () => {
      toast.success("Dataset physique créé avec succès !");
      navigate('/datasets');
  };

  return (
    <div className="min-h-full bg-muted/10 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/datasets/new')}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Assistant Dataset Physique</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Configuration Multi-tables</p>
          </div>
        </div>
        
        <Stepper steps={steps} currentStep={step} className="max-w-md hidden lg:block" />

        <div className="flex items-center gap-3">
          {step > 1 && (
            <button 
              onClick={() => {
                if (step === 3 && selectedTables.length === 1) setStep(1);
                else setStep(step - 1);
              }}
              className="px-6 py-2 border border-border rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-muted transition-all"
            >
              Précédent
            </button>
          )}
          <button 
            disabled={(step === 1 && selectedTables.length === 0) || isLoading}
            onClick={() => {
              if (step === 1) {
                if (selectedTables.length > 1) detectJoins();
                else loadColumns();
              }
              else if (step === 3) loadColumns();
              else if (step === 4) setStep(5);
              else handleSave();
            }}
            className="btn-primary px-8 py-2 shadow-lg shadow-accent/20 flex items-center gap-2"
          >
            {step === 5 ? 'Enregistrer' : 'Suivant'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto py-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="space-y-2 text-center max-w-xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight">Configuration des Sources</h2>
                    <p className="text-muted-foreground font-light">Sélectionnez une base de données puis les tables à inclure dans votre dataset.</p>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground italic">1. Base de données</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {databases.map(db => (
                                <button 
                                    key={db.id}
                                    onClick={() => setSelectedDatabaseId(String(db.id))}
                                    className={cn(
                                        "p-6 glass-panel text-left space-y-4 group transition-all duration-300 relative overflow-hidden",
                                        selectedDatabaseId === String(db.id) 
                                            ? "border-accent bg-accent/5 ring-4 ring-accent/5" 
                                            : "hover:border-accent/30"
                                    )}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                            selectedDatabaseId === String(db.id) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground group-hover:bg-accent/10"
                                        )}>
                                            <Server className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">{db.database_name}</h4>
                                            <Badge variant="neutral" className="text-[7px] uppercase tracking-widest">{db.id === 'local' ? 'Internal' : 'External'}</Badge>
                                        </div>
                                    </div>
                                    {selectedDatabaseId === String(db.id) && (
                                        <div className="absolute top-4 right-4 text-accent">
                                            <CheckCircle2 className="w-4 h-4 fill-accent text-accent-foreground" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {selectedDatabaseId && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 border-t border-border pt-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground italic">2. Tables disponibles</h3>
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-muted px-3 py-1 rounded-full border border-border">
                                        {selectedTables.length} sélectionnée(s)
                                    </div>
                                </div>
                                
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Sync avec la source...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {tables.map(table => (
                                            <button 
                                                key={table}
                                                onClick={() => handleTableToggle(table)}
                                                className={cn(
                                                    "p-4 glass-panel text-left space-y-3 group transition-all duration-300 relative",
                                                    selectedTables.includes(table) ? "border-accent bg-accent/5 ring-2 ring-accent/5" : "hover:border-accent/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                    selectedTables.includes(table) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                                                )}>
                                                    <TableIcon className="w-5 h-5" />
                                                </div>
                                                <p className="font-bold text-[13px] text-foreground truncate">{table}</p>
                                                {selectedTables.includes(table) && (
                                                    <div className="absolute top-3 right-3 text-accent">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center max-w-xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight">Relations détectées</h2>
                    <p className="text-muted-foreground font-light">Nous avons analysé vos tables pour trouver des liens logiques. Vous pouvez modifier ces relations si nécessaire.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground italic">Relations Actives</h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Ajouter manuellement
                            </button>
                        </div>
                        {joins.length > 0 ? (
                        joins.map((join, i) => (
                            <div key={i} className="glass-panel p-6 flex items-center justify-between group hover:border-accent/30 transition-all border-l-4 border-l-accent">
                            <div className="flex items-center gap-8 flex-1">
                                <div className="text-center space-y-2 flex-1">
                                    <div className="p-3 bg-muted rounded-xl font-bold border border-border text-sm">{join.leftTable}</div>
                                    <div className="text-[10px] font-mono text-accent">{join.leftCol}</div>
                                </div>
                                
                                <div className="flex flex-col items-center gap-2">
                                    <div className="px-3 py-1 bg-accent/10 text-accent text-[9px] font-black uppercase rounded-full border border-accent/20">
                                        {join.type} join
                                    </div>
                                    <Link2 className="w-6 h-6 text-accent/40 animate-pulse" />
                                </div>

                                <div className="text-center space-y-2 flex-1">
                                    <div className="p-3 bg-muted rounded-xl font-bold border border-border text-sm">{join.rightTable}</div>
                                    <div className="text-[10px] font-mono text-accent">{join.rightCol}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pl-8 border-l border-border ml-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-all">
                                    <Settings2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-muted rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            </div>
                        ))
                        ) : (
                        <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-muted/50">
                            <Link2 className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                            <h4 className="font-bold text-lg mb-2">Aucune relation détectée</h4>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">Nous n'avons pas pu trouver de clés communes. Ajoutez une relation manuellement pour lier vos tables.</p>
                            <button className="btn-primary px-8">Ajouter une jointure</button>
                        </div>
                        )}
                    </div>

                    {/* Joined Data Preview */}
                    <div className="space-y-4">
                         <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-accent" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Aperçu du résultat joint</h3>
                        </div>
                        <div className="prism-card overflow-hidden h-64 overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm border-b border-border">
                                    <tr>
                                        {selectedTables.map(t => (
                                            <th key={t} className="px-6 py-3 text-[9px] font-black uppercase text-accent tracking-widest bg-accent/5">
                                                {t}.*
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {[1, 2, 3].map(i => (
                                        <tr key={i} className="hover:bg-muted/5 transition-colors">
                                            {selectedTables.map(t => (
                                                <td key={t} className="px-6 py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="h-2 w-20 bg-muted rounded animate-pulse" />
                                                        <div className="h-2 w-12 bg-muted/50 rounded animate-pulse" />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 bg-accent/5 text-[10px] text-accent font-bold text-center border-t border-accent/10">
                                Simulnation du résultat SQL joint...
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="glass-panel p-6 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Aperçu du Modèle</h4>
                    <div className="space-y-3">
                        {selectedTables.map(t => (
                            <div key={t} className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                                <TableIcon className="w-4 h-4 text-accent" />
                                <span className="text-xs font-bold">{t}</span>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-4 text-center max-w-xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight">Configuration du Dataset</h2>
                    <p className="text-muted-foreground font-light">Personnalisez votre catalogue. Cachez les colonnes, créez des métriques et des champs calculés.</p>
                    
                    <div className="flex items-center justify-center gap-8 border-b border-border mt-8">
                        <button 
                            onClick={() => setActiveSubTab('cols')}
                            className={cn(
                                "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                                activeSubTab === 'cols' ? "text-accent" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Colonnes
                            {activeSubTab === 'cols' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                        </button>
                        <button 
                            onClick={() => setActiveSubTab('metrics')}
                            className={cn(
                                "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                                activeSubTab === 'metrics' ? "text-accent" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Métriques
                            {activeSubTab === 'metrics' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                        </button>
                        <button 
                            onClick={() => setActiveSubTab('calcs')}
                            className={cn(
                                "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                                activeSubTab === 'calcs' ? "text-accent" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Champs Calculés
                            {activeSubTab === 'calcs' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                        </button>
                    </div>
                </div>

                {activeSubTab === 'cols' && (
                  <div className="space-y-8">
                    <div className="prism-card overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/50 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground italic">Catalogue des colonnes</h3>
                            <div className="flex gap-4 items-center">
                                <span className="text-[10px] text-muted-foreground font-medium">{columns.length} colonnes détectées</span>
                            </div>
                        </div>
                        <div className="max-h-[400px] overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visibilité</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Table</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Champ Original</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nom d'Affichage</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {columns.map((col, i) => (
                                        <tr key={i} className={cn("hover:bg-muted/10 transition-colors", !col.visible && "opacity-50 grayscale")}>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => {
                                                        const newCols = [...columns];
                                                        newCols[i].visible = !newCols[i].visible;
                                                        setColumns(newCols);
                                                    }}
                                                    className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                        col.visible ? "text-accent bg-accent/10" : "text-muted-foreground bg-muted"
                                                    )}
                                                >
                                                    {col.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="neutral" className="font-mono text-[9px]">{col.table}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{col.originalName}</td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    value={col.displayName}
                                                    onChange={(e) => {
                                                        const newCols = [...columns];
                                                        newCols[i].displayName = e.target.value;
                                                        setColumns(newCols);
                                                    }}
                                                    className="bg-transparent border-b border-transparent hover:border-border focus:border-accent transition-all text-sm font-bold w-full py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground/60">{col.type}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {dataPreview.length > 0 && (
                        <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-accent" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Aperçu direct (5 premières lignes)</h3>
                            </div>
                            <div className="prism-card overflow-hidden">
                                <div className="max-w-full overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-muted/20 border-b border-border">
                                                {Object.keys(dataPreview[0]).map(k => (
                                                    <th key={k} className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground tracking-widest">{k}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {dataPreview.map((row, i) => (
                                                <tr key={i}>
                                                     {Object.keys(row).map(k => (
                                                        <td key={k} className="px-6 py-3 text-[10px] text-muted-foreground whitespace-nowrap">{String(row[k])}</td>
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
                )}

                {activeSubTab === 'metrics' && (
                    <div className="space-y-8 py-12 text-center bg-muted/20 rounded-3xl border border-border border-dashed">
                        <div className="max-w-md mx-auto space-y-4">
                            <Plus className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                            <h3 className="text-xl font-bold">Aucune métrique personnalisée</h3>
                            <p className="text-sm text-muted-foreground italic">Vous pourrez ajouter des expressions agrégées complexes (ex: SUM(ventes) / COUNT(distinct clients)) après la création ou dès maintenant en mode expert.</p>
                            <button className="btn-primary mt-4">Ajouter une métrique experte</button>
                        </div>
                    </div>
                )}

                {activeSubTab === 'calcs' && (
                    <div className="space-y-8 py-12 text-center bg-muted/20 rounded-3xl border border-border border-dashed">
                        <div className="max-w-md mx-auto space-y-4">
                            <Plus className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                            <h3 className="text-xl font-bold">Aucun champ calculé</h3>
                            <p className="text-sm text-muted-foreground italic">Ajoutez des colonnes virtuelles basées sur des formules SQL (ex: CASE WHEN ... THEN ... END).</p>
                            <button className="btn-primary mt-4">Créer un champ calculé</button>
                        </div>
                    </div>
                )}
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto space-y-12 py-12"
              >
                <div className="text-center space-y-4">
                   <div className="w-24 h-24 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-accent/5">
                        <CheckCircle2 className="w-12 h-12" />
                   </div>
                   <h2 className="text-4xl font-bold tracking-tight">Dernière étape</h2>
                   <p className="text-muted-foreground font-light text-lg">Donnez un nom clair à votre nouveau dataset physique pour qu'il soit facilement identifiable.</p>
                </div>

                <div className="space-y-6 glass-panel p-10">
                    <FormSection label="Nom du Dataset">
                        <FormInput 
                            value={datasetName}
                            onChange={(e) => setDatasetName(e.target.value)}
                            placeholder="Ex: Analyse Multi-tables Ventes & Produits"
                            className="text-lg py-6"
                        />
                    </FormSection>

                    <FormSection 
                        label="Clause WHERE par défaut" 
                        description="Applique un filtre permanent. Utilisez {{filter}} pour lier dynamiquement aux filtres de dashboard."
                    >
                        <textarea
                            value={defaultWhere}
                            onChange={(e) => setDefaultWhere(e.target.value)}
                            placeholder="Ex: status = 'active' AND region = {{region}}"
                            className="w-full h-24 bg-background border border-border rounded-xl p-4 text-xs font-mono focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                        />
                    </FormSection>
                    
                    <div className="pt-6 border-t border-border">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Résumé de la configuration</h4>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-lg font-bold">{selectedTables.length}</p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase">Tables</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold">{joins.length}</p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase">Relations</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold">{columns.filter(c => c.visible).length}</p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase">Colonnes</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button 
                        onClick={handleSave}
                        className="btn-primary px-12 py-4 text-base shadow-2xl shadow-accent/20 group"
                    >
                        Confirmer et Enregistrer
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Progress Footer for Mobile */}
      <div className="lg:hidden bg-background border-t border-border p-4">
         <Stepper steps={steps} currentStep={step} />
      </div>
    </div>
  );
};
