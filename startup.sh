#!/bin/bash

REPO_URL="https://github.com/movega/GitOps-Project"
DOCKER_USER="alvarovm95493"

echo "🚀 Iniciando Entorno GitOps (Versión Robusta)..."

# 1. Gestión del Clúster
if [ "$(docker ps -a -f name=gitops-cluster-control-plane --format '{{.Status}}' | grep Exited)" ]; then
    echo "🟢 Reanudando clúster..."
    docker start gitops-cluster-control-plane
    echo "⏳ Esperando estabilidad de red interna (15s)..."
    sleep 15 # <--- ESTO EVITA EL CRASHLOOP DEL REPO-SERVER
elif ! kind get clusters | grep -q "gitops-cluster"; then
    echo "🏗️ Creando nuevo clúster..."
    kind create cluster --name gitops-cluster
else
    echo "✅ El clúster ya está activo."
fi

# 2. Namespaces y ArgoCD
for ns in argocd dev test prod; do
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
done

echo "📥 Aplicando manifiestos de ArgoCD..."
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. ESPERA CRÍTICA
echo "⏳ Esperando a que todos los componentes de ArgoCD estén listos..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
kubectl wait --for=condition=available --timeout=300s deployment/argocd-repo-server -n argocd

# 4. Sincronización de Aplicaciones
echo "🤖 Configurando Aplicaciones..."
envs=("dev" "test" "prod")
for env in "${envs[@]}"; do
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
    targetRevision: HEAD
    path: k8s/overlays/$env
  destination:
    server: https://kubernetes.default.svc
    namespace: $env
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF
done

# 5. Credenciales
ARGOPASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "---------------------------------------------------"
echo "  USER: admin | PASS: $ARGOPASS"
echo "---------------------------------------------------"

# 6. Túneles (REINICIO FORZADO)
echo "🌉 Reiniciando túneles de red..."
pkill -f "port-forward"
sleep 2
kubectl port-forward svc/argocd-server -n argocd 8081:443 > /dev/null 2>&1 &
kubectl port-forward svc/gitops-project -n dev 8080:80 > /dev/null 2>&1 &

echo "✨ ¡Listo! Si no carga, refresca la pestaña PORTS de VS Code."