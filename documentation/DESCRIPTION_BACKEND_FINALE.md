# 📑 Description Complète du Backend BI-Plateforme

## 🏛️ Architecture Clean & DDD
Le backend est structuré suivant les principes de la **Clean Architecture**, séparant strictement les responsabilités métier de l'infrastructure technique.

### Modules Principaux :
*   **Core** : Contient le noyau (`Kernel`), la configuration globale, le gestionnaire de plugins et le moteur de sécurité RLS/RBAC.
*   **Domain** : Définit les entités métier (Schemas) et les services sémantiques (Datasets, Auth, Query Logic).
*   **Infrastructure** : Gère les implémentations concrètes (Drivers SQL, Base de données, Cache Redis).
*   **API** : Expose les endpoints FastAPI sécurisés et documentés.

---

## 🚀 Fonctionnalités Clés du Moteur

### 1. Multi-Dialectes SQL (Drivers)
Support natif de plusieurs moteurs grâce à une couche d'abstraction des dialectes :
*   **SQLite** : Dialecte par défaut pour le développement.
*   **Postgres** : Support des fonctions avancées comme `DATE_TRUNC`.
*   **Extensibilité** : Nouveau dialecte ajoutable via plugin en implémentant `BaseDialect`.

### 2. Intelligence Dynamique (Jinja2)
Le Query Engine traite les métriques et colonnes calculées comme des templates Jinja2.
*   **Paramètres Dynamiques** : Passage de variables depuis l'UI vers le SQL.
*   **Contexte Utilisateur** : Injection directe des attributs de profil dans les formules SQL.

### 3. "Implicit RLS" (Sécurité Sémantique)
Sécurisation automatique des données sans configuration manuelle :
*   Correspondance automatique entre les attributs utilisateur (ex: `region`) et les tags de colonnes (`security_scope`).
*   Support des jokers (`*`) pour les accès globaux et des listes pour les accès multi-périmètres.

### 4. Écosystème de Plugins
Le `PluginManager` permet aux développeurs d'étendre la plateforme :
*   **Chargement Dynamique** : Les modules dans `/plugins` sont chargés au démarrage.
*   **Hooks Système** : Points d'ancrage pour intervenir dans le cycle de vie des requêtes.

---

## 🛠️ Stack Technique
*   **Langage** : Python 3.12
*   **Framework** : FastAPI + Pydantic v2
*   **Moteur Sémantique** : Jinja2
*   **Données** : Pandas (pour le processing local) + SQLAlchemy Core
*   **Logs** : Système de logging structuré avec contexte utilisateur.

---
*Ce backend constitue le socle haute performance et sécurisé de la BI-Plateforme.*
