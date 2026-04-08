import type { HeroData, ProjectItem } from './types';

export const heroSeed: HeroData = {
  title: 'GitOps Matchday',
  subtitle: 'CI/CD rapido, estable y listo para produccion',
};

export const projectsSeed: ProjectItem[] = [
  {
    id: '76a6374e-85d3-4d95-870d-058dbf4f57be',
    title: 'Jornada 1: Build',
    description:
      'Pipeline de build reproducible con chequeos tempranos para llegar al despliegue con una base solida.',
    techStack: ['GitHub Actions', 'Node.js', 'TypeScript', 'Cache', 'Docker'],
    imageUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
    repoUrl: 'https://github.com/alvaro/gitops-delivery-platform',
    liveUrl: 'https://gitops-delivery-platform.example.com',
  },
  {
    id: '4fba26ff-52f5-4fc7-8601-57ecfb5f5fbe',
    title: 'Jornada 2: Test',
    description:
      'Validaciones automaticas para proteger la calidad antes de cada merge a rama principal.',
    techStack: ['Vitest', 'Testing Library', 'Lint', 'Type Check', 'Coverage'],
    imageUrl:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80',
    repoUrl: 'https://github.com/alvaro/observability-control-center',
    liveUrl: 'https://observability-control.example.com',
  },
  {
    id: '7bf0f20e-3c29-4d1f-9e2f-f0a4d2f74bf3',
    title: 'Jornada 3: Deploy',
    description:
      'Despliegue continuo con trazabilidad de cambios para publicar versiones sin friccion.',
    techStack: ['ArgoCD', 'Kubernetes', 'Kustomize', 'Rollout', 'Observability'],
    imageUrl:
      'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1600&q=80',
    repoUrl: 'https://github.com/alvaro/platform-engineering-starter',
    liveUrl: 'https://platform-starter.example.com',
  },
];

export const contactProfileSeed = {
  address: 'Madrid, Espana',
  phone: '+34 600 123 456',
  email: 'gitops.club@example.com',
};
