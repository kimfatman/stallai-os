import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/aiService';

export function useDailyReport(date?: string) {
  return useQuery({
    queryKey: ['dailyReport', date],
    queryFn: () => aiService.getDailyReport(date),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useProductSuggestions(params?: {
  location?: string;
  targetAudience?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: ['productSuggestions', params],
    queryFn: () => aiService.getProductSuggestions(params),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTrendingProducts(timeRange?: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: ['trendingProducts', timeRange],
    queryFn: () => aiService.getTrendingProducts(timeRange),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useMarketInsights() {
  return useQuery({
    queryKey: ['marketInsights'],
    queryFn: aiService.getMarketInsights,
    staleTime: 1000 * 60 * 30,
  });
}

export function useBusinessPrediction(type: 'sales' | 'inventory' | 'demand') {
  return useQuery({
    queryKey: ['businessPrediction', type],
    queryFn: () => aiService.getPrediction(type),
    staleTime: 1000 * 60 * 30,
  });
}

export function useBusinessAdvice() {
  return useQuery({
    queryKey: ['businessAdvice'],
    queryFn: aiService.getBusinessAdvice,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAIChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ message, context }: { message: string; context?: any }) =>
      aiService.chat(message, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiInsights'] });
    },
  });
}

export function useAnalyzeSales(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['salesAnalysis', startDate, endDate],
    queryFn: () => aiService.analyzeSales(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 10,
  });
}
