import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';

interface AIAgentCardProps {
  title?: string;
  description?: string;
  status?: 'idle' | 'thinking' | 'ready';
}

export default function AIAgentCard({
  title = 'AI助手',
  description = '有什么可以帮助您的吗？',
  status = 'idle',
}: AIAgentCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'thinking':
        return '#FFB300';
      case 'ready':
        return '#43A047';
      default:
        return '#757575';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'thinking':
        return '思考中...';
      case 'ready':
        return '在线';
      default:
        return '离线';
    }
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="robot" size={28} color="#FFFFFF" />
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.status}>{getStatusText()}</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    color: '#757575',
  },
  description: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 22,
  },
});
