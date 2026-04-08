import type { HeroData, ProjectItem } from './types';

export const heroSeed: HeroData = {
  title: 'Senior Frontend Engineer',
  subtitle: 'Especialista en GitOps y Kubernetes',
};

export const projectsSeed: ProjectItem[] = [
  {
    id: '76a6374e-85d3-4d95-870d-058dbf4f57be',
    title: 'GitOps Delivery Platform',
    description:
      'Automatizacion end-to-end con ArgoCD, Kustomize y despliegues por entorno para acelerar releases sin perder trazabilidad.',
    techStack: ['React', 'TypeScript', 'Kubernetes', 'ArgoCD', 'Kustomize'],
    imageUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
    repoUrl: 'https://github.com/alvaro/gitops-delivery-platform',
    liveUrl: 'https://gitops-delivery-platform.example.com',
  },
  {
    id: '4fba26ff-52f5-4fc7-8601-57ecfb5f5fbe',
    title: 'Observability Control Center',
    description:
      'Panel operativo para servicios cloud-native con foco en disponibilidad, alertas y rendimiento en tiempo real.',
    techStack: ['React', 'Tailwind CSS', 'Prometheus', 'Grafana', 'Docker'],
    imageUrl:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80',
    repoUrl: 'https://github.com/alvaro/observability-control-center',
    liveUrl: 'https://observability-control.example.com',
  },
  {
    id: '7bf0f20e-3c29-4d1f-9e2f-f0a4d2f74bf3',
    title: 'Platform Engineering Starter',
    description:
      'Template productivo para equipos que inician su adopcion de GitOps con pipelines, manifiestos base y overlays listos para usar.',
    techStack: ['Vite', 'Framer Motion', 'Zustand', 'Kubernetes', 'GitHub Actions'],
    imageUrl:
      'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1600&q=80',
    repoUrl: 'https://github.com/alvaro/platform-engineering-starter',
    liveUrl: 'https://platform-starter.example.com',
  },
];

export const contactProfileSeed = {
  address: 'Santiago, Chile',
  phone: '+56 9 1234 5678',
  email: 'contact@alvaro.dev',
};
