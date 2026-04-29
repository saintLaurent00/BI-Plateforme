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
          title="Intégration Frontend Indépendant (Headless Superset)"
          description="Exigences backend et mapping des API pour connecter un frontend étranger."
          icon={Code}
        >
          <h4>1. Exigences Backend & Sécurité</h4>
          <p>Pour qu'un frontend hébergé sur un domaine différent puisse communiquer avec Superset, les configurations suivantes sont impératives :</p>
          <ul>
            <li><strong>Activation de CORS</strong> : <code>ENABLE_CORS = True</code></li>
            <li><strong>Politique de Cookies</strong> : <code>SESSION_COOKIE_SAMESITE = "None"</code></li>
            <li><strong>Gestion du Token CSRF</strong> : Récupération via <code>/api/v1/security/csrf_token/</code></li>
          </ul>

          <h4>2. Mapping API par Fonctionnalité</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Profil & Connexion</p>
              <code className="text-xs text-accent">GET /api/v1/me/</code>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Tableaux de Bord</p>
              <code className="text-xs text-accent">GET /api/v1/dashboard/</code>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Données Graphiques</p>
              <code className="text-xs text-accent">POST /api/v1/chart/data</code>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">SQL Lab</p>
              <code className="text-xs text-accent">POST /api/v1/sqllab/execute</code>
            </div>
          </div>
        </DocumentCard>

        {/* Full Architecture Dossier */}
        <DocumentCard 
          title="Dossier Complet d'Architecture"
          description="Inventaire exhaustif de l'interface et de la logique backend."
          icon={Layers}
        >
          <h4>Architecture Frontend</h4>
          <p>Toutes les routes principales sont centralisées dans <code>superset-frontend/src/views/routes.tsx</code>. Les composants clés incluent :</p>
          <ul>
            <li><strong>Dashboard</strong> : Visionneuse et éditeur de dashboard.</li>
            <li><strong>Explore</strong> : Point d'entrée principal pour créer des graphiques.</li>
            <li><strong>SqlLab</strong> : IDE SQL interactif.</li>
          </ul>

          <h4>Architecture Backend</h4>
          <p>Le backend gère les requêtes via <strong>Flask-AppBuilder (FAB)</strong> et suit le cycle suivant :</p>
          <ol>
            <li>Entrée sur un endpoint exposé.</li>
            <li>Sécurité via l'annotateur <code>@protect()</code>.</li>
            <li>Validation via <strong>Marshmallow Schemas</strong>.</li>
            <li>Exécution via le <strong>Command Pattern</strong>.</li>
            <li>Interaction ORM via <strong>SQLAlchemy</strong>.</li>
          </ol>
        </DocumentCard>

        {/* Security & Integration Report */}
        <DocumentCard 
          title="Rapport de Sécurité & Intégration"
          description="Synthèse exhaustive de l'architecture technique et stratégies Headless."
          icon={Shield}
        >
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 text-accent font-bold mb-2">
              <Info className="w-4 h-4" />
              Résumé Exécutif
            </div>
            <p className="text-sm italic">
              "Apache Superset est une plateforme de data visualisation robuste construite sur un backend Python (Flask/Gunicorn) et un frontend React/TypeScript. Son architecture est résolument modulaire et extensible."
            </p>
          </div>

          <h4>Stratégies Headless</h4>
          <p>Pour brancher votre propre frontend sur le moteur de Superset :</p>
          <ul>
            <li><strong>Authentification Guest</strong> : Utilisation de tokens JWT pour l'intégration sécurisée.</li>
            <li><strong>Consommation de Données</strong> : Appel direct à <code>POST /api/v1/chart/data</code>.</li>
            <li><strong>Rendu</strong> : Utilisation de composants tiers (D3.js, Chart.js) pour une intégration visuelle parfaite.</li>
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
