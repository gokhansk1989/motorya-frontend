import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  condition: string;
  sizeLabel?: string;
  city?: string;
  status: string;
  viewCount: number;
  favoriteCount: number;
  isFavorited?: boolean;
  createdAt: string;
  images: { url: string; sortOrder: number }[];
  seller: { id: string; displayName: string; avatarUrl?: string; ratingAvg: number };
  category: { id: string; name: string; slug: string; parentId?: string | null; parent?: { slug: string } | null };
  brand?: { id: string; name: string };
}

export interface ListingsQuery {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  condition?: string;
  gender?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export function useListings(query: ListingsQuery = {}) {
  return useQuery({
    queryKey: ['listings', query],
    queryFn: () => api.get('/listings', { params: query }).then((r) => r.data),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.get(`/listings/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: () => api.get('/listings/mine').then((r) => r.data),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/listings/${id}/favorite`).then((r) => r.data),
    onMutate: async (id: string) => {
      // Optimistic update: tüm listings cache'lerinde isFavorited'ı hemen tersine çevir
      const queries = qc.getQueriesData<any>({ queryKey: ['listings'] });
      for (const [key, data] of queries) {
        if (!data) continue;
        const items: Listing[] = Array.isArray(data) ? data : (data.items ?? []);
        const updated = items.map((l: Listing) =>
          l.id === id ? { ...l, isFavorited: !l.isFavorited } : l
        );
        qc.setQueryData(key, Array.isArray(data) ? updated : { ...data, items: updated });
      }
      // Tekil ilan
      qc.setQueriesData<any>({ queryKey: ['listing', id] }, (old: any) =>
        old ? { ...old, isFavorited: !old.isFavorited } : old
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: () => {
      // Hata durumunda geri al
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['listing'] });
    },
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/listings', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  });
}

export function useMyFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get('/listings/favorites/mine').then((r) => r.data),
  });
}

export function useSimilarListings(id: string) {
  return useQuery({
    queryKey: ['listing-similar', id],
    queryFn: () => api.get(`/listings/${id}/similar`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useListingsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['listings-by-ids', ids],
    queryFn: () => api.get('/listings/by-ids', { params: { ids: ids.join(',') } }).then((r) => r.data),
    enabled: ids.length > 0,
  });
}
