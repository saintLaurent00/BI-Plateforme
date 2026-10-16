# Architecture de référence — BI-Plateforme

## Décision

BI-Plateforme adopte l'organisation du dépôt Apache Superset comme référence structurelle pour le frontend et le backend. Il s'agit d'une adaptation des frontières de modules et des conventions de dossiers, pas d'une copie de code source.

Référence analysée : https://github.com/apache/superset

## Règles

1. Organiser le code par capacités produit reconnues par les utilisateurs BI : dashboards, charts, datasets, databases, explore, SQL Lab, security, reports.
2. Garder les plugins de visualisation indépendants de l'application principale.
3. Séparer modèles, API, logique d'exécution, composants UI et infrastructure.
4. Préserver les comportements existants pendant chaque déplacement, notamment le redimensionnement continu au pixel près de l'éditeur de dashboard.
5. Toute migration de chemin doit inclure la mise à jour des imports, des alias, des tests et de la configuration TypeScript.
6. Le backend conserve les mêmes frontières fonctionnelles mais utilise des modules Rust idiomatiques, pas des fichiers Python renommés.

## Arborescence cible

```text
BI-Plateforme/
├── frontend/
│   ├── src/
│   │   ├── SqlLab/              # SQL Lab, requêtes et résultats
│   │   ├── assets/              # Ressources statiques et médias
│   │   ├── chartCustomizations/  # Personnalisation des charts
│   │   ├── components/           # Composants applicatifs partagés
│   │   ├── core/                 # Types et contrats transversaux
│   │   ├── dashboard/            # Liste, détail, grille et éditeur
│   │   ├── database/             # Connexions et moteurs de données
│   │   ├── explore/              # Chart builder et exploration visuelle
│   │   ├── features/             # Capacités produit transversales
│   │   ├── filters/              # Filtres et data mask
│   │   ├── hooks/                # Hooks React génériques
│   │   ├── pages/                # Routes et compositions de pages
│   │   ├── setup/                # Initialisation et enregistrement
│   │   ├── types/                # Types publics de l'application
│   │   ├── utils/                # Utilitaires génériques
│   │   └── visualizations/        # Contrats/adaptateurs de visualisation
│   ├── plugins/
│   │   └── plugin-chart-*/        # Un package par famille de graphiques
│   └── packages/                  # Packages frontend réutilisables
├── backend/
│   └── src/
│       ├── api/                   # Routes HTTP et schémas d'API
│       ├── cache/                 # Cache et invalidation
│       ├── charts/                # Modèles et cas d'usage des charts
│       ├── commands/              # Commandes applicatives/CLI
│       ├── connectors/             # Connecteurs de sources de données
│       ├── dashboards/            # Dashboards et layouts
│       ├── databases/             # Connexions et métadonnées DB
│       ├── datasets/              # Catalogue et métadonnées de datasets
│       ├── db_engine_specs/        # Capacités spécifiques aux moteurs SQL
│       ├── errors/                # Erreurs typées
│       ├── explore/               # Orchestration de l'exploration
│       ├── models/                # Modèles persistés
│       ├── queries/               # Cycle de vie des requêtes
│       ├── reports/               # Exports et rapports
│       ├── security/              # Authentification, permissions, RLS
│       ├── sqllab/                # Exécution SQL interactive
│       ├── tasks/                 # Travaux asynchrones
│       └── views/                 # Présentation HTTP / handlers
└── docs/
    └── architecture/
```

## Correspondance avec Superset

| Apache Superset | BI-Plateforme |
|---|---|
| `superset-frontend/src/SqlLab` | `frontend/src/SqlLab` |
| `superset-frontend/src/dashboard` | `frontend/src/dashboard` |
| `superset-frontend/src/database` | `frontend/src/database` |
| `superset-frontend/src/explore` | `frontend/src/explore` |
| `superset-frontend/src/features` | `frontend/src/features` |
| `superset-frontend/src/visualizations` | `frontend/src/visualizations` |
| `superset-frontend/plugins/plugin-chart-*` | `frontend/plugins/plugin-chart-*` |
| `superset/charts` | `backend/src/charts` |
| `superset/dashboards` | `backend/src/dashboards` |
| `superset/datasets` | `backend/src/datasets` |
| `superset/databases` | `backend/src/databases` |
| `superset/db_engine_specs` | `backend/src/db_engine_specs` |
| `superset/explore` | `backend/src/explore` |
| `superset/queries` | `backend/src/queries` |
| `superset/reports` | `backend/src/reports` |
| `superset/security` | `backend/src/security` |
| `superset/sqllab` | `backend/src/sqllab` |

## Stratégie de migration

La migration est progressive et doit rester compilable à chaque étape :

1. Créer les points d'entrée et modules cibles avec des exports/adaptateurs temporaires.
2. Déplacer une capacité à la fois et mettre à jour les imports.
3. Corriger la configuration des plugins et les tests après chaque lot.
4. Exécuter TypeScript, build frontend et tests Rust avant de poursuivre.
5. Supprimer les anciens chemins seulement après avoir vérifié qu'aucun import ni comportement ne les utilise.

L'arborescence cible n'est considérée comme appliquée qu'après migration du code réel ; la présence de dossiers vides n'est pas une preuve de conformité.
