# 🤝 Guide de Contribution

## Workflow de Développement

### Avant de Coder

1. Vérifier le tableau de suivi dans l'issue de planification
2. S'assurer que la dépendance bloquante est complétée
3. Ouvrir une branche : `git checkout -b feat/ID-XX-description`

### Pendant le Développement

- **Chaque fichier = une unité atomique testable**
- Tests requis pour chaque module
- Commits granulaires avec message descriptif
- Push des changements régulièrement

### Tests

```bash
# Tests Go
cd gateway-auth-go && go test ./...
cd ../metadata-semantic-go && go test ./...

# Tests Rust
cd ../query-engine-rust && cargo test
cd ../orchestrator-sync-rust && cargo test
```

### Pull Request

1. Référencer l'ID de tâche : "Closes #XX"
2. Décrire brièvement les changements
3. Marquer comme draft si incomplet
4. Attendre la review avant merge

## Structure des Répertoires

```
BI-Plateforme/
├── platform_config.go           # Configuration centrale
├── docker-compose.yml           # Infrastructure
├── gateway-auth-go/             # Authentification
│   ├── ent/                     # Schémas DAO
│   ├── internal/auth/           # Logique auth
│   └── cmd/                     # Point d'entrée
├── metadata-semantic-go/        # Métadonnées BI
│   ├── ent/                     # Schémas DAO
│   ├── internal/permission/     # Validateur RLS
│   └── cmd/
├── query-engine-rust/           # Moteur SQL
│   ├── src/parser/              # Template + RLS + AST
│   ├── src/executor/            # Pushdown
│   └── Cargo.toml
├── orchestrator-sync-rust/      # Tâches de fond
│   ├── src/renderer/            # Snapshots
│   ├── src/mailing/             # Dispatcher
│   └── Cargo.toml
└── dbt-models/                  # Transformations
```

## Checklist de Validation

- [ ] Code compilable sans erreur
- [ ] Tests unitaires passants
- [ ] Aucune variable d'environnement orpheline
- [ ] Documentation à jour (docstrings, README)
- [ ] Tableau de suivi mis à jour (PR description)

## Questions?

Ouvrire une issue avec le label `question` ou discuter dans les discussions.
