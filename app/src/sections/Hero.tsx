import React from 'react';
import { motion } from 'framer-motion';
import { SectionContainer } from '../components/SectionContainer';
import { usePortfolioStore } from '@/store/usePortfolioStore';

export const Hero = () => {
  const hero = usePortfolioStore((state) => state.hero);

  return (
    <SectionContainer index=".01" id="hero">
      <div className="h-full flex flex-col justify-between min-h-[70vh]">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tighter leading-none">GO</span>
            <span className="font-bold text-2xl tracking-tighter leading-none text-accent">FC</span>
          </div>
          
          <div className="flex gap-8 text-xs font-semibold tracking-widest">
            <a href="#projects" className="hover:text-white text-secondary transition-colors">JORNADAS</a>
            <a href="#contact" className="hover:text-white text-secondary transition-colors">CONTACTO</a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 text-center relative">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
            >
                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block">Estadio de despliegues</span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 drop-shadow-2xl">
                    {hero.title}
                </h1>
                <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-secondary">
                    {hero.subtitle}
                </p>
                <div className="w-full h-[1px] bg-white/20 mt-8 max-w-[220px] mx-auto"></div>
                <span className="text-[10px] text-white/40 mt-2 block">build, test y deploy en una sola alineacion</span>
            </motion.div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] stadium-glow rounded-full blur-3xl -z-0"></div>
        </div>

        <div className="rounded-sm border border-accent/20 bg-accentSoft/20 px-4 py-3 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-secondary">Estado del partido CI/CD</div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.16em]">
            <span className="inline-flex items-center gap-2 text-white/90">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Build OK
            </span>
            <span className="inline-flex items-center gap-2 text-white/90">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Tests OK
            </span>
            <span className="inline-flex items-center gap-2 text-white/90">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Deploy listo
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end text-[10px] text-secondary uppercase tracking-wider">
            <div className="flex flex-col gap-1">
                <span className="text-white/40">Ritmo</span>
                <span>Partido nocturno</span>
            </div>
            <div className="flex flex-col gap-1 items-end">
                <span className="text-white/40">Color</span>
                <div className="w-4 h-4 rounded-full bg-accent border border-white/20"></div>
            </div>
        </div>
      </div>
    </SectionContainer>
  );
};
