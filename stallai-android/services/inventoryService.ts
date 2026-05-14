import { api } from './api';
import { Product, InventoryAlert, RestockSuggestion } from '../types';

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: '烤肠',
    sku: 'KC001',
    category: '热食',
    stock: 5,
    minStock: 20,
    maxStock: 100,
    unitPrice: 5.0,
    costPrice: 2.0,
    status: 'low',
    salesVelocity: 15.5,
  },
  {
    id: '2',
    name: '奶茶',
    sku: 'NC001',
    category: '饮品',
    stock: 45,
    minStock: 15,
    maxStock: 80,
    unitPrice: 12.0,
    costPrice: 4.5,
    status: 'normal',
    salesVelocity: 8.2,
  },
  {
    id: '3',
    name: '鸡蛋灌饼',
    sku: 'JGB001',
    category: '热食',
    stock: 0,
    minStock: 10,
    maxStock: 50,
    unitPrice: 8.0,
    costPrice: 3.0,
    status: 'out',
    salesVelocity: 12.0,
  },
  {
    id: '4',
    name: '肉夹馍',
    sku: 'RJM001',
    category: '热食',
    stock: 25,
    minStock: 10,
    maxStock: 60,
    unitPrice: 10.0,
    costPrice: 4.0,
    status: 'normal',
    salesVelocity: 6.8,
  },
  {
    id: '5',
    name: '酸梅汤',
    sku: 'SMT001',
    category: '饮品',
    stock: 60,
    minStock: 20,
    maxStock: 100,
    unitPrice: 6.0,
    costPrice: 1.5,
    status: 'normal',
    salesVelocity: 5.5,
  },
];

const mockAlerts: InventoryAlert[] = [
  {
    id: '1',
    productId: '1',
    productName: '烤肠',
    type: 'low_stock',
    currentStock: 5,
    suggestedAction: '建议立即补货至50根',
  },
  {
    id: '2',
    productId: '3',
    productName: '鸡蛋灌饼',
    type: 'out_of_stock',
    currentStock: 0,
    suggestedAction: '已断货，请尽快补货',
  },
];

const mockRestockSuggestions: RestockSuggestion[] = [
  {
    productId: '1',
    productName: '烤肠',
    suggestedQuantity: 50,
    reason: '根据近7日销售数据，预计3天内售罄',
    predictedDemand: 45,
  },
  {
    productId: '3',
    productName: '鸡蛋灌饼',
    suggestedQuantity: 30,
    reason: '已断货，昨日销量12个',
    predictedDemand: 36,
  },
];

export const inventoryService = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return mockProducts;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },
  
  // Get product by ID
  getProduct: async (id: string): Promise<Product> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const product = mockProducts.find((p) => p.id === id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  },
  
  // Create product
  createProduct: async (data: Omit<Product, 'id'>): Promise<Product> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      const newProduct: Product = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
      };
      
      mockProducts.push(newProduct);
      return newProduct;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },
  
  // Update product
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Product not found');
      }
      
      mockProducts[index] = { ...mockProducts[index], ...data };
      return mockProducts[index];
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  },
  
  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockProducts.splice(index, 1);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },
  
  // Get inventory alerts
  getAlerts: async (): Promise<InventoryAlert[]> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockAlerts;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      throw error;
    }
  },
  
  // Get restock suggestions
  getRestockSuggestions: async (): Promise<RestockSuggestion[]> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return mockRestockSuggestions;
    } catch (error) {
      console.error('Failed to fetch restock suggestions:', error);
      throw error;
    }
  },
  
  // Update stock
  updateStock: async (id: string, quantity: number): Promise<Product> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Product not found');
      }
      
      mockProducts[index].stock += quantity;
      
      // Update status based on stock
      if (mockProducts[index].stock <= 0) {
        mockProducts[index].status = 'out';
      } else if (mockProducts[index].stock <= mockProducts[index].minStock) {
        mockProducts[index].status = 'low';
      } else {
        mockProducts[index].status = 'normal';
      }
      
      return mockProducts[index];
    } catch (error) {
      console.error('Failed to update stock:', error);
      throw error;
    }
  },
};
