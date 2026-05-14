import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/supplierService';

export function useSuppliers(params?: {
  category?: string;
  minRating?: number;
  sortBy?: 'rating' | 'distance' | 'minOrder';
}) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => supplierService.getSuppliers(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierService.getSupplier(id),
    enabled: !!id,
  });
}

export function useSupplierProducts(supplierId: string) {
  return useQuery({
    queryKey: ['supplierProducts', supplierId],
    queryFn: () => supplierService.getProducts(supplierId),
    enabled: !!supplierId,
  });
}

export function useSupplierReviews(supplierId: string) {
  return useQuery({
    queryKey: ['supplierReviews', supplierId],
    queryFn: () => supplierService.getReviews(supplierId),
    enabled: !!supplierId,
  });
}

export function useRecommendedSuppliers() {
  return useQuery({
    queryKey: ['recommendedSuppliers'],
    queryFn: supplierService.getRecommended,
    staleTime: 1000 * 60 * 30,
  });
}

export function useSearchSuppliers(query: string) {
  return useQuery({
    queryKey: ['suppliers', 'search', query],
    queryFn: () => supplierService.search(query),
    enabled: query.length > 0,
  });
}

export function useContactSupplier() {
  return useMutation({
    mutationFn: ({ supplierId, message }: { supplierId: string; message: string }) =>
      supplierService.contact(supplierId, message),
  });
}
