#!/bin/bash
set -euo pipefail

# Configuración
REPO_URL="https://github.com/movega/GitOps-Project"
DOCKER_USER="alvarovm95493"
CLUSTER_NAME="gitops-cluster"
KIND_CONFIG_PATH="$(dirname "$0")/kind-config.yaml"
INGRESS_NGINX_MANIFEST="https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml"
ARGOCD_INGRESS_MANIFEST="$(dirname "$0")/k8s/argocd-ingress.yaml"
ARGOCD_UI_PORT="${ARGOCD_UI_PORT:-8081}"
DEV_APP_PORT="${DEV_APP_PORT:-8080}"
PORT_FORWARD_ADDRESS="${PORT_FORWARD_ADDRESS:-0.0.0.0}"
ARGOCD_USE_PUBLIC_HOST="${ARGOCD_USE_PUBLIC_HOST:-false}"
PORT_FORWARD_LOG_DIR="${PORT_FORWARD_LOG_DIR:-/tmp}"

echo "🚀 Iniciando Entorno GitOps (Modo Reparación)..."

create_kind_cluster() {
    local attempt
    for attempt in 1 2; do
        if kind create cluster --name "$CLUSTER_NAME" --config "$KIND_CONFIG_PATH"; then
            return 0
        fi
        if [ "$attempt" -lt 2 ]; then
            echo "⏳ Reintentando creación del clúster en 15s..."
            sleep 15
        fi
    done
    echo "❌ No se pudo crear el clúster Kind tras 2 intentos."
    return 1
}

start_port_forward_with_restart() {
    local service_name="$1"
    local namespace="$2"
    local local_port="$3"
    local target_port="$4"
    local log_file="${PORT_FORWARD_LOG_DIR}/port-forward-${service_name}-${local_port}.log"

    pkill -f "kubectl port-forward.*svc/${service_name}.*${local_port}:${target_port}" || true
    nohup bash -c "while true; do kubectl port-forward svc/${service_name} -n ${namespace} ${local_port}:${target_port} --address ${PORT_FORWARD_ADDRESS}; sleep 2; done" >"${log_file}" 2>&1 &
}

# 1. Gestión del Clúster
if ! kind get clusters | grep -q "^$CLUSTER_NAME$"; then
    echo "🏗️ Creando nuevo clúster con puertos publicados..."
    create_kind_cluster
else
    echo "✅ El clúster ya existe."
    # Intentar arrancar si está detenido (Docker)
    docker start "${CLUSTER_NAME}-control-plane" 2>/dev/null || true

    # Verificar que el nodo publique HTTP/HTTPS del ingress (cualquier hostPort válido)
    MAPPED_HTTP_PORT=$(docker port "${CLUSTER_NAME}-control-plane" 80/tcp 2>/dev/null | awk -F: 'NR==1 {print $NF}')
    MAPPED_HTTPS_PORT=$(docker port "${CLUSTER_NAME}-control-plane" 443/tcp 2>/dev/null | awk -F: 'NR==1 {print $NF}')
    if [ -z "${MAPPED_HTTP_PORT:-}" ] || [ -z "${MAPPED_HTTPS_PORT:-}" ]; then
        echo "♻️ El clúster actual no expone puertos del ingress (80/443 en el nodo). Recreando..."
        kind delete cluster --name "$CLUSTER_NAME"
        create_kind_cluster
    fi
fi

echo "⏳ Esperando estabilidad del nodo..."
kubectl wait --for=condition=Ready node/${CLUSTER_NAME}-control-plane --timeout=60s

INGRESS_HOST_HTTP_PORT=$(docker port "${CLUSTER_NAME}-control-plane" 80/tcp 2>/dev/null | awk -F: 'NR==1 {print $NF}')
INGRESS_HOST_HTTP_PORT="${INGRESS_HOST_HTTP_PORT:-9080}"

# 2. Namespaces
echo "Create namespaces..."
for ns in argocd dev test prod; do
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
done

# 3. Instalar ArgoCD
echo "📥 Instalando/Actualizando ArgoCD..."
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3.1 Instalar Ingress NGINX para exposición estable por HTTP/HTTPS
echo "🌐 Instalando/actualizando Ingress NGINX..."
kubectl apply -f "$INGRESS_NGINX_MANIFEST"
kubectl wait --namespace ingress-nginx \
  --for=condition=Ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

# 3.2 Exposición estable de ArgoCD por Ingress (argocd-server interno)
echo "🌐 Configurando publicación estable de ArgoCD..."
kubectl patch svc argocd-server -n argocd --type merge -p='{"spec":{"type":"ClusterIP","ports":[{"name":"http","port":80,"protocol":"TCP","targetPort":8080},{"name":"https","port":443,"protocol":"TCP","targetPort":8080}]}}'
kubectl patch configmap argocd-cmd-params-cm -n argocd --type merge -p='{"data":{"server.insecure":"true"}}'
kubectl apply -f "$ARGOCD_INGRESS_MANIFEST"

