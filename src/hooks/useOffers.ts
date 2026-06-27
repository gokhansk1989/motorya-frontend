import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const _apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://98.93.139.51:3000';
const SOCKET_ORIGIN = _apiBase.replace(/\/api-backend.*/, '').replace(/\/api.*/, '') || 'http://98.93.139.51';
const SOCKET_PATH = _apiBase.includes('/api-backend') ? '/api-backend/socket.io' : '/socket.io';

// Teklif durumu (kabul/red/karşı teklif) değişince sayfayı canlı güncelle —
// mesajlaşmadaki socket altyapısı üzerinden 'offer:updated' event'i dinler.
export function useOfferUpdates() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) return;
    const socket = io(`${SOCKET_ORIGIN}/chat`, { auth: { token }, transports: ['websocket'], path: SOCKET_PATH });
    socket.on('offer:updated', () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['offers-received'] });
      qc.invalidateQueries({ queryKey: ['listing-offers'] });
    });
    return () => { socket.disconnect(); };
  }, [token, qc]);
}

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

export function useCounterOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, counterAmount, counterMessage }: { id: string; counterAmount: number; counterMessage?: string }) =>
      api.patch(`/offers/${id}/counter`, { counterAmount, counterMessage }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers-received'] });
      qc.invalidateQueries({ queryKey: ['listing-offers'] });
    },
  });
}

export function useRespondCounterOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'ACCEPTED' | 'REJECTED' }) =>
      api.patch(`/offers/${id}/respond-counter`, { action }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['offers-received'] });
      qc.invalidateQueries({ queryKey: ['listing-offers'] });
    },
  });
}
