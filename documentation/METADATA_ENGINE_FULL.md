# 🛡️ Fiche Descriptive : BI-Plateforme Metadata Engine (Prism Meta)

Ce document détaille l'architecture de la **Méta Base de Données**, le cerveau central de la BI-Plateforme qui orchestre l'identité, la sémantique et la proactivité.

---

## 1. La Méta DB : Le Cœur du Système
Contrairement aux outils BI classiques, BI-Plateforme n'utilise pas de fichiers de configuration statiques. Tout est piloté par une base de données de métadonnées relationnelle (`prism_meta.db`).

### Piliers de la Méta DB :
*   **Identity Store** : Utilisateurs, Rôles, Groupes et Permissions (RBAC).
*   **Semantic Store** : Datasets, Colonnes calculées, Métriques sémantiques.
*   **Security Store** : Attributs RLS (Row Level Security) rattachés aux profils.
*   **Ops Store** : Tâches planifiées (Scheduler), Alertes et Politiques de Cache.

---

## 2. Architecture de l'Identité & Sécurité
Le système implémente une sécurité multicouche nativement intégrée au moteur de requête.

### RBAC (Role-Based Access Control)
*   **Modèles** : `UserModel`, `RoleModel`, `PermissionModel`.
*   **Fonctionnement** : Chaque utilisateur possède un rôle qui lui confère une liste de permissions granulaires (ex: `read:datasets`, `write:dashboards`).

### RLS Sémantique (Row Level Security)
*   **Attributs de Profil** : Les utilisateurs possèdent des attributs JSON (ex: `{"region": "Sud"}`).
*   **Injection Automatique** : Le moteur de query interroge la Méta DB pour récupérer ces attributs et injecte dynamiquement les clauses `WHERE` correspondantes.
*   **Support Hiérarchique** : Gestion des jokers `*` pour les administrateurs et directeurs.

---

## 3. Moteur de Sémantique Dynamique
Les jeux de données ne sont plus des tables brutes mais des entités BI enrichies.
*   **Calculated Fields** : Définis en SQL dans la Méta DB, compilés à la volée.
*   **Metrics Engine** : Centralisation des formules de calcul (SUM, AVG, etc.) pour garantir une "Single Source of Truth" (SSOT) à travers toute l'organisation.

---

## 4. Proactivité & Performance
*   **Scheduler DB-Driven** : Les alertes et rapports sont stockés dans la table `scheduled_jobs`. Le worker synchronise son état avec la base de données.
*   **Cache Policies** : Le TTL (Time To Live) et les stratégies de mise en cache sont configurables par dataset directement via les métadonnées.

---

## 5. Flux de Données Technique
1.  **Auth** : L'API valide l'utilisateur via `UserModel`.
2.  **Schema Resolution** : Le service récupère la définition du dataset (colonnes/métriques) via `DatasetModel`.
3.  **Security Context** : Les attributs RLS sont extraits du profil utilisateur.
4.  **Query Generation** : Le QueryBuilder assemble le SQL final en combinant toutes ces sources.
5.  **Execution** : La requête est exécutée sur la base analytique, avec passage par le Cache Manager.

---
*Prism Meta : L'intelligence qui structure vos données.*
