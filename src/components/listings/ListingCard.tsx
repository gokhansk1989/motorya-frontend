'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Eye } from 'lucide-react';
import { formatPrice, timeAgo } from '@/lib/utils';
import { useToggleFavorite } from '@/hooks/useListings';
import { useAuthStore } from '@/store/auth';
import type { Listing } from '@/hooks/useListings';

function ConditionPill({ condition }: { condition: string }) {
  const map: Record<string, { label: string; tone: string }> = {
    NEW: { label: 'Sıfır', tone: 'var(--good)' },
    LIKE_NEW: { label: 'Sıfır Gibi', tone: 'var(--good)' },
    GOOD: { label: 'İyi', tone: 'var(--good)' },
    FAIR: { label: 'Makul', tone: 'var(--warn)' },
    POOR: { label: 'Kullanılmış', tone: 'var(--bad)' },
  };
  const c = map[condition] ?? { label: condition, tone: 'var(--good)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', color: 'var(--ink-2)' }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: c.tone, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  const { user } = useAuthStore();
  const toggle = useToggleFavorite();
  const thumb = listing.images?.[0]?.url;
  const discountPct = listing.originalPrice
    ? Math.round((1 - Number(listing.price) / Number(listing.originalPrice)) * 100)
    : null;

  return (
    <article className="m-card m-fade-up">
      <Link href={`/ilan/${listing.id}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div className="m-card-media">
          {thumb ? (
            <Image src={thumb} alt={listing.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px" style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(45deg, var(--bg-2) 0 12px, var(--bg-3) 12px 24px)',
              display: 'grid', placeItems: 'center', color: 'var(--ink-3)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'oklch(0 0 0 / 0.45)', padding: '5px 10px', borderRadius: 6 }}>
                Fotoğraf yok
              </span>
            </div>
          )}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, zIndex: 2 }}>
            {discountPct && discountPct > 0 && (
              <span className="m-badge new">%{discountPct} İNDİRİM</span>
            )}
          </div>
          {user && (
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); toggle.mutate(listing.id); }}
              aria-label="Favori"
              style={{
                position: 'absolute', top: 10, right: 10, width: 36, height: 36,
                display: 'grid', placeItems: 'center', borderRadius: '50%',
                background: 'oklch(0 0 0 / 0.45)', border: '1px solid oklch(1 0 0 / 0.12)',
                color: listing.isFavorited ? 'var(--accent)' : 'var(--ink)',
                backdropFilter: 'blur(6px)', zIndex: 2, transition: 'all .14s ease',
              }}
            >
              <Heart size={17} fill={listing.isFavorited ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
          )}
        </div>
      </Link>

      <div className="m-card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <ConditionPill condition={listing.condition} />
          {listing.brand && (
            <span className="m-kicker" style={{ letterSpacing: '0.12em' }}>{listing.brand.name}</span>
          )}
        </div>
        <Link href={`/ilan/${listing.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="m-card-title">{listing.title}</h3>
        </Link>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="m-price">
            {formatPrice(listing.price)}<span className="cur">₺</span>
          </span>
          {listing.originalPrice && (
            <span className="m-price-old">{formatPrice(listing.originalPrice)}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9, color: 'var(--ink-3)', fontSize: 12 }}>
          {listing.city && (
            <>
              <MapPin size={13} />
              <span>{listing.city}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }} />
            </>
          )}
          <Eye size={13} />
          <span>{(listing as any).viewCount ?? 0}</span>
          <div style={{ flex: 1 }} />
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}
