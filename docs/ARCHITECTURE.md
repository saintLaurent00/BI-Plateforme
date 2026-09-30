
# Architecture complète — Hifadih BI

> **Document de référence de l'architecture actuelle du dépôt.**
>
> Ce document décrit ce qui existe réellement dans BI-Plateforme au **30 septembre 2026**, puis sépare clairement la trajectoire backend Rust de l'implémentation actuelle.

---

# 1. Vue d'ensemble

Hifadih BI est actuellement une **application web BI principalement exécutée côté navigateur**.

Son architecture actuelle repose sur :

- **React 19** pour l'interface ;
- **TypeScript** pour le code applicatif ;
- **Vite** pour le build et le serveur de développement ;
- **React Router** pour le routing ;
- **Tailwind CSS** pour le système de styles ;
- **ECharts / Recharts / D3** pour les visualisations ;
- un système de **plugins de graphiques** ;
- **localStorage** pour une partie de la persistance applicative ;
- **SQL.js + IndexedDB** pour une base SQLite exécutée dans le navigateur ;
- **Docker Compose** pour PostgreSQL, Valkey et MailDev en environnement local.

Le dépôt contient également un ancien fichier Go nommé 'platform_config.go', mais **aucun serveur Go n'est actuellement présent ni lancé par les scripts du frontend**.

---

# 2. Architecture runtime actuelle

~~~text
┌───────────────────────────────────────────────────────────────────────┐
│                           NAVIGATEUR                                  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    React Application                            │  │
│  │                                                                 │  │
│  │  App / Router                                                   │  │
│  │      │                                                          │  │
│  │      ├── Layout                                                 │  │
│  │      │    ├── Sidebar                                           │  │
│  │      │    ├── Topbar                                            │  │
│  │      │    ├── Theme                                             │  │
│  │      │                                                          │  │
│  │      ├── Pages                                                  │  │
│  │      ├── Features                                               │  │
│  │      ├── Components                                             │  │
│  │      └── Core                                                   │  │
│  │                                                                 │  │
│  └───────────────────────────┬─────────────────────────────────────┘  │
│                              │                                        │
│             ┌────────────────┼─────────────────┐                      │
│             │                │                 │                      │
│             ▼                ▼                                      │
│       localStorage      SQL.js / SQLite                             │
│             │                │                 │                      │
│             │                ▼                 │                      │
│             │            IndexedDB            │                      │
│             │                                  │                      │
│             └──────────────────────────────────┘                      │
└───────────────────────────────────────────────────────────────────────┘

                 Infrastructure Docker locale
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│    PostgreSQL 15   │  │       Valkey       │  │      MailDev       │
│      :5432         │  │       :6379        │  │ :1025 / :1080      │
└────────────────────┘  └────────────────────┘  └────────────────────┘

NOTE:
Les conteneurs existent dans infrastructure/docker/docker-compose.yml, mais le frontend actuel
n'utilise pas encore PostgreSQL/Valkey/MailDev comme backend applicatif.
~~~

---

# 3. Architecture en couches

~~~text
┌──────────────────────────────────────┐
│  1. Presentation                     │
│  pages + components + UI             │
├──────────────────────────────────────┤
│  2. Features                         │
│  data-sources + visualization-editor │
├──────────────────────────────────────┤
│  3. Application Services             │
│  hifadihService + PDF                 │
├──────────────────────────────────────┤
│  4. Domain / Contracts               │
│  DTOs + types                        │
├──────────────────────────────────────┤
│  5. Browser Persistence              │
│  localStorage + SQL.js + IndexedDB  │
├──────────────────────────────────────┤
│  6. External Infrastructure          │
│  Docker services                      │
└──────────────────────────────────────┘
~~~

## 3.1 Presentation

Responsable de l'expérience utilisateur :

- pages ;
- navigation ;
- formulaires ;
- tableaux ;
- cartes ;
- modales ;
- graphiques ;
- éditeurs ;
- dashboard UI.

