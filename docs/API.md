# API Hifadih BI

## Statut

Ce document définit les **contrats API cibles** du backend Rust. Les endpoints ci-dessous ne sont pas encore tous implémentés dans le dépôt actuel.

Base URL cible :

```text
/api/v1
```

## Erreurs

```json
{
  "error": {
    "code": "DATASET_NOT_FOUND",
    "message": "Dataset not found",
    "details": {}
  },
  "request_id": "req_01..."
}
```

## Health

```text
GET /health
GET /ready
```

## Auth

```text
POST /auth/login
POST /auth/logout
```

Exemple de login :

```json
{
  "email": "user@example.com",
  "password": "********"
}
```

Réponse cible :

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "usr_123",
    "email": "user@example.com"
  }
}
```

## Users / Roles

```text
GET    /users
GET    /users/{id}
POST   /users
PATCH  /users/{id}

GET    /roles
POST   /roles
PATCH  /roles/{id}
```

## Datasources

```text
GET    /datasources
POST   /datasources
GET    /datasources/{id}
PATCH  /datasources/{id}
DELETE /datasources/{id}
POST   /datasources/{id}/test
POST   /datasources/{id}/sync
```

Les secrets de connexion ne doivent jamais être retournés.

## Datasets

```text
GET    /datasets
POST   /datasets
GET    /datasets/{id}
PATCH  /datasets/{id}
DELETE /datasets/{id}

GET    /datasets/{id}/columns
GET    /datasets/{id}/preview
GET    /datasets/{id}/metadata
```

## Charts

```text
GET    /charts
POST   /charts
GET    /charts/{id}
PATCH  /charts/{id}
DELETE /charts/{id}
POST   /charts/{id}/query
```

## Dashboards

```text
GET    /dashboards
POST   /dashboards
GET    /dashboards/{id}
PATCH  /dashboards/{id}
DELETE /dashboards/{id}

POST   /dashboards/{id}/duplicate
POST   /dashboards/{id}/publish
```

## Query Engine

```text
POST /queries
```

Exemple :

```json
{
  "dataset_id": "ds_sales",
  "dimensions": ["country"],
  "metrics": [
    { "expression": "sum", "column": "revenue" }
  ],
  "filters": [
    { "column": "year", "operator": "eq", "value": 2026 }
  ],
  "limit": 1000
}
```

Le backend doit reconstruire la requête depuis un modèle contrôlé. Les fragments SQL utilisateur ne doivent pas être concaténés directement.

## SQL Lab

```text
POST /sql/validate
POST /sql/execute
```

Pipeline obligatoire : authentication → authorization → restrictions datasource → RLS → timeout → resource limits → audit.

## Reports

```text
POST /reports
GET  /reports/{id}
GET  /reports/{id}/status
GET  /reports/{id}/download
```

Les exports lourds sont exécutés par un worker.

## Versionnement

Les ruptures de contrat créent une nouvelle version :

```text
/api/v1
/api/v2
```
