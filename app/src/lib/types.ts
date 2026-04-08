export interface HeroData {
  title: string;
  subtitle: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  techStack: string[];
  imageUrl?: string;
  repoUrl?: string;
  liveUrl?: string;
}

export interface ContactRequest {
  name?: string;
  email: string;
  message: string;
}
