# GitOps-Project

## Acceso principal a ArgoCD (recomendado)

El camino principal del proyecto vuelve a ser `port-forward` para mantener una URL estable y evitar problemas de red LAN:

- ArgoCD UI: `http://127.0.0.1:8081`
- App dev: `http://localhost:8080`

Ejecuta:

```bash
bash startup.sh
```

El script deja:

- `kubectl port-forward` de `argocd-server` en `8081`.
- `kubectl port-forward` de `gitops-project` (dev) en `8080`.
- `argocd-cm.data.url` alineada con la URL de acceso principal.

## Acceso desde Mac (sin depender de LAN)

Si usas Mac, crea un túnel SSH hacia el host donde corre `kubectl` (WSL o la máquina que lo ejecuta):

```bash
ssh -N -L 8081:127.0.0.1:8081 usuario@<host-donde-corre-kubectl>
```

Luego abre en el Mac:

- `http://127.0.0.1:8081`

Este flujo evita bloqueos típicos de redes de aula (aislamiento entre clientes, reglas de firewall externas, etc.).

## Ingress y acceso por IP LAN (opcional)

El proyecto mantiene Ingress en `80/443` (Kind + `ingress-nginx`) como alternativa local en WSL.  
El acceso directo desde otra máquina por IP (`http://10.51.33.58`) depende de la red del entorno y puede fallar aunque ArgoCD esté sano.

Si quieres probar la vía LAN en Windows (PowerShell admin):

```powershell
wsl -d Ubuntu hostname -I
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=80 connectaddress=<WSL_IP> connectport=80
netsh advfirewall firewall add rule name=ArgoCD-WSL-HTTP-LAN dir=in action=allow protocol=TCP localport=80
```

Comprobación desde Mac:

```bash
curl -I http://10.51.33.58
```

Si falla esa comprobación, el problema es de conectividad LAN, no de ArgoCD.

## Override opcional de URL pública

Por defecto, `startup.sh` ignora `ARGOCD_PUBLIC_HOST` y usa `http://127.0.0.1:8081`.

Si quieres forzar URL remota en `argocd-cm.data.url`, activa ambos:

```bash
export ARGOCD_USE_PUBLIC_HOST=true
export ARGOCD_PUBLIC_HOST="10.51.33.58"
bash startup.sh
```

Logs de `port-forward` (por si vuelve a salir `ERR_EMPTY_RESPONSE`):

```bash
tail -f /tmp/port-forward-argocd-server-8081.log
```