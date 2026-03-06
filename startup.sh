#!/bin/bash

# --- CONFIGURACIÓN DEL ESTUDIANTE ---
REPO_URL="https://github.com/movega/GitOps-Project"
DOCKER_USER="alvarovm95493"
# ------------------------------------

echo "🚀 Iniciando Entorno GitOps (Fase CI/CD)..."

# 1. Gestión del Clúster (Reanudar o Crear)
if [ "$(docker ps -a -f name=gitops-cluster-control-plane --format '{{.Status}}' | grep Exited)" ]; then
    echo "🟢 Reanudando nodos del clúster existente..."
    docker start gitops-cluster-control-plane
    until kubectl cluster-info > /dev/null 2>&1; do echo "⏳ Esperando al API Server..."; sleep 2; done
elif ! kind get clusters | grep -q "gitops-cluster"; then
    echo "🏗️ Clúster no encontrado. Creando gitops-cluster..."
    kind create cluster --name gitops-cluster
else
    echo "✅ El clúster ya está en ejecución."
fi

# 2. Nota sobre la imagen
# Ya no usamos 'kind load' porque la imagen bajará de Docker Hub gracias a GitHub Actions.
echo "ℹ️  La imagen se descargará automáticamente desde $DOCKER_USER/gitops-project"

# 3. Namespaces
echo "📂 Asegurando Namespaces..."
for ns in argocd dev test prod; do
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
done

# 4. Instalación de ArgoCD
echo "📥 Instalando/Actualizando ArgoCD..."
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "⏳ Esperando a que ArgoCD Server esté listo..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# 5. Configuración de Aplicaciones (Kustomize Overlays)
echo "🤖 Sincronizando Aplicaciones de ArgoCD..."
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

# 6. Obtención de Credenciales
ARGOPASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "---------------------------------------------------"
echo "  URL: https://localhost:8081"
echo "  USER: admin"
echo "  PASS: $ARGOPASS"
echo "---------------------------------------------------"

# 7. Túneles de Red (Port-Forwarding)
echo "🌉 Abriendo túneles de red..."
pkill -f "port-forward"
# Túnel ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8081:443 > /dev/null 2>&1 &
# Túnel App (Entorno Dev)
sleep 5
kubectl port-forward svc/gitops-project -n dev 8080:80 > /dev/null 2>&1 &

echo "✨ ¡Todo listo! Mantén esta terminal abierta."