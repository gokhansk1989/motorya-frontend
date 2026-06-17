import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SavedSearch {
  id: string;
  label: string;
  search?: string;
  categoryId?: string;
  brandId?: string;
  city?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  createdAt: string;
  lastNotifiedAt?: string;
}

export interface CreateSavedSearchInput {
  label: string;
  search?: string;
  categoryId?: string;
  brandId?: string;
  city?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function useSavedSearches() {
  return useQuery<SavedSearch[]>({
    queryKey: ['saved-searches'],
    queryFn: () => api.get('/saved-searches').then((r) => r.data),
  });
}

export function useCreateSavedSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSavedSearchInput) => api.post('/saved-searches', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-searches'] }),
  });
}

export function useDeleteSavedSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/saved-searches/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-searches'] }),
  });
}
