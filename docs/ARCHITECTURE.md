# Hifadih BI — Architecture frontend

> Architecture de référence du frontend après la refonte de septembre/octobre 2026.
>
> Le frontend est traité comme un produit autonome. Le backend Rust sera branché plus tard derrière les ports d'infrastructure déjà prévus.

## 1. Principe directeur

Hifadih BI sépare désormais clairement :

```
Presentation
    ↓
Features / Use cases
    ↓
Domain
    ↓
Infrastructure
```

Les dépendances ne doivent jamais remonter dans l'autre sens.

- **Presentation** affiche et orchestre l'interface.
- **Features** implémentent les parcours utilisateurs.
- **Domain** définit les concepts BI stables.
- **Infrastructure** implémente le stockage, HTTP et l'exécution.
- **Plugins** rendent les visualisations et ne construisent pas les requêtes.

## 2. Arborescence cible

```text
BI-Plateforme/
├── .github/
│   └── workflows/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── METADATA.md
│   ├── DATAVIZ.md
│   ├── QUERY_ENGINE.md
│   ├── PLUGIN_SYSTEM.md
│   ├── DATA_MODEL.md
│   ├── API.md
│   ├── DESIGN_SYSTEM.md
│   ├── CONTRIBUTING.md
│   └── ROADMAP.md
├── infrastructure/
│   └── docker/
├── plugins/
│   ├── plugin-chart-bar/
│   ├── plugin-chart-line/
│   ├── plugin-chart-pie/
│   ├── plugin-chart-boxplot/
│   ├── plugin-chart-funnel/
│   ├── plugin-chart-heatmap/
│   ├── plugin-chart-radar/
│   ├── plugin-chart-sankey/
│   ├── plugin-chart-scatter/
│   ├── plugin-chart-sunburst/
│   ├── plugin-chart-treemap/
│   └── plugin-chart-waterfall/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── pages/
│   │   ├── features/
│   │   │   ├── datasets/
│   │   │   ├── semantic-model/
│   │   │   ├── query-builder/
│   │   │   ├── query-execution/
│   │   │   ├── charts/
│   │   │   ├── dashboards/
│   │   │   ├── sql-lab/
│   │   │   └── administration/
│   │   ├── domain/
│   │   │   ├── dataset/
│   │   │   ├── query/
│   │   │   ├── chart/
│   │   │   └── dashboard/
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   ├── query-execution/
│   │   │   ├── persistence/
│   │   │   └── http/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── formatting/
│   │   │   ├── constants/
│   │   │   └── utils/
│   │   ├── styles/
│   │   └── main.tsx
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
├── .gitignore
├── DESIGN_SYSTEM.md
└── README.md
```

## 3. Domain : le cœur conceptuel

Le domain ne connaît ni React, ni ECharts, ni Axios, ni SQL.js.

Il contient les concepts stables :

```text
domain/
├── identity/       # User, Group, Role, Permission
├── catalog/        # DataSource
├── dataset/        # DatasetMetadata and semantic metadata
├── query/          # ChartQuery and query contracts
├── chart/          # Chart and visualization definition
├── content/        # Dashboard and SavedQuery
├── security/       # ResourceAccess and RowLevelSecurityPolicy
├── reporting/      # Report
└── audit/          # AuditLog
```

Le domaine est le vocabulaire commun du produit.

## 4. Métadonnées

La métadonnée canonique d'un dataset se compose de :

```text
DatasetMetadata
├── identity
├── source
├── physical definition
├── columns
├── metrics
├── calculated columns
├── time metadata
├── statistics
├── capabilities
├── governance
└── audit metadata
```

Une colonne possède explicitement :

```text
semantic name
physical name
label
data type
semantic role
groupable
filterable
temporal
nullable
format
expression
```

La séparation `name` / `physicalName` permet au query builder de rester stable même si PostgreSQL ou une autre source utilise une convention de nommage différente.

Voir `docs/METADATA.md`.

## 5. Query model

Un chart ne stocke plus une paire `x_axis/y_axis` comme contrat principal.

Le contrat devient :

```text
ChartQuery
├── datasetId
├── dimensions
├── metrics
├── calculatedColumns
├── filters
├── timeRange
├── orderBy
├── having
├── limit
└── offset
```

La query est indépendante du renderer.

## 6. Exécution

Le flux canonique est :

```text
DatasetMetadata
       ↓
ChartQuery
       ↓
QueryValidator
       ↓
QueryCompiler
       ↓
QueryExecutor
       ├── SampleQueryExecutor      ← maintenant
       └── RustApiQueryExecutor     ← futur
       ↓
ChartResult
```

Le chart plugin ne reçoit jamais un dataset brut et ne connaît pas SQL.

## 7. Sample data

Les données de développement sont désormais rattachées au domaine dataset :

