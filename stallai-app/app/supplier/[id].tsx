import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import GlassCard from '@/components/ui/GlassCard';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
}

const mockSupplier = {
  id: '1',
  name: '老王食材批发',
  category: '主食原料',
  rating: 4.8,
  reviews: 1234,
  products: 156,
  minOrder: 200,
  phone: '138-8888-8888',
  address: '朝阳区望京街道88号',
  businessHours: '06:00 - 22:00',
  description: '专注食材批发20年，源头厂家直供，品质保障，价格实惠。覆盖北京市区免费配送，新客户首单满500减50。',
  tags: ['源头厂家', '配送上门', '新品优惠', '品质保障'],
  isVerified: true,
  productsList: [
    { id: '1', name: '烤冷面面皮', price: 35, unit: '箱/50张' },
    { id: '2', name: '鸡蛋', price: 8.5, unit: '箱/30个' },
    { id: '3', name: '烤肠', price: 55, unit: '箱/100根' },
    { id: '4', name: '面粉', price: 45, unit: '袋/25kg' },
    { id: '5', name: '酱料包', price: 28, unit: '箱/200包' },
  ] as Product[],
};

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'info' | 'reviews'>('products');

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {}}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Supplier Info Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <GlassCard style={styles.infoCard}>
            <View style={styles.supplierHeader}>
              <View style={styles.supplierAvatar}>
                <MaterialCommunityIcons name="store" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.supplierBasic}>
                <View style={styles.nameRow}>
                  <Text style={styles.supplierName}>{mockSupplier.name}</Text>
                  {mockSupplier.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#43A047" />
                      <Text style={styles.verifiedText}>认证</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.supplierCategory}>{mockSupplier.category}</Text>
                <View style={styles.ratingRow}>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.floor(mockSupplier.rating) ? 'star' : 'star-outline'}
                        size={14}
                        color="#FFB300"
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>{mockSupplier.rating}</Text>
                  <Text style={styles.reviewsText}>({mockSupplier.reviews}条评价)</Text>
                </View>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {mockSupplier.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <MaterialCommunityIcons name="package-variant" size={24} color="#E53935" />
              <Text style={styles.statValue}>{mockSupplier.products}</Text>
              <Text style={styles.statLabel}>在售商品</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <MaterialCommunityIcons name="currency-usd" size={24} color="#43A047" />
              <Text style={styles.statValue}>¥{mockSupplier.minOrder}</Text>
              <Text style={styles.statLabel}>起批金额</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color="#1E88E5" />
              <Text style={styles.statValueSmall}>{mockSupplier.businessHours}</Text>
              <Text style={styles.statLabel}>营业时间</Text>
            </GlassCard>
          </View>
        </Animated.View>

        {/* Tab Buttons */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'products' && styles.tabButtonActive]}
              onPress={() => setActiveTab('products')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'products' && styles.tabButtonTextActive]}>
                商品列表
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'info' && styles.tabButtonActive]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'info' && styles.tabButtonTextActive]}>
                商家信息
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'reviews' && styles.tabButtonActive]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'reviews' && styles.tabButtonTextActive]}>
                评价
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Content based on active tab */}
        {activeTab === 'products' && (
          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <View style={styles.productsList}>
              {mockSupplier.productsList.map((product, index) => (
                <Animated.View
                  key={product.id}
                  entering={FadeInUp.delay(450 + index * 50).duration(400)}
                >
                  <GlassCard style={styles.productCard}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productUnit}>{product.unit}</Text>
                    </View>
                    <View style={styles.productPrice}>
                      <Text style={styles.productPriceValue}>¥{product.price}</Text>
                      <TouchableOpacity style={styles.addButton}>
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {activeTab === 'info' && (
          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <GlassCard style={styles.infoSection}>
              <Text style={styles.sectionTitle}>商家简介</Text>
              <Text style={styles.descriptionText}>{mockSupplier.description}</Text>
            </GlassCard>

            <GlassCard style={styles.infoSection}>
              <Text style={styles.sectionTitle}>联系方式</Text>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#757575" />
                <Text style={styles.infoText}>{mockSupplier.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#757575" />
                <Text style={styles.infoText}>{mockSupplier.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#757575" />
                <Text style={styles.infoText}>{mockSupplier.businessHours}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {activeTab === 'reviews' && (
          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <GlassCard style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.reviewerAvatarText}>摊</Text>
                </View>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>烤肠侠</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons key={star} name="star" size={12} color="#FFB300" />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>2024-01-15</Text>
              </View>
              <Text style={styles.reviewContent}>
                食材质量非常好，价格也很实惠。老板人很热情，配送也很准时。已经回购很多次了！
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>在线咨询</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
          <MaterialCommunityIcons name="phone" size={22} color="#E53935" />
          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>电话联系</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    height: 200,
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginBottom: 16,
  },
  supplierHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  supplierAvatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supplierBasic: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  supplierName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedText: {
    fontSize: 12,
    color: '#43A047',
  },
  supplierCategory: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reviewsText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 12,
    color: '#E53935',
  },
  statsRow: {
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
    marginTop: 8,
  },
  statValueSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#E53935',
    fontWeight: '600',
  },
  productsList: {
    gap: 10,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  productUnit: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  productPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productPriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    flex: 1,
  },
  reviewCard: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewerAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  reviewContent: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 120,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 6,
  },
  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E53935',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonTextSecondary: {
    color: '#E53935',
  },
});
