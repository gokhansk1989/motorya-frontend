import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SearchQuery {
  q?: string;
  categoryId?: string;
  brandId?: string;
  condition?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  items: any[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  facets: Record<string, Record<string, number>>;
}

export function useSearch(query: SearchQuery, enabled = true) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () =>
      api.get('/search', { params: query }).then((r): SearchResult => {
        const data = r.data;
        return {
          ...data,
          items: (data.items ?? []).map((item: any) => ({
            ...item,
            images: item.images ?? (item.imageUrl ? [{ url: item.imageUrl }] : []),
            brand: item.brand ?? (item.brandName ? { name: item.brandName } : undefined),
          })),
        };
      }),
    enabled,
    staleTime: 30_000,
  });
}
