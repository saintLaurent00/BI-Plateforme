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
import { supersetService } from '../services/supersetService';
import { getDashboards as getLocalDashboards } from '../lib/db';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, trend, icon: Icon }: any) => (
  <div className="minimal-card p-6 flex flex-col gap-4 group">
    <div className="flex items-center justify-between">
      <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        {trend}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-semibold tracking-tight">{value}</h3>
    </div>
  </div>
);

const ActivityItem = ({ user, action, target, time }: any) => (
  <div className="flex items-center gap-4 p-3 rounded-md hover:bg-muted transition-colors group cursor-pointer">
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} alt={user} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs">
        <span className="font-medium">{user}</span> <span className="text-muted-foreground">{action}</span> <span className="font-medium">{target}</span>
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
    </div>
    <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
  </div>
);

export const Home = () => {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboards = async () => {
      try {
        const { result } = await supersetService.getDashboards();
        if (result && result.length > 0) {
          setDashboards(result.slice(0, 4));
        } else {
          const local = await getLocalDashboards();
          setDashboards(local.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load dashboards:', err);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <button
          onClick={() => navigate('/chart-builder')}
          className="p-12 bg-indigo-600 text-white rounded-[48px] text-left group hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Sparkles size={120} />
          </div>
          <Sparkles className="mb-6 text-indigo-200" size={40} />
          <h2 className="text-3xl font-bold mb-2">BI Builder</h2>
          <p className="text-indigo-100 text-lg opacity-80">Créez des analyses complexes en quelques clics via un flux guidé par l'IA.</p>
          <div className="mt-8 flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
            Commencer <ChevronRight size={16} />
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard-builder')}
          className="p-12 bg-slate-900 text-white rounded-[48px] text-left group hover:bg-black transition-all shadow-2xl shadow-slate-900/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <LayoutDashboard size={120} />
          </div>
          <LayoutDashboard className="mb-6 text-slate-400" size={40} />
          <h2 className="text-3xl font-bold mb-2">Dashboard Builder</h2>
          <p className="text-slate-400 text-lg">Assemblez vos briques d'intelligence sur un canvas dynamique et interactif.</p>
          <div className="mt-8 flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
            Construire <ChevronRight size={16} />
          </div>
        </button>
      </motion.div>

      {/* AI Briefing */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Kwaku's Briefing</span>
        </div>
        
        <div className="max-w-4xl space-y-6">
          <h1 className="text-5xl font-semibold tracking-tight leading-[1.1] text-foreground">
            Good morning, Laurent. <br />
            <span className="text-muted-foreground/60">Your sales are up 12% this week.</span>
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed font-light max-w-2xl">
            The team is highly engaged with the <span className="text-foreground font-medium">Q1 Revenue</span> dashboard. 
            Consider refreshing the <span className="text-foreground font-medium">Customer Churn</span> dataset.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <button className="btn-primary px-8 py-2.5">Analyze Trends</button>
            <button className="btn-secondary px-8 py-2.5">View Insights</button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Dashboards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Favorites</h3>
            <button className="text-xs font-medium hover:underline flex items-center gap-1 group">
              View All
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activity</h3>
            <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
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