Répertoires :

~~~text
src/pages/
src/components/
~~~

## 3.2 Features

Responsable des fonctionnalités métier complexes :

~~~text
src/features/
├── data-sources/
└── visualization-editor/
~~~

## 3.3 Services applicatifs

~~~text
src/lib/
├── hifadihService.ts
└── pdfExport.ts
~~~

### hifadihService

C'est actuellement la principale façade de données.

Il gère notamment :

- dashboards ;
- charts ;
- datasets ;
- datasources ;
- users ;
- roles ;
- groups ;
- reports ;
- audit logs ;
- SSO de démonstration ;
- exécution SQL de démonstration.

La persistance de nombreuses opérations passe actuellement par 'localStorage'.

**Important :** malgré son nom, 'hifadihService' n'est pas encore un véritable client API HTTP vers un backend Rust.

## 3.4 Domain / Contracts

~~~text
src/core/types/
├── user.dto.ts
├── role.dto.ts
├── group.dto.ts
├── datasource.dto.ts
├── dataset.dto.ts
├── dashboard.dto.ts
└── audit.dto.ts
~~~

Les DTOs constituent le contrat de données utilisé par le frontend.

Les principaux agrégats sont :

~~~text
User
Role
Group
DataSource
Dataset
Chart
Dashboard
AuditLog
RLS Policy
Report
QueryResult
~~~

## 3.5 Persistence navigateur

Deux mécanismes distincts sont présents.

### localStorage

Utilisé notamment par 'hifadihService' :

~~~text
hifadih_dashboards
hifadih_charts
hifadih_datasets
hifadih_databases
hifadih_users
hifadih_roles
hifadih_groups
hifadih_reports
hifadih_logs
theme
~~~

### SQL.js + IndexedDB

'src/core/utils/db.ts' instancie SQLite dans le navigateur avec SQL.js et sauvegarde les bytes SQLite dans IndexedDB.

Le stockage local comprend notamment :

~~~text
charts
dashboards
saved_queries
roles
permissions
data_sources
~~~

ainsi que plusieurs tables de démonstration métier.

---

# 4. Point d'entrée et bootstrap

~~~text
index.html
    ↓
src/main.tsx
    ↓
src/index.css
    ↓
src/App.tsx
    ↓
React Router
~~~

'App.tsx' est le routeur applicatif principal.

Avant authentification, l'utilisateur est redirigé vers :

~~~text
/login
~~~

Après authentification de démonstration, 'Layout' enveloppe les routes principales.

---

# 5. Routing actuel

| Route | Fonction |
|---|---|
| / | Home |
| /login | Login |
| /dashboards | Liste des dashboards |
| /dashboards/:id | Détail d'un dashboard |
| /dashboard-editor | Création/édition dashboard |
| /dashboard-editor/:id | Édition dashboard |
| /charts | Catalogue des charts |
| /chart/add | Sélection d'un type de chart |
| /chart-editor | Création chart |
| /chart-editor/:id | Édition chart |
| /sql-lab | SQL Lab |
| /datasets | Exploration datasets |
| /datasets/new | Création dataset |
| /datasets/new/physical | Création physical dataset |
| /datasets/:id | Détail dataset |
| /datasets/edit/:id | Édition dataset |
| /admin | Administration |
| /documentation | Documentation |

---

# 6. Shell applicatif

Le composant :

~~~text
src/components/layout/Layout.tsx
~~~

constitue le shell global.

~~~text
Layout
├── Sidebar
│   ├── Home
│   ├── Dashboards
│   ├── Charts
│   ├── SQL Lab
│   ├── Datasets
│   └── Documentation
│
├── Administration
│   ├── Users
│   ├── Groups
│   ├── Roles
│   ├── RLS Policies
│   ├── Sessions
│   ├── Governance & Screening
│   ├── Authentication
│   ├── Screening Dashboard
│   ├── Data Sources
│   ├── Security
│   ├── Alerts & Reports
│   └── Settings
│
├── Topbar
│   ├── Search
│   ├── Theme
│   ├── Notifications
│   └── User / Logout
│
└── AIChat
~~~

