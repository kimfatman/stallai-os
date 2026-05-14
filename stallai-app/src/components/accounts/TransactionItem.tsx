import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { formatCurrency, formatTimeAgo } from '@/utils/formatters';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
}

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function TransactionItem({
  transaction,
  onPress,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const Icon = isIncome ? 'arrow-up-circle' : 'arrow-down-circle';
  const color = isIncome ? '#43A047' : '#E53935';

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onDelete}>
      <GlassCard style={styles.card}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={Icon as any} size={24} color={color} />
          </View>
          <View style={styles.info}>
            <View style={styles.header}>
              <Text style={styles.category}>{transaction.category}</Text>
              <Text style={[styles.amount, { color }]}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
            <Text style={styles.time}>{formatTimeAgo(transaction.date)}</Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: '#616161',
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    color: '#9E9E9E',
  },
});
