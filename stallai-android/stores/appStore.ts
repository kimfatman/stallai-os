import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  // App settings
  isOnboardingComplete: boolean;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  language: 'zh' | 'en';
  
  // Actions
  setOnboardingComplete: (value: boolean) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleHaptics: () => void;
  setLanguage: (lang: 'zh' | 'en') => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  isOnboardingComplete: false,
  isDarkMode: false,
  notificationsEnabled: true,
  hapticsEnabled: true,
  language: 'zh' as const,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setOnboardingComplete: (value) => set({ isOnboardingComplete: value }),
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      toggleNotifications: () => set((state) => ({ 
        notificationsEnabled: !state.notificationsEnabled 
      })),
      
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      
      setLanguage: (lang) => set({ language: lang }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
