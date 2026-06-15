'use client';
import { useMyFavorites } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { data, isLoading } = useMyFavorites();

  const listings = Array.isArray(data) ? data : (data?.items ?? []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Favorilerim</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({length:8}).map((_,i) => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-20"/>
          <p className="text-lg font-medium mb-2">Henüz favori yok</p>
          <p className="text-sm mb-5">Beğendiğiniz ilanları favorilere ekleyin</p>
          <Link href="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium">
            İlanlara Göz At
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listings.map((listing: any) => (
            <ListingCard key={listing.id} listing={listing}/>
          ))}
        </div>
      )}
    </div>
  );
}
