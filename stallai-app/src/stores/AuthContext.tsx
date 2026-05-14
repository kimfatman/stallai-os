/**
 * 认证状态管理
 * Authentication State Management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as AuthService from '@/src/services/auth';

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  level: string;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  days: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化检查
  useEffect(() => {
    checkAuth();
  }, []);

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const userData = await AuthService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const login = async (phone: string, code: string) => {
    try {
      const response = await AuthService.login(phone, code);
      await SecureStore.setItemAsync('auth_token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  // 登出
  const logout = async () => {
    try {
      await AuthService.logout();
      await SecureStore.deleteItemAsync('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      await SecureStore.deleteItemAsync('auth_token');
      setUser(null);
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      const userData = await AuthService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