Le thème est stocké dans 'localStorage'.

---

# 7. Module Dashboards

~~~text
src/pages/DashboardList/
├── Dashboards.tsx
└── DashboardDetail.tsx

src/pages/DashboardEditor/
├── DashboardEditor.tsx
├── EditorDragContext.tsx
├── EditorItemNode.tsx
├── GridOverlay.tsx
├── LayoutConfigPanel.tsx
├── MoveLayoutModal.tsx
├── collisionUtils.ts
├── treeUtils.ts
└── types.ts
~~~

## Responsabilités

- listing ;
- consultation ;
- création ;
- édition ;
- layout ;
- drag & drop ;
- déplacement ;
- collision ;
- configuration ;
- affichage de charts ;
- briefing IA ;
- insights IA.

## Modèle

Un dashboard possède notamment :

~~~text
id
title/name
owners
published/status
tags
description
department
section
region
zone
category
refresh_interval
layout
metadata
backgroundColor
created_at
updated_at
~~~

---

# 8. Module Visualisation

## 8.1 Chart Editor

~~~text
src/features/visualization-editor/
├── ChartEditor.tsx
└── ChartSelector.tsx
~~~

Le selector choisit le type de visualisation.

L'editor configure notamment :

- datasource ;
- dataset ;
- dimensions ;
- mesures ;
- axes ;
- paramètres ;
- configuration graphique.

## 8.2 Composants graphiques

~~~text
src/components/charts/
├── D3Chart.tsx
├── EChartsChart.tsx
└── PivotTable.tsx
~~~

---

# 9. Architecture des plugins de graphiques

Les plugins sont isolés sous :

~~~text
plugins/
~~~

Plugins présents :

~~~text
plugin-chart-bar
plugin-chart-boxplot
plugin-chart-funnel
plugin-chart-heatmap
plugin-chart-line
plugin-chart-pie
plugin-chart-radar
plugin-chart-sankey
plugin-chart-scatter
plugin-chart-sunburst
plugin-chart-treemap
plugin-chart-waterfall
~~~

Les plugins les plus complets suivent une structure proche de :

~~~text
plugin-chart-X/
├── src/
│   ├── XChart.tsx
│   ├── buildQuery.ts
│   ├── controlPanel.tsx
│   ├── transformProps.ts
│   ├── types.ts
│   └── index.ts
├── test/
├── types/
└── tsconfig.json
~~~

## Pipeline plugin

~~~text
Dataset / Query configuration
            ↓
       buildQuery
            ↓
       Query model
            ↓
      Result dataset
            ↓
     transformProps
            ↓
       XChart.tsx
            ↓
      Browser rendering
~~~

Certains plugins possèdent également :

- 'controlPanel.tsx' ;
- 'Styles.tsx' ;
- 'consts.ts' ;
- tests ;
- stories.

'plugins/index.ts' constitue le point d'entrée du système de plugins.

---

# 10. Module Datasets

~~~text
src/pages/Datasets/
├── DatasetsExplorer.tsx
└── Datasets.tsx

src/features/data-sources/
├── DatasetWizard.tsx
├── PhysicalDatasetWizard.tsx
└── PhysicalDatasetEdit.tsx
~~~

## Dataset

Le modèle distingue notamment :

~~~text
physical
virtual
~~~

Un dataset peut contenir :

~~~text
id
table_name
name
schema
sql
database
columns
metrics
description
owner
tags
data_category
sensitivity_level
row_count
size_mb
cache_timeout
metadata
~~~

## DatasetColumn

~~~text
name
type
displayName
description
isCalculated
expression
isFiltered
isGroupable
isTemporal
isPrimaryKey
metadata
~~~

## DatasetMetric

~~~text
name
expression
displayName
description
metric_type
format
metadata
~~~

