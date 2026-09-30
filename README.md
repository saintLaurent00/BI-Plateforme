# Hifadih BI

> Plateforme de Business Intelligence pour explorer, visualiser et analyser les données dans une interface moderne, extensible et orientée analytics.

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Build](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Backend cible](https://img.shields.io/badge/Backend%20cible-Rust-orange?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)](https://github.com/saintLaurent00/BI-Plateforme)

## À propos

**Hifadih BI** est une plateforme BI destinée à réunir dans un même environnement :

- exploration et préparation de données ;
- création de visualisations et de dashboards ;
- requêtes SQL ;
- catalogue de datasets ;
- administration et gestion des fonctionnalités BI ;
- plugins de visualisation extensibles ;
- assistance à l'analyse avec **Hifadih AI** ;
- import, traitement et export de données côté client.

Le dépôt est actuellement centré sur le **frontend React/TypeScript**. L'évolution prévue du système est un **backend entièrement en Rust**.

> **État du projet — 30 septembre 2026**  
> Le backend Rust est une cible d'architecture et n'est pas encore présent dans l'arborescence actuelle.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         Hifadih BI                           │
│                    React + TypeScript                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         Rust API                            │
│                  Axum + Tokio + Serde                       │
└───────────────┬──────────────────────────────┬──────────────┘
                │                              │
                ▼                              ▼
        ┌───────────────┐              ┌───────────────┐
        │  PostgreSQL   │              │    Valkey     │
        │ IAM + Metadata│              │ Cache + Jobs  │
        └───────────────┘              └───────────────┘
                │
                ▼
        ┌───────────────────┐
        │ Query / Analytics │
        │       Rust        │
        └───────────────────┘
```

Architecture détaillée : **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**

---

## Stack

### Frontend

| Domaine | Technologies |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| Visualisation | ECharts, Recharts, D3 |
| Interaction | Motion, Anime.js, React DnD |
| Data local | SQL.js, IndexedDB |
| Import | PapaParse |
| Export | jsPDF, html2canvas |
| IA | Google GenAI SDK |

### Infrastructure

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

---

## Structure du dépôt

```text
BI-Plateforme/
│
├── docs/                 # Documentation du projet
├── frontend/             # Architecture frontend cible
├── plugins/              # Plugins de visualisation
├── src/                  # Code frontend actuellement présent
│
├── README.md             # Présentation du projet
├── package.json          # Dépendances et scripts
├── vite.config.ts        # Configuration Vite
├── tsconfig.json         # Configuration TypeScript
├── docker-compose.yml    # Infrastructure locale
├── .env.example          # Variables d'environnement exemple
├── CONTRIBUTING.md       # Guide de contribution
└── AGENTS.md             # Instructions pour assistants IA
```

La documentation détaillée est volontairement regroupée dans **[docs/](./docs/)** afin de garder la page principale lisible.

---

## Démarrage rapide

### Prérequis

- Node.js récent
- npm ou Bun
- Docker et Docker Compose

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

L'application est disponible sur **http://localhost:3000**.

### Vérification

```bash
npm run build
npm run lint
```

### Infrastructure locale

```bash
docker compose up -d
docker compose ps
```

Arrêt :

```bash
docker compose down
```

---

## Documentation

| Document | Contenu |
|---|---|
| [Architecture](./docs/ARCHITECTURE.md) | Architecture actuelle et cible |
| [API](./docs/API.md) | Contrats et interfaces API |
| [Présentation](./docs/PRESENTATION.md) | Vision et présentation du projet |
| [Roadmap](./docs/ROADMAP.md) | Évolution prévue du projet |
| [Contribution](./CONTRIBUTING.md) | Workflow de développement |
| [AGENTS.md](./AGENTS.md) | Contexte et règles pour assistants IA |

---

## Direction technique

La trajectoire du projet est volontairement structurée autour d'un **backend Rust unique**.

Les prochaines étapes principales sont :

1. stabiliser le modèle de domaine ;
2. définir les contrats API ;
3. créer le workspace backend Rust ;
4. implémenter l'IAM et l'autorisation ;
5. implémenter les métadonnées ;
6. construire le query engine ;
7. connecter le frontend à l'API Rust ;
8. ajouter cache, workers et reporting ;
9. renforcer les tests, l'observabilité et la sécurité.

---

## Contribution

Les contributions suivent le workflow documenté dans **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

Pour comprendre rapidement le projet avant de modifier le code, commencer par :

**README → Architecture → Roadmap → code concerné**

---

## Licence

Le code applicatif et les dépendances du projet peuvent être soumis à des licences différentes. Vérifier les notices correspondantes avant toute redistribution.
