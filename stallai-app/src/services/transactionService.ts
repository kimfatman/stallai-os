import { request } from './api';

type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

interface TransactionFormData {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date?: string;
}

interface DailySummary {
  date: string;
  income: number;
  expense: number;
  profit: number;
  orderCount: number;
}

interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
}

export const transactionService = {
  /**
   * Get all transactions
   */
  getTransactions: async (params?: {
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> => {
    const response = await request<Transaction[]>('GET', '/transactions', { params });
    return response.data || [];
  },

  /**
   * Get transaction by ID
   */
  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await request<Transaction>('GET', `/transactions/${id}`);
    return response.data!;
  },

  /**
   * Create new transaction
   */
  createTransaction: async (data: TransactionFormData): Promise<Transaction> => {
    const response = await request<Transaction>('POST', '/transactions', data);
    return response.data!;
  },

  /**
   * Update transaction
   */
  updateTransaction: async (id: string, data: Partial<TransactionFormData>): Promise<Transaction> => {
    const response = await request<Transaction>('PUT', `/transactions/${id}`, data);
    return response.data!;
  },

  /**
   * Delete transaction
   */
  deleteTransaction: async (id: string): Promise<void> => {
    await request<void>('DELETE', `/transactions/${id}`);
  },

  /**
   * Get daily summary
   */
  getDailySummary: async (date?: string): Promise<DailySummary> => {
    const response = await request<DailySummary>('GET', '/transactions/daily-summary', {
      params: { date },
    });
    return response.data!;
  },

  /**
   * Get monthly summary
   */
  getMonthlySummary: async (month?: string): Promise<MonthlySummary> => {
    const response = await request<MonthlySummary>('GET', '/transactions/monthly-summary', {
      params: { month },
    });
    return response.data!;
  },

  /**
   * Get transactions by category
   */
  getByCategory: async (category: string): Promise<Transaction[]> => {
    const response = await request<Transaction[]>('GET', '/transactions', {
      params: { category },
    });
    return response.data || [];
  },

  /**
   * Export transactions
   */
  export: async (format: 'csv' | 'xlsx', startDate?: string, endDate?: string): Promise<string> => {
    const response = await request<string>('GET', '/transactions/export', {
      params: { format, startDate, endDate },
    });
    return response.data!;
  },
};

export default transactionService;
