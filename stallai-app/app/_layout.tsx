/**
 * 根布局组件 - 摆摊AI经营OS
 * Root Layout - AI Street Vendor Management OS
 * 
 * 提供全局 Providers、主题配置和认证状态管理
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/stores/AuthContext';
import { ThemeProvider, useTheme } from '@/src/stores/ThemeContext';
import { initI18n } from '@/src/services/i18n';
import { initSentry } from '@/src/services/sentry';

// 创建全局 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5分钟内数据视为新鲜
      gcTime: 30 * 60 * 1000, // 30分钟缓存
    },
  },
});

/**
 * 初始化检查组件
 * 在应用启动时执行必要的初始化操作
 */
function InitGate({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // 初始化国际化
        await initI18n();
        // 初始化 Sentry (如果已配置)
        initSentry();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * 主题感知的状态栏组件
 */
function ThemedStatusBar() {
  const { theme } = useTheme();
  
  return (
    <StatusBar 
      style={theme === 'dark' ? 'light' : 'dark'} 
      backgroundColor="transparent"
      translucent 
    />
  );
}

/**
 * 根布局组件
 * 配置全局路由和 Providers
 */
function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <InitGate>
                <ThemedStatusBar />
                {/* 全局堆栈导航器 */}
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                    animation: 'slide_from_right',
                  }}
                >
                  {/* 首页 - AI 驾驶舱 */}
                  <Stack.Screen name="index" />
                  
                  {/* 底部标签页 */}
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  
                  {/* 商品详情 */}
                  <Stack.Screen 
                    name="product/[id]" 
                    options={{ 
                      headerShown: true,
                      headerTitle: '商品详情',
                      presentation: 'card',
                    }} 
                  />
                  
                  {/* 新建商品 */}
                  <Stack.Screen 
                    name="product/new" 
                    options={{ 
                      headerShown: true,
                      headerTitle: '添加商品',
                      presentation: 'modal',
                    }} 
                  />
                  
                  {/* 货源广场 */}
                  <Stack.Screen 
                    name="supplier/index" 
                    options={{ 
                      headerShown: true,
                      headerTitle: '货源广场',
                      presentation: 'card',
                    }} 
                  />
                  
                  {/* 供应商详情 */}
                  <Stack.Screen 
                    name="supplier/[id]" 
                    options={{ 
                      headerShown: true,
                      headerTitle: '供应商详情',
                      presentation: 'card',
                    }} 
                  />
                  
                  {/* 摆摊地图 */}
                  <Stack.Screen 
                    name="map" 
                    options={{ 
                      headerShown: true,
                      headerTitle: '摆摊地图',
                      presentation: 'card',
                    }} 
                  />
                  
                  {/* 个人中心 */}
                  <Stack.Screen 
                    name="profile" 
                    options={{ 
                      headerShown: true,
                      headerTitle: '个人中心',
                      presentation: 'card',
                    }} 
                  />
                  
                  {/* AI 每日报告 */}
                  <Stack.Screen 
                    name="ai/daily-report" 
                    options={{ 
                      headerShown: true,
                      headerTitle: '每日报告',
                      presentation: 'modal',
                    }} 
                  />
                  
                  {/* AI 选品 */}
                  <Stack.Screen 
                    name="ai/selection" 
                    options={{ 
                      headerShown: true,
                      headerTitle: 'AI 选品',
                      presentation: 'modal',
                    }} 
                  />
                  
                  {/* AI 爆款预测 */}
                  <Stack.Screen 
                    name="ai/prediction" 
                    options={{ 
                      headerShown: true,
                      headerTitle: '爆款预测',
                      presentation: 'modal',
                    }} 
                  />
                </Stack>
              </InitGate>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});

export default RootLayoutNav;
