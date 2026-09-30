# Hifadih BI

> Plateforme moderne d'exploration, de visualisation et d'analyse de données, avec une interface BI riche et une architecture backend cible en Rust.

[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20TypeScript-61DAFB)](https://react.dev/)
[![Build](https://img.shields.io/badge/build-Vite-646CFF)](https://vite.dev/)
[![Backend%20cible](https://img.shields.io/badge/backend-Rust-orange)](https://www.rust-lang.org/)

## Vue d'ensemble

**Hifadih BI** est une plateforme de Business Intelligence conçue pour explorer des datasets, construire des visualisations et dashboards interactifs, exécuter des requêtes et assister l'analyse avec l'IA.

Le dépôt actuel contient principalement le **frontend React/TypeScript** et les briques UI. La direction technique est désormais un **backend entièrement Rust**.

> **État au 30 septembre 2026 :** les anciens documents décrivaient des services Go/Rust qui ne correspondent plus à l'arborescence actuelle. Cette documentation distingue donc les composants existants des composants backend Rust à construire.

## Fonctionnalités du frontend

- Authentification de démonstration
- Home et navigation BI
- Dashboards et dashboard editor
- Catalogue et éditeur de visualisations
- Exploration et création de datasets
- SQL Lab
- Administration
- Documentation intégrée
- Plugins de graphiques
- Assistance **Hifadih AI**
- Import et traitement de données côté client
- Export PDF

## Architecture cible

```text
                         ┌──────────────────────────┐
                         │       Hifadih BI UI      │
                         │ React + TypeScript + Vite│
                         └────────────┬─────────────┘
                                      │ HTTPS / JSON
                                      ▼
                         ┌──────────────────────────┐
                         │      Rust API / BFF      │
                         │ Axum + Tokio + Serde     │
                         └──────┬────────┬──────────┘
                                │        │
                    ┌───────────┘        └──────────────┐
                    ▼                                   ▼
             ┌──────────────┐                    ┌──────────────┐
             │ PostgreSQL   │                    │    Valkey    │
             │ IAM + Meta   │                    │ Cache / Jobs │
             └──────────────┘                    └──────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │ Query / Analytics │
                         │     Rust         │
                         └──────────────────┘
```

Voir [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Stack actuelle

### Frontend

- React 19
- TypeScript 5.8
- Vite 6
- React Router 7
- Tailwind CSS 4
- ECharts, Recharts, D3
- Motion / Anime.js
- React DnD / @hello-pangea/dnd
- SQL.js
- PapaParse
- jsPDF / html2canvas
- Google GenAI SDK

### Infrastructure locale

- PostgreSQL 15
- Valkey
- MailDev
- Docker Compose

### Backend cible

- Rust stable
- Tokio
- Axum
- Serde
- SQLx
- PostgreSQL
- Valkey
- tracing

Le backend Rust n'est pas encore présent dans l'arborescence actuelle : il s'agit de la cible d'architecture.

## Démarrage

### Prérequis

- Node.js récent
- npm ou Bun
- Docker + Docker Compose

### Installation

```bash
git clone https://github.com/saintLaurent00/BI-Plateforme.git
cd BI-Plateforme
npm install
```

### Développement

```bash
npm run dev
```

Vite écoute sur le port **3000**.

### Build et vérification

```bash
npm run build
npm run lint
```

### Infrastructure

```bash
docker compose up -d
docker compose ps
```

| Service | Port | Usage |
|---|---:|---|
| PostgreSQL | 5432 | Persistance |
| Valkey | 6379 | Cache / jobs |
| MailDev SMTP | 1025 | Tests d'envoi |
| MailDev UI | 1080 | Visualisation des emails |

Arrêt :

```bash
docker compose down
```

## Configuration

Le fichier `.env.example` contient actuellement :

```env
VITE_HIFADIH_API_URL=https://api.hifadih.ai
VITE_HIFADIH_ENV=production
```

Ne jamais committer de secrets réels.

## Structure

```text
BI-Plateforme/
├── src/
│   ├── components/       # UI et composants partagés
│   ├── core/             # types et utilitaires
│   ├── features/         # fonctionnalités métier
│   ├── lib/              # services transverses
│   └── pages/            # écrans
├── plugins/              # plugins de visualisation
├── docker-compose.yml
├── package.json
├── vite.config.ts
├── tsconfig.json
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    ├── PRESENTATION.md
    └── ROADMAP.md
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API et contrats](./docs/API.md)
- [Présentation](./docs/PRESENTATION.md)
- [Roadmap](./docs/ROADMAP.md)
- [Contribution](./CONTRIBUTING.md)
- [Instructions agents IA](./AGENTS.md)

## Roadmap

1. stabiliser le modèle de domaine ;
2. définir les contrats API ;
3. créer le workspace backend Rust ;
4. implémenter IAM et autorisation ;
5. implémenter les métadonnées ;
6. implémenter le query engine ;
7. connecter le frontend à l'API Rust ;
8. ajouter workers, cache et reporting ;
9. renforcer tests, observabilité et sécurité.

## Licence

Le code applicatif actuel contient des fichiers sous licence Apache-2.0 et des dépendances tierces soumises à leurs propres licences. Vérifier les notices du dépôt avant redistribution.
