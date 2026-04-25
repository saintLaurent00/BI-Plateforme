# 🐳 Stratégie de Déploiement & Containerisation

Pour garantir la portabilité et la scalabilité de l'architecture microservices de BI-Plateforme, nous adoptons une approche **Container-First**.

## 1. Structure Docker
Chaque microservice possède son propre `Dockerfile` optimisé pour la production.

*   **Image de base** : `python:3.12-slim` (pour la légèreté et la sécurité).
*   **Multi-stage build** : Séparation des dépendances de build et du runtime final.
*   **Utilisateur non-root** : Chaque container s'exécute avec des privilèges restreints.

## 2. Orchestration (Kubernetes / K8s)
Le déploiement est piloté par Kubernetes pour assurer la haute disponibilité.

### Composants K8s :
*   **Deployments** : Gèrent les réplicas de chaque service (ex: `query-intelligence-deployment`).
*   **Horizontal Pod Autoscaler (HPA)** : Ajuste le nombre d'instances en fonction de l'utilisation CPU/Mémoire.
*   **Services & Ingress** : Gèrent l'équilibrage de charge et l'exposition des APIs.
*   **ConfigMaps & Secrets** : Centralisent la configuration et les clés de sécurité.

## 3. Stack d'Infrastructure (Auto-hébergé ou Cloud)
*   **Service de Message** : Cluster Redis pour le cache et RabbitMQ/Kafka pour les tâches asynchrones.
*   **Persistance** : Instances PostgreSQL managées pour les métadonnées.
*   **Registre d'Images** : Docker Hub ou registre privé (ex: AWS ECR, GCP GCR).

## 4. Pipeline CI/CD
1.  **Build** : Test unitaires et construction des images Docker à chaque commit.
2.  **Scan** : Analyse des vulnérabilités dans les images.
3.  **Push** : Envoi des images validées vers le registre.
4.  **Deploy** : Mise à jour automatique des déploiements K8s via Helm ou Kustomize.

---
*Cette stratégie permet de déployer BI-Plateforme aussi bien "On-Premise" que sur n'importe quel fournisseur Cloud (AWS, Azure, GCP).*
