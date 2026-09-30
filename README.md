# Hifadih BI

> Plateforme de Business Intelligence pour explorer, visualiser et analyser les données dans une interface moderne, extensible et orientée analytics.

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Build](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Backend cible](https://img.shields.io/badge/Backend%20cible-Rust-orange?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)](https://github.com/saintLaurent00/BI-Plateforme)

## Aperçu

**Démo en ligne :** [Ouvrir l'aperçu Hifadih BI](https://saintlaurent00.github.io/BI-Plateforme/)

> L'aperçu est déployé automatiquement depuis la branche `main` via GitHub Pages.

## À propos

**Hifadih BI** est une plateforme BI destinée à réunir dans un même environnement :

- exploration et préparation de données ;
- création de visualisations et de dashboards ;
- requêtes SQL ;
- catalogue de datasets ;
- administration ;
- plugins de visualisation extensibles ;
- exploration et visualisation interactive des données.

Le dépôt est actuellement centré sur le **frontend React/TypeScript**. La cible backend est un **backend unique en Rust**.

> **État du projet — 30 septembre 2026**  
> Le backend Rust est une cible d'architecture et n'est pas encore présent dans l'arborescence actuelle.

## Architecture

```text
BI-Plateforme/
├── README.md
├── .gitignore
├── docs/                  # Documentation
├── frontend/              # Application React + TypeScript
│   ├── src/
│   ├── plugins/           # Registre des plugins côté application
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── infrastructure/        # Infrastructure locale
│   └── docker/
│       └── docker-compose.yml
└── plugins/               # Packages de plugins de visualisation
    ├── plugin-chart-bar/
    ├── plugin-chart-line/
    ├── plugin-chart-pie/
    └── ...
```

L'objectif est de garder la racine du dépôt orientée **navigation et documentation**, tandis que l'implémentation frontend vit dans `frontend/`.

## Stack

### Frontend

| Domaine | Technologies |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| Visualisation | ECharts, Recharts, D3 |
| Motion | Motion, Anime.js |
| Interaction | React DnD |
| Data local | SQL.js, IndexedDB |
| Import | PapaParse |
| Export | jsPDF, html2canvas |
| IA | Google GenAI SDK |

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

## Démarrage rapide

### Prérequis

- Node.js récent
- npm ou Bun
- Docker et Docker Compose

### Installation

```bash
git clone https://github.com/saintLaurent00/BI-Plateforme.git
cd BI-Plateforme/frontend
npm install
```

### Développement

```bash
npm run dev
```

Application : **http://localhost:3000**

### Vérification

```bash
npm run build
npm run lint
```

### Infrastructure locale

Depuis la racine du dépôt :

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
docker compose -f infrastructure/docker/docker-compose.yml ps
```

Arrêt :

```bash
docker compose -f infrastructure/docker/docker-compose.yml down
```

## Documentation

| Document | Contenu |
|---|---|
| [Architecture](./docs/ARCHITECTURE.md) | Architecture actuelle et cible |
| [API](./docs/API.md) | Contrats et interfaces API |
| [Présentation](./docs/PRESENTATION.md) | Vision du projet |
| [Roadmap](./docs/ROADMAP.md) | Évolution prévue |

## Direction technique

La trajectoire du projet est structurée autour d'un **backend Rust unique**.

Ordre de travail prévu :

1. stabiliser le domaine ;
2. définir les contrats API ;
3. créer le workspace backend Rust ;
4. implémenter IAM et autorisation ;
5. implémenter les métadonnées ;
6. construire le query engine ;
7. connecter le frontend à l'API Rust ;
8. ajouter cache, workers et reporting ;
9. renforcer tests, observabilité et sécurité.

## Contribution

Avant toute modification :

**README → Architecture → Roadmap → code concerné**

Le frontend se travaille depuis `frontend/`. Les packages de visualisation indépendants se trouvent dans `plugins/`.

## Licence

Le code applicatif et les dépendances peuvent être soumis à des licences différentes. Vérifier les notices correspondantes avant redistribution.
