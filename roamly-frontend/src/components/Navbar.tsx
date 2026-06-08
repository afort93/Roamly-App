import React from 'react';
import { Link } from 'react-router-dom';
import { Map, User } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-100 py-5 px-6 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center space-x-2 text-2xl font-black text-brand-teal">
        <Map className="w-8 h-8 text-brand-orange" />
        <span className="tracking-tighter">Roamly</span>
      </Link>
      
      <div className="flex items-center space-x-6 font-bold">
        <Link to="/account" className="text-gray-500 hover:text-brand-teal transition flex items-center space-x-1">
          <User className="w-5 h-5" />
          <span className="hidden sm:inline">Account</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
