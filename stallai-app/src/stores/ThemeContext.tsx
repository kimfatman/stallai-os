/**
 * 主题状态管理
 * Theme State Management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themePreference: Theme;
  setThemePreference: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@stallai_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<Theme>('system');
  const [isInitialized, setIsInitialized] = useState(false);

  // 从存储加载主题偏好
  useEffect(() => {
    loadThemePreference();
  }, []);

  // 根据偏好确定实际主题
  const theme = themePreference === 'system'
    ? (systemColorScheme || 'light')
    : themePreference;

  // 加载保存的主题偏好
  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setThemePreferenceState(saved as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  // 设置主题偏好
  const setThemePreference = async (newTheme: Theme) => {
    setThemePreferenceState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // 切换主题 (仅在 light/dark 间切换)
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemePreference(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themePreference,
        setThemePreference,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
