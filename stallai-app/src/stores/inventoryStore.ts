import { create } from 'zustand';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  cost: number;
  lastRestock: Date;
  imageUrl?: string;
}

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  
  setItems: (items: InventoryItem[]) => void;
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;
  getLowStockItems: () => InventoryItem[];
  getTotalValue: () => number;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshInventory: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  
  setItems: (items) => set({ items }),
  
  addItem: (item) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
    };
    const current = get().items;
    set({ items: [...current, newItem] });
  },
  
  updateItem: (id, updates) => {
    const current = get().items;
    set({
      items: current.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  },
  
  removeItem: (id) => {
    const current = get().items;
    set({ items: current.filter((item) => item.id !== id) });
  },
  
  updateStock: (id, newStock) => {
    const current = get().items;
    set({
      items: current.map((item) =>
        item.id === id
          ? { ...item, currentStock: newStock, lastRestock: new Date() }
          : item
      ),
    });
  },
  
  getLowStockItems: () => {
    const current = get().items;
    return current.filter((item) => item.currentStock <= item.minStock);
  },
  
  getTotalValue: () => {
    const current = get().items;
    return current.reduce(
      (total, item) => total + item.currentStock * item.cost,
      0
    );
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  refreshInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          name: '烤冷面',
          category: '主食',
          currentStock: 25,
          minStock: 20,
          unit: '份',
          cost: 3.5,
          lastRestock: new Date(Date.now() - 86400000),
        },
        {
          id: '2',
          name: '烤肠',
          category: '肉类',
          currentStock: 50,
          minStock: 30,
          unit: '根',
          cost: 1.2,
          lastRestock: new Date(Date.now() - 172800000),
        },
        {
          id: '3',
          name: '鸡蛋',
          category: '蛋类',
          currentStock: 8,
          minStock: 15,
          unit: '个',
          cost: 0.8,
          lastRestock: new Date(),
        },
        {
          id: '4',
          name: '面粉',
          category: '原料',
          currentStock: 10,
          minStock: 5,
          unit: 'kg',
          cost: 5.0,
          lastRestock: new Date(Date.now() - 604800000),
        },
        {
          id: '5',
          name: '酱料包',
          category: '调料',
          currentStock: 100,
          minStock: 50,
          unit: '包',
          cost: 0.5,
          lastRestock: new Date(Date.now() - 259200000),
        },
      ];
      
      set({ items: mockItems, isLoading: false });
    } catch (error) {
      set({
        error: 'Failed to refresh inventory',
        isLoading: false,
      });
    }
  },
}));
