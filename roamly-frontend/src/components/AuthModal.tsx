import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AuthModal: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    login, 
    register, 
    isLoading, 
    error,
    clearError 
  } = useAuthStore();

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      closeAuthModal();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeAuthModal}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={closeAuthModal}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-brand-teal hover:bg-brand-teal/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              {isLogin ? 'Welcome back' : 'Join ZipTrip'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isLogin 
                ? 'Sign in to access your saved itineraries' 
                : 'Plan and save your perfect day trips'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-2xl transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-2xl transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl animate-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-orange hover:bg-orange-600 disabled:bg-orange-300 text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-brand-orange/20 active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <button
              onClick={toggleMode}
              className="text-gray-500 font-bold hover:text-brand-teal transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
