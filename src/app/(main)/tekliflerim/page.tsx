'use client';
import { useMyOffers, useWithdrawOffer } from '@/hooks/useOffers';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Tag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const OFFER_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:  { label: 'Bekliyor',  bg: 'color-mix(in oklch, #f59e0b 15%, transparent)',         color: '#f59e0b' },
  ACCEPTED: { label: 'Kabul Edildi', bg: 'color-mix(in oklch, var(--good) 15%, transparent)',  color: 'var(--good)' },
  REJECTED: { label: 'Reddedildi',  bg: 'color-mix(in oklch, var(--bad) 15%, transparent)',   color: 'var(--bad)' },
  WITHDRAWN:{ label: 'Geri Çekildi', bg: 'var(--bg-3)', color: 'var(--ink-3)' },
};

export default function OffersPage() {
  const { data: offers, isLoading } = useMyOffers();
  const withdraw = useWithdrawOffer();

  return (
    <div className="m-wrap" style={{ maxWidth: 760, paddingTop: 36, paddingBottom: 60 }}>
      <h1 className="m-display" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 28 }}>Tekliflerim</h1>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 80, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)', animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : offers?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {offers.map((o: any) => {
            const st = OFFER_STATUS[o.status] ?? OFFER_STATUS.PENDING;
            return (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--line)' }}>
                  {o.listing?.images?.[0]
                    ? <img src={o.listing.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 22 }}>📦</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/ilan/${o.listing?.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.listing?.title}
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>{formatPrice(o.amount)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', textDecoration: 'line-through' }}>{formatPrice(o.listing?.price)}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{timeAgo(o.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '3px 9px', borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
                  {o.status === 'PENDING' && (
                    <button
                      onClick={() => withdraw.mutate(o.id, { onSuccess: () => toast.success('Teklif geri çekildi') })}
                      disabled={withdraw.isPending}
                      style={{ fontSize: 12, color: 'var(--bad)', background: 'none', border: 0, cursor: 'pointer', padding: 0, fontFamily: 'var(--font-display)', fontWeight: 600 }}
                    >
                      Geri Çek
                    </button>
                  )}
                  {o.status === 'ACCEPTED' && (
                    <Link href="/siparislerim" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      Siparişi Gör →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
          <Tag size={44} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--ink-2)' }}>Henüz teklif vermediniz</p>
          <p style={{ fontSize: 13 }}>İlanları keşfet, beğendiğine teklif ver</p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, height: 42, padding: '0 20px', borderRadius: 10, background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: 'var(--font-display)' }}>
            İlanları Keşfet
          </Link>
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
