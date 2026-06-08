import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-teal text-brand-cream/60 py-12 px-6 text-center">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0 text-left">
          <span className="text-2xl font-black text-white tracking-tighter">Roamly</span>
          <p className="mt-2 text-sm font-medium">© 2024 Roamly Inc. All rights reserved.</p>
        </div>
        <div className="flex space-x-8 text-sm font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-brand-orange transition">Terms</a>
          <a href="#" className="hover:text-brand-orange transition">Privacy</a>
          <a href="#" className="hover:text-brand-orange transition">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
