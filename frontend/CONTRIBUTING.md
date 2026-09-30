# Guide de contribution

## Structure

```text
BI-Plateforme/
├── docs/                  # Documentation
├── frontend/              # Application React/TypeScript
│   ├── src/
│   ├── plugins/           # Registre des plugins
│   ├── package.json
│   └── vite.config.ts
└── plugins/               # Packages de visualisation
    └── plugin-chart-*/
```

## Workflow

1. Lire le [README](../README.md).
2. Consulter `docs/ARCHITECTURE.md` et `docs/ROADMAP.md`.
3. Créer une branche dédiée :
   ```bash
   git checkout -b feat/description
   ```
4. Modifier uniquement le périmètre nécessaire.
5. Vérifier le frontend :
   ```bash
   cd frontend
   npm install
   npm run lint
   npm run build
   ```
6. Documenter les changements qui affectent l'architecture ou les contrats.
7. Ouvrir une Pull Request avec une description claire.

## Plugins

Les packages de visualisation indépendants sont dans `/plugins`. Le registre utilisé par l'application est dans `/frontend/plugins`.

Les plugins sont consommés directement par le code frontend via leurs sources TypeScript. Ils ne constituent pas actuellement un workspace npm du frontend.

## Backend Rust

Le backend Rust n'est pas encore présent dans l'arborescence active. Lorsqu'il sera introduit, son organisation devra suivre l'architecture documentée avant d'ajouter de nouveaux services.

## Checklist

- [ ] Le code compile.
- [ ] `npm run lint` passe.
- [ ] `npm run build` passe.
- [ ] Les variables d'environnement nécessaires sont documentées.
- [ ] La documentation est à jour si nécessaire.
- [ ] Aucun fichier généré ou secret n'est ajouté au dépôt.
