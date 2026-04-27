import React from 'react';
import { motion } from 'motion/react';
import { Database, ArrowUpRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const DatasetWizard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-muted/20 p-6 lg:p-10 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-12">
        <div className="space-y-4 text-center">
          <button 
            onClick={() => navigate('/datasets')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors mx-auto"
          >
            <ChevronLeft className="w-3 h-3" />
            Retour aux datasets
          </button>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">Nouveau Dataset</h2>
          <p className="text-muted-foreground text-lg font-light">Structurez vos données de manière intelligente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.button 
            whileHover={{ y: -5 }}
            onClick={() => navigate('/datasets/new/physical')}
            className="group relative glass-panel p-10 text-left space-y-8 overflow-hidden hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500">
              <Database className="w-8 h-8" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">Dataset Physique</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Importez une ou plusieurs tables existantes depuis votre base de données. 
                Configurez les relations entre tables manuellement ou automatiquement.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent opacity-0 group-hover:opacity-100 transition-all duration-500">
              Commencer le wizard <ArrowUpRight className="w-4 h-4" />
            </div>

            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Database className="w-48 h-48" />
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ y: -5 }}
            onClick={() => navigate('/sql-lab?mode=create_dataset')}
            className="group relative glass-panel p-10 text-left space-y-8 overflow-hidden hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500">
              <ArrowUpRight className="w-8 h-8" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">Dataset Virtuel</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Utilisez la puissance du SQL pour créer un dataset sur mesure à partir de requêtes personnalisées. 
                Jointures complexes, agrégations et CTE.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent opacity-0 group-hover:opacity-100 transition-all duration-500">
              Ouvrir le SQL Lab <ArrowUpRight className="w-4 h-4" />
            </div>

            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <ArrowUpRight className="w-48 h-48" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
