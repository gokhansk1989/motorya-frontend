'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useOrder, useConfirmCashPayment, useConfirmHandoff, useConfirmReceipt, useCancelOrder } from '@/hooks/useOrders';
import { useAuthStore } from '@/store/auth';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Circle, Package, MapPin, Clock } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'CREATED',    label: 'Oluşturuldu' },
  { key: 'PAID_ESCROW', label: 'Ödeme Onaylandı' },
  { key: 'DELIVERED',  label: 'Teslim Edildi' },
  { key: 'COMPLETED',  label: 'Tamamlandı' },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CREATED:          { label: 'Oluşturuldu',      color: '#f59e0b' },
  AWAITING_PAYMENT: { label: 'Ödeme Bekleniyor', color: '#f59e0b' },
  PAID_ESCROW:      { label: 'Ödeme Alındı',     color: 'var(--accent)' },
  SHIPPED:          { label: 'Kargoda',           color: 'var(--accent)' },
  DELIVERED:        { label: 'Teslim Edildi',     color: 'var(--good)' },
  COMPLETED:        { label: 'Tamamlandı',        color: 'var(--good)' },
  DISPUTED:         { label: 'Anlaşmazlık',       color: 'var(--bad)' },
  REFUNDED:         { label: 'İade',              color: 'var(--bad)' },
  CANCELLED:        { label: 'İptal Edildi',      color: 'var(--ink-3)' },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: order, isLoading } = useOrder(id);
  const confirmCash = useConfirmCashPayment();
  const confirmHandoff = useConfirmHandoff();
  const confirmReceipt = useConfirmReceipt();
  const cancelOrder = useCancelOrder();
  const [note, setNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

  if (isLoading) {
    return (
      <div className="m-wrap" style={{ maxWidth: 620, paddingTop: 36, paddingBottom: 60 }}>
        <div style={{ height: 400, background: 'var(--bg-1)', borderRadius: 16, animation: 'pulse 1.5s ease infinite' }} />
      </div>
    );
  }
  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '96px 0', color: 'var(--ink-3)' }}>
        <Package size={44} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
        <p className="m-display" style={{ fontSize: 18 }}>Sipariş bulunamadı</p>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;
  const stepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
  const currentStepIdx = stepIdx === -1 ? (order.status === 'PAID_ESCROW' ? 1 : 0) : stepIdx;
  const isTerminal = ['COMPLETED', 'CANCELLED', 'REFUNDED', 'DISPUTED'].includes(order.status);
  const statusMeta = STATUS_LABELS[order.status] ?? { label: order.status, color: 'var(--ink-3)' };
  const otherUser = isBuyer ? order.seller : order.buyer;

  const handleAction = async (action: 'cash' | 'handoff' | 'receipt' | 'cancel') => {
    try {
      if (action === 'cash') await confirmCash.mutateAsync({ id, meetingNote: note || undefined });
      else if (action === 'handoff') await confirmHandoff.mutateAsync({ id, meetingNote: note || undefined });
      else if (action === 'receipt') await confirmReceipt.mutateAsync(id);
      else if (action === 'cancel') await cancelOrder.mutateAsync(id);
      toast.success('İşlem başarılı');
      setCancelling(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Hata oluştu');
    }
  };

  return (
    <div className="m-wrap" style={{ maxWidth: 620, paddingTop: 28, paddingBottom: 60 }}>
      <Link href="/siparislerim" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft size={15} /> Siparişlerim
      </Link>

      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', marginBottom: 2 }}>
            #{order.id.slice(-8).toUpperCase()}
          </p>
          <h1 className="m-display" style={{ fontSize: 22, color: 'var(--ink)' }}>{order.listing?.title}</h1>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '4px 12px', borderRadius: 20, background: `color-mix(in oklch, ${statusMeta.color} 13%, transparent)`, color: statusMeta.color }}>
          {statusMeta.label}
        </span>
      </div>

      {/* Ürün kartı */}
      <div className="m-surface-2" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--line)' }}>
          {order.listing?.images?.[0]
            ? <img src={order.listing.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 28 }}>📦</div>}
        </div>
        <div style={{ flex: 1 }}>
          <Link href={`/ilan/${order.listingId}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', textDecoration: 'none' }}>
            {order.listing?.title}
          </Link>
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 22, color: 'var(--accent)', marginTop: 2 }}>
            {formatPrice(order.amount)} ₺
          </p>
        </div>
      </div>

      {/* Karşı taraf */}
      <div className="m-surface-2" style={{ padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        {otherUser?.avatarUrl
          ? <img src={otherUser.avatarUrl} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
          : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0 }}>{otherUser?.displayName?.[0]}</div>
        }
        <div>
          <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>{isBuyer ? 'Satıcı' : 'Alıcı'}</p>
          <Link href={`/kullanici/${otherUser?.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', textDecoration: 'none' }}>
            {otherUser?.displayName}
          </Link>
        </div>
        <Link
          href={`/mesajlarim`}
          className="m-btn m-btn-ghost sm"
          style={{ marginLeft: 'auto', fontSize: 13 }}
        >
          Mesaj Gönder
        </Link>
      </div>

      {/* Adım göstergesi */}
      {!isTerminal && (
        <div className="m-surface-2" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStepIdx;
              const active = i === currentStepIdx;
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center',
                      background: done ? 'var(--good)' : active ? 'var(--accent)' : 'var(--bg-3)',
                      color: done || active ? '#fff' : 'var(--ink-3)',
                      transition: 'all .2s',
                    }}>
                      {done ? <CheckCircle2 size={16} /> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? 'var(--ink)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? 'var(--good)' : 'var(--bg-3)', margin: '0 4px', marginBottom: 22, transition: 'background .2s' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Buluşma notu */}
      {order.shipment?.meetingNote && (
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: 'color-mix(in oklch, var(--accent) 8%, var(--bg-1))', borderRadius: 12, border: '1px solid color-mix(in oklch, var(--accent) 20%, transparent)', marginBottom: 16 }}>
          <MapPin size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>{order.shipment.meetingNote}</p>
        </div>
      )}

      {/* Aksiyon alanı */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Alıcı: elden ödemeyi onayla */}
        {order.status === 'CREATED' && isBuyer && order.paymentMethod === 'CASH' && !cancelling && (
          <div className="m-surface-2" style={{ padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Ödemeyi Onayla</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>Satıcıyla buluşup elden ödeyeceğini onaylayın. Buluşma detayını not bırakabilirsin.</p>
            <input
              className="m-field"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="İstanbul, Pazar 15:00 gibi…"
              style={{ marginBottom: 12 }}
            />
            <button
              className="m-btn m-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={confirmCash.isPending}
              onClick={() => handleAction('cash')}
            >
              {confirmCash.isPending ? 'İşleniyor…' : 'Elden Ödeyeceğimi Onayla'}
            </button>
          </div>
        )}

        {/* Satıcı: teslim et */}
        {order.status === 'PAID_ESCROW' && isSeller && order.paymentMethod === 'CASH' && !cancelling && (
          <div className="m-surface-2" style={{ padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Teslim Ettim</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>Ürünü alıcıya teslim ettiğini onaylayın.</p>
            <input
              className="m-field"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Teslim notu (opsiyonel)"
              style={{ marginBottom: 12 }}
            />
            <button
              className="m-btn m-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={confirmHandoff.isPending}
              onClick={() => handleAction('handoff')}
            >
              {confirmHandoff.isPending ? 'İşleniyor…' : 'Teslim Ettim'}
            </button>
          </div>
        )}

        {/* Alıcı: teslim aldım */}
        {order.status === 'DELIVERED' && isBuyer && !cancelling && (
          <div className="m-surface-2" style={{ padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Teslim Aldım</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>Ürünü teslim aldığını onaylarsan sipariş tamamlanır.</p>
            <button
              className="m-btn m-btn-primary"
              style={{ width: '100%', justifyContent: 'center', background: 'var(--good)', borderColor: 'var(--good)' }}
              disabled={confirmReceipt.isPending}
              onClick={() => handleAction('receipt')}
            >
              {confirmReceipt.isPending ? 'İşleniyor…' : 'Teslim Aldım — Siparişi Tamamla'}
            </button>
          </div>
        )}

        {/* Tamamlandı */}
        {order.status === 'COMPLETED' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={44} style={{ color: 'var(--good)', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>Sipariş Tamamlandı</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Satıcıya yorum bırakmayı unutma</p>
            <Link href={`/kullanici/${order.sellerId}`} className="m-btn m-btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              Yorum Yaz
            </Link>
          </div>
        )}

        {/* İptal onayı */}
        {cancelling && (
          <div className="m-surface-2" style={{ padding: 18, border: '1px solid color-mix(in oklch, var(--bad) 30%, transparent)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Siparişi iptal etmek istediğine emin misin?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="m-btn m-btn-ghost" style={{ flex: 1 }} onClick={() => setCancelling(false)}>Vazgeç</button>
              <button
                className="m-btn"
                style={{ flex: 1, background: 'var(--bad)', color: '#fff', borderColor: 'var(--bad)' }}
                disabled={cancelOrder.isPending}
                onClick={() => handleAction('cancel')}
              >
                {cancelOrder.isPending ? 'İşleniyor…' : 'İptal Et'}
              </button>
            </div>
          </div>
        )}

        {/* İptal butonu */}
        {['CREATED', 'PAID_ESCROW'].includes(order.status) && !cancelling && (
          <button
            className="m-btn m-btn-ghost"
            style={{ width: '100%', color: 'var(--bad)', justifyContent: 'center' }}
            onClick={() => setCancelling(true)}
          >
            Siparişi İptal Et
          </button>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
