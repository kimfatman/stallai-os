/**
 * 底部标签页布局
 * Tab Navigation Layout
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/src/stores/ThemeContext';

/**
 * 标签栏图标配置
 */
type TabIconName = 'home' | 'home-outline' |
  'grid' | 'grid-outline' |
  'receipt' | 'receipt-outline' |
  'cube' | 'cube-outline' |
  'analytics' | 'analytics-outline' |
  'people' | 'people-outline';

/**
 * 标签页配置
 */
const tabs = [
  {
    name: 'dashboard',
    label: '驾驶舱',
    icon: 'home' as TabIconName,
    iconOutline: 'home-outline' as TabIconName,
  },
  {
    name: 'accounts',
    label: '记账',
    icon: 'receipt' as TabIconName,
    iconOutline: 'receipt-outline' as TabIconName,
  },
  {
    name: 'inventory',
    label: '库存',
    icon: 'cube' as TabIconName,
    iconOutline: 'cube-outline' as TabIconName,
  },
  {
    name: 'insights',
    label: '分析',
    icon: 'analytics' as TabIconName,
    iconOutline: 'analytics-outline' as TabIconName,
  },
  {
    name: 'community',
    label: '社区',
    icon: 'people' as TabIconName,
    iconOutline: 'people-outline' as TabIconName,
  },
];

/**
 * 底部标签页布局组件
 */
export default function TabLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        // 隐藏头部
        headerShown: false,
        // 标签栏样式
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        // 标签栏激活样式
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
        // 标签栏文字样式
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            // 标签栏图标
            tabBarIcon: ({ focused, color, size }) => (
              <View className="relative">
                <Ionicons
                  name={focused ? tab.icon : tab.iconOutline}
                  size={size}
                  color={color}
                />
                {/* 聚焦指示器 */}
                {focused && (
                  <View className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                )}
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
