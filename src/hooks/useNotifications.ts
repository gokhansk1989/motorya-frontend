import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function useNotifications() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/users/me/notifications').then((r: any) => r.data),
    enabled: !!user,
  });
}

/**
 * Profil sayaclari ve okunmamis mesaj sayisi.
 *
 * Mesajlar artik zile dusmuyor; okunmamis mesajin gorunur tek isareti
 * mesaj ikonunun kendi rozeti. Sayi konusmalardaki lastReadAt'ten
 * hesaplaniyor, yani okununca gercekten sifirlaniyor.
 */
export function useOzet() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['me-summary'],
    queryFn: () => api.get('/users/me/summary').then((r: any) => r.data),
    enabled: !!user,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
