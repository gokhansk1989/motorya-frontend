'use client';
import { useMyFavorites } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { Heart, Search } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { data, isLoading } = useMyFavorites();
  const listings = Array.isArray(data) ? data : (data?.items ?? []);

  return (
    <div className="m-wrap" style={{ maxWidth: 1100, paddingTop: 36, paddingBottom: 60 }}>
      <h1 className="m-display" style={{ fontSize: 28, marginBottom: 28 }}>Favorilerim</h1>

      {isLoading ? (
        <div className="m-listing-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="m-card" style={{ opacity: 0.4 }}>
              <div className="m-card-media" style={{ background: 'var(--bg-2)' }} />
              <div className="m-card-body">
                <div style={{ height: 12, background: 'var(--bg-3)', borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 10, background: 'var(--bg-3)', borderRadius: 6, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'color-mix(in oklch, var(--accent) 10%, var(--bg-1))', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <Heart size={32} style={{ color: 'var(--accent)', opacity: 0.5 }} />
          </div>
          <p className="m-display" style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 10 }}>Henüz favori yok</p>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
            İlanlardaki kalp ikonuna tıklayarak beğendiklerinizi buraya ekleyin
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/ara" className="m-btn m-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Search size={16} /> İlanlara Göz At
            </Link>
            <Link href="/ilan-ver" className="m-btn" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              İlan Ver
            </Link>
          </div>
        </div>
      ) : (
        <div className="m-listing-grid">
          {listings.map((listing: any) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
