'use client';
import { useState } from 'react';
import { useMyFavorites } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { Heart, Search } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { data, isLoading } = useMyFavorites();
  const listings = Array.isArray(data) ? data : (data?.items ?? []);

  // Favoriler hicbir zaman otomatik silinmiyor; ilan satildiginda ya da
  // yayindan kalktiginda listede kaliyor. Durumuna gore suzebilmek,
  // listeyi uzun tutan kullanicilar icin isi kolaylastiriyor.
  const [sekme, setSekme] = useState<'TUMU' | 'AKTIF' | 'SATILDI'>('TUMU');

  const aktifOlanlar = listings.filter((l: any) => l.status === 'ACTIVE' || l.status === 'RESERVED');
  const satilanlar = listings.filter((l: any) => l.status === 'SOLD');
  // ARCHIVED ya da silinmis ilanlar: ayri bir sekme acmak yerine "Tümü"
  // icinde kaliyorlar; kullaniciya yine de durumlarini soyluyoruz.
  const yayindaOlmayan = listings.filter(
    (l: any) => l.status && !['ACTIVE', 'RESERVED', 'SOLD'].includes(l.status),
  );

  const gosterilen =
    sekme === 'AKTIF' ? aktifOlanlar : sekme === 'SATILDI' ? satilanlar : listings;

  const sekmeler = [
    { key: 'TUMU' as const, label: 'Tümü', sayi: listings.length },
    { key: 'AKTIF' as const, label: 'Aktif', sayi: aktifOlanlar.length },
    { key: 'SATILDI' as const, label: 'Satıldı', sayi: satilanlar.length },
  ];

  return (
    <div className="m-wrap" style={{ maxWidth: 1100, paddingTop: 36, paddingBottom: 60 }}>
      <h1 className="m-display" style={{ fontSize: 28, marginBottom: 16 }}>Favorilerim</h1>

      {!isLoading && listings.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: 'var(--bg-1)', borderRadius: 12, padding: 5, border: '1px solid var(--line)', overflowX: 'auto' }}>
            {sekmeler.map(t => (
              <button key={t.key} onClick={() => setSekme(t.key)} style={{
                flex: 1, minWidth: 'max-content', height: 36, borderRadius: 8, border: 0, cursor: 'pointer',
                fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-display)', padding: '0 14px',
                background: sekme === t.key ? 'var(--bg-3)' : 'transparent',
                color: sekme === t.key ? 'var(--ink)' : 'var(--ink-3)',
              }}>
                {t.label}
                {t.sayi > 0 && <span style={{ marginLeft: 5, fontSize: 11, fontFamily: 'var(--font-mono)', opacity: 0.6 }}>({t.sayi})</span>}
              </button>
            ))}
          </div>

          {yayindaOlmayan.length > 0 && sekme === 'TUMU' && (
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.5 }}>
              {yayindaOlmayan.length} favorin artık yayında değil. Favorilerini silmiyoruz;
              satıcı ilanı tekrar yayına alırsa listende durmaya devam eder.
            </p>
          )}
        </>
      )}

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
        gosterilen.length === 0 ? (
          <p style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
            {sekme === 'AKTIF' ? 'Yayında olan favorin yok.' : 'Satıldı olarak işaretlenen favorin yok.'}
          </p>
        ) : (
          <div className="m-listing-grid">
            {gosterilen.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
