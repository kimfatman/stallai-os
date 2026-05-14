import { api } from './api';
import { Transaction, TransactionSummary, CategoryBreakdown } from '../types';

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 45.0,
    category: '食品销售',
    description: '烤肠 x3, 奶茶 x2',
    createdAt: new Date('2024-01-15T10:30:00'),
    paymentMethod: '微信支付',
  },
  {
    id: '2',
    type: 'income',
    amount: 28.0,
    category: '食品销售',
    description: '鸡蛋灌饼 x2',
    createdAt: new Date('2024-01-15T11:15:00'),
    paymentMethod: '支付宝',
  },
  {
    id: '3',
    type: 'expense',
    amount: 120.0,
    category: '原材料采购',
    description: '烤肠原料采购',
    createdAt: new Date('2024-01-15T09:00:00'),
    paymentMethod: '现金',
  },
  {
    id: '4',
    type: 'income',
    amount: 56.0,
    category: '食品销售',
    description: '套餐A x2, 奶茶 x1',
    createdAt: new Date('2024-01-15T12:00:00'),
    paymentMethod: '微信支付',
  },
  {
    id: '5',
    type: 'expense',
    amount: 35.0,
    category: '摊位费用',
    description: '摊位管理费',
    createdAt: new Date('2024-01-15T08:00:00'),
    paymentMethod: '现金',
  },
];

const mockSummary: TransactionSummary = {
  todayIncome: 2580.5,
  todayExpense: 485.0,
  weekIncome: 15234.8,
  weekExpense: 3240.5,
  monthIncome: 68540.2,
  monthExpense: 15230.8,
  categoryBreakdown: [
    { category: '食品销售', amount: 1850.0, percentage: 71.8, color: '#8B7355' },
    { category: '饮料销售', amount: 480.0, percentage: 18.6, color: '#E53935' },
    { category: '其他收入', amount: 250.5, percentage: 9.6, color: '#4CAF50' },
  ],
};

export const transactionService = {
  // Get transactions list
  getTransactions: async (params?: {
    startDate?: string;
    endDate?: string;
    type?: 'income' | 'expense';
    page?: number;
    pageSize?: number;
  }): Promise<{ data: Transaction[]; total: number }> => {
    try {
      // const response = await api.get('/transactions', { params });
      // return response.data;
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      let filtered = [...mockTransactions];
      
      if (params?.type) {
        filtered = filtered.filter((t) => t.type === params.type);
      }
      
      return {
        data: filtered,
        total: filtered.length,
      };
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },
  
  // Get transaction summary
  getSummary: async (): Promise<TransactionSummary> => {
    try {
      // const response = await api.get<TransactionSummary>('/transactions/summary');
      // return response.data;
      
      await new Promise((resolve) => setTimeout(resolve, 600));
      return mockSummary;
    } catch (error) {
      console.error('Failed to fetch transaction summary:', error);
      throw error;
    }
  },
  
  // Create transaction
  createTransaction: async (data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    try {
      // const response = await api.post<Transaction>('/transactions', data);
      // return response.data;
      
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      const newTransaction: Transaction = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      };
      
      mockTransactions.unshift(newTransaction);
      return newTransaction;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  },
  
  // Update transaction
  updateTransaction: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    try {
      // const response = await api.put<Transaction>(`/transactions/${id}`, data);
      // return response.data;
      
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      const index = mockTransactions.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Transaction not found');
      }
      
      mockTransactions[index] = { ...mockTransactions[index], ...data };
      return mockTransactions[index];
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  },
  
  // Delete transaction
  deleteTransaction: async (id: string): Promise<void> => {
    try {
      // await api.delete(`/transactions/${id}`);
      
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const index = mockTransactions.findIndex((t) => t.id === id);
      if (index !== -1) {
        mockTransactions.splice(index, 1);
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  },
  
  // Get category breakdown
  getCategoryBreakdown: async (): Promise<CategoryBreakdown[]> => {
    try {
      // const response = await api.get<CategoryBreakdown[]>('/transactions/categories');
      // return response.data;
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockSummary.categoryBreakdown;
    } catch (error) {
      console.error('Failed to fetch category breakdown:', error);
      throw error;
    }
  },
};
