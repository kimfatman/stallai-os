import { request } from './api';

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  products: number;
  minOrder: number;
  phone?: string;
  address?: string;
  businessHours?: string;
  description?: string;
  tags: string[];
  isVerified: boolean;
  distance?: string;
  createdAt: string;
}

interface SupplierProduct {
  id: string;
  supplierId: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  imageUrl?: string;
}

interface SupplierReview {
  id: string;
  supplierId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  images?: string[];
  createdAt: string;
}

export const supplierService = {
  /**
   * Get all suppliers
   */
  getSuppliers: async (params?: {
    category?: string;
    minRating?: number;
    sortBy?: 'rating' | 'distance' | 'minOrder';
    limit?: number;
    offset?: number;
  }): Promise<Supplier[]> => {
    const response = await request<Supplier[]>('GET', '/suppliers', { params });
    return response.data || [];
  },

  /**
   * Get supplier by ID
   */
  getSupplier: async (id: string): Promise<Supplier> => {
    const response = await request<Supplier>('GET', `/suppliers/${id}`);
    return response.data!;
  },

  /**
   * Search suppliers
   */
  search: async (query: string): Promise<Supplier[]> => {
    const response = await request<Supplier[]>('GET', '/suppliers/search', {
      params: { q: query },
    });
    return response.data || [];
  },

  /**
   * Get supplier products
   */
  getProducts: async (supplierId: string): Promise<SupplierProduct[]> => {
    const response = await request<SupplierProduct[]>('GET', `/suppliers/${supplierId}/products`);
    return response.data || [];
  },

  /**
   * Get supplier reviews
   */
  getReviews: async (supplierId: string): Promise<SupplierReview[]> => {
    const response = await request<SupplierReview[]>('GET', `/suppliers/${supplierId}/reviews`);
    return response.data || [];
  },

  /**
   * Create order with supplier
   */
  createOrder: async (
    supplierId: string,
    items: { productId: string; quantity: number }[]
  ): Promise<{ orderId: string; totalAmount: number }> => {
    const response = await request<{ orderId: string; totalAmount: number }>(
      'POST',
      `/suppliers/${supplierId}/orders`,
      { items }
    );
    return response.data!;
  },

  /**
   * Get recommended suppliers
   */
  getRecommended: async (): Promise<Supplier[]> => {
    const response = await request<Supplier[]>('GET', '/suppliers/recommended');
    return response.data || [];
  },

  /**
   * Get suppliers by category
   */
  getByCategory: async (category: string): Promise<Supplier[]> => {
    const response = await request<Supplier[]>('GET', '/suppliers', {
      params: { category },
    });
    return response.data || [];
  },

  /**
   * Contact supplier
   */
  contact: async (supplierId: string, message: string): Promise<void> => {
    await request('POST', `/suppliers/${supplierId}/contact`, { message });
  },
};

export default supplierService;
