import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Star, 
  ArrowUpRight, 
  ChevronRight,
  MoreHorizontal,
  Zap,
  Activity,
  Users,
  LayoutDashboard,
  Plus
} from 'lucide-react';
import { DashboardCard } from '@/ui/components/cards/base/DashboardCard';
import { Badge } from '@/ui/components/Badge';
import { dashboardService } from '@/features/dashboards/application/DashboardService';
import { visualizationService } from '@/features/charts/application/VisualizationService';
import { dataCatalogService } from '@/features/datasets/application/DataCatalogService';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, trend, icon: Icon }: any) => (
  <div className="hifadih-glass p-6 flex flex-col gap-4 group hover:border-accent/30 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
        <Icon className="w-4 h-4" />
      </div>
      <Badge variant="info" className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest">
        {trend}
      </Badge>
    </div>
    <div>
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
      <h3 className="text-2xl font-semibold tracking-tight text-foreground">{value}</h3>
    </div>
  </div>
);

const ActivityItem = ({ user, action, target, time }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all group cursor-pointer border border-transparent hover:border-border">
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border shadow-sm transition-all">
      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} alt={user} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">
        <strong className="text-foreground font-bold">{user}</strong> <span className="opacity-60">{action}</span> <strong className="text-foreground font-bold">{target}</strong>
      </p>
      <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">{time}</p>
    </div>
    <div className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
      <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors" />
    </div>
  </div>
);

export const Home = () => {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ dashboards: 0, charts: 0, datasets: 0, databases: 0 });
  const [loadError, setLoadError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    const loadOverview = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const [dashboardRows, chartRows, datasetRows, databaseRows] = await Promise.all([
          dashboardService.list(),
          visualizationService.listCharts(),
          dataCatalogService.listDatasets(),
          dataCatalogService.listDatabases(),
        ]);
        if (!active) return;
        setDashboards(dashboardRows.slice(0, 4));
        setStats({
          dashboards: dashboardRows.length,
          charts: chartRows.length,
          datasets: datasetRows.length,
          databases: databaseRows.length,
        });
      } catch (err) {
        if (!active) return;
        setDashboards([]);
        setLoadError(err instanceof Error ? err.message : 'Impossible de charger les données Superset.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadOverview();
    return () => { active = false; };
  }, []);

  return (
    <div className="p-6 lg:p-12 space-y-12">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="max-w-4xl space-y-6">
          <h1 className="text-5xl font-semibold tracking-tight leading-[1.1] text-foreground">
            Bienvenue, Laurent. <br />
            <span className="text-muted-foreground/60">Voici un aperçu de vos données aujourd'hui.</span>
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed font-light max-w-2xl">
            Explorez vos tableaux de bord favoris et analysez vos derniers indicateurs de performance.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <button onClick={() => navigate('/dashboards')} className="btn-primary px-8 py-2.5">Mes Tableaux de Bord</button>
            <button onClick={() => navigate('/charts')} className="btn-secondary px-8 py-2.5">Explorer les Graphiques</button>
          </div>
        </div>
      </motion.div>

      {loadError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{loadError}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Datasets" value={isLoading ? "…" : stats.datasets.toLocaleString()} trend="Superset" icon={Users} />
        <StatCard label="Graphiques" value={isLoading ? "…" : stats.charts.toLocaleString()} trend="Superset" icon={Activity} />
        <StatCard label="Bases de données" value={isLoading ? "…" : stats.databases.toLocaleString()} trend="Superset" icon={TrendingUp} />
        <StatCard label="Dashboards" value={isLoading ? "…" : stats.dashboards.toLocaleString()} trend="Superset" icon={LayoutDashboard} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Dashboards */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tableaux de Bord Favoris</h3>
            <button 
              onClick={() => navigate('/dashboards')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-all flex items-center gap-2 group"
            >
              Voir Tout
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
              ))
            ) : dashboards.length > 0 ? (
              dashboards.map((dashboard) => (
                <DashboardCard 
                  key={dashboard.id} 
                  dashboard={dashboard} 
                  onClick={() => navigate(`/dashboards/${dashboard.id}`)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">No dashboards found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">État du catalogue</h3>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3 rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-semibold">Connexion à Apache Superset</p>
            <p className="text-xs leading-relaxed text-muted-foreground">Les indicateurs et tableaux de bord de cette page proviennent de l’API de l’instance configurée. Les activités utilisateur ne sont pas simulées.</p>
            <button onClick={() => navigate('/datasets')} className="text-xs font-semibold text-accent hover:underline">Ouvrir le catalogue de données</button>
          </div>        </div>
      </div>
    </div>
  );
};