---

# 11. Import CSV

Le frontend possède un parcours d'import CSV.

~~~text
CSV file
   ↓
File input
   ↓
PapaParse
   ↓
Parsing
   ↓
Validation / transformation
   ↓
Dataset local
   ↓
SQL.js / application state
   ↓
Visualization
~~~

Le traitement est actuellement effectué côté navigateur.

---

# 12. SQL Lab

~~~text
src/pages/SqlLab/SqlLab.tsx
~~~

SQL Lab permet l'exploration SQL dans l'application.

Dans l'architecture actuelle, l'exécution est encore liée aux mécanismes locaux/de démonstration.

La façade :

~~~text
hifadihService.executeSql()
~~~

retourne actuellement un résultat de démonstration plutôt qu'une exécution distante complète.

---

# 13. Administration

~~~text
src/pages/Admin/Admin.tsx
~~~

Le module couvre conceptuellement :

~~~text
Identity
├── Users
├── Groups
├── Roles
├── Sessions
└── Authentication

Governance
├── RLS Policies
├── Audit
├── Screening
└── Security

Data
├── Data Sources
└── Reports

System
└── Settings
~~~

Les DTOs correspondants existent déjà côté frontend.

---

# 14. IAM et autorisation — état actuel

Les types du projet modélisent :

~~~text
User
Role
Group
Permission
Session
RLS Policy
Audit Log
~~~

Permissions prévues :

~~~text
ALL
READ
WRITE
DELETE
EXECUTE_SQL
MANAGE_USERS
MANAGE_ROLES
MANAGE_DATASOURCES
EXPORT_DATA
MANAGE_DASHBOARDS
~~~

Scopes de rôles :

~~~text
Global
Regional
Sectional
Departmental
~~~

**Mais l'autorité de sécurité n'est pas encore backend.**

Le login actuel dans 'App.tsx' utilise un simple état React :

~~~text
isAuthenticated = true / false
~~~

Le SSO dans 'hifadihService' est également une implémentation de démonstration.

---

# 15. Row-Level Security

Le modèle frontend prévoit :

~~~text
RowLevelSecurityDTO
├── table_name
├── policy_name
├── clause
├── status
├── group_ids
├── role_ids
├── department
├── section
└── region
~~~

Intention fonctionnelle :

~~~text
User
 ↓
Group / Role
 ↓
RLS Policy
 ↓
Allowed rows
 ↓
Dataset / Query
~~~

L'application actuelle ne possède toutefois pas encore de moteur backend qui impose réellement ces politiques sur une base distante.

---

# 17. Export PDF

~~~text
src/lib/pdfExport.ts
~~~

Technologies :

~~~text
html2canvas
jsPDF
~~~

Pipeline :

~~~text
Dashboard DOM
     ↓
html2canvas
     ↓
Canvas
     ↓
jsPDF
     ↓
PDF
~~~

L'export est actuellement principalement côté navigateur.

---

# 18. Design System / UI

Composants réutilisables :

~~~text
src/components/ui/
├── Badge.tsx
├── DataTable.tsx
├── FormElements.tsx
├── Modal.tsx
├── Skeleton.tsx
└── Stepper.tsx
~~~

Cartes :

~~~text
src/components/ui/cards/
├── ChartCard.tsx
├── DashboardCard.tsx
├── MiniChart.tsx
└── MiniDashboard.tsx
~~~

Il existe également :

~~~text
src/components/cards/
~~~

avec des composants de cartes similaires.

Cette duplication devra être rationalisée progressivement afin d'avoir une source unique pour les composants partagés.

---

# 19. Core utilities

~~~text
src/core/utils/
├── dashboardLayout.ts
├── db.ts
└── utils.ts
~~~

### dashboardLayout.ts

Gestion des opérations liées au layout des dashboards.

### db.ts

Couche SQLite navigateur :

~~~text
SQL.js
   ↓
SQLite in-memory
   ↓
