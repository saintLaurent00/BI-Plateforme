import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  LayoutGrid, 
  List, 
  MoreVertical,
  Star,
  Tag,
  Plus,
  Layout as LayoutIcon
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { getDashboards } from '../lib/db';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DashboardCard = ({ dashboard, view }: any) => {
  const navigate = useNavigate();
  const id = dashboard.id;

  if (view === 'list') {
    return (
      <div 
        onClick={() => navigate(`/dashboards/${id}`)}
        className="glass-panel p-5 flex items-center gap-8 group cursor-pointer hover:border-accent/30 transition-all duration-500"
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100 group-hover:ring-8 group-hover:ring-accent/5 transition-all">
          <img 
            src={`https://picsum.photos/seed/${dashboard.name}/200/150`} 
            alt={dashboard.name} 
            className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base text-slate-900 tracking-tight group-hover:text-accent transition-colors">{dashboard.name}</h4>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Intelligence Asset</span>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(dashboard.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
            <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Published</Badge>
            <span className="text-[8px] text-slate-300 mt-1 font-serif italic">Verified Source</span>
          </div>
          <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => navigate(`/dashboards/${id}`)}
      className="glass-panel group cursor-pointer overflow-hidden hover:border-accent/30 transition-all duration-500"
    >
      <div className="h-44 bg-slate-50 relative overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${dashboard.name}/600/400`} 
          alt={dashboard.name} 
          className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="p-2.5 bg-white/90 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white transition-all shadow-xl"
          >
            <Star className="w-3.5 h-3.5 text-slate-400 hover:text-amber-500" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge variant="success" className="bg-emerald-500 text-white border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Published</Badge>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg text-slate-900 tracking-tight mb-1 truncate group-hover:text-accent transition-colors">{dashboard.name}</h3>
        <p className="text-[10px] text-slate-400 font-serif italic mb-6">Strategic intelligence overview</p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dashboard.name}`} alt="Owner" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Laurent O.</span>
          </div>
          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(dashboard.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

const FilterSection = ({ title, options }: any) => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</h4>
    <div className="space-y-1">
      {options.map((option: any) => (
        <label key={option.label} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer group transition-colors">
          <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
          <span className="text-xs text-muted-foreground group-hover:text-foreground flex-1">{option.label}</span>
          <span className="text-[10px] font-medium text-muted-foreground/60">{option.count}</span>
        </label>
      ))}
    </div>
  </div>
);

export const Dashboards = () => {
  const navigate = useNavigate();
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [dashboards, setDashboards] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newDashboard, setNewDashboard] = React.useState({ title: '', description: '', tags: '' });

  React.useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      const d = await getDashboards();
      setDashboards(d);
    } catch (err) {
      console.error('Failed to load dashboards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setNewDashboard({ title: '', description: '', tags: '' });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Horizontal Filter Bar */}
      <div className="border-b border-border bg-background/50 backdrop-blur-md px-8 py-4 flex items-center gap-8 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Status:</span>
            <div className="flex items-center gap-1">
              {["Published", "Draft", "Archived"].map(status => (
                <button 
                  key={status}
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-muted transition-colors"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1"></div>

        <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider">Clear All</button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 lg:p-12 space-y-10 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Dashboards</h2>
            <p className="text-muted-foreground text-sm mt-1">Organize and share your data stories.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-muted rounded-md p-1">
              <button 
                onClick={() => setView('grid')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  view === 'grid' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('list')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  view === 'list' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => navigate('/dashboard-editor')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Dashboard
            </button>
          </div>
        </div>

        {/* Grid/List View */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : dashboards.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-lg">
            <LayoutIcon className="w-12 h-12 text-muted/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No dashboards yet</h3>
            <p className="text-muted-foreground text-sm mb-8">Create your first dashboard to organize your charts.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary px-8"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            view === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {dashboards.map((dashboard) => (
              <DashboardCard key={dashboard.id} dashboard={dashboard} view={view} />
            ))}
          </div>
        )}
      </div>

      {/* Create Dashboard Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Dashboard"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Title</label>
            <input 
              type="text" 
              value={newDashboard.title}
              onChange={(e) => setNewDashboard({ ...newDashboard, title: e.target.value })}
              placeholder="e.g. Q2 Revenue Analysis" 
              className="input-minimal"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Description</label>
            <textarea 
              value={newDashboard.description}
              onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
              placeholder="Briefly describe the purpose..." 
              className="input-minimal min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Tags</label>
            <div className="relative group">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <input 
                type="text" 
                value={newDashboard.tags}
                onChange={(e) => setNewDashboard({ ...newDashboard, tags: e.target.value })}
                placeholder="Sales, Q2, Revenue" 
                className="input-minimal pl-10"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary flex-1"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
