# Hifadih BI — Frontend Context

Le frontend se trouve sous `frontend/src/`.

## Architecture

Le frontend suit une architecture **Business Services / Modular Monolith**.

- `services/` contient les capacités métier.
- `platform/` contient les mécanismes techniques : routing, persistance locale/SQLite et runtime.
- `ui/` contient uniquement les primitives de présentation génériques.
- `frontend/plugins/` contient les packages de visualisation ; leur registre public appartient au service `visualization`.

Les anciens répertoires techniques `app/`, `pages/`, `features/`, `domain/`, `infrastructure/`, `core/` et `lib/` ne font plus partie de l'architecture active.

Les dépendances inter-services doivent passer par l'API publique du service propriétaire, par exemple :

```ts
import { ChartQuery } from '@/services/query';
import { DatasetMetadata } from '@/services/data';
```

Ne pas réintroduire une façade métier globale dans `platform/`.

La cible backend du projet est un **backend Rust**. Toute nouvelle intégration backend doit respecter `docs/ARCHITECTURE.md`.
