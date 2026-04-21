import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  LayoutGrid, 
  List, 
  Plus,
  Layout as LayoutIcon,
  Tag
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { 
  FormSection, 
  FormInput, 
  FormTextarea, 
  FormActions, 
  FormButton,
  FormLabel
} from '../components/FormElements';
import { getDashboards as getLocalDashboards, saveDashboard, deleteDashboard } from '../lib/db';
import { DASHBOARD_TEMPLATES, DashboardTemplate } from '../constants/templates';
import { supersetService } from '../services/supersetService';
import { isConfigured as isSupersetConfigured } from '../lib/supersetClient';
import { DashboardCard } from '../components/cards/DashboardCard';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

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
  const [step, setStep] = React.useState(1);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('blank');
  const [newDashboard, setNewDashboard] = React.useState({ title: '', description: '', tags: '' });
  const [isCreating, setIsCreating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredDashboards = dashboards.filter(d => {
    const title = d.dashboard_title || d.name || d.title || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  React.useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    if (!isSupersetConfigured) {
      try {
        const local = await getLocalDashboards();
        setDashboards(local);
      } catch (err) {
        console.error('Failed to load local dashboards:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const { result } = await supersetService.getDashboards();
      if (result.length > 0) {
        setDashboards(result);
      } else {
        const local = await getLocalDashboards();
        setDashboards(local);
      }
    } catch (err) {
      // Quiet fallback if not explicitly configured or network issues
      const local = await getLocalDashboards();
      setDashboards(local);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this dashboard? This action cannot be undone.')) return;
    
    try {
      await deleteDashboard(id);
      toast.success('Dashboard deleted successfully');
      loadDashboards();
    } catch (err) {
      console.error('Failed to delete dashboard:', err);
      toast.error('Failed to delete dashboard');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsCreating(true);
    try {
      const template = DASHBOARD_TEMPLATES.find(t => t.id === selectedTemplate);
      const dashboardId = crypto.randomUUID();
      
      await saveDashboard({
        id: dashboardId,
        name: newDashboard.title,
        description: newDashboard.description,
        layout: template?.layout || [],
        backgroundColor: '#f8fafc'
      });

      setIsModalOpen(false);
      setNewDashboard({ title: '', description: '', tags: '' });
      setStep(1);
      setSelectedTemplate('blank');
      navigate(`/dashboard-editor/${dashboardId}`);
    } catch (err) {
      console.error('Failed to create dashboard:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateModal = () => {
    setStep(1);
    setSelectedTemplate('blank');
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Horizontal Filter Bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl px-8 py-3 flex items-center gap-6 sticky top-0 z-10 shadow-sm transition-colors">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Filtres</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Statut:</span>
            <div className="flex items-center gap-1.5">
              {["Published", "Draft", "Archived"].map(status => (
                <button 
                  key={status}
                  className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-border hover:border-accent/30 hover:bg-accent/5 transition-all"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1"></div>

        <button className="text-[9px] font-black text-muted-foreground hover:text-foreground uppercase tracking-[0.2em] transition-colors">Réinitialiser</button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 lg:p-10 space-y-10 overflow-y-auto bg-muted/20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Tableaux de Bord</h2>
            <p className="text-muted-foreground text-base font-light">Organisez et partagez vos histoires de données.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="pl-11 pr-5 py-2 bg-background border border-border rounded-xl text-xs focus:ring-4 ring-accent/5 focus:border-accent w-64 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center bg-background border border-border rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setView('grid')}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  view === 'grid' ? "bg-muted text-foreground shadow-inner" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setView('list')}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  view === 'list' ? "bg-muted text-foreground shadow-inner" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
            <button 
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2 px-5 py-2 shadow-lg shadow-accent/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau
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
        ) : filteredDashboards.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-[32px] bg-muted/20">
            <div className="w-20 h-20 bg-muted rounded-[24px] flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No dashboards found</h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
              {searchQuery ? `We couldn't find any dashboards matching "${searchQuery}"` : "Create your first dashboard to organize your charts."}
            </p>
            {!searchQuery && (
              <button 
                onClick={openCreateModal}
                className="btn-primary px-8"
              >
                Get Started
              </button>
            )}
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            view === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {filteredDashboards.map((dashboard) => (
              <DashboardCard 
                key={dashboard.id} 
                dashboard={dashboard} 
                view={view} 
                onClick={() => navigate(`/dashboards/${dashboard.id}`)}
                onDelete={() => handleDelete(dashboard.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Dashboard Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={step === 1 ? "Create New Dashboard" : "Select a Template"}
      >
        <form onSubmit={handleCreate} className="space-y-8">
          {step === 1 ? (
            <div className="space-y-6">
              <FormSection label="Title">
                <FormInput 
                  value={newDashboard.title}
                  onChange={(e) => setNewDashboard({ ...newDashboard, title: e.target.value })}
                  placeholder="e.g. Q2 Revenue Analysis" 
                  required
                  autoFocus
                />
              </FormSection>
              
              <FormSection label="Description">
                <FormTextarea 
                  value={newDashboard.description}
                  onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                  placeholder="Briefly describe the purpose..." 
                  className="min-h-[100px]"
                />
              </FormSection>

              <FormSection label="Tags">
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors z-10" />
                  <FormInput 
                    value={newDashboard.tags}
                    onChange={(e) => setNewDashboard({ ...newDashboard, tags: e.target.value })}
                    placeholder="Sales, Q2, Revenue" 
                    className="pl-12"
                  />
                </div>
              </FormSection>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {DASHBOARD_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group",
                      selectedTemplate === template.id 
                        ? "bg-accent/5 border-accent shadow-sm" 
                        : "bg-background border-border hover:border-accent/40 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      selectedTemplate === template.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={cn(
                          "text-sm font-bold transition-colors",
                          selectedTemplate === template.id ? "text-accent" : "text-foreground"
                        )}>
                          {template.name}
                        </h4>
                        {selectedTemplate === template.id && (
                          <Check className="w-4 h-4 text-accent" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-balance">
                        {template.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <FormActions>
            <FormButton 
              type="button"
              variant="secondary"
              onClick={() => step === 1 ? setIsModalOpen(false) : setStep(1)}
              className="flex-1"
            >
              {step === 1 ? "Cancel" : "Back"}
            </FormButton>
            <FormButton 
              type="submit"
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                step === 1 ? "Next" : "Create Dashboard"
              )}
            </FormButton>
          </FormActions>
        </form>
      </Modal>
    </div>
  );
};