Uint8Array
   ↓
IndexedDB
~~~

### utils.ts

Utilitaires transverses, notamment classes CSS et helpers.

---

# 20. Flux de données principaux

## Dashboard

~~~text
User
 ↓
Dashboards page
 ↓
hifadihService.getDashboards()
 ↓
localStorage
 ↓
DashboardDTO[]
 ↓
DashboardCard / DataTable
 ↓
DashboardDetail
~~~

## Création dashboard

~~~text
DashboardEditor
 ↓
CreateDashboardDTO
 ↓
hifadihService.createDashboard()
 ↓
localStorage
 ↓
DashboardDTO
 ↓
UI refresh
~~~

## Dataset

~~~text
Dataset Explorer
 ↓
hifadihService
 ↓
localStorage / SQL.js
 ↓
DatasetDTO
 ↓
Dataset UI
~~~

## CSV

~~~text
CSV
 ↓
PapaParse
 ↓
records
 ↓
SQL.js / Dataset
 ↓
Chart
~~~

## Chart

~~~text
Dataset
 ↓
Chart configuration
 ↓
Plugin
 ↓
buildQuery / transformProps
 ↓
Chart component
 ↓
ECharts / D3 / custom renderer
~~~

---

# 21. Modèle de données conceptuel

~~~text
                     ┌─────────────┐
                     │    User     │
                     └──────┬──────┘
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
             ┌────────┐           ┌────────┐
             │  Role  │           │ Group  │
             └────┬───┘           └───┬────┘
                  │                   │
                  └─────────┬─────────┘
                            ▼
                       Permissions
                            │
                            ▼
                     RLS Policies
                            │
                            ▼
┌──────────────┐      ┌──────────────┐
│  DataSource  │─────▶│    Dataset   │
└──────────────┘      └──────┬───────┘
                             │
                  ┌──────────┴──────────┐
                  ▼                     ▼
              Dimensions            Metrics
                  │                     │
                  └──────────┬──────────┘
                             ▼
                           Chart
                             │
                             ▼
                         Dashboard
~~~

---

# 22. Infrastructure Docker actuelle

Le fichier 'infrastructure/docker/docker-compose.yml' définit trois services.

## PostgreSQL

~~~text
postgres:15-alpine
port: 5432
volume: pg_data
~~~

Rôle prévu :

- persistance ;
- IAM ;
- métadonnées ;
- configuration BI.

## Valkey

~~~text
valkey/valkey:latest
port: 6379
volume: valkey_data
~~~

Rôle prévu :

- cache ;
- queue ;
- coordination.

## MailDev

~~~text
maildev/maildev
SMTP: 1025
UI: 1080
~~~

Rôle :

- développement ;
- tests d'envoi d'emails.

Réseau :

~~~text
bi-network
~~~

---

# 23. Configuration frontend

'.env.example' contient notamment :

~~~env
VITE_HIFADIH_API_URL=https://api.hifadih.ai
VITE_HIFADIH_ENV=production
~~~

'vite.config.ts' gère :

- React plugin ;
- Tailwind plugin ;
- alias '@' ;
- variables d'environnement ;
- HMR ;
- serveur Vite.

---

# 24. Monorepo frontend + plugins

Le projet utilise les workspaces npm :

~~~text
plugins/plugin-chart-*
~~~

Architecture :

~~~text
BI-Plateforme
│
├── Application
│   └── src/
│
└── Plugin ecosystem
    └── plugins/
        ├── plugin-chart-bar
        ├── plugin-chart-line
        ├── plugin-chart-pie
        ├── ...
        └── plugin-chart-waterfall
~~~

---

# 25. Arborescence logique complète

