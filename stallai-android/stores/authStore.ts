import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  // Auth status
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  
  // User data
  user: User | null;
  
  // Actions
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateToken: (token: string) => void;
  
  // Getters
  getUserId: () => string | null;
  getUserName: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      user: null,
      
      login: (token, refreshToken, user) => set({
        isAuthenticated: true,
        token,
        refreshToken,
        user,
      }),
      
      logout: () => set({
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        user: null,
      }),
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
      
      updateToken: (token) => set({ token }),
      
      getUserId: () => get().user?.id || null,
      
      getUserName: () => get().user?.name || null,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
