# 💎 Prism Hub : Spécifications Techniques Complètes du Backend

Ce document constitue la référence ultime du backend de la **BI-Plateforme**. Il décrit l'intégralité des modules, leur logique interne et leur interaction au sein du **Prism Hub**.

---

## 🏗️ 1. Architecture Globale
Le backend est conçu selon les principes de la **Clean Architecture** et du **Domain-Driven Design (DDD)**. Il est organisé pour être "Microservices-Ready", permettant une séparation physique des services (Identité, Requêtes, Métadonnées) sans changement de code majeur.

### Couches Logicielles :
*   **API Layer (`app/api`)** : Points d'entrée FastAPI. Gère la validation des schémas d'entrée, l'injection de dépendances et le routage.
*   **Domain Layer (`app/domain`)** : Le cœur métier. Indépendant des frameworks. Contient les services sémantiques, le moteur de génération SQL et les règles de sécurité RLS.
*   **Infrastructure Layer (`app/infrastructure`)** : Implémentations techniques (SQLAlchemy, Drivers de bases de données, Cache Redis, Introspecteur SQL).
*   **Core Layer (`app/core`)** : Noyau système (Security, Config, Plugins, Logs).

---

## 🧠 2. Prism Meta (Metadata Store)
Le système n'est pas configuré par fichiers, mais piloté par une base de données relationnelle (`prism_meta.db`).

### Entités Gérées :
1.  **Identity & RBAC** :
    *   `users`, `roles`, `permissions`.
    *   Gestion fine des accès via des tables de liaison.
2.  **Semantic Mapping** :
    *   `datasets` : Définition des sources (Physiques/Virtuelles).
    *   `columns` : Alias (labels), visibilité, types et expressions calculées.
    *   `metrics` : Formules SQL centralisées (SUM, AVG, etc.).
3.  **Contextual Security** :
    *   `security_attributes` : Attributs JSON par utilisateur (ex: `{"region": "Sud"}`) pour le filtrage automatique.
4.  **Operations** :
    *   `scheduled_jobs` : Configuration des alertes et rapports.
    *   `cache_policies` : Paramétrage du TTL par dataset.

---

## 🚀 3. Query Intelligence Engine
Le moteur transforme les intentions métier en SQL exécutable et sécurisé.

### Fonctionnalités Clés :
*   **Multi-Dialect Support** : Abstraction via `BaseDialect`. Implémentations pour **SQLite** (strftime) et **Postgres** (DATE_TRUNC).
*   **Moteur Jinja2** : Compilation dynamique des expressions SQL permettant l'injection de paramètres utilisateur (`{{ params.cat }}`) ou de contexte (`{{ user.region }}`).
*   **SQL Wrapping (Expert Mode)** : Pour sécuriser le SQL manuel, le moteur enveloppe la requête de l'utilisateur dans une sous-requête : `SELECT * FROM (USER_SQL) AS wrapped WHERE RLS_CLAUSES`.
*   **Implicit RLS** : Détection automatique des colonnes de sécurité et injection de filtres `WHERE` sans intervention de l'utilisateur.

---

## ⚡ 4. Performance et Proactivité
*   **Secure Cache Manager** :
    *   Hashage unique combinant : `Base SQL + Paramètres + Attributs RLS`.
    *   Garantit qu'un utilisateur ne peut pas accéder aux données d'un autre via le cache.
*   **Alerting Scheduler** :
    *   Worker asynchrone permanent.
    *   Surveillance cyclique des métriques en base SQL.
    *   Logs d'alertes structurés.
*   **Database Introspector** :
    *   Analyse dynamique du schéma des bases analytiques.
    *   Découverte automatique de jointures (Auto-Join) basée sur les heuristiques de colonnes.

---

## 🌐 5. Service Frontend & Compatibilité
*   **Hosting Unifié** : FastAPI sert le build de production React (`dist/`) sur la racine `/`.
*   **Compatibility Layer (v1)** : Ensemble d'endpoints émulant Apache Superset (`/api/v1/me/`, `/api/v1/dashboard/`, etc.) pour assurer le fonctionnement transparent du frontend existant tout en y injectant la sécurité "Prism".

---

## 🛠️ 6. Stack Technique
*   **Backend** : Python 3.12, FastAPI, Pydantic v2, Jinja2, SQLAlchemy.
*   **Processing** : Pandas.
*   **Bases** : SQLite (Metadata/Analytic), extensible Postgres.
*   **Logs** : Système de filtrage par contexte utilisateur pour audit trail complet.

---
*Le Prism Hub est le moteur de confiance qui transforme vos données en levier de croissance.*
