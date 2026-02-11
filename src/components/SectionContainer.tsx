import React from 'react';
import { motion } from 'framer-motion';

interface SectionContainerProps {
  index: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({ index, children, className = '', id }) => {
  return (
    <section id={id} className={`relative flex w-full min-h-[90vh] py-12 ${className}`}>
      {/* Left Margin / Index */}
      <div className="w-16 md:w-24 flex flex-col items-center justify-end pb-8 border-r border-white/10 shrink-0">
        <span className="text-xs md:text-sm text-secondary font-mono tracking-widest -rotate-90 origin-center translate-y-full mb-8">
          {index}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-6 md:px-12 relative">
        {children}
        
        {/* Decorative right margin lines/elements could go here if needed */}
      </div>
      
      {/* Right Margin (Optional, for balance) */}
      <div className="w-8 md:w-16 hidden md:flex flex-col items-center justify-end pb-8 border-l border-white/10 shrink-0">
        <div className="h-12 w-[1px] bg-white/20"></div>
        <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase py-4 writing-vertical-rl">
          Scroll
        </span>
      </div>
    </section>
  );
};
