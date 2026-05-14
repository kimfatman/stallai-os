import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransactionFormProps {
  onSubmit: (transaction: any) => void;
  onClose: () => void;
  initialData?: any;
}

const categories = {
  income: ['销售', '退款', '其他收入'],
  expense: ['食材采购', '设备维护', '租金', '交通', '其他支出'],
};

export default function TransactionForm({
  onSubmit,
  onClose,
  initialData,
}: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'income');
  const [category, setCategory] = useState(initialData?.category || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    if (!category) {
      return;
    }

    onSubmit({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.title}>记一笔</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.submitText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => setType('income')}
          >
            <Ionicons
              name="arrow-up-circle"
              size={20}
              color={type === 'income' ? '#43A047' : '#757575'}
            />
            <Text
              style={[
                styles.typeButtonText,
                type === 'income' && styles.typeButtonTextActive,
              ]}
            >
              收入
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
            onPress={() => setType('expense')}
          >
            <Ionicons
              name="arrow-down-circle"
              size={20}
              color={type === 'expense' ? '#E53935' : '#757575'}
            />
            <Text
              style={[
                styles.typeButtonText,
                type === 'expense' && styles.typeButtonTextActiveExpense,
              ]}
            >
              支出
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>¥</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#9E9E9E"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择分类</Text>
          <View style={styles.categoryGrid}>
            {(type === 'income' ? categories.income : categories.expense).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && (type === 'income' ? styles.categoryChipActive : styles.categoryChipActiveExpense),
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="添加备注信息..."
            placeholderTextColor="#9E9E9E"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cancelText: {
    fontSize: 16,
    color: '#757575',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  submitText: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#43A047',
  },
  typeButtonActiveExpense: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#E53935',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#757575',
  },
  typeButtonTextActive: {
    color: '#43A047',
  },
  typeButtonTextActiveExpense: {
    color: '#E53935',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 24,
  },
  currency: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 150,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  categoryChipActive: {
    backgroundColor: '#43A047',
  },
  categoryChipActiveExpense: {
    backgroundColor: '#E53935',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  descriptionInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
