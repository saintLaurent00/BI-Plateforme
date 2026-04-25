# 🛡️ Fiche Descriptive Complète : BI-Plateforme Backend (Prism Hub)

Ce document constitue la synthèse finale de l'architecture et des fonctionnalités du backend de la BI-Plateforme. Il sert de guide de référence pour le développement, le déploiement et l'extension du système.

---

## 1. Vision et Philosophie
BI-Plateforme est un système d'intelligence d'affaires **"Domain-Driven"** conçu pour éliminer la complexité technique pour les utilisateurs finaux.
*   **Simplicité Radicale** : Pas de SQL pour l'utilisateur, que du langage métier.
*   **Sécurité Native** : Sécurisation automatique par le contexte (Implicit RLS).
*   **Extensibilité Totale** : Architecture "Noyau & Plugins" pour une personnalisation sans limites.

---

## 2. Architecture Système (Microservices Scalables)
Le backend est décomposé en services autonomes orchestrés pour une scalabilité horizontale infinie.

### Composants Clés :
*   **Gateway Service** : Point d'entrée unique et routage intelligent.
*   **Identity Service** : Gestion des profils, sessions et attributs de sécurité.
*   **Metadata Service** : Le cerveau sémantique (définition des Datasets, Métriques, Scopes).
*   **Query Intelligence Service** : Le moteur de traduction DSL -> SQL agnostique.
*   **Action Service** : Gestionnaire de Write-back (écriture), Alertes et Rapports.

---

## 3. Structure du Code et Organisation (DDD)
Le projet suit les principes de la **Clean Architecture** et du **Domain-Driven Design**.

*   **/services** : Isolation des microservices.
*   **/shared** : Partage des schémas Pydantic et utilitaires communs.
*   **/plugins** : Répertoire dynamique pour les drivers (Postgres, Snowflake...) et calculs spécifiques.
*   **Organisation interne par service** : `api/` (Entrée), `domain/` (Métier Pur), `infrastructure/` (Technique).

---

## 4. Le Moteur d'Intelligence (Query Engine)
Une machine de calcul puissante et flexible :
*   **Multi-Dialectes SQL** : Support natif de SQLite, Postgres, MySQL, Snowflake, etc. via une abstraction `BaseDialect`.
*   **Jinja2 Templating** : Permet l'injection de paramètres dynamiques et du contexte utilisateur directement dans les expressions de métriques.
*   **Multi-filtres complexes** : Gestion récursive des logiques AND/OR imbriquées.
*   **Granularité Temporelle** : Transformation automatique des dates (Mois, Trimestre, Année) selon le moteur SQL.

---

## 5. Sécurité : "Semantic Security"
*   **Implicit RLS (Row Level Security)** : Injection automatique de clauses `WHERE` en faisant correspondre les attributs utilisateur (ex: `region`) avec les colonnes tagguées dans le Metadata Service.
*   **Support Hiérarchique** : Gestion des accès "Superviseur" via des jokers (`*`) et des listes de valeurs.
*   **RBAC Global** : Contrôle granulaire des permissions au niveau du Dataset et de la fonctionnalité.
*   **Audit Trail** : Journalisation structurée de chaque action de lecture et d'écriture incluant le contexte utilisateur complet.

---

## 6. Performance et Proactivité
*   **Système de Caching Multi-niveaux** :
    *   *Backend* : Cache Redis basé sur le hash de la requête logique + contexte utilisateur.
    *   *Frontend* : Cache local pour les manipulations d'UI instantanées.
*   **Alerting Engine** : Surveillance en temps réel des métriques avec notifications (Slack, Mail, Webhook).
*   **Reporting Scheduler** : Génération et envoi automatisé de rapports (PDF/CSV) à intervalles réguliers.

---

## 7. Interaction Bidirectionnelle (Write-back)
*   **Formulaires Dynamiques** : Saisie de données (budgets, corrections) directement depuis l'interface BI.
*   **Validation & Sécurité** : Vérification stricte des types et droits d'écriture avec historique de modifications.

---

## 8. Déploiement et Ops
*   **Containerisation** : Dockerisation de chaque microservice (images légères Python 3.12).
*   **Orchestration** : Support complet de Kubernetes (Deployments, HPA, Ingress).
*   **Observabilité** : Logs structurés JSON centralisables (ELK/Grafana) pour un diagnostic instantané.

---
*BI-Plateforme : Le moteur d'intelligence qui parle votre langue métier.*
