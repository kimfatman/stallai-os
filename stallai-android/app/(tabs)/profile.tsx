import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../../components/ui/GlassCard';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);

  const menuItems = [
    { icon: 'storefront', title: '摊位信息', subtitle: '管理您的摊位设置', color: colors.wood },
    { icon: 'person', title: '个人信息', subtitle: '查看和编辑个人资料', color: colors.info },
    { icon: 'trophy', title: '成就中心', subtitle: '查看已解锁成就', color: colors.warning },
    { icon: 'bell', title: '消息通知', subtitle: '系统消息和提醒', color: colors.error },
    { icon: 'help-circle', title: '帮助中心', subtitle: '使用指南和常见问题', color: colors.mediumGray },
    { icon: 'settings', title: '设置', subtitle: '应用偏好设置', color: colors.mediumGray },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>我的</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.white} />
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="trophy" size={12} color={colors.wood} />
              <Text style={styles.levelText}>Lv.3</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || '摊主'}</Text>
            <Text style={styles.stallName}>街边小吃摊</Text>
            <View style={styles.expBar}>
              <View style={[styles.expProgress, { width: '65%' }]} />
            </View>
            <Text style={styles.expText}>还需 350 经验升级</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>128</Text>
              <Text style={styles.statLabel}>总订单</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3,280</Text>
              <Text style={styles.statLabel}>总收入</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>连续天数</Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Animated.View key={item.title} entering={FadeInUp.delay(index * 50).duration(400)}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.mediumGray} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <GlassCard style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <Text style={styles.aboutTitle}>摆摊AI经营OS</Text>
            <Text style={styles.versionText}>版本 1.0.0</Text>
          </View>
          <Text style={styles.aboutDesc}>智能摆摊经营管理助手，让您的生意更轻松</Text>
        </GlassCard>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: typography.sizes.xxxl, fontWeight: '700', color: colors.darkGray },
  profileCard: { marginHorizontal: spacing.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.wood, justifyContent: 'center', alignItems: 'center' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${colors.wood}15`, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 10, marginTop: -12 },
  levelText: { fontSize: typography.sizes.xs, color: colors.wood, fontWeight: '600' },
  profileInfo: { flex: 1, marginLeft: spacing.lg },
  userName: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.darkGray },
  stallName: { fontSize: typography.sizes.sm, color: colors.mediumGray, marginTop: spacing.xs },
  expBar: { height: 6, backgroundColor: colors.lightGray, borderRadius: 3, marginTop: spacing.md },
  expProgress: { height: 6, backgroundColor: colors.wood, borderRadius: 3 },
  expText: { fontSize: typography.sizes.xs, color: colors.mediumGray, marginTop: spacing.xs },
  statsCard: { marginHorizontal: spacing.md, marginTop: spacing.md, padding: spacing.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.darkGray },
  statLabel: { fontSize: typography.sizes.xs, color: colors.mediumGray, marginTop: spacing.xs },
  statDivider: { width: 1, backgroundColor: colors.lightGray },
  menuSection: { marginTop: spacing.lg, marginHorizontal: spacing.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  menuIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuInfo: { flex: 1, marginLeft: spacing.md },
  menuTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.darkGray },
  menuSubtitle: { fontSize: typography.sizes.xs, color: colors.mediumGray, marginTop: 2 },
  aboutCard: { marginHorizontal: spacing.md, marginTop: spacing.lg, padding: spacing.lg, alignItems: 'center' },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aboutTitle: { fontSize: typography.sizes.lg, fontWeight: '600', color: colors.darkGray },
  versionText: { fontSize: typography.sizes.xs, color: colors.mediumGray },
  aboutDesc: { fontSize: typography.sizes.sm, color: colors.mediumGray, marginTop: spacing.sm, textAlign: 'center' },
  bottomPadding: { height: 100 },
});