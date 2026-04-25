# 📂 Structure du Code : Architecture Clean & Scalable

Cette structure est conçue pour permettre à une équipe de plusieurs développeurs de travailler simultanément sans conflits, tout en facilitant le passage d'un monolithe vers des microservices réels.

## 1. Hiérarchie Globale du Projet

```text
/bi-plateforme-backend
│
├── /services               # Répertoire des Microservices
│   ├── /identity-svc       # Gestion des utilisateurs et RLS
│   ├── /query-svc          # Le Cœur : Traduction DSL -> SQL
│   ├── /metadata-svc       # Définition des Datasets et Métriques
│   ├── /action-svc         # Alertes, Reports et Write-back
│   └── /gateway-svc        # Point d'entrée unique (Orchestrateur)
│
├── /shared                 # Code partagé entre les services
│   ├── /models             # Schémas Pydantic communs
│   ├── /utils              # Logging, Crypto, Time helpers
│   └── /events             # Définitions des messages Kafka/RabbitMQ
│
├── /plugins                # Extensions dynamiques
│   ├── /drivers            # Dialectes SQL (Postgres, Snowflake...)
│   └── /custom-viz         # Logiques de calcul spécifiques
│
├── /infrastructure         # Configuration globale
│   ├── /docker             # Dockerfiles et Docker Compose
│   └── /k8s                # Manifestes Kubernetes
│
└── /documentation          # Spécifications et Architecture
```

## 2. Structure interne d'un Microservice (DDD)

Chaque dossier dans `/services` (ex: `query-svc`) suit cette organisation :

```text
/query-svc
├── /src
│   ├── /api                # Couche d'exposition (Controllers, Routes)
│   │   └── v1/             # Versioning de l'API
│   │
│   ├── /domain             # Cœur métier (Le "Quoi")
│   │   ├── /entities       # Modèles métier purs
│   │   ├── /services       # Logique de traitement complexe
│   │   └── /exceptions     # Erreurs spécifiques au domaine
│   │
│   ├── /infrastructure     # Détails techniques (Le "Comment")
│   │   ├── /repository     # Accès aux bases de données
│   │   ├── /clients        # Appels vers d'autres microservices
│   │   └── /cache          # Logique Redis locale
│   │
│   └── main.py             # Point d'entrée du service
│
├── /tests                  # Tests unitaires et d'intégration
├── Dockerfile              # Containerisation du service
└── requirements.txt        # Dépendances spécifiques
```

## 3. Pourquoi cette structure est-elle Scalable ?

1.  **Indépendance** : Vous pouvez réécrire le `query-svc` en Rust sans toucher à l' `identity-svc` en Python.
2.  **Partage intelligent** : Le dossier `/shared` garantit que tous les services parlent le même langage (mêmes schémas de données).
3.  **Extensibilité** : Pour ajouter une base de données (ex: ClickHouse), on n'ouvre pas le code du `query-svc`. On ajoute simplement un dossier dans `/plugins/drivers`.
4.  **Déploiement flexible** : On peut déployer toute la plateforme sur une seule machine pour le développement, ou sur 1000 serveurs en production.

---
*Cette organisation est le standard des plateformes SaaS modernes.*
