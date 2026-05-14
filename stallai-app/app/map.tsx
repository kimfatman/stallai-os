import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import GlassCard from '@/components/ui/GlassCard';

const { width, height } = Dimensions.get('window');

interface StallLocation {
  id: string;
  name: string;
  type: 'night_market' | 'school' | 'business' | 'residential';
  address: string;
  rent: number;
  footTraffic: string;
  competition: string;
  rating: number;
  distance?: string;
  latitude: number;
  longitude: number;
}

const mockLocations: StallLocation[] = [
  {
    id: '1',
    name: '望京SOHO夜市',
    type: 'night_market',
    address: '朝阳区望京街道',
    rent: 5000,
    footTraffic: '高',
    competition: '中等',
    rating: 4.8,
    distance: '1.2km',
    latitude: 39.9968,
    longitude: 116.4729,
  },
  {
    id: '2',
    name: '中关村步行街',
    type: 'business',
    address: '海淀区中关村大街',
    rent: 8000,
    footTraffic: '极高',
    competition: '激烈',
    rating: 4.6,
    distance: '2.5km',
    latitude: 39.9857,
    longitude: 116.3128,
  },
  {
    id: '3',
    name: '理工大学后门',
    type: 'school',
    address: '海淀区中关村南大街',
    rent: 3000,
    footTraffic: '高',
    competition: '低',
    rating: 4.9,
    distance: '3.1km',
    latitude: 39.9432,
    longitude: 116.3268,
  },
  {
    id: '4',
    name: '国贸CBD',
    type: 'business',
    address: '朝阳区建国门外大街',
    rent: 12000,
    footTraffic: '极高',
    competition: '激烈',
    rating: 4.5,
    distance: '4.8km',
    latitude: 39.9086,
    longitude: 116.4611,
  },
];

const typeColors: Record<string, string> = {
  night_market: '#E53935',
  school: '#1E88E5',
  business: '#FFB300',
  residential: '#43A047',
};

const typeLabels: Record<string, string> = {
  night_market: '夜市',
  school: '学校',
  business: '商业区',
  residential: '居民区',
};

export default function MapScreen() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<StallLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.log('Location permission denied');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationSelect = (location: StallLocation) => {
    setSelectedLocation(location);
  };

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case '极高':
        return '#E53935';
      case '高':
        return '#FFB300';
      default:
        return '#43A047';
    }
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

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>摆摊地图</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => Alert.alert('筛选', '筛选功能开发中')}
        >
          <MaterialCommunityIcons name="filter-variant" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </Animated.View>

      {/* Map Placeholder */}
      <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map-marker-radius" size={80} color="#BDBDBD" />
          <Text style={styles.mapPlaceholderText}>地图视图</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            {userLocation ? `当前位置: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : '正在获取位置...'}
          </Text>
        </View>

        {/* Map Markers Simulation */}
        <View style={styles.markersContainer}>
          {mockLocations.slice(0, 3).map((location, index) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.marker,
                {
                  top: 80 + index * 60,
                  left: 40 + index * 30,
                  backgroundColor: typeColors[location.type],
                },
              ]}
              onPress={() => handleLocationSelect(location)}
            >
              <MaterialCommunityIcons
                name={location.type === 'night_market' ? 'home-city' : 'map-marker'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Location List */}
      <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.listContainer}>
        <Text style={styles.sectionTitle}>推荐摆摊地点</Text>
        <View style={styles.locationList}>
          {mockLocations.map((location, index) => (
            <Animated.View
              key={location.id}
              entering={FadeInUp.delay(300 + index * 80).duration(400)}
            >
              <TouchableOpacity onPress={() => handleLocationSelect(location)}>
                <GlassCard
                  style={[
                    styles.locationCard,
                    selectedLocation?.id === location.id && styles.locationCardActive,
                  ]}
                >
                  <View style={styles.locationHeader}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: typeColors[location.type] },
                      ]}
                    >
                      <Text style={styles.typeBadgeText}>{typeLabels[location.type]}</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFB300" />
                      <Text style={styles.ratingText}>{location.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>

                  <View style={styles.locationStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>租金/月</Text>
                      <Text style={styles.statValue}>¥{location.rent}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>人流量</Text>
                      <Text style={[styles.statValue, { color: getTrafficColor(location.footTraffic) }]}>
                        {location.footTraffic}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>竞争度</Text>
                      <Text style={styles.statValue}>{location.competition}</Text>
                    </View>
                    {location.distance && (
                      <View style={styles.statItem}>
                        <Ionicons name="location-outline" size={14} color="#757575" />
                        <Text style={styles.distanceText}>{location.distance}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.locationActions}>
                    <TouchableOpacity style={styles.navButton}>
                      <Ionicons name="navigate" size={18} color="#FFFFFF" />
                      <Text style={styles.navButtonText}>导航</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.detailButton}>
                      <Text style={styles.detailButtonText}>查看详情</Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Selected Location Detail */}
      {selectedLocation && (
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.detailBar}>
          <View style={styles.detailBarContent}>
            <View>
              <Text style={styles.detailBarName}>{selectedLocation.name}</Text>
              <Text style={styles.detailBarAddress}>{selectedLocation.address}</Text>
            </View>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => Alert.alert('开始摆摊', `已设置 ${selectedLocation.name} 为今日摆摊地点`)}
            >
              <Text style={styles.startButtonText}>设为今日地点</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9E9E9E',
    marginTop: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 4,
  },
  markersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  marker: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  locationList: {
    gap: 12,
  },
  locationCard: {
    padding: 14,
  },
  locationCardActive: {
    borderWidth: 2,
    borderColor: '#E53935',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 10,
  },
  locationStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  distanceText: {
    fontSize: 12,
    color: '#757575',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },
  navButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  detailButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailButtonText: {
    fontSize: 13,
    color: '#616161',
  },
  detailBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  detailBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailBarName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  detailBarAddress: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  startButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
