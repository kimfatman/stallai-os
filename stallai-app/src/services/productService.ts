import { request } from './api';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  soldToday: number;
  imageUrl?: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  description?: string;
  tags?: string[];
  imageUrl?: string;
}

export const productService = {
  /**
   * Get all products
   */
  getProducts: async (): Promise<Product[]> => {
    const response = await request<Product[]>('GET', '/products');
    return response.data || [];
  },

  /**
   * Get product by ID
   */
  getProduct: async (id: string): Promise<Product> => {
    const response = await request<Product>('GET', `/products/${id}`);
    return response.data!;
  },

  /**
   * Create new product
   */
  createProduct: async (data: ProductFormData): Promise<Product> => {
    const response = await request<Product>('POST', '/products', data);
    return response.data!;
  },

  /**
   * Update product
   */
  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    const response = await request<Product>('PUT', `/products/${id}`, data);
    return response.data!;
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: string): Promise<void> => {
    await request<void>('DELETE', `/products/${id}`);
  },

  /**
   * Update product stock
   */
  updateStock: async (id: string, stock: number): Promise<Product> => {
    const response = await request<Product>('PATCH', `/products/${id}/stock`, { stock });
    return response.data!;
  },

  /**
   * Record sale
   */
  recordSale: async (id: string, quantity: number): Promise<{ newStock: number; revenue: number }> => {
    const response = await request<{ newStock: number; revenue: number }>(
      'POST',
      `/products/${id}/sale`,
      { quantity }
    );
    return response.data!;
  },

  /**
   * Get products by category
   */
  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await request<Product[]>('GET', '/products', {
      params: { category },
    });
    return response.data || [];
  },

  /**
   * Search products
   */
  search: async (query: string): Promise<Product[]> => {
    const response = await request<Product[]>('GET', '/products/search', {
      params: { q: query },
    });
    return response.data || [];
  },
};

export default productService;
