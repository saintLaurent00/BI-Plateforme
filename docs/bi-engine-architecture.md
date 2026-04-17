# BI-Plateforme — Architecture Query Intelligence Engine

## Objectif
Permettre à un utilisateur non technique d'obtenir des insights en quelques secondes via un flux guidé:
1. Dataset
2. Metric
3. Dimension
4. Preview instantané
5. Sauvegarde dashboard

## Backend FastAPI
- `POST /api/query`: génère une requête SQL paramétrée à partir d'une requête métier.
- `GET /api/datasets`: expose le catalogue sémantique des datasets.

### Pipeline `/api/query`
1. Chargement du dataset logique (`DatasetRegistry`)
2. Validation de la requête (`QueryValidator`)
3. Génération SQL (`QueryBuilder`)
4. Exécution paramétrée (`SQLExecutor`)
5. Insights automatiques (`InsightEngine`)

## Dataset Abstraction Layer
Un dataset représente une entité BI réutilisable:
- `name`
- `table_name`
- `columns` (métier -> physique)
- `metrics` (agrégats contrôlés)

## Frontend Guided UX
- `src/features/chart-builder`: flow guidé minimaliste.
- `ChartBuilderWizard`: trois choix et preview instant.
- `QueryExecutionMotion`: animation de chargement.

## Motion Design
L'animation est utilisée comme couche d'explication d'état:
- Pulse au chargement de requête.
- Transition vers état résultat.
- Feedback visuel de progression utilisateur.
