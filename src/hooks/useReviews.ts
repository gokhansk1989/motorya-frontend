import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useUserReviews(userId: string | null) {
  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: () => api.get(`/reviews/user/${userId}`).then(r => r.data),
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { listingId: string; rating: number; comment?: string; buyerId?: string }) =>
      api.post('/reviews', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });
}
