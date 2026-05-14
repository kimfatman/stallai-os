import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import GlassCard from '@/components/ui/GlassCard';

interface ProductSuggestion {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  profitMargin: number;
  popularity: number;
  difficulty: '简单' | '中等' | '困难';
  reason: string;
  supplier?: string;
  matchScore: number;
}

const mockSuggestions: ProductSuggestion[] = [
  {
    id: '1',
    name: '芝士土豆饼',
    category: '主食',
    price: 15,
    cost: 5,
    profitMargin: 66.7,
    popularity: 92,
    difficulty: '简单',
    reason: '根据您店铺周边学生群体较多，土豆类小吃在学生群体中接受度高，毛利率可观',
    matchScore: 95,
  },
  {
    id: '2',
    name: '爆浆鸡排',
    category: '肉类',
    price: 18,
    cost: 7,
    profitMargin: 61.1,
    popularity: 88,
    difficulty: '中等',
    reason: '近期周边夜市数据显示鸡肉类小吃销量上涨35%，建议尝试',
    matchScore: 88,
  },
  {
    id: '3',
    name: '柠檬茶',
    category: '饮品',
    price: 12,
    cost: 3,
    profitMargin: 75,
    popularity: 85,
    difficulty: '简单',
    reason: '饮品搭配主食销售效果显著，可提升客单价约20%',
    matchScore: 82,
  },
  {
    id: '4',
    name: '蒜蓉生蚝',
    category: '海鲜',
    price: 25,
    cost: 12,
    profitMargin: 52,
    popularity: 78,
    difficulty: '困难',
    reason: '海鲜类利润空间有限，且存储要求较高，暂不推荐',
    matchScore: 45,
  },
];

const categories = ['全部', '主食', '肉类', '饮品', '小吃', '甜点'];

export default function AISelectionScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuggestions = mockSuggestions.filter((product) => {
    const matchCategory = selectedCategory === '全部' || product.category === selectedCategory;
    const matchSearch = product.name.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单':
        return '#43A047';
      case '中等':
        return '#FFB300';
      case '困难':
        return '#E53935';
      default:
        return '#757575';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return '#43A047';
    if (score >= 60) return '#FFB300';
    return '#E53935';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={['#FAFAFA', '#F5F0EB', '#FFFFFF']}
        style={styles.background}
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
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>AI选品</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* AI Context */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <GlassCard variant="gradient" style={styles.contextCard}>
            <View style={styles.contextHeader}>
              <MaterialCommunityIcons name="brain" size={20} color="#FFFFFF" />
              <Text style={styles.contextTitle}>选品分析</Text>
            </View>
            <Text style={styles.contextText}>
              基于您店铺的位置（望京SOHO周边）、目标客群（18-30岁年轻人）以及当前热销品类，为您推荐以下商品：
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Search */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9E9E9E" />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索商品..."
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Product List */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          {filteredSuggestions.map((product, index) => (
            <Animated.View
              key={product.id}
              entering={FadeInUp.delay(450 + index * 100).duration(400)}
            >
              <GlassCard
                style={[
                  styles.productCard,
                  product.matchScore < 60 && styles.productCardLow,
                ]}
              >
                <View style={styles.productHeader}>
                  <View style={styles.productTitleRow}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{product.category}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.matchScore,
                      { backgroundColor: getMatchScoreColor(product.matchScore) + '20' },
                    ]}
                  >
                    <Ionicons
                      name="bulb"
                      size={14}
                      color={getMatchScoreColor(product.matchScore)}
                    />
                    <Text
                      style={[
                        styles.matchScoreText,
                        { color: getMatchScoreColor(product.matchScore) },
                      ]}
                    >
                      匹配度 {product.matchScore}%
                    </Text>
                  </View>
                </View>

                <View style={styles.productStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>售价</Text>
                    <Text style={styles.statValue}>¥{product.price}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>成本</Text>
                    <Text style={styles.statValueCost}>¥{product.cost}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>毛利</Text>
                    <Text style={styles.statValueProfit}>{product.profitMargin}%</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>难度</Text>
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(product.difficulty) },
                      ]}
                    >
                      {product.difficulty}
                    </Text>
                  </View>
                </View>

                <View style={styles.popularityBar}>
                  <Text style={styles.popularityLabel}>市场热度</Text>
                  <View style={styles.popularityTrack}>
                    <View
                      style={[styles.popularityFill, { width: `${product.popularity}%` }]}
                    />
                  </View>
                  <Text style={styles.popularityValue}>{product.popularity}%</Text>
                </View>

                <View style={styles.reasonContainer}>
                  <View style={styles.reasonIcon}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#8B7355" />
                  </View>
                  <Text style={styles.reasonText}>{product.reason}</Text>
                </View>

                <View style={styles.productActions}>
                  <TouchableOpacity style={styles.detailButton}>
                    <Text style={styles.detailButtonText}>查看详情</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      product.matchScore < 60 && styles.addButtonDisabled,
                    ]}
                    disabled={product.matchScore < 60}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>添加</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
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
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 44,
  },
  contextCard: {
    backgroundColor: '#8B7355',
    marginBottom: 20,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  contextTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contextText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    marginLeft: 8,
  },
  categoriesContainer: {
    gap: 10,
    paddingRight: 16,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#616161',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  productCard: {
    marginBottom: 16,
  },
  productCardLow: {
    opacity: 0.7,
  },
  productHeader: {
    marginBottom: 14,
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  categoryBadge: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#E53935',
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 4,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statValueCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
  statValueProfit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#43A047',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  popularityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  popularityLabel: {
    fontSize: 12,
    color: '#757575',
    marginRight: 10,
  },
  popularityTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  popularityFill: {
    height: '100%',
    backgroundColor: '#FFB300',
    borderRadius: 3,
  },
  popularityValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFB300',
    marginLeft: 10,
  },
  reasonContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F0EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  reasonIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  addButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
