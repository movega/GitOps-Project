#!/bin/bash

# Configuración
REPO_URL="https://github.com/movega/GitOps-Project"
DOCKER_USER="alvarovm95493"
CLUSTER_NAME="gitops-cluster"

echo "🚀 Iniciando Entorno GitOps (Modo Reparación)..."

# 1. Gestión del Clúster
if ! kind get clusters | grep -q "^$CLUSTER_NAME$"; then
    echo "🏗️ Creando nuevo clúster..."
    kind create cluster --name $CLUSTER_NAME
else
    echo "✅ El clúster ya existe."
    # Intentar arrancar si está detenido (Docker)
    docker start "${CLUSTER_NAME}-control-plane" 2>/dev/null || true
fi

echo "⏳ Esperando estabilidad del nodo..."
kubectl wait --for=condition=Ready node/${CLUSTER_NAME}-control-plane --timeout=60s

# 2. Namespaces
echo "Create namespaces..."
for ns in argocd dev test prod; do
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
done

# 3. Instalar ArgoCD
echo "📥 Instalando/Actualizando ArgoCD..."
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 4. PARCHE CRÍTICO: Reducir recursos para Kind/WSL2
kubectl patch deployment argocd-repo-server -n argocd --type=json -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/resources", "value": {"limits": {"cpu": "250m", "memory": "256Mi"}, "requests": {"cpu": "50m", "memory": "64Mi"}}}]'
kubectl patch deployment argocd-server -n argocd --type=json -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/resources", "value": {"limits": {"cpu": "250m", "memory": "256Mi"}, "requests": {"cpu": "50m", "memory": "64Mi"}}}]'

# 5. Esperar a ArgoCD (con reinicio si es necesario)
echo "⏳ Esperando componentes de ArgoCD..."
# Forzar reinicio para que tomen el parche de recursos si ya existían
kubectl rollout restart deployment argocd-repo-server -n argocd
kubectl rollout restart deployment argocd-server -n argocd

kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
kubectl wait --for=condition=available --timeout=300s deployment/argocd-repo-server -n argocd

# 6. Configurar Aplicaciones
echo "🤖 Configurando Apps en ArgoCD..."
envs=("dev" "test" "prod")
for env in "${envs[@]}"; do
    if [ "$env" == "dev" ]; then
        TARGET_REVISION="dev"
    else
        TARGET_REVISION="main"
    fi

    cat <<EOF | kubectl apply -f -
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: project-$env
  namespace: argocd
spec:
  project: default
  source:
    repoURL: $REPO_URL
    targetRevision: $TARGET_REVISION
    path: k8s/overlays/$env
  destination:
    server: https://kubernetes.default.svc
    namespace: $env
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF
done

# 7. Credenciales y Acceso
ARGOPASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "---------------------------------------------------"
echo "  ArgoCD User: admin"
echo "  ArgoCD Pass: $ARGOPASS"
echo "---------------------------------------------------"

# 8. Port-Forwarding (Más robusto)
echo "bridge: Estableciendo túneles..."
pkill -f "kubectl port-forward.*8081" || true
pkill -f "kubectl port-forward.*8080" || true

# Esperar un momento para asegurar que los puertos se liberen
sleep 2

# Lanzar en segundo plano y guardar PIDs si fuera necesario (aquí simple)
nohup kubectl port-forward svc/argocd-server -n argocd 8081:443 > /dev/null 2>&1 &
echo "  -> ArgoCD UI: https://localhost:8081"

# Esperar a que la app dev esté lista antes de hacer port-forward
echo "⏳ Esperando despliegue de la app (dev)..."
kubectl wait --for=condition=available --timeout=120s deployment/gitops-project -n dev || echo "⚠️ La app aún no está lista, intentando port-forward de todos modos..."

nohup kubectl port-forward svc/gitops-project -n dev 8080:80 > /dev/null 2>&1 &
echo "  -> App (Dev): http://localhost:8080"

echo "✨ Entorno listo."
