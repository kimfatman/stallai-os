import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { focused: IconName; unfocused: IconName }> = {
  dashboard: { focused: 'grid', unfocused: 'grid-outline' },
  accounts: { focused: 'wallet', unfocused: 'wallet-outline' },
  inventory: { focused: 'cube', unfocused: 'cube-outline' },
  insights: { focused: 'analytics', unfocused: 'analytics-outline' },
  profile: { focused: 'person', unfocused: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
  dashboard: '首页',
  accounts: '记账',
  inventory: '库存',
  insights: '分析',
  profile: '我的',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.wood,
        tabBarInactiveTintColor: colors.mediumGray,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {Object.entries(TAB_LABELS).map(([name, label]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused
                ? TAB_ICONS[name].focused
                : TAB_ICONS[name].unfocused;
              return (
                <Ionicons
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
            },
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.white,
    borderTopWidth: 0,
    elevation: 0,
    height: 70,
    paddingBottom: Platform.OS === 'android' ? spacing.sm : 0,
    paddingTop: spacing.xs,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabBarIcon: {
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});
