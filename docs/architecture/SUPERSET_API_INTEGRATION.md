# Intégration Apache Superset

## Cible

La branche `refonte/pages-superset` est un frontend React/TypeScript connecté directement à Apache Superset **6.1.0 ou supérieur**. Aucun backend applicatif intermédiaire n'est ajouté.

## Configuration locale

Créer `frontend/.env.local` à partir de `frontend/.env.example` :

```env
VITE_SUPERSET_URL=http://localhost:8088
```

Cette variable contient uniquement l'URL de base de l'instance, sans `/api/v1`. Redémarrer Vite après modification.

## Client commun

Le client HTTP est dans `frontend/src/platform/api/superset-client.ts`. Il centralise :
- l'URL de l'instance ;
- l'en-tête JWT Bearer ;
- les réponses et erreurs HTTP ;
- le renouvellement du JWT ;
- la récupération et l'envoi du jeton CSRF pour les écritures.

Les jetons sont conservés dans `sessionStorage` pour limiter leur durée de vie au contexte de l'onglet. Ils ne doivent jamais être codés en dur.

## Services branchés sur les API Superset

| Fonctionnalité | Endpoints utilisés |
| --- | --- |
| Authentification | `POST /api/v1/security/login`, `POST /api/v1/security/refresh` |
| Dashboards | `GET/POST/DELETE /api/v1/dashboard/`, `GET /api/v1/dashboard/{id}` |
| Charts | `GET /api/v1/chart/`, `GET /api/v1/chart/{id}`, `POST/PUT/DELETE /api/v1/chart/{id}`, `GET /api/v1/chart/{id}/data/` |
| Datasets | `GET/POST/DELETE /api/v1/dataset/`, `GET /api/v1/dataset/{id}` |
| Bases et tables | `GET /api/v1/database/`, `GET /api/v1/database/{id}/tables/`, `GET /api/v1/database/{id}/table/{table}/{schema}` |
| SQL Lab | `POST /api/v1/sqllab/execute/`, `GET/POST/PUT /api/v1/saved_query/` |

Les listes utilisent le format de pagination Rison attendu par les API de Superset. Les droits effectifs dépendent des rôles de l'utilisateur et de la configuration de l'instance.

## CORS et sécurité

Si le frontend et Superset ne partagent pas la même origine, configurer CORS dans Superset pour autoriser explicitement l'origine du frontend, les en-têtes `Authorization` et `Content-Type`, ainsi que les requêtes nécessaires au mécanisme CSRF. Ne jamais intégrer d'identifiants de service privilégiés dans le code client.

## État et limites à valider

Cette intégration est en cours de réalisation. Les listes et opérations indiquées ci-dessus doivent être testées sur une instance réelle de la version cible. Les fonctionnalités qui modifient la structure native d'un dashboard, la création de datasets virtuels, les détails de colonnes/métriques et les options spécifiques aux visualisations nécessitent encore une validation de compatibilité avec les schémas exacts de Superset. Ne pas considérer la branche comme validée en production avant un build TypeScript/Vite et des tests d'intégration sur une instance configurée.
