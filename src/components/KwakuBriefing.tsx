import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, ArrowUpRight, Zap } from 'lucide-react';
import { kwakuService } from '../services/kwakuService';

interface KwakuBriefingProps {
  dashboardName: string;
}

export const KwakuBriefing = ({ dashboardName }: KwakuBriefingProps) => {
  const [briefing, setBriefing] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Artificial brief for dashboard context
    const briefs = [
      `Bienvenue sur ${dashboardName}. J'analyse vos KPIs en temps réel. La tendance semble positive.`,
      `Kwaku ici. Le dashboard ${dashboardName} est prêt. J'ai remarqué une anomalie légère dans les données d'hier.`,
      `Analyse stratégique de ${dashboardName} en cours. Focus sur la conversion ce matin.`
    ];
    setBriefing(briefs[Math.floor(Math.random() * briefs.length)]);
  }, [dashboardName]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-accent/10 border border-accent/20 rounded-[32px] p-8 mt-6 mb-10 overflow-hidden relative group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-24 h-24 text-accent" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-8">
        <div className="w-16 h-16 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shadow-2xl shadow-accent/20 shrink-0">
          <Zap className="w-8 h-8" />
        </div>
        
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-accent">
            <Brain className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Briefing Stratégique de Kwaku</span>
          </div>
          
          <h2 className="text-3xl font-black text-foreground tracking-tight leading-tight">
            Analyse de "{dashboardName}"
          </h2>
          
          <p className="text-muted-foreground text-lg font-light leading-relaxed">
            {briefing} <span className="text-accent font-medium italic">Voulez-vous que je génère un rapport complet pour l'équipe ?</span>
          </p>
          
          <div className="flex items-center gap-4 pt-2">
            <button className="px-6 py-2 bg-foreground text-background rounded-full text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2">
              Action Recommandée
              <ArrowUpRight className="w-3 h-3" />
            </button>
            <button className="px-6 py-2 border border-border text-xs font-medium rounded-full hover:bg-muted transition-all">
              Ignorer
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
