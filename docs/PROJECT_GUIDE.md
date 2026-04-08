# GitOps-Project - Developer Guide

## 1. What this project is

`GitOps-Project` is a React + TypeScript SPA, containerized with Docker and deployed to Kubernetes through ArgoCD using a GitOps model.

This repository demonstrates:

- Frontend development with Vite.
- Docker image build and publish with GitHub Actions.
- Environment-specific deploys with Kustomize overlays.
- Automated reconciliation in Kubernetes through ArgoCD.

## 2. Stack and runtime assumptions

### Application stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand

### Delivery stack

- Docker (multi-stage build)
- Kubernetes + Kustomize
- ArgoCD
- Kind for local cluster
- GitHub Actions for CI/CD

### Recommended local versions

- Node.js 20.x
- npm 9+
- Docker Desktop (or Docker daemon running)
- `kind`
- `kubectl`

## 3. Repository structure

- `app/` - frontend app
- `k8s/base/` - shared Kubernetes manifests
- `k8s/overlays/dev|test|prod/` - per-environment overlays
- `startup.sh` - bootstrap/resume local GitOps stack
- `shutdown.sh` - stop local tunnels and pause Kind node
- `.github/workflows/main.yml` - CI/CD workflow

## 4. Three-environment model

This project uses one branch per environment:

- `dev` -> Kubernetes namespace `dev` -> image tag `dev-latest`
- `test` -> Kubernetes namespace `test` -> image tag `test-latest`
- `main` -> Kubernetes namespace `prod` -> image tag `latest`

ArgoCD applications created by `startup.sh`:

- `project-dev` tracks branch `dev`
- `project-test` tracks branch `test`
- `project-prod` tracks branch `main`

## 5. Promotion flow between environments

Use pull requests to move the same code forward:

1. Develop and validate on `dev`.
2. Promote with PR: `dev -> test`.
3. Promote with PR: `test -> main`.

This gives a clear audit trail and controlled progression across environments.

## 6. CI/CD workflow

The workflow has two responsibilities:

1. **Validate** (on push + PR to `dev`, `test`, `main`):
   - install deps
   - lint
   - typecheck
   - tests
   - production build
   - Docker build
   - Kustomize manifest validation
2. **Publish image** (only on branch push after validate):
   - map branch to environment tag
   - push image to Docker Hub

### Why this matters

As a new engineer, remember:

- CI is your quality gate before merge.
- ArgoCD deploys what Git says should run.
- Docker registry tags are part of delivery, but Git remains the source of truth for manifests.

## 7. Local development (frontend only)

From `app/`:

```bash
npm ci
npm run dev
```

Quality commands:

```bash
npm run lint
npm run check
npm run test
npm run build
```

## 8. Local GitOps runbook (Kind + ArgoCD)

From repository root:

```bash
./startup.sh
```

What it does:

- creates or resumes a Kind cluster
- creates `argocd`, `dev`, `test`, `prod` namespaces
- installs ArgoCD
- applies local ArgoCD resource patch
- creates/updates ArgoCD Applications for all environments
- opens local tunnels:
  - ArgoCD UI: `https://localhost:8081`
  - Dev app: `http://localhost:8080`

To stop:

```bash
./shutdown.sh
```

It closes known port-forwards and pauses the Kind control-plane container.

## 9. Critical caveat for newcomers

`startup.sh` points ArgoCD to a remote Git repository and branches.

That means:

- uncommitted local changes are not deployed
- local commits not pushed to the tracked branch are not deployed

If you do not see your change in ArgoCD, first check whether it is committed and pushed to the correct branch (`dev`, `test`, or `main`).

## 10. Troubleshooting quick checklist

If startup succeeds but app is not ready:

1. Verify Docker daemon is running.
2. Ensure ports `8080` and `8081` are free.
3. Check ArgoCD namespace pods:
   - `kubectl get pods -n argocd`
4. Check app namespace pods:
   - `kubectl get pods -n dev`
5. Inspect deployment events:
   - `kubectl describe deployment gitops-project -n dev`
6. Confirm branch-to-tag consistency:
   - `dev` uses `dev-latest`
   - `test` uses `test-latest`
   - `main` uses `latest`

## 11. First-day checklist for a new engineer

1. Install prerequisites (Node 20, Docker, kind, kubectl).
2. Run frontend locally (`cd app && npm ci && npm run dev`).
3. Run quality checks (`lint`, `check`, `test`, `build`).
4. Bootstrap GitOps stack (`./startup.sh`).
5. Log into ArgoCD at `https://localhost:8081`.
6. Verify app health in namespace `dev`.
7. Work in `dev` and promote via PR to `test`, then `main`.
