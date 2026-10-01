# Présentation — Hifadih BI

## Slide 1 — Hifadih BI

### Une plateforme moderne de Business Intelligence

**Explorer · Visualiser · Analyser · Décider**

Projet : `BI-Plateforme`

---

## Slide 2 — Le problème

Les équipes data jonglent souvent entre sources, SQL, notebooks, visualisation, dashboards et exports.

Hifadih BI vise à réunir ces usages dans une expérience cohérente.

---

## Slide 3 — La vision

- connecter des sources ;
- cataloguer les datasets ;
- explorer les données ;
- construire des visualisations ;
- composer des dashboards ;
- exécuter des requêtes ;
- automatiser des rapports.

---

## Slide 4 — Ce qui existe aujourd'hui

Le dépôt fournit principalement le frontend :

- React 19 + TypeScript ;
- Vite ;
- dashboards ;
- dashboard editor ;
- chart editor ;
- datasets ;
- SQL Lab ;
- administration ;
- documentation ;
- plugins de visualisation.

---

## Slide 5 — Expérience utilisateur

```text
Login
  ↓
Home
  ↓
Datasets ─────→ Exploration
  │
  └───────────→ Chart Editor
                    ↓
               Dashboard Editor
                    ↓
                 Dashboard
```

SQL Lab permet l'exploration par requêtes.

---

## Slide 6 — Architecture cible

```text
React / TypeScript
        │
        ▼ HTTPS / JSON
     Rust API
 ├── IAM
 ├── Metadata
 ├── Query Engine
 ├── Dashboards
 ├── Reporting
 └── Workers
        │
   ┌────┴────┐
   ▼         ▼
PostgreSQL  Valkey
```

---

## Slide 7 — Pourquoi Rust ?

Le backend Rust vise :

- performance ;
- concurrence ;
- sûreté mémoire ;
- contrôle des ressources ;
- services asynchrones ;
- query engine ;
- workers.

Le frontend reste React/TypeScript.

---

## Slide 8 — Query Engine

```text
Query
  ↓
Validation
  ↓
Authorization
  ↓
RLS
  ↓
Planning
  ↓
Pushdown
  ↓
Execution
  ↓
Result
```

Objectif : limiter les transferts et calculs inutiles.

---

## Slide 9 — Semantic Layer

Centralise :

- datasets ;
- dimensions ;
- métriques ;
- relations ;
- ownership ;
- permissions ;
- RLS.

---

## Slide 10 — Sécurité

- authentication ;
- authorization ;
- RBAC ;
- RLS ;
- secrets hors du code ;
- validation ;
- audit ;
- rate limiting ;
- logs sans données sensibles.

---

## Slide 11 — Infrastructure

| Composant | Rôle |
|---|---|
| PostgreSQL | persistance |
| Valkey | cache / jobs |
| MailDev | emails de développement |
| Docker Compose | infrastructure locale |

---

## Slide 12 — Roadmap

```text
Frontend actuel
      ↓
Workspace Rust
      ↓
IAM
      ↓
Metadata
      ↓
Query Engine
      ↓
API ↔ Frontend
      ↓
Workers / Reporting
      ↓
Production
```

---

## Slide 13 — Positionnement

**BI + Data Exploration + Visualization + Query Engine**

React gère l'expérience. Rust gère le backend. PostgreSQL gère la persistance. Valkey gère cache et coordination.

---

## Slide 14 — État du projet

**Aujourd'hui :** frontend BI riche et infrastructure locale.

**Prochaine étape majeure :** construire le backend Rust puis remplacer progressivement les comportements de démonstration par des services persistants et sécurisés.

---

## Slide 15 — Conclusion

Hifadih BI évolue d'une interface BI avancée vers une plateforme analytique complète.

**Objectif : une architecture cohérente, performante, sécurisée et entièrement Rust côté backend.**
