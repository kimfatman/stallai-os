import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventoryService';
import { useInventoryStore } from '@/stores/inventoryStore';

export function useInventory() {
  const { setItems } = useInventoryStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getInventory,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync with store
  React.useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data, setItems]);

  return { data, isLoading, error, refetch };
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventoryItem', id],
    queryFn: () => inventoryService.getInventoryItem(id),
    enabled: !!id,
  });
}

export function useAddInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryService.addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryService.updateItem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryItem', id] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useRestockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity: number; notes?: string } }) =>
      inventoryService.restock(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryItem', id] });
    },
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ['lowStockItems'],
    queryFn: inventoryService.getLowStockItems,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useTotalInventoryValue() {
  return useQuery({
    queryKey: ['totalInventoryValue'],
    queryFn: inventoryService.getTotalValue,
    staleTime: 1000 * 60 * 5,
  });
}
