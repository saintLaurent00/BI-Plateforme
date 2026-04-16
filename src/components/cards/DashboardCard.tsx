import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical,
  Star,
  Layout as LayoutIcon,
  Tag,
  Edit2,
  Eye,
  Trash2
} from 'lucide-react';
import { Badge } from '../Badge';
import { MiniDashboard } from './MiniDashboard';
import { cn } from '../../lib/utils';

interface DashboardCardProps {
  dashboard: any;
  view?: 'grid' | 'list';
  onClick?: () => void;
  onDelete?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard, view = 'grid', onClick, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);
  const title = dashboard.dashboard_title || dashboard.name || dashboard.title;
  const owner = dashboard.owner || (dashboard.owners?.[0] ? `${dashboard.owners[0].first_name} ${dashboard.owners[0].last_name}` : 'Unknown');
  const date = dashboard.changed_on_delta_humanized || (dashboard.created_at ? new Date(dashboard.created_at).toLocaleDateString() : 'Recently');

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard-editor/${dashboard.id}`);
  };

  if (view === 'list') {
    return (
      <div 
        onClick={onClick}
        className="glass-panel p-5 flex items-center gap-8 group cursor-pointer hover:border-accent/30 transition-all duration-500"
      >
        <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border group-hover:ring-8 group-hover:ring-accent/5 transition-all">
          <MiniDashboard />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base text-foreground tracking-tight group-hover:text-accent transition-colors">{title}</h4>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">Intelligence Asset</span>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{date}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <Badge variant={dashboard.published ? "success" : "neutral"} className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
              {dashboard.published ? 'Published' : 'Draft'}
            </Badge>
            <span className="text-[8px] text-muted-foreground/60 mt-1 font-serif italic">Verified Source</span>
          </div>
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={handleEdit}
              className="p-2.5 text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
              title="Edit Dashboard"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(); }}
                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="glass-panel group cursor-pointer overflow-hidden hover:border-accent/30 transition-all duration-500"
    >
      <div className="h-44 bg-muted/30 relative overflow-hidden">
        <MiniDashboard />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <button 
            onClick={handleEdit}
            className="p-2.5 bg-background/90 backdrop-blur-xl rounded-xl border border-border/20 hover:bg-accent hover:text-white transition-all shadow-xl"
            title="Edit Dashboard"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="p-2.5 bg-background/90 backdrop-blur-xl rounded-xl border border-border/20 hover:bg-background transition-all shadow-xl"
          >
            <Star className="w-3.5 h-3.5 text-muted-foreground hover:text-amber-500" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Badge variant={dashboard.published ? "success" : "neutral"} className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
            {dashboard.published ? 'Published' : 'Draft'}
          </Badge>
          <div className="p-1.5 bg-white/80 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-3 h-3 text-accent" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="font-bold text-lg text-foreground tracking-tight truncate group-hover:text-accent transition-colors">{title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Tag className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">Enterprise, Strategic</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all shrink-0">
            <LayoutIcon className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${owner}`} alt={owner} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-foreground font-bold uppercase tracking-widest">{owner}</p>
              <p className="text-[8px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">{date}</p>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(); }}
                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
