# Frontend Page Audit — BI-Plateforme

Date de l'audit : 2026-10-16  
Branche : `main`

## Portée et méthode

Cet inventaire est basé sur les routes déclarées, les points d'entrée des features et l'arborescence frontend. Il s'agit d'un audit statique : une route ou un composant présent ne signifie pas que le parcours métier a déjà été testé en exécution. Les pages seront validées individuellement pendant leur réalisation.

## Routes et vues déclarées

| Route | Vue / composant | Domaine | État initial |
|---|---|---|---|
| `/login` | `Login` | Identity | À valider fonctionnellement |
| `/` | `Home` | Dashboards | À valider fonctionnellement |
| `/dashboards` | `Dashboards` | Dashboards | À valider fonctionnellement |
| `/dashboards/:id` | `DashboardDetail` | Dashboards | À valider fonctionnellement |
| `/dashboard-editor` | `DashboardEditor` | Dashboards | À valider fonctionnellement |
| `/dashboard-editor/:id` | `DashboardEditor` | Dashboards | À valider fonctionnellement |
| `/charts` | `Charts` | Charts | À valider fonctionnellement |
| `/dataviz` | `DatavizLab` | Charts | À valider fonctionnellement |
| `/chart/add` | `ChartSelector` | Charts | À valider fonctionnellement |
| `/chart-editor` | `ChartEditor` | Charts | À valider fonctionnellement |
| `/chart-editor/:id` | `ChartEditor` | Charts | À valider fonctionnellement |
| `/sql-lab` | `SqlLab` | Exploration | Migration de l'export corrigée ; parcours à valider |
| `/datasets` | `DatasetsExplorer` | Datasets | À valider fonctionnellement |
| `/datasets/new` | `DatasetWizard` | Datasets | À valider fonctionnellement |
| `/datasets/new/physical` | `PhysicalDatasetWizard` | Datasets | À valider fonctionnellement |
| `/datasets/:id` | `Datasets` (détail) | Datasets | À valider fonctionnellement |
| `/datasets/edit/:id` | `PhysicalDatasetEdit` | Datasets | À valider fonctionnellement |
| `/admin` | `Admin` | Identity / Governance | À valider fonctionnellement |
| `/documentation` | `Documentation` | Documentation | À valider fonctionnellement |

## Constats prioritaires

1. **SQL Lab — point d'entrée canonique :** la route utilise maintenant `@/features/exploration`. L'export de `features/exploration/ui` pointe directement vers l'implémentation de la feature. `features/sqlLab` est conservé comme façade de compatibilité.
2. **Authentification :** `App.tsx` conserve actuellement l'état `isAuthenticated` dans l'état React local. Il est donc réinitialisé au rechargement. À remplacer ou connecter au mécanisme de session réel avant validation de production.
3. **Tests :** aucun fichier de test frontend `*.test.*` ou `*.spec.*` n'a été trouvé dans l'inventaire de `frontend/src`. Les scripts disponibles sont `lint` (contrôle TypeScript) et `build` (Vite).
4. **Compatibilité legacy :** des vues et services restent présents sous `services/` en plus de leurs emplacements `features/`. Il faut confirmer qu'il s'agit uniquement de façades avant toute suppression.
5. **Validation métier :** l'audit statique ne prouve pas encore le fonctionnement des sauvegardes, requêtes, filtres, éditeurs, permissions ou données réelles. Ces éléments doivent être testés page par page.

## Ordre de réalisation proposé

1. Layout, navigation et authentification
2. Accueil
3. Datasets : exploration, détails, création et édition
4. SQL Lab
5. Charts : liste, sélection, éditeur et visualisations
6. Dashboards : liste, détail et éditeur
7. Administration et permissions
8. Documentation et finitions transversales : états vides, chargement, erreurs, responsive design et accessibilité

## Critères de validation de chaque page

- Affichage et navigation corrects
- Actions et formulaires fonctionnels
- Données réelles ou limitation explicitement documentée
- États de chargement, succès, erreur et absence de données
- Gestion des permissions selon le parcours
- Vérification responsive
- TypeScript et build de production réussis
- Tests du parcours ajoutés dès qu'ils sont disponibles

## Statut

L'inventaire des routes et les premiers constats sont documentés. **Aucune page n'est déclarée terminée sur la seule base de cet audit statique.** La suite est la réalisation et la validation fonctionnelle, vue par vue.