```text
features/datasets/
└── sample/
    ├── SampleSalesData.ts
    ├── SampleSalesDataset.ts
    └── index.ts
```

La donnée de test et sa métadonnée sont séparées :

```text
SampleSalesData
        +
SampleSalesDataset
        ↓
SampleQueryExecutor
```

Cela permet de remplacer plus tard les lignes locales par une API Rust sans changer le contrat de chart.

## 8. Query execution feature

```text
features/query-execution/
├── types/
│   └── QueryExecutor.ts
├── compiler/
│   └── QueryCompiler.ts
├── validators/
│   └── QueryValidator.ts
├── executors/
│   └── SampleQueryExecutor.ts
└── index.ts
```

Le compilateur transforme le modèle sémantique en SQL.

Le validateur vérifie les références, les expressions et les contraintes du modèle.

L'exécuteur décide **où** la query est exécutée.

## 9. Chart feature et plugins

```text
features/charts/
├── adapters/
├── registry/
├── components/
├── hooks/
├── types/
└── index.ts

plugins/
└── plugin-chart-*/
```

Responsabilités :

### Query layer

- construit ChartQuery
- valide
- compile
- exécute

### Chart feature

- sélectionne un plugin
- prépare ChartResult
- applique la configuration de visualisation

### Plugin

- transforme ChartResult en propriétés de rendu
- rend le graphique
- expose ses contrôles visuels

Un plugin ne doit pas :

- construire du SQL ;
- charger une base ;
- connaître SQL.js ;
- charger un dataset ;
- agréger des lignes sources.

## 10. Pages

Les pages sont les points d'entrée des parcours :

```text
pages/
├── home/
├── login/
├── dashboards/
├── dashboard-editor/
├── charts/
├── chart-builder/
├── datasets/
├── sql-lab/
├── documentation/
└── administration/
```

Une page compose des features ; elle ne doit pas devenir un service métier géant.

## 11. Infrastructure

L'infrastructure contient les implémentations techniques :

```text
infrastructure/
├── database/
│   └── sqlite/
├── query-execution/
│   ├── SampleQueryExecutor.ts
│   └── RustApiQueryExecutor.ts
├── persistence/
│   ├── DatasetRepository.ts
│   ├── ChartRepository.ts
│   └── DashboardRepository.ts
└── http/
    ├── httpClient.ts
    └── apiClient.ts
```

Le principe est important :

```text
domain = ce que le système est
infrastructure = comment cela fonctionne techniquement
```

## 12. Shared

`shared/` contient uniquement ce qui est réellement transversal :

- primitives UI ;
- feedback ;
- navigation ;
- hooks génériques ;
- formatage ;
- utilitaires génériques.

On n'y place pas de logique Dataset, Query, Chart ou Dashboard.

## 13. Migration de l'ancienne architecture

L'ancien code contient encore des zones historiques :

```text
core/types/
core/utils/
lib/
components/
features/visualization-editor/
features/data-sources/
pages/DashboardList/
pages/DashboardEditor/
```

La migration est volontairement progressive.

Le premier slice migré est **Dataviz + métadonnées + query execution**.

Les anciens modules ne doivent plus devenir la nouvelle architecture de référence. Ils seront déplacés par domaines, avec mise à jour des imports et suppression des doubles contrats.

## 14. Architecture runtime finale

```text
                         ┌───────────────────┐
                         │       Pages       │
                         └─────────┬─────────┘
                                   ↓
                         ┌───────────────────┐
                         │     Features      │
                         └─────────┬─────────┘
                                   ↓
                         ┌───────────────────┐
                         │      Domain       │
                         │ metadata / query  │
                         │ chart / dashboard │
                         └─────────┬─────────┘
                                   ↓
                         ┌───────────────────┐
                         │  Infrastructure   │
                         │ SQL / HTTP / DB   │
                         └─────────┬─────────┘
                                   ↓
                         ┌───────────────────┐
                         │ Rust Query Engine │
                         │      FUTURE       │
                         └───────────────────┘

Chart rendering is a parallel presentation concern:

ChartResult
    ↓
Chart Adapter
    ↓
Chart Plugin
    ↓
ECharts / D3
```

## 15. Règles d'architecture

1. Un seul modèle canonique de métadonnées.
2. Un seul modèle canonique de ChartQuery.
3. Aucun SQL construit dans un plugin.
4. Aucun dataset chargé directement par un plugin.
5. Aucun renderer ne décide comment les données sont interrogées.
6. Les labels UI ne sont jamais des identifiants SQL.
7. Les noms sémantiques sont séparés des noms physiques.
8. Les expressions SQL restent des données déclaratives.
9. Le frontend peut utiliser un executor local sans modifier le domain.
10. Le futur backend Rust implémente un port existant ; il ne redéfinit pas le contrat frontend.
