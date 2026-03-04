#!/bin/bash
echo "🛑 Stopping GitOps Environment..."

# 1. Matar los túneles de puerto para liberar la terminal
echo "🔗 Closing tunnels..."
pkill -f "port-forward"

# 2. Detener el contenedor de Docker de Kind (sin borrarlo)
echo "🐳 Pausing Kind cluster nodes..."
docker stop gitops-cluster-control-plane

echo "✅ Environment paused. Run ./startup.sh to resume."