import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  Database, 
  Check,
  PieChart,
  BarChart,
  LineChart,
  Activity,
  TrendingUp,
  Hash,
  Layers,
  Layout as LayoutIcon,
  Minus,
  ChevronDown,
  GitBranch
} from 'lucide-react';
import { getTables, getTableSchema } from '../lib/db';
import { Badge } from '../components/Badge';
import { supersetService } from '../services/supersetService';
import { Dataset } from '../types';

import { Stepper } from '../components/Stepper';

const CHART_CATEGORIES = [
  { name: 'Tous les graphiques', icon: Layers },
  { name: 'Evolution', icon: TrendingUp },
  { name: 'Distribution', icon: BarChart },
  { name: 'Correlation', icon: Activity },
  { name: 'Part of a Whole', icon: PieChart },
  { name: 'Ranking', icon: BarChart },
  { name: 'Flow', icon: Activity },
  { name: 'KPIs', icon: Hash },
  { name: 'Carte', icon: LayoutIcon },
  { name: 'Tables', icon: LayoutIcon },
  { name: 'Branch', icon: GitBranch },
  { name: 'Web', icon: Activity },
];

const CHART_TYPES = [
  // --- EVOLUTION ---
  { label: 'Graphique Linéaire', type: 'Line', icon: LineChart, category: 'Evolution', description: 'Idéal pour visualiser les tendances et l\'évolution des données sur une période donnée.' },
  { label: 'Graphique de Surface', type: 'Area', icon: TrendingUp, category: 'Evolution', description: 'Met en évidence l\'ampleur du changement au fil du temps.' },
  { label: 'Surface Empilée', type: 'StackedArea', icon: TrendingUp, category: 'Evolution', description: 'Illustre comment les composants contribuent au total global dans le temps.' },
  { label: 'Streamgraph', type: 'Streamgraph', icon: TrendingUp, category: 'Evolution', description: 'Type de graphique de surface empilé organique pour les évolutions.' },
  { label: 'Graphique en Spirale', type: 'Line', icon: Activity, category: 'Evolution', description: 'Idéal pour visualiser des données cycliques et temporelles.' },
  { label: 'Ligne de Temps (Timeline)', type: 'Timeline', icon: TrendingUp, category: 'Evolution', description: 'Visualise des événements ou des jalons sur une échelle de temps linéaire.' },
  { label: 'Graphique en Chandeliers', type: 'Candlestick', icon: Activity, category: 'Evolution', description: 'Idéal pour l\'analyse boursière (OHLC).' },

  // --- DISTRIBUTION ---
  { label: 'Histogramme', type: 'Bar', icon: BarChart, category: 'Distribution', description: 'Analyse la distribution de fréquence d\'une variable continue.' },
  { label: 'Boîte à Moustaches', type: 'BoxPlot', icon: BarChart, category: 'Distribution', description: 'Visualise la distribution et les valeurs aberrantes (outliers) d\'un dataset.' },
  { label: 'Nuage de Mots', type: 'WordCloud', icon: Layers, category: 'Distribution', description: 'Visualise la fréquence des termes textuels par leur taille.' },
  { label: 'Diagramme de Venn', type: 'Pie', icon: PieChart, category: 'Distribution', description: 'Montre les relations logiques et les intersections entre différents ensembles.' },
  
  // --- CORRELATION ---
  { label: 'Diagramme de Dispersion', type: 'Scatter', icon: Activity, category: 'Correlation', description: 'Affiche la relation entre deux variables numériques.' },
  { label: 'Graphique à Bulles', type: 'Bubble', icon: Activity, category: 'Correlation', description: 'Extension du nuage de points où la taille de la bulle représente une 3ème variable.' },
  { label: 'Carte Thermique', type: 'Heatmap', icon: LayoutIcon, category: 'Correlation', description: 'Représentation matricielle utilisant des dégradés de couleurs pour les valeurs.' },

  // --- PART OF A WHOLE ---
  { label: 'Diagramme Circulaire', type: 'Pie', icon: PieChart, category: 'Part of a Whole', description: 'Représentation classique des proportions par secteur.' },
  { label: 'Graphique Beignet', type: 'Donut', icon: PieChart, category: 'Part of a Whole', description: 'Une variante du camembert avec un centre vide, souvent utilisé pour les KPI.' },
  { label: 'Carte Treemap', type: 'Treemap', icon: LayoutIcon, category: 'Part of a Whole', description: 'Visualise des structures hiérarchiques avec des rectangles imbriqués.' },
  { label: 'Paquet de Cercles', type: 'CirclePacking', icon: PieChart, category: 'Part of a Whole', description: 'Affiche des structures hiérarchiques sous forme de cercles imbriqués élégants.' },
  { label: 'Diagramme Sunburst', type: 'Sunburst', icon: PieChart, category: 'Part of a Whole', description: 'Graphique radial multi-niveaux pour naviguer dans des hiérarchies de données complexes.' },
  { label: 'Barres Empilées', type: 'StackedBar', icon: BarChart, category: 'Part of a Whole', description: 'Montre la relation entre les parties et le tout pour chaque catégorie.' },

  // --- RANKING ---
  { label: 'Diagramme à Barres', type: 'Bar', icon: BarChart, category: 'Ranking', description: 'Compare des valeurs entre différentes catégories de manière claire et directe.' },
  { label: 'Lollipop Chart', type: 'Lollipop', icon: Activity, category: 'Ranking', description: 'Variante élégante du diagramme à barres avec des lignes et des points.' },

  // --- FLOW ---
  { label: 'Diagramme en Entonnoir', type: 'Funnel', icon: Activity, category: 'Flow', description: 'Visualise les étapes de conversion d\'un processus linéaire.' },
  { label: 'Schéma Sankey', type: 'Sankey', icon: Activity, category: 'Flow', description: 'Visualise les flux et les volumes de transfert entre plusieurs états.' },
  { label: 'Diagramme en Cascade', type: 'Waterfall', icon: BarChart, category: 'Flow', description: 'Montre l\'effet cumulatif de valeurs positives et négatives.' },

  // --- KPIS ---
  { label: 'Big Number', type: 'Bar', icon: Hash, category: 'KPIs', description: 'Affiche une métrique clé de manière très visible.' },
  { label: 'Tableau à Puces', type: 'Bullet', icon: BarChart, category: 'KPIs', description: 'Visualisation ultra-compacte pour comparer une mesure à une cible et des seuils.' },
  { label: 'KPI Dashboard Card', type: 'Bar', icon: Hash, category: 'KPIs', description: 'Micro-visualisation pour indicateurs de performance.' },

  // --- CARTE ---
  { label: 'Carte Choroplèthe', type: 'Bar', icon: LayoutIcon, category: 'Carte', description: 'Colore les régions géographiques selon une échelle statistique.' },
  { label: 'Carte de Symboles', type: 'Bubble', icon: LayoutIcon, category: 'Carte', description: 'Place des icônes ou cercles proportionnels sur une carte géographique.' },

  // --- TABLES ---
  { label: 'Tableau Croisé Dynamique', type: 'Table', icon: LayoutIcon, category: 'Tables', description: 'Synthétise de grands volumes de données selon plusieurs axes.' },
  { label: 'Vue Grille Détaillée', type: 'Table', icon: LayoutIcon, category: 'Tables', description: 'Tableau de données standard avec options de filtrage avancées.' },
  { label: 'Pivot Table Tree', type: 'Table', icon: LayoutIcon, category: 'Tables', description: 'Tableau croisé avec structure hiérarchique extensible.' },
  
  // --- BRANCH ---
  { label: 'Dendrogramme', type: 'Dendrogram', icon: GitBranch, category: 'Branch', description: 'Visualise les relations de regroupement hiérarchique entre objets.' },
  { label: 'Diagramme en Arborescence', type: 'Tree', icon: GitBranch, category: 'Branch', description: 'Représentation classique des structures hiérarchiques parent-enfant.' },
  { label: 'Arbre Radial', type: 'RadialTree', icon: GitBranch, category: 'Branch', description: 'Disposition circulaire d\'une arborescence pour optimiser l\'espace.' },
  { label: 'Graphe de Réseau', type: 'Network', icon: Activity, category: 'Branch', description: 'Visualise des connexions complexes entre des entités (nœuds et liens).' },

  // --- WEB ---
  { label: 'Carte Radar', type: 'Radar', icon: Activity, category: 'Web', description: 'Compare plusieurs variables quantitatives sur plusieurs axes.' },
  { label: 'Diagramme de Cordes', type: 'Chord', icon: Activity, category: 'Web', description: 'Visualise les relations d\'interdépendance complexes dans une matrice.' },
];

