import React from 'react';
import { Hero } from './sections/Hero';
import { Projects } from './sections/Projects';
import { Contact } from './sections/Contact';

function App() {
  return (
    <div className="relative w-full min-h-screen bg-background text-primary selection:bg-white selection:text-black">
      <div className="grain-overlay"></div>
      
      <main className="relative z-10 max-w-7xl mx-auto">
        <Hero />
        <Projects />
        <Contact />
      </main>
    </div>
  );
}

export default App;
