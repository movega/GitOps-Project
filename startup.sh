#!/bin/bash

REPO_URL="https://github.com/movega/GitOps-Project" # 👈 PON AQUÍ TU URL DE GITHUB

echo "🚀 Starting GitOps Environment..."

# 1. Clúster y carga de imagen
if ! kind get clusters | grep -q "gitops-cluster"; then
    kind create cluster --name gitops-cluster
fi
kind load docker-image gitops-project:latest --name gitops-cluster

# 2. Namespaces
for ns in argocd dev test prod; do
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
done

# 3. Instalación de ArgoCD y esperar a que esté listo
echo "📥 Installing ArgoCD..."
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
echo "⏳ Waiting for ArgoCD Server (may take 1 minute)..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# 4. CREACIÓN AUTOMÁTICA DE APPS (La magia de GitOps)
echo "🤖 Auto-creating ArgoCD Applications..."
envs=("dev" "test" "prod")
for env in "${envs[@]}"; do
    # Usamos kubectl para crear el objeto de ArgoCD directamente sin entrar en la web
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

# 5. Contraseña y Túneles
ARGOPASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "---------------------------------------------------"
echo "  USER: admin | PASSWORD: $ARGOPASS"
echo "---------------------------------------------------"

pkill -f "port-forward"
kubectl port-forward svc/argocd-server -n argocd 8081:443 > /dev/null 2>&1 &
# Esperamos un poco a que las apps sincronicen antes de abrir el túnel de la web
sleep 10
kubectl port-forward svc/gitops-project -n dev 8080:80 > /dev/null 2>&1 &

echo "✨ System fully restored and Apps re-created!"