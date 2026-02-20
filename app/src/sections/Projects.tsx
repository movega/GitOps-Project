import React from 'react';
import { motion } from 'framer-motion';
import { SectionContainer } from '../components/SectionContainer';
import { ArrowUpRight } from 'lucide-react';

export const Projects = () => {
  return (
    <SectionContainer index=".02" id="projects">
      <div className="h-full flex flex-col min-h-[70vh]">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tighter leading-none">TU</span>
            <span className="font-bold text-2xl tracking-tighter leading-none">RA</span>
          </div>
          <div className="flex gap-8 text-xs font-semibold tracking-widest">
            <a href="#projects" className="text-white transition-colors">PROJECTS</a>
            <a href="#contact" className="hover:text-white text-secondary transition-colors">CONTACT</a>
          </div>
        </div>

        {/* Project Showcase */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-4xl relative"
            >
                {/* Image Placeholder */}
                <div className="aspect-video w-full bg-surface border border-white/10 rounded-sm overflow-hidden relative group cursor-pointer">
                    <img 
                        src="https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Minimalist%20dark%20coffee%20shop%20website%20interface%20mockup%2C%20high%20contrast%2C%20elegant%2C%20monochrome&image_size=landscape_16_9" 
                        alt="Keet Cafe Project" 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-center">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">KEET CAFE</h2>
                        <p className="text-secondary max-w-md mx-auto text-sm mb-8 leading-relaxed">
                            Save some time and be wonderful. A digital experience designed for the modern coffee connoisseur, featuring minimalist aesthetics and seamless ordering flow.
                        </p>
                        <button className="px-8 py-3 border border-white/30 text-xs font-bold tracking-widest hover:bg-white hover:text-black transition-all duration-300 uppercase">
                            View Project
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>

        <div className="mt-12 flex justify-center">
            <button className="flex items-center gap-2 text-xs font-bold tracking-widest text-secondary hover:text-white transition-colors">
                ALL PROJECTS <ArrowUpRight size={14} />
            </button>
        </div>
      </div>
    </SectionContainer>
  );
};
