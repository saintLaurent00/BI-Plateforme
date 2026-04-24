# 📝 Cahier des Charges Détaillé : BI-Plateforme (Prism Hub)

## 1. Objectifs du Projet
Construire une plateforme BI scalable, extensible et hautement sécurisée, capable de se connecter à n'importe quelle source de données et de fournir une expérience utilisateur fluide sans connaissances SQL.

## 2. Spécifications Fonctionnelles (MVP)

### A. Gestion des Sources & Intelligence
*   **Connexion Multi-Drivers** : Support initial de Postgres, MySQL, SQLite et Snowflake.
*   **Couche Sémantique** : Création de Datasets virtuels avec métriques (agrégations) et dimensions.
*   **Dynamic Querying** : Filtrage, tri, pagination et granularité temporelle automatique.
*   **Write-back** : Formulaires de saisie pour modifier des données sources spécifiques.

### B. Sécurité & Gouvernance
*   **Implicit RLS** : Filtrage automatique basé sur le profil utilisateur.
*   **RBAC** : Gestion des rôles (Admin, Manager, Viewer) et des permissions par dataset.
*   **Audit Trail** : Historique complet des actions (lecture/écriture).

### C. Automatisation & Performance
*   **Alerting** : Déclenchement d'alertes sur seuils de métriques.
*   **Reporting** : Envoi planifié de dashboards par mail.
*   **Caching** : Mise en cache Redis pour les requêtes répétitives.

## 3. Spécifications Techniques

### A. Stack Technologique (Backend)
*   **Langage** : Python 3.11+
*   **Framework API** : FastAPI
*   **Manipulation de Données** : Polars / Pandas
*   **Drivers Base de Données** : SQLAlchemy (Core) + Drivers natifs (psycopg2, pymysql).
*   **Templating** : Jinja2 (pour les requêtes dynamiques).
*   **Cache / Queue** : Redis + Celery (pour les alertes/reports).

### B. Architecture logicielle (Clean Architecture)
*   **Domain-Driven Design (DDD)** : Séparation claire entre les entités métier (le quoi) et l'infrastructure (le comment).
*   **Plugin Engine** : Utilisation de `entry_points` Python ou d'un système de chargement dynamique pour les extensions tiers.

## 4. Contraintes & Performances
*   **Latence de Requête** : < 500ms pour la traduction DSL vers SQL.
*   **Sécurité** : 100% des requêtes doivent passer par le middleware RLS.
*   **Extensibilité** : Ajout d'un nouveau connecteur sans modifier le code source du Kernel.

## 5. Livrables
1.  API Backend Documentée (Swagger/OpenAPI).
2.  Système de Plugins fonctionnel.
3.  Tableau de bord de diagnostic (Logs & Bugs).
