# 📘 Documentation Globale du Backend : BI-Plateforme (Prism Hub)

## 1. Introduction
BI-Plateforme est un système d'intelligence d'affaires (BI) conçu pour être le pont entre des sources de données complexes et des utilisateurs métier. Son architecture repose sur une séparation stricte entre la couche d'exécution (données) et la couche d'intelligence (métadonnées), le tout enveloppé dans un écosystème extensible par plugins.

## 2. Architecture de Haut Niveau
Le système adopte une architecture **Microservices / Modulaire** centrée sur un **Noyau (Kernel)** extensible.

### Composants Principaux :
1.  **Identity Service (Auth Core)** :
    *   Gère l'authentification et les sessions.
    *   Porte les attributs de sécurité (`security_attributes`) pour le filtrage automatique (RLS).
2.  **Metadata Service (Semantic Layer)** :
    *   Stocke les définitions des Datasets, Métriques et Dimensions.
    *   Gère les relations entre entités et le "Semantic Tagging" pour la sécurité.
3.  **Query Engine (The Intelligence Engine)** :
    *   Reçoit des requêtes logiques (DSL).
    *   Compile ces requêtes via Jinja2 et des Dialectes spécifiques (Postgres, SQLite, etc.).
    *   Injecte silencieusement le RLS Implicite.
4.  **Plugin System (Kernel)** :
    *   Permet l'extension dynamique des connecteurs et des fonctionnalités.
    *   Gère les hooks et les overrides de fonctions système.
5.  **Performance Layer (Cache)** :
    *   Cache de résultats (Redis) basé sur un hash contextuel (Requête + Utilisateur).
6.  **Action Service (Write-back & Alerts)** :
    *   Gère les écritures sécurisées et les formulaires.
    *   Planifie et exécute les alertes proactives.

## 3. Flux de Données (Cycle d'une Requête)
1.  **Request** : Le frontend envoie une requête logique (ex: `{metric: "total_sales", group: "month"}`).
2.  **Contextualize** : Le backend récupère l'utilisateur et ses attributs de sécurité.
3.  **Validate** : Le Metadata Service vérifie les permissions d'accès au dataset.
4.  **Compile** : Le Query Engine transforme le DSL en SQL, injecte le RLS, et applique le templating Jinja2.
5.  **Execute** : Le Driver Manager sélectionne la bonne connexion et exécute le SQL.
6.  **Analyze** : (Optionnel) Le moteur d'insights analyse les résultats.
7.  **Respond** : Les données sont renvoyées et mises en cache.

## 4. Principes de Développement pour Tiers
*   **Agnosticisme** : Le système doit pouvoir fonctionner avec n'importe quelle source SQL ou NoSQL via un driver.
*   **Immuabilité du Core** : Les développeurs ne modifient pas le noyau, ils utilisent des plugins pour étendre les capacités.
*   **Sécurité Native** : Aucune donnée ne sort du système sans avoir été passée au filtre du RLS automatique.

---
*Cette documentation est la base de référence pour le développement de BI-Plateforme.*
