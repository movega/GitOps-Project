#!/bin/bash

REPO_URL="https://github.com/movega/GitOps-Project"

echo "🚀 Starting GitOps Environment..."

# 1. Gestión del Clúster (Docker Start vs Kind Create)
if [ "$(docker ps -a -f name=gitops-cluster-control-plane --format '{{.Status}}' | grep Exited)" ]; then
    echo "🟢 Resuming existing cluster nodes..."
    docker start gitops-cluster-control-plane
    # Esperamos a que el API Server responda antes de seguir
    until kubectl cluster-info > /dev/null 2>&1; do echo "⏳ Waiting for API Server..."; sleep 2; done
elif ! kind get clusters | grep -q "gitops-cluster"; then
    echo "🏗️ Cluster not found. Creating kind-cluster..."
    kind create cluster --name gitops-cluster
else
    echo "✅ Cluster is already running."
fi

# 2. Cargar imagen (siempre es bueno asegurar que está la última)
echo "📦 Loading Docker image into Kind..."
kind load docker-image gitops-project:latest --name gitops-cluster

# 3. Aplicar configuraciones (Idempotente: si ya existe, no hace nada)
echo "📂 Ensuring Namespaces and ArgoCD..."
for ns in argocd dev test prod; do
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
done

kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 4. Apps y Contraseña (Solo se muestran los datos)
echo "🤖 Syncing ArgoCD Applications..."
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
    path: k8s/base
  destination:
    server: https://kubernetes.default.svc
    namespace: $env
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF
done

ARGOPASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "---------------------------------------------------"
echo "  USER: admin | PASSWORD: $ARGOPASS"
echo "---------------------------------------------------"

# 5. Túneles (Esto sí hay que hacerlo siempre al empezar)
echo "🌉 Opening Port-Forwarding tunnels..."
pkill -f "port-forward"
kubectl port-forward svc/argocd-server -n argocd 8081:443 > /dev/null 2>&1 &
# Un pequeño sleep para asegurar que el service de la app existe antes de tunelar
sleep 5
kubectl port-forward svc/gitops-project -n dev 8080:80 > /dev/null 2>&1 &

echo "✨ Everything is ready!"