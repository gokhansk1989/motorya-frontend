import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useMyOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: () => api.get('/offers/mine').then((r) => r.data),
  });
}

export function useReceivedOffers() {
  return useQuery({
    queryKey: ['offers-received'],
    queryFn: () => api.get('/offers/received').then((r) => r.data),
  });
}

export function useListingOffers(listingId: string) {
  return useQuery({
    queryKey: ['listing-offers', listingId],
    queryFn: () => api.get(`/offers/listing/${listingId}`).then((r) => r.data),
    enabled: !!listingId,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { listingId: string; amount: number; message?: string }) =>
      api.post('/offers', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useRespondOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'ACCEPTED' | 'REJECTED' }) =>
      api.patch(`/offers/${id}/respond`, { action }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['offers-received'] });
      qc.invalidateQueries({ queryKey: ['listing-offers'] });
    },
  });
}

export function useWithdrawOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/offers/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}
