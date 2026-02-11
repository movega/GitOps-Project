import React from 'react';
import { motion } from 'framer-motion';
import { SectionContainer } from '../components/SectionContainer';

export const Contact = () => {
  return (
    <SectionContainer index=".03" id="contact">
      <div className="h-full flex flex-col min-h-[70vh]">
        {/* Header */}
        <div className="flex justify-between items-start mb-20">
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tighter leading-none">TU</span>
            <span className="font-bold text-2xl tracking-tighter leading-none">RA</span>
          </div>
          <div className="flex gap-8 text-xs font-semibold tracking-widest">
            <a href="#projects" className="hover:text-white text-secondary transition-colors">PROJECTS</a>
            <a href="#contact" className="text-white transition-colors">CONTACT</a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24 flex-1">
            {/* Left Column: Info */}
            <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold uppercase tracking-widest mb-8">Contact</h3>
                <p className="text-secondary text-sm leading-relaxed mb-12">
                    I am currently available for freelance projects. 
                    If you have a project that you want to get started, 
                    think you need my help with something or just fancy saying hey, 
                    then get in touch.
                </p>

                <div className="space-y-8">
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2">Address</h4>
                        <p className="text-sm">123 Design Street, Creative City, 90210</p>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2">Phone</h4>
                        <p className="text-sm">+1 (555) 123-4567</p>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2">Email</h4>
                        <p className="text-sm">hello@tura-design.com</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="flex flex-col justify-center bg-surface/30 p-8 md:p-12 rounded-sm border border-white/5">
                <h3 className="text-lg font-bold uppercase tracking-widest mb-8">Contact Form</h3>
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-secondary">Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-background border-b border-white/10 p-2 focus:border-white outline-none transition-colors text-sm"
                            placeholder="Your Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-secondary">Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-background border-b border-white/10 p-2 focus:border-white outline-none transition-colors text-sm"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-secondary">Message</label>
                        <textarea 
                            rows={4}
                            className="w-full bg-background border-b border-white/10 p-2 focus:border-white outline-none transition-colors text-sm resize-none"
                            placeholder="Tell me about your project"
                        ></textarea>
                    </div>
                    <button type="submit" className="mt-8 px-8 py-3 bg-white text-black text-xs font-bold tracking-widest hover:bg-gray-200 transition-colors uppercase w-full md:w-auto">
                        Send Message
                    </button>
                </form>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center">
            <p className="text-xs font-bold tracking-[0.2em] mb-2">THANKS FOR WATCHING!</p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">© 2024 Tura Design</p>
        </div>
      </div>
    </SectionContainer>
  );
};
