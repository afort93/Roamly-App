import { create } from 'zustand';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  is_premium: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isAuthModalOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { access_token } = response.data;
      const decoded = jwtDecode(access_token) as any;
      
      const user: User = {
        id: decoded.sub,
        email: decoded.email || email,
        is_premium: decoded.is_premium || false,
      };

      localStorage.setItem('roamly_token', access_token);
      set({ 
        token: access_token, 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.detail || 'Login failed', 
        isLoading: false 
      });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post('/api/auth/register', { email, password });
      // After registration, log in automatically
      const response = await axios.post('/api/auth/login', { email, password });
      const { access_token } = response.data;
      const decoded = jwtDecode(access_token) as any;

      const user: User = {
        id: decoded.sub,
        email: decoded.email || email,
        is_premium: decoded.is_premium || false,
      };

      localStorage.setItem('roamly_token', access_token);
      set({ 
        token: access_token, 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.detail || 'Registration failed', 
        isLoading: false 
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('roamly_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('roamly_token');
    if (token) {
      try {
        const decoded = jwtDecode(token) as any;
        // Check expiration
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('roamly_token');
          set({ token: null, user: null, isAuthenticated: false });
          return;
        }

        const user: User = {
          id: decoded.sub,
          email: decoded.email,
          is_premium: decoded.is_premium || false,
        };
        set({ token, user, isAuthenticated: true });
      } catch (err) {
        localStorage.removeItem('roamly_token');
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },

  clearError: () => set({ error: null }),
}));