~~~text
BI-Plateforme/
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   │
│   ├── components/
│   │   ├── cards/
│   │   ├── charts/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── constants/
│   │   └── templates.ts
│   │
│   ├── core/
│   │   ├── types/
│   │   │   ├── user.dto.ts
│   │   │   ├── role.dto.ts
│   │   │   ├── group.dto.ts
│   │   │   ├── datasource.dto.ts
│   │   │   ├── dataset.dto.ts
│   │   │   ├── dashboard.dto.ts
│   │   │   └── audit.dto.ts
│   │   └── utils/
│   │       ├── db.ts
│   │       ├── dashboardLayout.ts
│   │       └── utils.ts
│   │
│   ├── features/
│   │   ├── data-sources/
│   │   └── visualization-editor/
│   │
│   ├── lib/
│   │   ├── hifadihService.ts
│   │   │   └── pdfExport.ts
│   │
│   └── pages/
│       ├── Admin/
│       ├── Charts/
│       ├── DashboardEditor/
│       ├── DashboardList/
│       ├── Datasets/
│       ├── Documentation/
│       ├── Home/
│       ├── Login/
│       └── SqlLab/
│
├── plugins/
│   ├── index.ts
│   ├── types.ts
│   └── plugin-chart-*/
│
├── docs/
├── infrastructure/docker/docker-compose.yml
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── metadata.json
├── .env.example
└── platform_config.go
~~~

---

# 26. Fichier Go actuel

Le dépôt contient :

~~~text
platform_config.go
~~~

Il définit une configuration Go avec :

~~~text
DATABASE_URL
REDIS_URL
JWT_SECRET
MAIL_PROVIDER
MAIL_FROM
MAIL_PORT
~~~

Cependant :

- aucun 'go.mod' n'est présent ;
- aucun serveur HTTP Go n'est présent ;
- aucun script npm ne lance Go ;
- aucun module backend Go n'apparaît dans l'arborescence actuelle.

Il doit donc être considéré comme **legacy / artefact de l'ancienne architecture**, et non comme un composant runtime actuel.

À terme, cette configuration devra disparaître au profit du backend Rust.

---

# 27. Dépendances et responsabilités

| Couche | Technologie | Responsabilité |
|---|---|---|
| UI | React | interface |
| Language | TypeScript | logique applicative |
| Build | Vite | build/dev server |
| Routing | React Router | navigation |
| Styling | Tailwind CSS | styles |
| Charts | ECharts | visualisation |
| Charts | Recharts | visualisation |
| Charts | D3 | visualisation avancée |
| Motion | Motion / Anime.js | animations |
| DnD | React DnD / hello-pangea | interaction dashboard |
| Local SQL | SQL.js | SQLite navigateur |
| Local persistence | IndexedDB | persistance SQLite |
| Browser storage | localStorage | état persistant simple |
| CSV | PapaParse | import |
| PDF | jsPDF / html2canvas | export |
| Infrastructure | Docker Compose | services locaux |
| DB locale infra | PostgreSQL | future persistance serveur |
| Cache infra | Valkey | futur cache/queue |
| Mail infra | MailDev | emails de développement |

---

# 28. Ce qui est réellement connecté aujourd'hui

## Connecté au frontend

~~~text
React
React Router
localStorage
IndexedDB
SQL.js
PapaParse
ECharts
Recharts
D3
jsPDF
html2canvas
~~~

## Présent mais pas encore intégré comme backend applicatif

~~~text
PostgreSQL
Valkey
MailDev
~~~

## Legacy / à supprimer ou migrer

~~~text
platform_config.go
~~~

## Architecture non encore implémentée

~~~text
Rust API
Rust IAM
Rust Metadata
Rust Query Engine
Rust Workers
Rust Reporting
~~~

---

# 29. Limites actuelles

L'architecture actuelle est adaptée à un **prototype BI avancé / frontend fonctionnel**, mais pas encore à une plateforme multi-utilisateurs de production.

### Authentication

Principalement simulée côté React.

### Authorization

Les rôles et permissions sont modélisés mais ne sont pas encore imposés par une autorité backend.

### Persistence

Une grande partie des données est stockée dans le navigateur.

### SQL

