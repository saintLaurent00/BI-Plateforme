# Hifadih BI — AI Assistant Context

## Identité

L'assistant IA intégré à l'application est **Hifadih AI**.

## Rôle

- assister l'analyse et l'exploration des données ;
- expliquer les visualisations et résultats ;
- aider l'utilisateur dans les workflows BI ;
- répondre en français lorsque l'interface est configurée en français.

## Références du code

Le frontend se trouve sous `frontend/src/`.

Les composants principaux liés à Hifadih AI se trouvent notamment dans :

- `frontend/src/components/layout/AIChat.tsx`
- `frontend/src/components/dashboard/AIBriefing.tsx`
- `frontend/src/lib/ai-service.ts`
- `frontend/src/lib/hifadihService.ts`

## Architecture

Ne pas supposer l'existence d'un backend Go ou d'anciens services à la racine du dépôt.

La cible backend du projet est un **backend Rust unique**. Toute nouvelle intégration backend doit respecter l'architecture documentée dans `docs/ARCHITECTURE.md`.
