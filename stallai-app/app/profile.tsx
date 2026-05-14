import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import { useAuthStore } from '@/stores/authStore';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  unlocked: boolean;
}

interface DailyTask {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
}

const mockAchievements: Achievement[] = [
  { id: '1', icon: 'trophy', title: '新手摊主', description: '完成首次销售', progress: 1, total: 1, unlocked: true },
  { id: '2', icon: 'fire', title: '连续7天', description: '连续出摊7天', progress: 5, total: 7, unlocked: false },
  { id: '3', icon: 'cash', title: '万元户', description: '累计收入达到1万元', progress: 8234, total: 10000, unlocked: false },
  { id: '4', icon: 'star', title: '五星好评', description: '获得50个五星好评', progress: 42, total: 50, unlocked: false },
  { id: '5', icon: 'people', title: '社群达人', description: '分享10次经营心得', progress: 7, total: 10, unlocked: false },
];

const mockDailyTasks: DailyTask[] = [
  { id: '1', title: '完成5笔订单', reward: 20, completed: true },
  { id: '2', title: '查看AI日报', reward: 10, completed: true },
  { id: '3', title: '记账3笔', reward: 15, completed: false },
  { id: '4', title: '库存盘点', reward: 25, completed: false },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const currentLevel = user?.level || 5;
  const currentExp = user?.exp || 2450;
  const nextLevelExp = 3000;
  const expProgress = (currentExp / nextLevelExp) * 100;

  const totalAchievements = mockAchievements.length;
  const unlockedAchievements = mockAchievements.filter(a => a.unlocked).length;

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '退出', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const menuItems = [
    { icon: 'person-outline', title: '个人信息', action: () => Alert.alert('个人信息', '功能开发中') },
    { icon: 'location-outline', title: '常用地址', action: () => router.push('/map') },
    { icon: 'wallet-outline', title: '我的钱包', action: () => Alert.alert('我的钱包', '功能开发中') },
    { icon: 'settings-outline', title: '设置', action: () => Alert.alert('设置', '功能开发中') },
    { icon: 'help-circle-outline', title: '帮助与反馈', action: () => Alert.alert('帮助反馈', '功能开发中') },
    { icon: 'document-text-outline', title: '用户协议', action: () => Alert.alert('用户协议', '功能开发中') },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={['#8B7355', '#735E46', '#8B7355']}
        style={styles.headerGradient}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.headerTitle}>个人中心</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => Alert.alert('设置', '功能开发中')}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <GlassCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>摊</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Lv.{currentLevel}</Text>
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.nickname || '新手摊主'}</Text>
                <View style={styles.streakBadge}>
                  <MaterialCommunityIcons name="fire" size={16} color="#FFB300" />
                  <Text style={styles.streakText}>连续出摊 {user?.streak || 5} 天</Text>
                </View>
                <View style={styles.expBar}>
                  <View style={[styles.expBarFill, { width: `${expProgress}%` }]} />
                  <Text style={styles.expText}>{currentExp}/{nextLevelExp} 经验</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <View style={styles.statsContainer}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>¥8,234</Text>
              <Text style={styles.statLabel}>累计收入</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>累计订单</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{unlockedAchievements}/{totalAchievements}</Text>
              <Text style={styles.statLabel}>成就</Text>
            </GlassCard>
          </View>
        </Animated.View>

        {/* Daily Tasks */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>每日任务</Text>
            <View style={styles.taskProgress}>
              <Text style={styles.taskProgressText}>
                {mockDailyTasks.filter(t => t.completed).length}/{mockDailyTasks.length}
              </Text>
            </View>
          </View>
          <GlassCard style={styles.tasksCard}>
            {mockDailyTasks.map((task, index) => (
              <View
                key={task.id}
                style={[
                  styles.taskItem,
                  index < mockDailyTasks.length - 1 && styles.taskItemBorder,
                ]}
              >
                <View style={styles.taskInfo}>
                  <View style={[styles.taskIcon, task.completed && styles.taskIconCompleted]}>
                    <Ionicons
                      name={task.completed ? 'checkmark' : 'ellipse-outline'}
                      size={18}
                      color={task.completed ? '#FFFFFF' : '#BDBDBD'}
                    />
                  </View>
                  <View>
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskReward}>+{task.reward}经验</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.claimButton, task.completed && styles.claimButtonCompleted]}
                  disabled={task.completed}
                >
                  <Text style={styles.claimButtonText}>
                    {task.completed ? '已完成' : '领取'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {/* Achievements */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>成就徽章</Text>
            <TouchableOpacity>
              <Text style={styles.moreLink}>查看全部</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsContainer}
          >
            {mockAchievements.map((achievement, index) => (
              <Animated.View
                key={achievement.id}
                entering={FadeInUp.delay(450 + index * 50).duration(400)}
              >
                <GlassCard
                  style={[
                    styles.achievementCard,
                    !achievement.unlocked && styles.achievementCardLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.achievementIcon,
                      !achievement.unlocked && styles.achievementIconLocked,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={achievement.icon as any}
                      size={28}
                      color={achievement.unlocked ? '#FFB300' : '#BDBDBD'}
                    />
                  </View>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  {!achievement.unlocked && (
                    <View style={styles.achievementProgress}>
                      <View
                        style={[
                          styles.achievementProgressFill,
                          { width: `${(achievement.progress / achievement.total) * 100}%` },
                        ]}
                      />
                    </View>
                  )}
                </GlassCard>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Menu */}
        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>更多功能</Text>
          <GlassCard style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.action}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={22} color="#757575" />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>
            ))}
          </GlassCard>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)}>
          <Text style={styles.sectionTitle}>偏好设置</Text>
          <GlassCard style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="notifications-outline" size={22} color="#757575" />
                <Text style={styles.settingItemText}>消息通知</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E0E0E0', true: '#E53935' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.settingItem, styles.menuItemBorder]}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="location-outline" size={22} color="#757575" />
                <Text style={styles.settingItemText}>位置权限</Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#E0E0E0', true: '#E53935' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInUp.delay(700).duration(500)}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>退出登录</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    height: 180,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#FFB300',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  streakText: {
    fontSize: 13,
    color: '#8B7355',
  },
  expBar: {
    height: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  expBarFill: {
    height: '100%',
    backgroundColor: '#8B7355',
    borderRadius: 10,
  },
  expText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 11,
    color: '#616161',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#757575',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  moreLink: {
    fontSize: 13,
    color: '#E53935',
  },
  taskProgress: {
    backgroundColor: '#E53935',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  taskProgressText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tasksCard: {
    marginBottom: 20,
    padding: 0,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  taskItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIconCompleted: {
    backgroundColor: '#43A047',
  },
  taskTitle: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  taskTitleCompleted: {
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  taskReward: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 2,
  },
  claimButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  claimButtonCompleted: {
    backgroundColor: '#F5F5F5',
  },
  claimButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  achievementsContainer: {
    gap: 12,
    paddingRight: 16,
    marginBottom: 20,
  },
  achievementCard: {
    width: 110,
    alignItems: 'center',
    padding: 14,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIconLocked: {
    backgroundColor: '#F5F5F5',
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 10,
    color: '#757575',
    textAlign: 'center',
  },
  achievementProgress: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#8B7355',
    borderRadius: 2,
  },
  menuCard: {
    marginBottom: 20,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  settingsCard: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  logoutButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 15,
    color: '#757575',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});
