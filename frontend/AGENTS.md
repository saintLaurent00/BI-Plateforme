# Hifadih BI — Frontend Context

Le frontend se trouve sous `frontend/src/`.

- `frontend/src/lib/hifadihService.ts`

## Architecture

Le frontend est actuellement autonome côté navigateur. Ne pas supposer l'existence d'un backend ou d'un service distant pour implémenter une fonctionnalité frontend.

La cible backend du projet est un **backend Rust unique**. Toute nouvelle intégration backend doit respecter l'architecture documentée dans `docs/ARCHITECTURE.md`.
