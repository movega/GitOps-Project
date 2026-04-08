import React from 'react';
import { motion } from 'framer-motion';
import { SectionContainer } from '../components/SectionContainer';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

export const Projects = () => {
  const projects = usePortfolioStore((state) => state.projects);

  return (
    <SectionContainer index=".02" id="projects">
      <div className="h-full flex flex-col min-h-[70vh]">
        <div className="flex justify-between items-start mb-12">
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tighter leading-none">GO</span>
            <span className="font-bold text-2xl tracking-tighter leading-none text-accent">FC</span>
          </div>
          <div className="flex gap-8 text-xs font-semibold tracking-widest">
            <a href="#projects" className="text-white transition-colors">JORNADAS</a>
            <a href="#contact" className="hover:text-white text-secondary transition-colors">CONTACTO</a>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-3">Calendario del pipeline</h2>
            <p className="text-secondary text-sm md:text-base">
              Cada jornada representa una fase de CI/CD. El objetivo es simple: cambios seguros, build estable y despliegue continuo sin friccion.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {projects.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="bg-surface/60 border border-white/10 rounded-sm overflow-hidden hover:border-accent/60 transition-colors"
              >
                {project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="aspect-video w-full object-cover opacity-80"
                  />
                )}
                <div className="p-6 md:p-8 space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-accent block mb-3">
                      Fase {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">
                      {project.title}
                    </h2>
                    {project.description && (
                      <p className="text-secondary text-sm leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={`${project.id}-${tech}`}
                        className="text-[10px] uppercase tracking-wider border border-white/20 px-2 py-0.5 rounded-sm text-secondary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-secondary hover:text-white transition-colors uppercase"
                      >
                        <Github size={14} />
                        Repo
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-secondary hover:text-white transition-colors uppercase"
                      >
                        <ExternalLink size={14} />
                        Live
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="#contact"
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-secondary hover:text-white transition-colors"
          >
            PASAR A CONTACTO <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </SectionContainer>
  );
};
