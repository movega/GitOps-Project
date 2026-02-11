import React from 'react';
import { motion } from 'framer-motion';
import { SectionContainer } from '../components/SectionContainer';

export const Hero = () => {
  return (
    <SectionContainer index=".01" id="hero">
      <div className="h-full flex flex-col justify-between min-h-[70vh]">
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tighter leading-none">TU</span>
            <span className="font-bold text-2xl tracking-tighter leading-none">RA</span>
          </div>
          
          <div className="flex gap-8 text-xs font-semibold tracking-widest">
            <a href="#projects" className="hover:text-white text-secondary transition-colors">PROJECTS</a>
            <a href="#contact" className="hover:text-white text-secondary transition-colors">CONTACT</a>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center flex-1 text-center relative">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
            >
                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block">Project</span>
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white mb-4 drop-shadow-2xl">
                    TURA
                </h1>
                <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-secondary">
                    A Junior Web-Designer
                </p>
                <div className="w-full h-[1px] bg-white/20 mt-8 max-w-[200px] mx-auto"></div>
                <span className="text-[10px] text-white/40 mt-2 block">since 2018</span>
            </motion.div>
            
            {/* Background decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl -z-0"></div>
        </div>

        {/* Bottom Metadata */}
        <div className="flex justify-between items-end text-[10px] text-secondary uppercase tracking-wider">
            <div className="flex flex-col gap-1">
                <span className="text-white/40">Typography</span>
                <span>Cera CY</span>
            </div>
            <div className="flex flex-col gap-1 items-end">
                <span className="text-white/40">Color</span>
                <div className="w-4 h-4 rounded-full bg-white border border-white/20"></div>
            </div>
        </div>
      </div>
    </SectionContainer>
  );
};
