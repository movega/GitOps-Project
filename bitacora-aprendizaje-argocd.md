# Bitacora de aprendizaje - Resolucion de errores de sincronizacion en ArgoCD

Fecha: 2026-03-20
Proyecto: GitOps-Project
Entorno: Kind en WSL2 (Ubuntu)

## Contexto del problema

Al sincronizar en ArgoCD aparecian errores como:

- `dial tcp 10.96.92.35:8081: i/o timeout`
- `failed to list refs ... github.com ... context deadline exceeded`
- `Unable to load data: context deadline exceeded`

Mi primera hipotesis fue que ArgoCD no tenia conectividad estable desde `argocd-repo-server` hacia GitHub.

## Lo que fui encontrando y como lo resolvi

### 1) Problema de red interno del cluster (CNI + CoreDNS)

**Que vi:**
- `kindnet` estaba en `Error`.
- Un pod de `coredns` estaba en estado roto.
- Eventos repetidos de sandbox (`FailedCreatePodSandBox`).

**Que hice:**
- Elimine los pods rotos para forzar recreacion:
  - `kubectl delete pod -n kube-system kindnet-... --force --grace-period=0`
  - `kubectl delete pod -n kube-system coredns-... --force --grace-period=0`

**Resultado:**
- Ambos se recrearon y pasaron a `Running`.
- Mejoro la estabilidad de red del cluster.

### 2) Validacion de conectividad real desde ArgoCD

**Que queria comprobar:**
Que `argocd-repo-server` pudiera leer refs del repo remoto.

**Que hice:**
- Ejecute:
  - `kubectl exec -n argocd deploy/argocd-repo-server -- git ls-remote https://github.com/movega/GitOps-Project HEAD`

**Resultado:**
- Devolvio el hash `HEAD` correctamente, por lo que la salida a GitHub quedo funcional.

### 3) Limpieza de estado en ArgoCD

**Problema:**
Aunque la red estaba mejor, algunas aplicaciones seguian en `Unknown` por estados viejos.

**Que hice:**
- Reinicie componentes de ArgoCD:
  - `argocd-repo-server`
  - `argocd-server`
  - `argocd-application-controller`
- Force refresh de apps con anotacion:
  - `argocd.argoproj.io/refresh=hard`

**Resultado:**
- Se fue limpiando el estado de sincronizacion progresivamente.

### 4) Fallback por inestabilidad residual

**Problema:**
Habia sintomas intermitentes en DNS/API despues del primer arreglo.

**Que hice:**
- Aplique fallback del plan:
  - `docker restart gitops-cluster-control-plane`
  - Espera de nodo `Ready`.
- Detecte que un pod de `argocd-repo-server` quedo atascado en init (`copyutil`), lo recree eliminando el pod.

**Resultado:**
- El repo-server quedo estable y en `Running`.
- La sincronizacion termino recuperandose.

## Estado final observado

Aplicaciones en ArgoCD:

- `project-dev`: `Synced / Healthy`
- `project-test`: `Synced / Healthy`
- `project-prod`: `Synced / Healthy`

## Aprendizajes personales (modo estudiante)

1. Los errores de ArgoCD muchas veces son sintoma y no causa; la causa real estaba en red del cluster.
2. Si `git ls-remote` funciona dentro de `argocd-repo-server`, el camino a GitHub esta bien.
3. En Kind/WSL2 conviene revisar primero `kube-system` (kindnet, coredns, kube-proxy) antes de tocar manifests.
4. Forzar refresh y reiniciar componentes de ArgoCD ayuda a limpiar estados stale despues de una caida de red.
5. Tener un plan con fallback (reiniciar nodo / recrear cluster) evita quedarse bloqueado.

## Proximos pasos recomendados

- Ejecutar `startup.sh` para dejar entorno y port-forward listos para validar la UI.
- Verificar UI en `https://localhost:8081`.
- Si vuelve a pasar, revisar primero:
  - `kubectl get pods -n kube-system`
  - `kubectl logs -n kube-system -l k8s-app=kube-dns --tail=50`
  - `kubectl exec -n argocd deploy/argocd-repo-server -- git ls-remote <repo> HEAD`

## Nueva iteracion: acceso estable para navegador remoto

### Que problema queria resolver

Al entrar en ArgoCD aparecia en la UI:

- `Unable to load data: Request has been terminated ...`

Aunque el clúster podia estar sano, este error se repetia por depender de un `port-forward` efimero a `localhost`.

### Que cambie en esta iteracion

1. Cree `kind-config.yaml` para publicar puertos del nodo Kind.
2. Actualice `startup.sh` para crear/recrear el cluster con esa config cuando haga falta.
3. Cambie `argocd-server` a `NodePort` (443 -> 30443).
4. Elimine la dependencia del `port-forward` de ArgoCD.
5. Configure `argocd-cm.data.url` con una URL externa (`https://<host>:8081`).

