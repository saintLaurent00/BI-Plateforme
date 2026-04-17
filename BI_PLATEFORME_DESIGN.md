# BI-Plateforme : Conception du Système

## 1. Vision du Produit
BI-Plateforme n'est pas un simple outil de tableau de bord. C'est un système d'intelligence d'entreprise **centré sur l'humain**, conçu pour offrir des réponses instantanées avec une complexité minimale.

## 2. Architecture du Système

### Backend : Query Intelligence Engine (FastAPI)
Le backend dépasse le simple CRUD pour devenir un moteur de traduction sémantique.
- **Modèle de Données (Schemas)** : Définit les entités BI (Datasets, Metrics, Dimensions) indépendamment de la structure physique des tables.
- **QueryBuilder** : Classe coeur qui traduit les requêtes logiques (ex: "total_amount by category") en SQL sécurisé et optimisé.
- **InsightGenerator** : Analyse les résultats de requêtes en temps réel pour extraire des observations actionnables via des heuristiques et de l'IA.
- **Abstraction Layer** : Les utilisateurs interagissent avec des métriques nommées, pas avec des colonnes SQL.

### Frontend : Guided BI Experience (React + Vite)
L'interface est conçue pour réduire la charge cognitive.
- **Guided Chart Builder** : Un flux en 3 étapes (Source -> Mesure -> Segmentation) qui garantit l'obtention d'un résultat en moins de 60 secondes.
- **Simple Dashboard Builder** : Un canvas intuitif où les briques d'intelligence sont assemblées par simple sélection, avec un retour visuel immédiat.
- **Motion System (anime.js)** : Les animations ne sont pas décoratives mais servent à :
    - Expliquer les transitions d'état.
    - Guider l'attention vers les nouveaux insights.
    - Rendre l'expérience fluide et "vivante".

## 3. Flux Utilisateur Core
1. **Empathie** : L'utilisateur arrive sur un briefing Kwaku personnalisé.
2. **Idéation** : L'utilisateur souhaite explorer une tendance -> BI Builder.
3. **Prototype** : Choix rapide de la métrique et dimension -> Visualisation instantanée + Insights IA.
4. **Validation** : Ajout au Dashboard Intelligence en un clic.

## 4. Sécurité et Performance
- **Isolation SQL** : Aucune chaîne SQL n'est exposée ou manipulée par l'utilisateur final.
- **Aggrégations Ciblées** : Les requêtes générées utilisent systématiquement des GROUP BY pour minimiser le transfert de données.
- **Cache Sémantique** : Structure prête pour une mise en cache basée sur les entités logiques.
