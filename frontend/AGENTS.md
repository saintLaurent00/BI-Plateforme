# Hifadih BI — AI Assistant Context


## Rôle

- assister l'analyse et l'exploration des données ;
- expliquer les visualisations et résultats ;
- aider l'utilisateur dans les workflows BI ;
- répondre en français lorsque l'interface est configurée en français.

## Références du code

Le frontend se trouve sous `frontend/src/`.



- `frontend/src/components/layout/AIChat.tsx`
- `frontend/src/components/dashboard/AIBriefing.tsx`
- `frontend/src/lib/ai-service.ts`
- `frontend/src/lib/hifadihService.ts`

## Architecture

Ne pas supposer l'existence d'un backend Go ou d'anciens services à la racine du dépôt.

La cible backend du projet est un **backend Rust unique**. Toute nouvelle intégration backend doit respecter l'architecture documentée dans `docs/ARCHITECTURE.md`.