### Resultado esperado

- ArgoCD queda accesible de forma mas estable por `https://<IP_DEL_SERVIDOR>:8081`.
- Ya no depende de que un proceso `kubectl port-forward` se mantenga vivo para la UI.

### Nota importante que aprendi

Si quiero controlar explicitamente el host remoto (por ejemplo una IP fija), puedo usar:

```bash
export ARGOCD_PUBLIC_HOST="10.51.33.58"
bash startup.sh
```

Asi me aseguro de que la URL configurada en ArgoCD coincida con la direccion desde la que abro el navegador.

## Nueva iteracion: acceso compartido mas simple con Ingress

### Problema detectado

Aunque pude abrir ArgoCD con tunel SSH (`localhost:8081`), no era un acceso comodo para un servicio compartido.
Tambien detecte que mezclar `localhost` y URL remota podia causar sesiones inestables (vuelta al login).

### Cambio de arquitectura

Pase de exponer ArgoCD por `NodePort` directo a un modelo con `Ingress`:

1. Kind ahora publica puertos `80/443` del host.
2. Se instala `ingress-nginx` automaticamente en `startup.sh`.
3. `argocd-server` vuelve a ser `ClusterIP` (interno).
4. ArgoCD se expone con `k8s/argocd-ingress.yaml`.
5. `argocd-cm.data.url` se alinea a una unica URL de acceso.

### Por que esta opcion me parece mejor

- Es mas parecido a un despliegue real de CI/CD.
- Evita depender de procesos `port-forward` para la UI.
- Facilita que mas de una persona acceda con la misma URL.
- Reduce errores de origen/sesion por usar multiples endpoints.

### Comandos de validacion que usare

```bash
kubectl get pods -n ingress-nginx
kubectl get ingress -n argocd
kubectl get svc argocd-server -n argocd
curl -I http://localhost
```

## Nueva iteracion: publicar ArgoCD en LAN para Mac (Windows + WSL2)

### Problema real que encontre

Desde el Mac, `http://10.51.33.58` devolvia `ERR_CONNECTION_REFUSED`, aunque en el entorno local algunas cosas funcionaban.

### Diagnostico que aprendi

- El Ingress esta en Kind dentro de WSL2.
- El Mac no habla directo con WSL2; habla con Windows (`10.51.33.58`).
- En Windows no habia listener/reenvio en `:80` hacia WSL.
- Por eso fallaba la conexion LAN aunque `localhost:8080` (app dev por port-forward) funcionara.

### Solucion aplicada (opcion A del plan)

En Windows configure `portproxy` y firewall:

```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=80 connectaddress=172.18.4.238 connectport=80
netsh advfirewall firewall add rule name=ArgoCD-WSL-HTTP-LAN dir=in action=allow protocol=TCP localport=80
netsh interface portproxy show v4tov4
```

Regla resultante:

- `0.0.0.0:80 -> 172.18.4.238:80`

### Verificacion que hice

- `curl -I http://127.0.0.1` en Windows devolvio `HTTP/1.1 200 OK`.
- `curl -I http://10.51.33.58` tambien devolvio `200`.

### Leccion importante

En WSL2 hay que separar siempre estos caminos:

1. `localhost:8080` -> port-forward local de la app dev.
2. `10.51.33.58:80` -> acceso LAN a ArgoCD via Windows + portproxy + WSL.

Si cambia la IP de WSL despues de reinicio, hay que actualizar la regla `portproxy`.

## Nueva iteracion: volver a localhost como camino principal

### Por que cambie de estrategia

Aunque en Windows consegui respuesta `200` en algunos tests de `portproxy`, desde el Mac seguia fallando:

- `curl -I http://10.51.33.58`
- `curl -I http://10.51.33.58:8088`

Con ese resultado, la conclusion practica fue que habia una limitacion de red LAN externa al cluster (aislamiento entre clientes o reglas del entorno), no un fallo de ArgoCD.

### Solucion aplicada en el proyecto

Volvi a un flujo mas robusto para este entorno:

1. ArgoCD queda con `kubectl port-forward` en `127.0.0.1:8081`.
2. `argocd-cm.data.url` se alinea por defecto a `http://127.0.0.1:8081`.
3. `ARGOCD_PUBLIC_HOST` queda solo como override opcional.
4. Ingress se mantiene instalado, pero como alternativa, no como via principal para el Mac.

### Flujo recomendado que me funciona de forma estable

- En el host donde corre `kubectl`: `bash startup.sh`
- En el Mac: tunel SSH `-L 8081:127.0.0.1:8081`
- En navegador Mac: `http://127.0.0.1:8081`

Con este enfoque mantengo un unico origen de acceso y reduzco mucho los problemas de sesion/login.
