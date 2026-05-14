import { create } from 'zustand';

interface User {
  id: string;
  nickname: string;
  avatar?: string;
  level: number;
  exp: number;
  streak: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addExp: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: {
    id: '1',
    nickname: '新手摊主',
    level: 5,
    exp: 2450,
    streak: 5,
  },
  token: null,
  isAuthenticated: true,
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  
  setToken: (token) => set({ token }),
  
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  
  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } });
    }
  },
  
  addExp: (amount) => {
    const currentUser = get().user;
    if (currentUser) {
      const newExp = currentUser.exp + amount;
      const expPerLevel = 1000;
      let newLevel = currentUser.level;
      let remainingExp = newExp;
      
      while (remainingExp >= expPerLevel) {
        remainingExp -= expPerLevel;
        newLevel += 1;
      }
      
      set({
        user: {
          ...currentUser,
          exp: remainingExp,
          level: newLevel,
        },
      });
    }
  },
}));
