'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice, timeAgo } from '@/lib/utils';
import { ListingCard } from '@/components/listings/ListingCard';
import { Star, Package, MessageCircle } from 'lucide-react';

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['public-profile', id],
    queryFn: () => api.get(`/users/${id}`).then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full animate-pulse"/>
          <div className="space-y-2"><div className="w-40 h-5 bg-gray-100 rounded animate-pulse"/><div className="w-24 h-4 bg-gray-100 rounded animate-pulse"/></div>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-center py-20 text-gray-400">Kullanıcı bulunamadı</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-500 overflow-hidden shrink-0">
          {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" alt=""/> : profile.displayName?.[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{profile.displayName}</h1>
          {profile.city && <p className="text-sm text-gray-500 mt-0.5">{profile.city}</p>}
          {profile.bio && <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
              {profile.ratingAvg?.toFixed(1) ?? '—'} ({profile.ratingCount} değerlendirme)
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <Package className="w-4 h-4 text-gray-400"/>
              {profile.salesCount} satış
            </span>
          </div>
        </div>
      </div>

      {/* Active listings */}
      {profile.listings?.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Aktif İlanlar ({profile.listings.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {profile.listings.map((l: any) => (
              <ListingCard key={l.id} listing={l}/>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {profile.reviewsReceived?.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4"/> Değerlendirmeler
          </h2>
          <div className="space-y-3">
            {profile.reviewsReceived.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-500">
                      {r.author?.displayName?.[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{r.author?.displayName}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({length:5}).map((_,i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}/>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(r.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
