import { create } from 'zustand';
import { contactProfileSeed, heroSeed, projectsSeed } from '@/lib/portfolioData';
import type { ContactRequest, HeroData, ProjectItem } from '@/lib/types';

interface PortfolioStore {
  hero: HeroData;
  projects: ProjectItem[];
  contactProfile: {
    address: string;
    phone: string;
    email: string;
  };
  sendContact: (request: ContactRequest) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioStore>(() => ({
  hero: heroSeed,
  projects: projectsSeed,
  contactProfile: contactProfileSeed,
  sendContact: async (request) => {
    // Placeholder behavior until /contact/send is connected.
    console.info('Contact request queued', request);
  },
}));
