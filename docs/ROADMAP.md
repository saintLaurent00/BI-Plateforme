# Roadmap Hifadih BI

## Phase 0 — Documentation et cadrage

- [x] Recentrer la documentation sur l'état réel du dépôt
- [x] Supprimer la description obsolète des services Go
- [x] Définir l'architecture backend Rust cible
- [x] Définir les premiers contrats API

## Phase 1 — Workspace Rust

- [ ] Créer `backend/Cargo.toml`
- [ ] Créer les crates `api`, `domain`, `storage`
- [ ] Configuration centralisée
- [ ] `tracing`
- [ ] `/health` et `/ready`
- [ ] CI : fmt, clippy, test

## Phase 2 — Domaine et persistance

- [ ] User / Role / Permission
- [ ] Datasource
- [ ] Dataset / Column
- [ ] Chart
- [ ] Dashboard
- [ ] Migrations PostgreSQL
- [ ] Repositories SQLx
- [ ] Cache Valkey

## Phase 3 — IAM

- [ ] Login / Logout
- [ ] JWT ou sessions
- [ ] Password hashing
- [ ] Roles / Permissions
- [ ] Audit
- [ ] Rate limiting

## Phase 4 — Metadata / Semantic Layer

- [ ] Catalogue datasets
- [ ] Dimensions / métriques
- [ ] Relations
- [ ] Metadata refresh
- [ ] RLS
- [ ] Ownership

## Phase 5 — Query Engine

- [ ] Query model
- [ ] Validation
- [ ] Authorization
- [ ] SQL generation
- [ ] Pushdown
- [ ] Pagination
- [ ] Timeout / resource limits
- [ ] Query cache
- [ ] Tests de non-régression

## Phase 6 — Intégration frontend

- [ ] Remplacer les données mockées
- [ ] Client API TypeScript
- [ ] Auth réelle
- [ ] Datasources réelles
- [ ] Datasets réels
- [ ] Dashboards persistants
- [ ] SQL Lab connecté

## Phase 7 — Workers et reporting

- [ ] Job model
- [ ] Scheduler
- [ ] Snapshots
- [ ] PDF / exports
- [ ] Mail reports
- [ ] Retry / dead-letter

## Phase 8 — Production

- [ ] Docker images frontend/backend
- [ ] CI/CD
- [ ] Secrets management
- [ ] Observability
- [ ] Security hardening
- [ ] Load tests
- [ ] Disaster recovery

## Définition de terminé

Une fonctionnalité doit posséder implémentation, tests, documentation, observabilité minimale, gestion d'erreurs et contrôle d'accès si nécessaire.
