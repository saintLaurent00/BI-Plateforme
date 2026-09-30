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
          l'intégration frontend et les protocoles de sécurité avancés.
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
          title="Architecture Hifadih BI (Mode Souverain)"
          description="Exigences techniques et protocoles de communication pour l'infrastructure Hifadih."
          icon={Code}
        >
          <h4>1. Infrastructure & Sécurité</h4>
          <p>Hifadih BI repose sur une architecture moderne conçue pour la performance et la sécurité des données d'entreprise :</p>
          <ul>
            <li><strong>Moteur de Données</strong> : Intégration native des bases SQL et NoSQL via des adaptateurs haute performance.</li>
            <li><strong>Protocole de Sécurité</strong> : Authentification multi-facteurs (MFA) et Row Level Security (RLS) granulaire.</li>
            <li><strong>Communication</strong> : API RESTful sécurisée pour une intégration fluide avec les systèmes existants.</li>
          </ul>

          <h4>2. Endpoints Stratégiques</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Profil & Identité</p>
              <code className="text-xs text-accent">GET /api/v1/auth/me</code>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Tableaux de Bord</p>
              <code className="text-xs text-accent">GET /api/v1/hifadih/dashboards</code>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Intelligence Analytique</p>
              <code className="text-xs text-accent">POST /api/v1/hifadih/analyze</code>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Moteur SQL</p>
              <code className="text-xs text-accent">POST /api/v1/hifadih/query</code>
            </div>
          </div>
        </DocumentCard>

        {/* Full Architecture Dossier */}
        <DocumentCard 
          title="Dossier Complet d'Architecture"
          description="Inventaire exhaustif de l'interface et de la logique métier de Hifadih."
          icon={Layers}
        >
          <h4>Frontend Core</h4>
          <p>L'interface est construite avec React et Tailwind CSS, favorisant une UX fluide et réactive.</p>
          <ul>
            <li><strong>Dashboard Center</strong> : Visionneuse intelligente et personnalisable de données.</li>
            <li><strong>Chart Factory</strong> : Moteur de génération de graphiques piloté par l'IA.</li>
            <li><strong>SQL IDE</strong> : Environnement de développement SQL intégré pour l'extraction de données.</li>
          </ul>

          <h4>Services de Données</h4>
          <p>Le cœur logicielle de Hifadih gère les flux via un service unifié (hifadihService) :</p>
          <ol>
            <li>Collecte des métadonnées des sources connectées.</li>
            <li>Cache intelligent pour des performances optimales.</li>
            <li>Moteur de recommandation IA pour les meilleures visualisations.</li>
            <li>Génération de rapports automatiques et alertes.</li>
          </ol>
        </DocumentCard>

        {/* Security & Integration Report */}
        <DocumentCard 
          title="Sécurité & Intégration Stratégique"
          description="Synthèse exhaustive des protocoles de protection des données Hifadih."
          icon={Shield}
        >
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 text-accent font-bold mb-2">
              <Info className="w-4 h-4" />
              Vision Sécuritaire
            </div>
            <p className="text-sm italic">
              "Hifadih BI place la souveraineté de vos données au cœur de son architecture. Chaque flux est crypté, chaque accès est audité, garantissant une intégrité totale de votre intelligence d'entreprise."
            </p>
          </div>

          <h4>Gouvernance des Données</h4>
          <p>Protocoles de protection et de mise à disposition des informations :</p>
          <ul>
            <li><strong>Protection RLS</strong> : Isolation stricte des données selon le profil utilisateur.</li>
            <li><strong>Audits Immunitaires</strong> : Screening temps réel de l'état de santé du système.</li>
            <li><strong>Connecteurs Certifiés</strong> : Protocoles standardisés pour l'échange de données sécurisé.</li>
          </ul>
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
