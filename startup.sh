#!/bin/bash

REPO_URL="https://github.com/movega/GitOps-Project"

echo "🚀 Starting GitOps Environment (Kustomize Version)..."

# 1. Gestión del Clúster (Docker Start vs Kind Create)
if [ "$(docker ps -a -f name=gitops-cluster-control-plane --format '{{.Status}}' | grep Exited)" ]; then
    echo "🟢 Resuming existing cluster nodes..."
    docker start gitops-cluster-control-plane
    until kubectl cluster-info > /dev/null 2>&1; do echo "⏳ Waiting for API Server..."; sleep 2; done
elif ! kind get clusters | grep -q "gitops-cluster"; then
    echo "🏗️ Cluster not found. Creating kind-cluster..."
    kind create cluster --name gitops-cluster
else
    echo "✅ Cluster is already running."
fi

# 2. Cargar imagen
echo "📦 Loading Docker image into Kind..."
kind load docker-image gitops-project:latest --name gitops-cluster

# 3. Namespaces y ArgoCD
echo "📂 Ensuring Namespaces and ArgoCD..."
for ns in argocd dev test prod; do
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
done

kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Esperar a que el servidor de ArgoCD esté listo antes de configurar las Apps
echo "⏳ Waiting for ArgoCD server to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# 4. Sincronización de Apps apuntando a OVERLAYS
echo "🤖 Syncing ArgoCD Applications to Kustomize Overlays..."
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
echo "  USER: admin | PASSWORD: $ARGOPASS"
echo "---------------------------------------------------"

# 6. Túneles
echo "🌉 Opening Port-Forwarding tunnels..."
pkill -f "port-forward"
kubectl port-forward svc/argocd-server -n argocd 8081:443 > /dev/null 2>&1 &

# Pequeña espera para que las apps se sincronicen y el service de la web aparezca
echo "⏳ Finalizing network tunnels..."
sleep 10
kubectl port-forward svc/gitops-project -n dev 8080:80 > /dev/null 2>&1 &

echo "✨ Everything is ready! Check ArgoCD: https://localhost:8081"