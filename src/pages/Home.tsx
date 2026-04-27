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
import { DashboardCard } from '../components/cards/DashboardCard';
import { Badge } from '../components/Badge';
import { supersetService } from '../services/supersetService';
import { isConfigured as isSupersetConfigured } from '../lib/supersetClient';
import { getDashboards as getLocalDashboards } from '../lib/db';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, trend, icon: Icon }: any) => (
  <div className="glass-panel p-6 flex flex-col gap-4 group hover:border-accent/30 transition-all duration-300">
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

  React.useEffect(() => {
    const loadDashboards = async () => {
      if (!isSupersetConfigured) {
        try {
          const local = await getLocalDashboards();
          setDashboards(local.slice(0, 4));
        } catch (lerr) {}
        setIsLoading(false);
        return;
      }

      try {
        const { result } = await supersetService.getDashboards();
        if (result && result.length > 0) {
          setDashboards(result.slice(0, 4));
        } else {
          const local = await getLocalDashboards();
          setDashboards(local.slice(0, 4));
        }
      } catch (err) {
        try {
          const local = await getLocalDashboards();
          setDashboards(local.slice(0, 4));
        } catch (lerr) {}
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboards();
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

      {/* Kwaku AI Briefing */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="prism-card p-8 bg-accent/5 border-accent/20 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-accent/20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="shrink-0">
             <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-xl shadow-accent/20 border border-accent-foreground/10">
                <Sparkles className="w-8 h-8 text-white" />
             </div>
          </div>
          <div className="space-y-4 flex-1">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Intelligence Assistant</span>
                <Badge variant="success" className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">Kwaku Active</Badge>
             </div>
             <h2 className="text-2xl font-bold tracking-tight italic">"Bonjour Laurent, votre infrastructure est à 99.9% de santé opérationnelle. J'ai détecté une optimisation possible sur le pool de connexion PostgreSQL."</h2>
             <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border/50">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   <span className="text-xs font-bold text-muted-foreground italic">Sécurité: Optimale</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border/50">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   <span className="text-xs font-bold text-muted-foreground italic">Performance: +12% vs hier</span>
                </div>
                <button onClick={() => navigate('/admin?section=sources')} className="flex items-center gap-2 text-xs font-black text-accent uppercase tracking-widest hover:translate-x-1 transition-all ml-auto">
                   Voir l'infrastructure
                   <ArrowUpRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Active Users" value="1,284" trend="+4.2%" icon={Users} />
        <StatCard label="Total Queries" value="48.2k" trend="+12.5%" icon={Activity} />
        <StatCard label="Data Health" value="98.4%" trend="+0.2%" icon={TrendingUp} />
        <StatCard label="Dashboards" value="246" trend="+8.1%" icon={LayoutDashboard} />
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
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Activité Récente</h3>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            <ActivityItem user="Sarah Chen" action="updated" target="Sales Dashboard" time="12m ago" />
            <ActivityItem user="Mike Ross" action="created" target="Churn Rate Chart" time="45m ago" />
            <ActivityItem user="Alex Kim" action="commented on" target="Executive Overview" time="2h ago" />
            <ActivityItem user="System" action="refreshed" target="Global Revenue" time="3h ago" />
            <ActivityItem user="Laurent O." action="shared" target="Marketing KPIs" time="5h ago" />
          </div>
        </div>
      </div>
    </div>
  );
};
