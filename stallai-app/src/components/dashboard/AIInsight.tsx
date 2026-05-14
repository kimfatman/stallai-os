import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { formatTimeAgo } from '@/utils/formatters';

interface Insight {
  id: string;
  type: 'tip' | 'alert' | 'success';
  title: string;
  content: string;
  icon: string;
  timestamp: Date;
}

interface AIInsightProps {
  insight: Insight;
  onPress?: () => void;
}

const typeConfig = {
  tip: {
    color: '#FFB300',
    bgColor: '#FFF8E1',
    icon: 'lightbulb-outline',
  },
  alert: {
    color: '#E53935',
    bgColor: '#FFEBEE',
    icon: 'alert-circle-outline',
  },
  success: {
    color: '#43A047',
    bgColor: '#E8F5E9',
    icon: 'trophy-outline',
  },
};

export default function AIInsight({ insight, onPress }: AIInsightProps) {
  const config = typeConfig[insight.type];

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon as any} size={20} color={config.color} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{insight.title}</Text>
            <Text style={styles.time}>{formatTimeAgo(insight.timestamp)}</Text>
          </View>
        </View>
        <Text style={styles.content}>{insight.content}</Text>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  content: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
  },
});
