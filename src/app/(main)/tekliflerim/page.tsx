'use client';
import { useState, useEffect } from 'react';
import { useMyOffers, useReceivedOffers, useRespondOffer, useWithdrawOffer } from '@/hooks/useOffers';
import { useCreateOrder } from '@/hooks/useOrders';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Tag, UserCheck, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:   { label: 'Bekliyor',      bg: 'color-mix(in oklch, #f59e0b 14%, transparent)',        color: '#f59e0b' },
  ACCEPTED:  { label: 'Kabul Edildi',  bg: 'color-mix(in oklch, var(--good) 14%, transparent)',    color: 'var(--good)' },
  REJECTED:  { label: 'Reddedildi',   bg: 'color-mix(in oklch, var(--bad) 14%, transparent)',     color: 'var(--bad)' },
  WITHDRAWN: { label: 'Geri Çekildi', bg: 'var(--bg-3)',                                          color: 'var(--ink-3)' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.PENDING;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function ListingThumb({ listing }: { listing: any }) {
  return (
    <div style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--line)' }}>
      {listing?.images?.[0]
        ? <img src={listing.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 22 }}>📦</div>}
    </div>
  );
}

function SentOffers() {
  const router = useRouter();
  const { data: offers, isLoading } = useMyOffers();
  const withdraw = useWithdrawOffer();
  const createOrder = useCreateOrder();

  if (isLoading) return <Skeleton />;
  if (!offers?.length) return (
    <Empty icon={<Tag size={44} />} title="Henüz teklif vermediniz" sub="İlanları keşfet, beğendiğine teklif ver" />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {offers.map((o: any) => (
        <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)' }}>
          <ListingThumb listing={o.listing} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link href={`/ilan/${(o.listing as any)?.slug ?? o.listing?.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {o.listing?.title}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>{formatPrice(o.amount)} ₺</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', textDecoration: 'line-through' }}>{formatPrice(o.listing?.price)} ₺</span>
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{timeAgo(o.createdAt)}</span>
            </div>
            {o.message && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{o.message}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
            <StatusBadge status={o.status} />
            {o.status === 'PENDING' && (
              <button
                onClick={() => withdraw.mutate(o.id, { onSuccess: () => toast.success('Teklif geri çekildi') })}
                disabled={withdraw.isPending}
                style={{ fontSize: 12, color: 'var(--bad)', background: 'none', border: 0, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600 }}
              >
                Geri Çek
              </button>
            )}
            {o.status === 'ACCEPTED' && (
              <button
                onClick={async () => {
                  try {
                    const order = await createOrder.mutateAsync({ listingId: o.listing.id, paymentMethod: 'CASH', amount: String(o.amount) });
                    router.push(`/siparislerim/${order.id}`);
                  } catch (e: any) {
                    const msg = e.response?.data?.message ?? '';
                    if (msg.includes('RESERVED') || msg.includes('not available')) {
                      toast.error('Bu ilan için zaten bir sipariş var');
                      router.push('/siparislerim');
                    } else {
                      toast.error(msg || 'Hata oluştu');
                    }
                  }
                }}
                disabled={createOrder.isPending}
                style={{ fontSize: 12, color: 'var(--good)', background: 'none', border: 0, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}
              >
                Siparişe Git <ChevronRight size={12} />
              </button>
            )}
            {o.status === 'REJECTED' && o.listing?.status === 'ACTIVE' && (
              <Link href={`/ilan/${(o.listing as any)?.slug ?? o.listing.id}`} style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Plus size={12} /> Yeni Teklif Ver
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReceivedOffers() {
  const { data: offers, isLoading } = useReceivedOffers();
  const respond = useRespondOffer();

  if (isLoading) return <Skeleton />;
  if (!offers?.length) return (
    <Empty icon={<UserCheck size={44} />} title="Henüz teklif almadınız" sub="İlanlarınıza gelen teklifler burada görünecek" />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {offers.map((o: any) => (
        <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)' }}>
          <ListingThumb listing={o.listing} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link href={`/ilan/${(o.listing as any)?.slug ?? o.listing?.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {o.listing?.title}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>{formatPrice(o.amount)} ₺</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', textDecoration: 'line-through' }}>{formatPrice(o.listing?.price)} ₺</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
              {o.buyer?.avatarUrl
                ? <img src={o.buyer.avatarUrl} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                : <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{o.buyer?.displayName?.[0]}</div>
              }
              <Link href={`/kullanici/${o.buyer?.id}`} style={{ fontSize: 12, color: 'var(--ink-2)', textDecoration: 'none', fontWeight: 600 }}>{o.buyer?.displayName}</Link>
              <span style={{ fontSize: 11, color: 'var(--ink-3)', opacity: 0.7 }}>· {timeAgo(o.createdAt)}</span>
            </div>
            {o.message && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{o.message}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
            <StatusBadge status={o.status} />
            {o.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="m-btn m-btn-primary sm"
                  style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                  disabled={respond.isPending}
                  onClick={() => respond.mutate({ id: o.id, action: 'ACCEPTED' }, { onSuccess: () => toast.success('Teklif kabul edildi!') })}
                >
                  Kabul Et
                </button>
                <button
                  className="m-btn m-btn-ghost sm"
                  style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                  disabled={respond.isPending}
                  onClick={() => respond.mutate({ id: o.id, action: 'REJECTED' }, { onSuccess: () => toast.success('Teklif reddedildi') })}
                >
                  Reddet
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ height: 88, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)', animation: 'pulse 1.5s ease infinite' }} />
      ))}
    </div>
  );
}

function Empty({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
      <div style={{ opacity: 0.25, color: 'var(--ink-3)', display: 'flex', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--ink-2)' }}>{title}</p>
      <p style={{ fontSize: 13 }}>{sub}</p>
    </div>
  );
}

const TABS = [
  { id: 'sent',     label: 'Verdiğim Teklifler' },
  { id: 'received', label: 'Aldığım Teklifler' },
];

export default function OffersPage() {
  const [tab, setTab] = useState<'sent' | 'received'>('sent');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('tab');
    if (p === 'received' || p === 'sent') setTab(p);
  }, []);

  return (
    <div className="m-wrap" style={{ maxWidth: 760, paddingTop: 36, paddingBottom: 60 }}>
      <h1 className="m-display" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 24 }}>Teklifler</h1>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line-soft)', marginBottom: 24 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{
              padding: '10px 18px', background: 'none', border: 0, cursor: 'pointer',
              fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 600,
              color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -1, transition: 'color .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sent' ? <SentOffers /> : <ReceivedOffers />}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
