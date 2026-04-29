import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  FileText, 
  Code, 
  Shield, 
  Layers, 
  Zap, 
  ChevronRight,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const DocumentCard = ({ title, description, icon: Icon, children }: { title: string, description: string, icon: any, children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
    <div className="p-6 border-b border-border bg-muted/30">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
      {children}
    </div>
  </div>
);

export const Documentation = () => {
  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-16 bg-background min-h-full">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em]">
          <BookOpen className="w-4 h-4" />
          Base de Connaissances
        </div>
        <h1 className="text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
          Documentation <br />
          <span className="text-muted-foreground font-light">Technique & Stratégique</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl font-light leading-relaxed">
          Tout ce que vous devez savoir sur l'architecture de Hifadih BI, 
          l'analyse locale et les protocoles de sécurité.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* UX Flow Section */}
        <DocumentCard 
          title="Flux UX Complet & Clair"
          description="Parcours utilisateur type et navigation au sein de la plateforme."
          icon={Zap}
        >
          <div className="space-y-8">
            <div className="relative pl-8 border-l-2 border-accent/20 space-y-8">
              <div className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background" />
                <h5 className="font-bold text-foreground">1. Authentification & Accueil</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  L'utilisateur se connecte et arrive sur le tableau de bord **Home**,
                  qui présente une vue d'ensemble des statistiques et des activités récentes de la plateforme.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background" />
                <h5 className="font-bold text-foreground">2. Exploration des Données</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Navigation vers **Dashboards** pour une vue d'ensemble ou **Charts** pour des analyses spécifiques. 
                  L'utilisateur peut filtrer et interagir avec les visualisations en temps réel.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background" />
                <h5 className="font-bold text-foreground">3. Analyse Avancée (SQL Lab)</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Pour des besoins spécifiques, l'analyste utilise le **SQL Lab** pour exécuter des requêtes complexes 
                  directement sur les sources de données connectées.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background" />
                <h5 className="font-bold text-foreground">4. Administration & Gouvernance</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Les administrateurs gèrent les accès via la section **Admin**, configurent les politiques de sécurité (RLS) 
                  et surveillent l'intégrité des données dans le **Screening Dashboard**.
                </p>
              </div>
            </div>
          </div>
        </DocumentCard>

        {/* Technical Specification */}
        <DocumentCard 
          title="Architecture Locale & SQL.js"
          description="Détails sur l'implémentation du moteur de données local."
          icon={Code}
        >
          <h4>1. Moteur de Base de Données</h4>
          <p>Hifadih BI utilise une architecture orientée client pour garantir la rapidité et la confidentialité des données :</p>
          <ul>
            <li><strong>SQL.js</strong> : Moteur SQLite compilé en WebAssembly pour les calculs.</li>
            <li><strong>IndexedDB</strong> : Persistance locale des bases de données et métadonnées.</li>
            <li><strong>Worker Pattern</strong> : Exécution des requêtes SQL sur un thread séparé.</li>
          </ul>

          <h4>2. Gestion des Sources</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Importation</p>
              <span className="text-xs text-accent">Support des fichiers CSV & SQL</span>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Persistance</p>
              <span className="text-xs text-accent">Sauvegarde automatique dans le navigateur</span>
            </div>
          </div>
        </DocumentCard>

        {/* Full Architecture Dossier */}
        <DocumentCard 
          title="Composants du Système"
          description="Inventaire exhaustif de l'interface et de la logique métier."
          icon={Layers}
        >
          <h4>Architecture Frontend</h4>
          <p>L'application est construite avec React et suit une structure modulaire :</p>
          <ul>
            <li><strong>Dashboard Engine</strong> : Gestionnaire de layout flexible pour organiser les analyses.</li>
            <li><strong>Chart Editor</strong> : Interface visuelle pour transformer les colonnes SQL en graphiques D3.js.</li>
            <li><strong>SQL Lab</strong> : IDE interactif pour l'exploration de données brute.</li>
          </ul>
        </DocumentCard>

        {/* Security & Integration Report */}
        <DocumentCard 
          title="Sécurité & Confidentialité"
          description="Politique de gestion des données au sein de Hifadih BI."
          icon={Shield}
        >
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 text-accent font-bold mb-2">
              <Info className="w-4 h-4" />
              Résumé de Sécurité
            </div>
            <p className="text-sm italic">
              "Toutes les analyses et données traitées par Hifadih BI restent exclusivement dans l'environnement local de l'utilisateur. Aucune donnée brute n'est transmise à nos serveurs."
            </p>
          </div>
        </DocumentCard>
      </div>

      <footer className="pt-12 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 Hifadih BI • Documentation technique confidentielle
        </p>
      </footer>
    </div>
  );
};
