'use client';
import { useState } from 'react';
import { useMyOrders } from '@/hooks/useOrders';
import { formatPrice, timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  CREATED:         { label: 'Oluşturuldu',      color: '#f59e0b',         bg: 'color-mix(in oklch, #f59e0b 13%, transparent)' },
  AWAITING_PAYMENT:{ label: 'Ödeme Bekleniyor', color: '#f59e0b',         bg: 'color-mix(in oklch, #f59e0b 13%, transparent)' },
  PAID_ESCROW:     { label: 'Ödeme Alındı',     color: 'var(--accent)',   bg: 'color-mix(in oklch, var(--accent) 12%, transparent)' },
  SHIPPED:         { label: 'Kargoda',           color: 'var(--accent)',   bg: 'color-mix(in oklch, var(--accent) 12%, transparent)' },
  DELIVERED:       { label: 'Teslim Edildi',     color: 'var(--good)',     bg: 'color-mix(in oklch, var(--good) 12%, transparent)' },
  COMPLETED:       { label: 'Tamamlandı',        color: 'var(--good)',     bg: 'color-mix(in oklch, var(--good) 12%, transparent)' },
  DISPUTED:        { label: 'Anlaşmazlık',       color: 'var(--bad)',      bg: 'color-mix(in oklch, var(--bad) 12%, transparent)' },
  REFUNDED:        { label: 'İade',              color: 'var(--bad)',      bg: 'color-mix(in oklch, var(--bad) 12%, transparent)' },
  CANCELLED:       { label: 'İptal',             color: 'var(--ink-3)',    bg: 'var(--bg-3)' },
};

function Badge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.CREATED;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 20, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

const TABS = [
  { id: 'buyer', label: 'Aldıklarım' },
  { id: 'seller', label: 'Sattıklarım' },
];

export default function OrdersPage() {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const { data: orders = [], isLoading } = useMyOrders(role);

  return (
    <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 36, paddingBottom: 60 }}>
      <h1 className="m-display" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 24 }}>Siparişlerim</h1>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line-soft)', marginBottom: 24 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setRole(t.id as any)}
            style={{
              padding: '10px 18px', background: 'none', border: 0, cursor: 'pointer',
              fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 600,
              color: role === t.id ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: `2px solid ${role === t.id ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -1, transition: 'color .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 88, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)', animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
          <Package size={44} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink-2)' }}>Henüz sipariş yok</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            {role === 'buyer' ? 'İlanları keşfet ve satın al' : 'İlan ver ve satmaya başla'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((o: any) => (
            <Link
              key={o.id}
              href={`/siparislerim/${o.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)', textDecoration: 'none', transition: 'box-shadow .15s' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--line)' }}>
                {o.listing?.images?.[0]
                  ? <img src={o.listing.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 24 }}>📦</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.listing?.title}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--accent)', marginTop: 2 }}>{formatPrice(o.amount)} ₺</p>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                  {role === 'buyer' ? `Satıcı: ${o.seller?.displayName}` : `Alıcı: ${o.buyer?.displayName}`}
                  {' · '}{timeAgo(o.createdAt)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <Badge status={o.status} />
                <ChevronRight size={16} style={{ color: 'var(--ink-3)' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
