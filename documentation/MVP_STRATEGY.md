# 🚀 BI-Plateforme : Roadmap & Philosophie MVP

Ce document définit la vision pragmatique de la **MVP** (Minimum Viable Product) de la BI-Plateforme, axée sur le contrôle et la puissance.

---

## 1. La Philosophie MVP : "SQL-First, Control-First"
Contrairement à la vision cible qui mise sur l'abstraction totale, la MVP reconnaît que les premiers utilisateurs sont souvent des experts qui ont besoin de précision.

*   **Priorité 1** : Contrôle manuel total via le **SQL Lab**.
*   **Priorité 2** : Sécurité garantie (RLS) sans effort, même en manuel.
*   **Priorité 3** : Performance via le caching intelligent.

---

## 2. Les Modules de la MVP

### A. SQL Lab (Le Cœur)
L'interface principale pour créer de la valeur. L'utilisateur écrit son SQL, et le backend s'occupe de l'isoler et de le sécuriser.
*   *Fonctionnalité clé* : Exécution directe, prévisualisation des données, wrapping RLS.

### B. Moteur de Sécurité (Invisible mais Actif)
Le backend n'exécute jamais le SQL de l'utilisateur "tel quel". Il l'enveloppe systématiquement dans une couche de sécurité :
```sql
SELECT * FROM ( [USER_SQL] ) AS mvp_wrapped WHERE [RLS_CLAUSES]
```

### C. Prism Meta (Fondation)
Stockage des définitions techniques et des attributs utilisateurs pour piloter la sécurité et le scheduling.

---

## 3. Évolutions Post-MVP (V2)
Une fois la base SQL solide et adoptée, nous introduirons :
*   **Guided Intelligence** : La traduction du langage naturel en SQL (Wizard).
*   **Visual Query Builder** : Sélection de champs en Drag & Drop.
*   **Auto-Insights** : Détection automatique d'anomalies via IA.

---
*BI-Plateforme MVP : La puissance brute, la sécurité en plus.*
