import { request } from './api';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  cost: number;
  lastRestock: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryFormData {
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  cost: number;
  imageUrl?: string;
}

interface RestockData {
  quantity: number;
  notes?: string;
}

export const inventoryService = {
  /**
   * Get all inventory items
   */
  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await request<InventoryItem[]>('GET', '/inventory');
    return response.data || [];
  },

  /**
   * Get inventory item by ID
   */
  getInventoryItem: async (id: string): Promise<InventoryItem> => {
    const response = await request<InventoryItem>('GET', `/inventory/${id}`);
    return response.data!;
  },

  /**
   * Add new inventory item
   */
  addItem: async (data: InventoryFormData): Promise<InventoryItem> => {
    const response = await request<InventoryItem>('POST', '/inventory', data);
    return response.data!;
  },

  /**
   * Update inventory item
   */
  updateItem: async (id: string, data: Partial<InventoryFormData>): Promise<InventoryItem> => {
    const response = await request<InventoryItem>('PUT', `/inventory/${id}`, data);
    return response.data!;
  },

  /**
   * Delete inventory item
   */
  deleteItem: async (id: string): Promise<void> => {
    await request<void>('DELETE', `/inventory/${id}`);
  },

  /**
   * Update stock quantity
   */
  updateStock: async (id: string, quantity: number): Promise<InventoryItem> => {
    const response = await request<InventoryItem>('PATCH', `/inventory/${id}/stock`, {
      quantity,
    });
    return response.data!;
  },

  /**
   * Restock item
   */
  restock: async (id: string, data: RestockData): Promise<InventoryItem> => {
    const response = await request<InventoryItem>('POST', `/inventory/${id}/restock`, data);
    return response.data!;
  },

  /**
   * Get low stock items
   */
  getLowStockItems: async (): Promise<InventoryItem[]> => {
    const response = await request<InventoryItem[]>('GET', '/inventory/low-stock');
    return response.data || [];
  },

  /**
   * Get inventory by category
   */
  getByCategory: async (category: string): Promise<InventoryItem[]> => {
    const response = await request<InventoryItem[]>('GET', '/inventory', {
      params: { category },
    });
    return response.data || [];
  },

  /**
   * Get total inventory value
   */
  getTotalValue: async (): Promise<number> => {
    const response = await request<{ totalValue: number }>('GET', '/inventory/total-value');
    return response.data?.totalValue || 0;
  },

  /**
   * Scan barcode to add/update inventory
   */
  scanBarcode: async (barcode: string): Promise<InventoryItem | null> => {
    const response = await request<InventoryItem | null>('POST', '/inventory/scan', {
      barcode,
    });
    return response.data || null;
  },
};

export default inventoryService;