Le moteur SQL actuel n'est pas encore un véritable query engine distant.

### Secrets

Les opérations sensibles doivent être déplacées côté backend.

### Infrastructure

PostgreSQL/Valkey/MailDev existent mais ne constituent pas encore le backend applicatif connecté.

---

# 30. Architecture cible d'évolution

L'objectif n'est pas de réécrire le frontend.

Le frontend actuel doit devenir le client d'une plateforme Rust.

~~~text
                         HIFADIH BI
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
          React Frontend              Rust Backend
                                      Axum + Tokio
                                           │
             ┌─────────────────────────────┼─────────────────────┐
             │                             │                     │
             ▼                             ▼                     ▼
           IAM                         Metadata             Query Engine
             │                             │                     │
             └─────────────────────────────┼─────────────────────┘
                                           │
                         ┌─────────────────┴─────────────────┐
                         ▼                                   ▼
                    PostgreSQL                            Valkey
                         │                                   │
                         └─────────────────┬─────────────────┘
                                           ▼
                                        Workers
                                           │
                                  ┌────────┴────────┐
                                  ▼                 ▼
                               Reports            Emails
~~~

---

# 31. Future workspace Rust

Cible recommandée :

~~~text
backend/
├── Cargo.toml
├── crates/
│   ├── api/
│   ├── domain/
│   ├── auth/
│   ├── metadata/
│   ├── query-engine/
│   ├── storage/
│   ├── reporting/
│   └── workers/
│
└── migrations/
~~~

Responsabilités :

- **api** : HTTP, routes, handlers, validation ;
- **domain** : entités et règles métier ;
- **auth** : users, sessions, JWT, rôles, permissions ;
- **metadata** : datasources, datasets, dimensions, metrics, semantic layer ;
- **query-engine** : parsing, validation, planning, RLS, pushdown, exécution ;
- **storage** : PostgreSQL, Valkey et persistence ;
- **reporting** : PDF, CSV, snapshots et rapports ;
- **workers** : jobs, scheduling et retries.

---

# 32. Migration vers le backend Rust

~~~text
État actuel
    │
    ├── React
    ├── localStorage
    ├── SQL.js
    └── services mockés
    │
    ▼
Rust API skeleton
    │
    ▼
PostgreSQL + SQLx
    │
    ▼
IAM
    │
    ▼
Metadata / Datasources / Datasets
    │
    ▼
Query Engine
    │
    ▼
Dashboards / Charts persistants
    │
    ▼
Workers / Reporting
    │
    ▼
Retrait progressif des mocks/local persistence
~~~

---

# 33. Principe directeur

Le projet doit converger vers :

~~~text
                         React
                           │
                     API Contract
                           │
                          Rust
                           │
          ┌────────────────┼────────────────┐
          │                │                │
         IAM           Semantic Layer    Query Engine
          │                │                │
          └────────────────┼────────────────┘
                           │
                    PostgreSQL / Valkey
                           │
                        Workers
~~~

Le **frontend ne doit plus être responsable de la sécurité, de la persistance métier critique ou de l'exécution SQL de production**.

Le frontend devient l'interface d'exploitation de la plateforme.

---

# 34. Résumé architectural

### Aujourd'hui

~~~text
React + TypeScript
        │
        ├── UI
        ├── BI Features
        ├── localStorage
        ├── SQL.js / IndexedDB
        └── Plugins
~~~

### Demain

~~~text
React + TypeScript
        │
        ▼
Rust API
        │
 ┌──────┼────────┬───────────┐
 ▼      ▼        ▼           ▼
IAM  Metadata  Query      Workers
                Engine
        │
 ┌──────┴───────┐
 ▼              ▼
PostgreSQL     Valkey
~~~

**La bonne lecture du projet est donc : Hifadih BI possède déjà un frontend BI riche et une modélisation de domaine avancée ; la prochaine transformation majeure consiste à déplacer l'autorité métier et les données critiques vers un backend Rust.**
