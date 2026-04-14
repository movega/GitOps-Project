# GitOps-Project

## Acceso principal (WSL/host)

El camino principal del proyecto usa `port-forward` para mantener URLs estables:

- ArgoCD UI: `http://127.0.0.1:8081`
- App dev: `http://127.0.0.1:8080`

Ejecuta:

```bash
bash startup.sh
```

El script deja:

- `kubectl port-forward` de `argocd-server` en `8081` (bind configurable con `PORT_FORWARD_ADDRESS`, por defecto `0.0.0.0`).
- `kubectl port-forward` de `gitops-project` (dev) en `8080` (mismo bind).
- `argocd-cm.data.url` alineada con la URL de acceso principal.

## Acceso desde Mac por VPN (recomendado)

Si quieres entrar desde tu Mac conectado por VPN al host, usa túnel SSH para mantener en Mac `localhost:8080` y `localhost:8081`:

```bash
ssh -N \
  -L 8080:127.0.0.1:8080 \
  -L 8081:127.0.0.1:8081 \
  usuario@<host-vpn>
```

Luego abre en el Mac:

- `http://127.0.0.1:8080` (web app)
- `http://127.0.0.1:8081`

Este flujo evita depender de rutas LAN directas hacia WSL.

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

## Troubleshooting por saltos de red

Si no abre en navegador, valida en este orden:

1. Dentro de WSL:
   - `curl -I http://127.0.0.1:8080`
   - `curl -I http://127.0.0.1:8081`
2. En el host (Windows/Linux que ejecuta WSL):
   - `curl -I http://127.0.0.1:8080`
   - `curl -I http://127.0.0.1:8081`
3. En el Mac (con túnel SSH abierto):
   - `curl -I http://127.0.0.1:8080`
   - `curl -I http://127.0.0.1:8081`

Si falla un nivel y el anterior no, el problema está en ese salto de red (no en ArgoCD ni en la app).
