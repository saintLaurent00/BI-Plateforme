# 📊 BI-Plateforme : Moteur Analytique Modulaire

## 🎯 Architecture

Plateforme analytique complète composée de 5 modules principaux :

1. **gateway-auth-go** : Authentification (Local, LDAP, SSO) + JWT
2. **metadata-semantic-go** : Graphe sémantique BI + Permissions (RLS)
3. **query-engine-rust** : Moteur SQL dynamique + Pushdown + Cache
4. **orchestrator-sync-rust** : Tâches de fond (snapshot, reporting)
5. **dbt-models** : Transformations et métadonnées BI

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose
- Go 1.20+
- Rust 1.70+
- Node.js (optionnel, pour la UI)

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/saintLaurent00/BI-Plateforme.git
cd BI-Plateforme

# 2. Démarrer les services d'infrastructure
docker compose up -d

# 3. Vérifier que tout est opérationnel
docker compose ps
```

### Vérification de l'Infrastructure

```bash
# PostgreSQL
psql -h localhost -U postgres -c "SELECT version();"

# Valkey
valkey-cli ping

# MailDev
curl http://localhost:1080/api/emails
```

## 📋 Plan de Construction

Voir l'issue **#1** pour le tableau de suivi complet de toutes les tâches (0% → 100%).

### Étapes

- **Étape A** : Infrastructure & Configuration (IDs 01-02)
- **Étape B** : Passerelle Sécurité & IAM (IDs 03-07)
- **Étape C** : Métadonnées & Graphe Sémantique (IDs 08-09)
- **Étape D** : Moteur Analytique Rust (IDs 10-12)
- **Étape E** : Tâches de Fond & Reporting (IDs 13-14)

## 🔧 Configuration

### Variables d'Environnement

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/bi-db?sslmode=disable
REDIS_URL=valkey://localhost:6379
JWT_SECRET=your-secret-key
MAIL_PROVIDER=smtp
MAIL_FROM=noreply@bi-plateforme.local
```

## 📚 Documentation

- [Architecture détaillée](./docs/ARCHITECTURE.md)
- [API Référence](./docs/API.md)
- [Guide de Contribution](./CONTRIBUTING.md)

## 📄 Licence

MIT - Voir [LICENSE](./LICENSE)
