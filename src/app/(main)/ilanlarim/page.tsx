'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useMyListings } from '@/hooks/useListings';
import { formatPrice } from '@/lib/utils';
import { Plus, Trash2, Eye, Package } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  PENDING_REVIEW: { label: 'Onay Bekliyor', bg: 'color-mix(in oklch, #f59e0b 15%, transparent)', color: '#f59e0b' },
  ACTIVE:         { label: 'Aktif',         bg: 'color-mix(in oklch, var(--good) 15%, transparent)', color: 'var(--good)' },
  REJECTED:       { label: 'Reddedildi',    bg: 'color-mix(in oklch, var(--bad) 15%, transparent)',  color: 'var(--bad)' },
  SOLD:           { label: 'Satıldı',       bg: 'var(--bg-3)', color: 'var(--ink-3)' },
  RESERVED:       { label: 'Rezerve',       bg: 'color-mix(in oklch, var(--accent-2) 15%, transparent)', color: 'var(--accent-2)' },
};

export default function MyListingsPage() {
  const [filter, setFilter] = useState('ALL');
  const { data, isLoading } = useMyListings();
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onSuccess: () => { toast.success('İlan silindi'); qc.invalidateQueries({ queryKey: ['myListings'] }); },
    onError: () => toast.error('İlan silinemedi'),
  });

  const listings = Array.isArray(data) ? data : (data?.items ?? []);
  const filtered = filter === 'ALL' ? listings : listings.filter((l: any) => l.status === filter);

  const tabs = [
    { key: 'ALL', label: 'Tümü', count: listings.length },
    { key: 'ACTIVE', label: 'Aktif', count: listings.filter((l: any) => l.status === 'ACTIVE').length },
    { key: 'PENDING_REVIEW', label: 'Onay Bekliyor', count: listings.filter((l: any) => l.status === 'PENDING_REVIEW').length },
    { key: 'SOLD', label: 'Satıldı', count: listings.filter((l: any) => l.status === 'SOLD').length },
  ];

  return (
    <div className="m-wrap" style={{ maxWidth: 760, paddingTop: 36, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 className="m-display" style={{ fontSize: 28, color: 'var(--ink)' }}>İlanlarım</h1>
        <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          <Plus size={18} strokeWidth={2.4} />İlan Ver
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--bg-1)', borderRadius: 12, padding: 5, border: '1px solid var(--line)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            flex: 1, height: 36, borderRadius: 8, border: 0, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--font-display)', transition: 'all .15s',
            background: filter === t.key ? 'var(--bg-3)' : 'transparent',
            color: filter === t.key ? 'var(--ink)' : 'var(--ink-3)',
            boxShadow: filter === t.key ? 'var(--shadow-s)' : 'none',
          }}>
            {t.label}{t.count > 0 && <span style={{ marginLeft: 5, fontSize: 11, fontFamily: 'var(--font-mono)', opacity: 0.6 }}>({t.count})</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 88, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)', animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
          <Package size={44} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--ink-2)' }}>Henüz ilan yok</p>
          <p style={{ fontSize: 13, marginBottom: 20 }}>İlk ilanını oluştur, ekipmanını sat</p>
          <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 42, padding: '0 20px', borderRadius: 10, textDecoration: 'none', fontSize: 14 }}>
            <Plus size={16} />İlan Ver
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((l: any) => {
            const st = STATUS[l.status] ?? { label: l.status, bg: 'var(--bg-3)', color: 'var(--ink-3)' };
            return (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)', transition: 'border-color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--line-soft)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}>
                <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--line)' }}>
                  {l.images?.[0] && <img src={l.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                    <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '3px 9px', borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{formatPrice(l.price)}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{l.viewCount ?? 0} görüntülenme · {l.favoriteCount ?? 0} favori</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Link href={`/ilan/${l.id}`} style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-2)', textDecoration: 'none' }}>
                    <Eye size={16} />
                  </Link>
                  <button
                    onClick={() => confirm('İlanı silmek istediğinizden emin misiniz?') && deleteMutation.mutate(l.id)}
                    style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'color-mix(in oklch, var(--bad) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--bad) 25%, transparent)', borderRadius: 8, color: 'var(--bad)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