if [ "${ARGOCD_USE_PUBLIC_HOST}" = "true" ] && [ -n "${ARGOCD_PUBLIC_HOST:-}" ]; then
    ARGOCD_EXTERNAL_URL="http://${ARGOCD_PUBLIC_HOST}"
else
    ARGOCD_EXTERNAL_URL="http://127.0.0.1:${ARGOCD_UI_PORT}"
fi
kubectl patch configmap argocd-cm -n argocd --type merge -p "{\"data\":{\"url\":\"${ARGOCD_EXTERNAL_URL}\"}}"

# 4. PARCHE CRÍTICO: Reducir recursos para Kind/WSL2
kubectl patch deployment argocd-repo-server -n argocd --type=json -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/resources", "value": {"limits": {"cpu": "250m", "memory": "256Mi"}, "requests": {"cpu": "50m", "memory": "64Mi"}}}]'
kubectl patch deployment argocd-server -n argocd --type=json -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/resources", "value": {"limits": {"cpu": "250m", "memory": "256Mi"}, "requests": {"cpu": "50m", "memory": "64Mi"}}}]'

# 5. Esperar a ArgoCD (con reinicio si es necesario)
echo "⏳ Esperando componentes de ArgoCD..."
# Forzar reinicio para que tomen el parche de recursos si ya existían
kubectl rollout restart deployment argocd-repo-server -n argocd
kubectl rollout restart deployment argocd-server -n argocd
kubectl rollout restart deployment argocd-redis -n argocd
kubectl rollout restart statefulset argocd-application-controller -n argocd

kubectl wait --for=condition=available --timeout=300s deployment/argocd-redis -n argocd
kubectl wait --for=condition=available --timeout=300s deployment/argocd-repo-server -n argocd
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
kubectl rollout status --timeout=300s statefulset/argocd-application-controller -n argocd

# 6. Configurar Aplicaciones
echo "🤖 Configurando Apps en ArgoCD..."
envs=("dev" "test" "prod")
for env in "${envs[@]}"; do
    case "$env" in
        dev) TARGET_REVISION="dev" ;;
        test) TARGET_REVISION="test" ;;
        prod) TARGET_REVISION="main" ;;
    esac

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

# Dar margen a ArgoCD para comenzar la reconciliación inicial.
sleep 30

# 7. Credenciales y Acceso
ARGOPASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "---------------------------------------------------"
echo "  ArgoCD User: admin"
echo "  ArgoCD Pass: $ARGOPASS"
echo "---------------------------------------------------"

# 8. Acceso a servicios
echo "bridge: Configurando accesos..."

# ArgoCD queda disponible por port-forward para un origen estable de sesión
start_port_forward_with_restart "argocd-server" "argocd" "${ARGOCD_UI_PORT}" "80"
echo "  -> ArgoCD UI (WSL/host): http://127.0.0.1:${ARGOCD_UI_PORT}"
echo "  -> Port-forward bind address: ${PORT_FORWARD_ADDRESS}"
echo "  -> ArgoCD URL configurada en argocd-cm: ${ARGOCD_EXTERNAL_URL}"
echo "  -> Ingress local (HTTP del nodo Kind -> host): http://127.0.0.1:${INGRESS_HOST_HTTP_PORT}"
if [ "${ARGOCD_USE_PUBLIC_HOST}" = "true" ] && [ -n "${ARGOCD_PUBLIC_HOST:-}" ]; then
    echo "  -> Modo público activo (ARGOCD_USE_PUBLIC_HOST=true): http://${ARGOCD_PUBLIC_HOST}"
else
    echo "  -> Modo localhost activo (ignora ARGOCD_PUBLIC_HOST salvo que ARGOCD_USE_PUBLIC_HOST=true)"
fi

# Esperar a que la app dev esté lista antes de hacer port-forward
echo "⏳ Esperando despliegue de la app (dev)..."
kubectl wait --for=condition=available --timeout=300s deployment/gitops-project -n dev || echo "⚠️ La app aún no está lista, intentando port-forward de todos modos..."

start_port_forward_with_restart "gitops-project" "dev" "${DEV_APP_PORT}" "80"
echo "  -> App (Dev, WSL/host): http://127.0.0.1:${DEV_APP_PORT}"
echo "  -> Mac por VPN (tunel SSH recomendado):"
echo "     ssh -N -L ${DEV_APP_PORT}:127.0.0.1:${DEV_APP_PORT} -L ${ARGOCD_UI_PORT}:127.0.0.1:${ARGOCD_UI_PORT} <usuario>@<host-vpn>"
echo "  -> Tras abrir el tunel en Mac: http://localhost:${DEV_APP_PORT} y http://localhost:${ARGOCD_UI_PORT}"
echo "  -> Logs port-forward: ${PORT_FORWARD_LOG_DIR}/port-forward-argocd-server-${ARGOCD_UI_PORT}.log"

echo "✨ Entorno listo."
