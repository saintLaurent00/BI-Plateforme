# Architecture de Hifadih BI

## 1. Objectif

Hifadih BI doit évoluer vers une plateforme BI complète dont le backend est **100 % Rust**.

L'architecture sépare :
- présentation ;
- contrats API ;
- identité et autorisation ;
- métadonnées BI ;
- exécution des requêtes ;
- cache ;
- traitements asynchrones ;
- intégrations externes.

## 2. État actuel

Le dépôt actuel est principalement un frontend React/TypeScript.

Déjà présents :
- routing ;
- Home, Dashboards, Charts, SQL Lab, Datasets, Admin et Documentation ;
- dashboard editor ;
- visualization editor ;
- plugins de graphiques ;
- types de domaine frontend ;
- utilitaires d'import/persistance ;
- services IA ;
- infrastructure Docker PostgreSQL/Valkey/MailDev.

**Aucun backend Rust n'est encore présent dans l'arborescence actuelle.** Les anciennes références à `gateway-auth-go`, `metadata-semantic-go`, `query-engine-rust` et `orchestrator-sync-rust` sont historiques.

## 3. Architecture cible

```text
┌───────────────────────────────────────────────────────────────────┐
│                           HIFADIH BI                              │
├───────────────────────────────────────────────────────────────────┤
│ Frontend                                                         │
│ React / TypeScript / Vite                                        │
│ Pages → Features → Core → Services                              │
└───────────────────────────────┬───────────────────────────────────┘
                                │ HTTPS / JSON
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                         RUST BACKEND                              │
│ Axum / Tokio                                                     │
│                                                                   │
│ IAM | Metadata | Query Engine | Dashboards | Reporting | Workers │
└───────────────┬───────────────────────────┬───────────────────────┘
                │                           │
                ▼                           ▼
        ┌───────────────┐           ┌───────────────┐
        │  PostgreSQL   │           │    Valkey     │
        │ source/meta   │           │ cache/queue   │
        └───────────────┘           └───────────────┘
```

## 4. Workspace Rust proposé

```text
backend/
├── Cargo.toml
├── crates/
│   ├── api/             # routes HTTP et handlers
│   ├── domain/          # entités et règles métier
│   ├── auth/            # identité, JWT/sessions
│   ├── metadata/        # datasets et semantic layer
│   ├── query-engine/    # planning et exécution
│   ├── storage/         # PostgreSQL / Valkey
│   ├── reporting/       # exports et rapports
│   └── workers/         # jobs asynchrones
└── migrations/
```

## 5. Responsabilités

### API

Expose les contrats HTTP pour authentication, users/roles, datasources, datasets, charts, dashboards, SQL, reports et health.

### IAM

Authentification, sessions/JWT, rôles, permissions et contrôle d'accès.

### Metadata

Catalogue des datasources, datasets, colonnes, métriques, dimensions, relations, ownership et règles RLS.

### Query Engine

```text
HTTP request
    ↓
validation
    ↓
authorization / RLS
    ↓
query model
    ↓
SQL generation / planning
    ↓
pushdown
    ↓
execution
    ↓
normalisation
    ↓
response
```

### Workers

Les traitements longs doivent être asynchrones : refresh de métadonnées, snapshots, rapports, exports et emails.

## 6. Persistance

**PostgreSQL** : utilisateurs, rôles, permissions, datasources, datasets, dashboards, charts, configurations et audit.

**Valkey** : cache, rate limiting, jobs légers, coordination et invalidation.

## 7. Sécurité

- secrets hors du code ;
- validation stricte ;
- requêtes SQL paramétrées ;
- authorization côté backend ;
- RLS avant exécution ;
- logs sans secrets/tokens ;
- rate limiting ;
- CORS explicite ;
- TLS en production.

## 8. Observabilité

Le backend Rust devra fournir :
- logs structurés avec `tracing` ;
- request/correlation ID ;
- métriques ;
- health/readiness ;
- durée des requêtes ;
- taux d'erreur ;
- métriques query engine ;
- métriques workers.

## 9. Principes

1. Rust est la technologie backend de référence.
2. Le frontend ne porte pas les règles de sécurité critiques.
3. Le domaine ne dépend pas du framework HTTP.
4. PostgreSQL/Valkey sont isolés derrière des abstractions.
5. Les contrats API sont versionnables.
6. Les opérations coûteuses sont asynchrones.
7. Chaque domaine doit rester testable indépendamment.