const CHART_SEEDS: Record<string, string> = {
  'Graphique Linéaire': 'line-graph,data-viz',
  'Diagramme à Barres': 'bar-chart,statistics',
  'Barres Empilées': 'stacked-bar,analytics',
  'Tableau à Colonnes': 'column-chart,data',
  'Diagramme Circulaire': 'pie-chart,business',
  'Graphique Beignet': 'donut-chart,report',
  'Graphique de Surface': 'area-chart,infographic',
  'Surface Empilée': 'stacked-area,stats',
  'Histogramme': 'histogram,distribution',
  'Big Number': 'dashboard-metric,kpi',
  'Diagramme de Dispersion': 'scatter-plot,science',
  'Boîte à Moustaches': 'box-plot,statistics',
  'Graphique à Deux Axes': 'dual-axis,chart',
  'Graphique à Bulles': 'bubble-chart,viz',
  'Diagramme en Entonnoir': 'funnel-chart,sales',
  'Carte Thermique': 'heatmap,data-grid',
  'Diagramme de Gantt': 'gantt-chart,timeline',
  'Carte Radar': 'radar-chart,performance',
  'Diagramme en Cascade': 'waterfall-chart,finance',
  'Carte Treemap': 'treemap,hierarchy',
  'Tableau Marimekko': 'marimekko,market',
  'Tableau à Puces': 'bullet-graph,kpi',
  'Graphique en Chandeliers': 'candlestick-chart,trading',
  'Schéma Sankey': 'sankey-diagram,flows',
  'Diagramme Pyramidal': 'pyramid-chart,population',
  'Paquet de Cercles': 'circle-packing,data',
  'Diagramme Sunburst': 'sunburst-chart,radial',
  'Diagramme de Venn': 'venn-diagram,logic',
  'Diagramme de Cordes': 'chord-diagram,network',
  'Coordonnées Parallèles': 'parallel-coordinates',
  'Diagramme en Arc': 'arc-diagram,links',
  'Streamgraph': 'streamgraph,trends',
  'Carte Choroplèthe': 'choropleth-map,geo',
  'Carte de Symboles': 'bubble-map,location',
  'Carte de Densité': 'density-map,heatmap',
  'Cartogramme': 'cartogram,world',
  'Plan d\'Étage': 'floor-plan,blueprint',
  'Visuel Parlementaire': 'parliament-chart,politics',
  'Graphique en Spirale': 'spiral-chart,time',
  'Barres Radiales': 'radial-bar,circles',
  'Tableau P&L Visuel': 'profit-loss,finance',
  'KPI Dashboard Card': 'kpi-dashboard,metric',
  'Calendrier Thermique': 'calendar-heatmap,activity',
  'Tableau Croisé Dynamique': 'pivot-table,excel',
  'Matrice d\'Adjacence': 'adjacency-matrix,graph',
  'Vue Grille Détaillée': 'data-table,grid',
  'Scorecard': 'scorecard,tracking',
  'Micro-graphiques (Sparklines)': 'sparklines,trends',
  'Pivot Table Tree': 'hierarchical-table,pivot',
  'Dendrogramme': 'dendrogram,hierarchy',
  'Diagramme en Arborescence': 'tree-diagram,structure',
  'Arbre Radial': 'radial-tree,circular',
  'Ligne de Temps (Timeline)': 'timeline,events',
  'Nuage de Mots': 'wordcloud,tags',
  'Graphe de Réseau': 'network-graph,nodes',
};

