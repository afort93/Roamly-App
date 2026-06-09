import React from 'react';
import { Link } from 'react-router-dom';
import { Map, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, openAuthModal } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-100 py-5 px-6 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center space-x-2 text-2xl font-black text-brand-teal">
        <Map className="w-8 h-8 text-brand-orange" />
        <span className="tracking-tighter">Roamly</span>
      </Link>
      
      <div className="flex items-center space-x-4 sm:space-x-6 font-bold">
        {isAuthenticated ? (
          <>
            <Link to="/account" className="text-gray-500 hover:text-brand-teal transition flex items-center space-x-1">
              <div className="w-8 h-8 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center text-xs font-black uppercase">
                {user?.email?.[0] || 'U'}
              </div>
              <span className="hidden sm:inline">Account</span>
            </Link>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition p-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button 
            onClick={openAuthModal}
            className="px-6 py-2 bg-brand-teal text-white rounded-full hover:bg-teal-700 transition shadow-md shadow-brand-teal/10 flex items-center space-x-2"
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
