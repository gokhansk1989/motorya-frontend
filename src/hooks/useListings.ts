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
  isFeatured?: boolean;
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
  isFeatured?: boolean;
}

export function useListings(query: ListingsQuery = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ['listings', query],
    queryFn: () => api.get('/listings', { params: query }).then((r) => r.data),
    enabled,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.get(`/listings/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

// initialData: sayfanın sunucu bileşeni ilanı zaten çekiyor (metadata için).
// Onu buraya geçirmek, ilk HTML'in dolu render edilmesini sağlar — aksi halde
// SSR sırasında veri olmadığı için yalnızca yükleniyor iskeleti HTML'e yazılır
// ve arama motorları boş sayfa görür.
export function useListingBySlug(slug: string, initialData?: unknown) {
  return useQuery({
    queryKey: ['listing-slug', slug],
    queryFn: () => api.get('/listings/by-slug', { params: { s: slug } }).then((r) => r.data),
    enabled: !!slug,
    initialData: initialData ?? undefined,
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
      // Tekil ilan (id ile)
      qc.setQueriesData<any>({ queryKey: ['listing', id] }, (old: any) =>
        old ? { ...old, isFavorited: !old.isFavorited } : old
      );
      // İlan detay sayfası slug ile cache'leniyor; hangi slug olduğu bilinmediğinden
      // eşleşen id'yi bulup güncelle.
      const slugQueries = qc.getQueriesData<any>({ queryKey: ['listing-slug'] });
      for (const [key, data] of slugQueries) {
        if (data && data.id === id) {
          qc.setQueryData(key, { ...data, isFavorited: !data.isFavorited });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['listing'] });
      qc.invalidateQueries({ queryKey: ['listing-slug'] });
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

export interface BuyerCandidate {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  source: 'accepted_offer' | 'offer' | 'message';
}

// Satıcının "satıldı" ekranında alıcıyı seçebilmesi için teklif verenler
// ve mesajlaşanlar. Alıcının kaydedilmesi karşılıklı yorum hakkını açar.
export function useBuyerCandidates(listingId: string, enabled = false) {
  return useQuery<BuyerCandidate[]>({
    queryKey: ['buyer-candidates', listingId],
    queryFn: () => api.get(`/listings/${listingId}/buyer-candidates`).then((r) => r.data),
    enabled: enabled && !!listingId,
  });
}

export function useMarkSold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, buyerId }: { id: string; buyerId?: string }) =>
      api.patch(`/listings/${id}/sold`, buyerId ? { buyerId } : {}).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listing'] });
      qc.invalidateQueries({ queryKey: ['listing-slug'] });
      qc.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}

export function useReserveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/listings/${id}/reserve`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['listing'] }); qc.invalidateQueries({ queryKey: ['my-listings'] }); },
  });
}

export function useUnreserveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/listings/${id}/unreserve`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['listing'] }); qc.invalidateQueries({ queryKey: ['my-listings'] }); },
  });
}

export function usePriceDrops(limit = 12) {
  return useQuery({
    queryKey: ['price-drops', limit],
    queryFn: () => api.get('/listings/price-drops', { params: { limit } }).then((r) => r.data),
    staleTime: 60 * 1000,
  });
}

export function usePriceGuide(categoryId?: string, brandId?: string) {
  return useQuery({
    queryKey: ['price-guide', categoryId, brandId],
    queryFn: () => api.get('/listings/price-guide', { params: { categoryId, brandId } }).then((r) => r.data),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}