const getChartImageUrl = (label: string, width: number, height: number, suffix: string = '') => {
  const seed = CHART_SEEDS[label] || label;
  // Utilisation de tags très restrictifs pour garantir des graphiques réels
  const tags = `data-visualization,chart,graph,dashboard,${seed.split(',')[0]}`;
  return `https://loremflickr.com/${width}/${height}/${tags}${suffix}?lock=${label.length}`;
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

export const ChartSelector = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = React.useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = React.useState<any | null>(null);
  const [selectedType, setSelectedType] = React.useState<string>('');
  const [schema, setSchema] = React.useState<any[]>([]);
  const [selectedX, setSelectedX] = React.useState<string>('');
  const [selectedY, setSelectedY] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('All');
  const [step, setStep] = React.useState(1);

  const steps = [
    { id: 1, label: 'Source' },
    { id: 2, label: 'Visualisation' },
    { id: 3, label: 'Finalisation' }
  ];

  React.useEffect(() => {
    loadData();
    setCategory('Tous les graphiques');
  }, []);

  const loadData = async () => {
    try {
      const [localTables, supersetResponse] = await Promise.all([
        getTables(),
        supersetService.getDatasets().catch(() => ({ result: [] }))
      ]);
      
      const localDs = localTables.map(t => ({
        id: t,
        name: t,
        type: 'Physical',
        kind: 'physical',
        source: 'local'
      }));

      const remoteDs = supersetResponse.result.map((ds: any) => ({
        id: ds.id,
        name: ds.table_name || ds.name,
        type: ds.kind === 'physical' ? 'Physical' : 'Virtual',
        kind: ds.kind,
        source: 'superset'
      }));

      setDatasets([...localDs, ...remoteDs]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedDataset) setStep(2);
    else if (step === 2 && selectedType) {
      if (selectedDataset.source === 'local') {
        getTableSchema(selectedDataset.id).then(setSchema);
      } else {
        // Mock schema for remote datasets for now or fetch it if needed
        setSchema([
          { name: 'date', type: 'TIMESTAMP' },
          { name: 'sales', type: 'FLOAT' },
          { name: 'quantity', type: 'INT' },
          { name: 'category', type: 'VARCHAR' }
        ]);
      }
      setStep(3);
    }
    else if (step === 3) handleCreate();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/charts');
  };

  const filteredTypes = React.useMemo(() => {
    return CHART_TYPES.filter(t => 
      (category === 'Tous les graphiques' || t.category === category) &&
      (t.label.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, category]);

  const selectedChartInfo = React.useMemo(() => {
    return CHART_TYPES.find(t => t.label === selectedType);
  }, [selectedType]);

  const handleCreate = () => {
    const selectedChart = CHART_TYPES.find(t => t.label === selectedType);
    if (!selectedDataset || !selectedChart) return;
    
    let url = `/chart-editor?dataset=${encodeURIComponent(selectedDataset.name)}&datasetId=${selectedDataset.id}&type=${selectedChart.type}&label=${selectedChart.label}&source=${selectedDataset.source}`;
    if (selectedX) url += `&xAxis=${selectedX}`;
    if (selectedY.length > 0) url += `&yAxis=${selectedY.join(',')}`;
    
    navigate(url);
  };

  return (
    <div className="min-h-full bg-background flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground">Nouveau graphique</h1>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Étape {step} sur 3</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Stepper steps={steps} currentStep={step} className="w-96 hidden md:block" />
          <button 
            onClick={handleNext}
            disabled={(step === 1 && !selectedDataset) || (step === 2 && !selectedType)}
            className="btn-primary px-6 py-2 shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
          >
            {step === 3 ? 'Générer le graphique' : 'Étape suivante'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {step === 1 && (
          <div className="flex-1 flex items-center justify-center p-12 bg-muted/10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl w-full bg-background border border-border shadow-2xl rounded-[32px] p-10 space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Choisissez votre source</h2>
                <p className="text-sm text-muted-foreground">Sélectionnez le dataset que vous souhaitez analyser.</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Datasets disponibles</label>
                <div className="grid grid-cols-1 gap-2">
                  {datasets.map(ds => (
                    <button
                      key={ds.id}
                      onClick={() => {
                        setSelectedDataset(ds);
                        setTimeout(() => handleNext(), 300);
                      }}
                      className={cn(
                        "w-full px-6 py-4 rounded-2xl border-2 flex items-center justify-between transition-all group",
                        selectedDataset?.id === ds.id ? "border-accent bg-accent/5 ring-4 ring-accent/10" : "border-border hover:border-accent/40"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          selectedDataset?.id === ds.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                        )}>
                          {ds.type === 'Physical' ? <Database className="w-5 h-5" /> : <GitBranch className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">{ds.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{ds.type} • {ds.source}</p>
                        </div>
                      </div>
                      {selectedDataset?.id === ds.id && <Check className="w-5 h-5 text-accent" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar: Categories */}
            <aside className="w-64 bg-background border-r border-border flex flex-col shrink-0">
              <div className="p-6 border-b border-border">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Source active</h2>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                  <Database className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold truncate">{selectedDataset?.name}</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4 mt-2">Catégories</h2>
                {CHART_CATEGORIES.map(cat => (
                  <button 
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                      category === cat.name ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Content: Grid & Details */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
              <div className="p-6 border-b border-border flex items-center justify-between gap-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Rechercher un graphique..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-muted border border-border rounded-xl text-xs outline-none focus:border-accent transition-all text-foreground"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredTypes.map((type) => (
                    <button
                      key={type.label}
                      onClick={() => setSelectedType(type.label)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 group relative",
                        selectedType === type.label 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/20' 
                          : 'border-border bg-background hover:border-accent/40 hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        "w-full aspect-video rounded-xl flex items-center justify-center transition-all overflow-hidden border border-border bg-slate-50",
                        selectedType === type.label ? 'bg-background shadow-none' : 'bg-muted/30'
                      )}>
                        <img 
                          src={getChartImageUrl(type.label, 400, 225)} 
                          alt={type.label}
                          className="w-full h-full object-cover grayscale-[0.3] contrast-[1.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-[11px] tracking-tight">{type.label}</h4>
                      </div>
                      {selectedType === type.label && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex items-center justify-center p-12 bg-muted/10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl w-full bg-background border border-border shadow-2xl rounded-[32px] overflow-hidden flex flex-col md:flex-row min-h-[600px]"
            >
              <div className="w-full md:w-80 bg-muted/30 p-10 border-r border-border flex flex-col">
                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      {selectedChartInfo && <selectedChartInfo.icon className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedChartInfo?.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Étape finale de configuration</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Database className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Source</span>
                      </div>
                      <div className="p-3 bg-background border border-border rounded-xl text-sm font-bold truncate">
                        {selectedDataset?.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LayoutIcon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Type de rendu</span>
                      </div>
                      <div className="p-3 bg-background border border-border rounded-xl text-sm font-bold truncate">
                        D3.js Visualization
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                   <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                     L'éditeur avancé permettra de personnaliser les couleurs et les styles une fois le graphique généré.
                   </p>
                </div>
              </div>

              <div className="flex-1 p-10 space-y-10 overflow-y-auto max-h-[80vh]">
                <div className="space-y-12">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-foreground">Configuration des Axes</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">Associez les colonnes de votre dataset aux axes du graphique.</p>
                  </div>

                  <div className="space-y-12">
                    {/* X Axis */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Activity className="w-4 h-4 text-accent" />
                          Axe Horizontal (Dimension / Temps)
                        </label>
                        {selectedX && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Sélectionné</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {schema.map(col => (
                          <button
                            key={col.name}
                            onClick={() => setSelectedX(col.name)}
                            className={cn(
                              "px-5 py-3 rounded-2xl text-xs font-bold border-2 transition-all flex items-center gap-3",
                              selectedX === col.name 
                                ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20 ring-4 ring-accent/10" 
                                : "bg-muted border-transparent text-muted-foreground hover:border-accent/40"
                            )}
                          >
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              selectedX === col.name ? "bg-white" : "bg-muted-foreground"
                            )} />
                            {col.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Y Axis */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-accent" />
                          Métriques (Valeurs numériques)
                        </label>
                        <Badge variant="outline" className="text-xs">{selectedY.length} métrique{selectedY.length > 1 ? 's' : ''}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {schema.filter(col => col.type.includes('INT') || col.type.includes('NUM') || col.type.includes('FLO')).map(col => (
                          <button
                            key={col.name}
                            onClick={() => {
                              if (selectedY.includes(col.name)) {
                                setSelectedY(selectedY.filter(y => y !== col.name));
                              } else {
                                setSelectedY([...selectedY, col.name]);
                              }
                            }}
                            className={cn(
                              "px-5 py-3 rounded-2xl text-xs font-bold border-2 transition-all flex items-center gap-3",
                              selectedY.includes(col.name)
                                ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20 ring-4 ring-accent/10" 
                                : "bg-muted border-transparent text-muted-foreground hover:border-accent/40"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                              selectedY.includes(col.name) ? "bg-white border-white" : "border-muted-foreground"
                            )}>
                              {selectedY.includes(col.name) && <Check className="w-3 h-3 text-accent" />}
                            </div>
                            {col.name}
                          </button>
                        ))}
                      </div>
                      {selectedY.length === 0 && (
                        <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wider">Veuillez sélectionner au moins une valeur numérique.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-10 border-t border-border flex justify-end gap-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="px-8 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Retour
                    </button>
                    <button 
                      onClick={handleCreate}
                      disabled={!selectedX || selectedY.length === 0}
                      className="btn-primary px-12 py-3 rounded-2xl shadow-xl shadow-accent/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                    >
                      Finaliser le graphique
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
