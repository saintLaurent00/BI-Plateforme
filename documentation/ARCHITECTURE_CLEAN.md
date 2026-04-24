# 🏗️ Architecture "Clean" & Documentation des Modules

## 1. Structure du Projet (DDD)
Le projet est organisé pour favoriser la modularité et l'extensibilité.

```text
backend/
├── app/
│   ├── core/               # Le Noyau (Kernel)
│   │   ├── plugins/        # Plugin Manager
│   │   ├── security/       # RLS & RBAC Engine
│   │   └── config.py
│   ├── domain/             # Logique Métier (Semantic Layer)
│   │   ├── datasets/       # Entités et Services Datasets
│   │   ├── query/          # Query Logic & DSL
│   │   └── auth/           # Identity & Profiles
│   ├── infrastructure/     # Implémentations techniques
│   │   ├── database/       # DB Context & Repository
│   │   ├── drivers/        # Drivers SQL natifs
│   │   └── cache/          # Redis Integration
│   ├── api/                # Points d'entrée (Endpoints)
│   └── worker/             # Background Tasks (Alerts, Reports)
├── plugins/                # Répertoire des plugins externes
└── tests/                  # Tests d'intégration et unitaires
```

## 2. Documentation des Modules

### 🛡️ Module : Auth & Security
*   **Rôle** : Garantir que chaque accès est légitime.
*   **Fonction Clé** : `apply_rls(query, user_context)`.
*   **Principe** : Injecte des filtres invisibles basés sur les attributs du profil utilisateur.

### 🧠 Module : Semantic Layer (Metadata Service)
*   **Rôle** : Transformer la technique en métier.
*   **Fonction Clé** : `resolve_metric(metric_name)`.
*   **Principe** : Mappe les noms conviviaux aux expressions SQL complexes et gère les relations.

### ⚡ Module : Query Engine (Multi-Dialect)
*   **Rôle** : Parler toutes les langues SQL.
*   **Fonction Clé** : `compile(request)`.
*   **Principe** : Utilise des classes de dialectes interchangeables pour générer le SQL optimal.

### 🔌 Module : Plugin Engine
*   **Rôle** : Ouvrir la plateforme au monde.
*   **Fonction Clé** : `load_plugins()`, `call_hook(name)`.
*   **Principe** : Découverte dynamique de modules et gestion des points d'extension.

### 📝 Module : Write-back & Actions
*   **Rôle** : Permettre l'interaction bidirectionnelle.
*   **Fonction Clé** : `execute_action(action_id, data)`.
*   **Principe** : Formulaires dynamiques avec validation forte et journalisation d'audit.

---
*Cette structure assure que chaque développeur peut modifier une partie sans impacter les autres.*
