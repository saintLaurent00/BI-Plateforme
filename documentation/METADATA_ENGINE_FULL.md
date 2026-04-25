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
*   **Calculated Fields (SQL-Driven)** : Définis par les experts SQL dans la Méta DB. La complexité technique est encapsulée ici (ex: formules complexes, jointures implicites).
*   **Metrics Engine (Domain-Driven Interface)** : Exposition de la logique SQL sous forme de labels métiers compréhensibles. Cela garantit une "Single Source of Truth" (SSOT) : l'utilisateur consomme une intelligence validée, sans avoir à gérer la syntaxe SQL.

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

## 6. La Philosophie : "Expert-to-User"
Le système n'élimine pas le SQL, il le **centralise**.

1.  **L'Expert (Analyste/Data Engineer)** : Utilise toute la puissance du SQL dans la Méta DB pour définir les règles métiers.
2.  **L'Utilisateur (Manager/Décideur)** : Interagit avec une interface simplifiée qui traduit ses intentions en SQL optimisé.

Cette approche résout le paradoxe entre **liberté d'analyse** et **rigueur de gouvernance**.

### Exemple Concret :
| Entité | Ce que voit l'Utilisateur | Ce que l'Expert a configuré (SQL) |
| :--- | :--- | :--- |
| **Métrique** | "Marge Nette" | `SUM(total_sales * 0.8) - SUM(cost_basis)` |
| **Dimension** | "Catégorie Premium" | `CASE WHEN price > 1000 THEN 'Luxe' ELSE 'Standard' END` |
| **Filtre** | "Mes Données" | `WHERE region_id IN (SELECT id FROM regions WHERE manager_id = :user_id)` |

---
*Prism Meta : L'intelligence qui structure vos données.*
