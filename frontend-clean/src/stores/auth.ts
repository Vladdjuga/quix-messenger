import { create } from 'zustand';
import { User } from '@/types';
import { getCurrentUser } from '@/services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: (user: User) => {
    set({
      user,
      isAuthenticated: true,
      error: null,
    });
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      set({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      return;
    }

    try {
      const response = await getCurrentUser();
      
      if (response.success && response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Token is invalid
        localStorage.removeItem('authToken');
        set({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: response.error || null,
        });
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      set({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error instanceof Error ? error.message : 'Auth check failed',
      });
    }
  },
}));
