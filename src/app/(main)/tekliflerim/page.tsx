'use client';
import { useState, useEffect } from 'react';
import { useMyOffers, useReceivedOffers, useRespondOffer, useWithdrawOffer, useCounterOffer, useRespondCounterOffer, useOfferUpdates } from '@/hooks/useOffers';
import { useCreateReview } from '@/hooks/useReviews';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Tag, UserCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function ReviewModal({ open, onClose, onSubmit, isPending, title }: {
  open: boolean; onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isPending: boolean; title: string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="m-surface-2" style={{ padding: 24, width: '100%', maxWidth: 400, borderRadius: 'var(--radius-l)' }}>
        <h3 className="m-display" style={{ fontSize: 18, margin: '0 0 16px' }}>{title}</h3>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)} style={{ fontSize: 28, background: 'none', border: 0, cursor: 'pointer', opacity: s <= rating ? 1 : 0.3, transition: 'opacity .1s' }}>⭐</button>
          ))}
        </div>
        <label className="m-label">Yorum (opsiyonel)</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
          placeholder="Deneyimini anlat..."
          style={{ width: '100%', marginTop: 6, marginBottom: 16, padding: '10px 12px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink)', fontSize: 14, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="m-btn m-btn-ghost" style={{ flex: 1 }} onClick={onClose}>Vazgeç</button>
          <button className="m-btn m-btn-primary" style={{ flex: 1 }} disabled={rating === 0 || isPending}
            onClick={() => onSubmit(rating, comment)}>
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:         { label: 'Bekliyor',         bg: 'color-mix(in oklch, #f59e0b 14%, transparent)',     color: '#f59e0b' },
  COUNTER_OFFERED: { label: 'Karşı Teklif',     bg: 'color-mix(in oklch, #8b5cf6 14%, transparent)',    color: '#8b5cf6' },
  ACCEPTED:        { label: 'Kabul Edildi',      bg: 'color-mix(in oklch, var(--good) 14%, transparent)', color: 'var(--good)' },
  REJECTED:        { label: 'Reddedildi',        bg: 'color-mix(in oklch, var(--bad) 14%, transparent)',  color: 'var(--bad)' },
  WITHDRAWN:       { label: 'Geri Çekildi',      bg: 'var(--bg-3)',                                       color: 'var(--ink-3)' },
  EXPIRED:         { label: 'Süresi Doldu',      bg: 'var(--bg-3)',                                       color: 'var(--ink-3)' },
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
        : <img src="/icons/empty-listing.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />}
    </div>
  );
}

function SentOffers() {
  const { data: offers, isLoading } = useMyOffers();
  const withdraw = useWithdrawOffer();
  const respondCounter = useRespondCounterOffer();
  const createReview = useCreateReview();
  const [reviewState, setReviewState] = useState<Record<string, { open: boolean; done: boolean }>>({});

  if (isLoading) return <Skeleton />;
  if (!offers?.length) return (
    <Empty icon={<Tag size={44} />} title="Henüz teklif vermediniz" sub="İlanları keşfet, beğendiğine teklif ver" />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {offers.map((o: any) => (
        <div key={o.id} className="m-offer-card" style={{ padding: 16, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)' }}>
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

            {/* Teklif kabul edildi — sonraki adım yönlendirmesi */}
            {o.status === 'ACCEPTED' && (
              <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 10, background: 'color-mix(in oklch, var(--good) 8%, var(--bg-1))', border: '1.5px solid color-mix(in oklch, var(--good) 30%, transparent)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--good)', marginBottom: 4 }}>🎉 Teklifiniz kabul edildi!</div>
                <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>
                  Satıcıyla mesajlaşarak buluşma yeri ve ödeme şeklini belirleyin. Ödemeyi teslimatta yapın — önceden yabancılara para göndermeyin.
                </p>
              </div>
            )}

            {/* Karşı teklif geldi */}
            {o.status === 'COUNTER_OFFERED' && o.counterAmount && (
              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: 'color-mix(in oklch, #8b5cf6 8%, var(--bg-1))', border: '1.5px solid color-mix(in oklch, #8b5cf6 25%, transparent)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>Satıcının karşı teklifi</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 17, color: '#8b5cf6' }}>{formatPrice(o.counterAmount)} ₺</div>
                {o.counterMessage && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{o.counterMessage}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    className="m-btn m-btn-primary sm"
                    style={{ height: 32, padding: '0 14px', fontSize: 12 }}
                    disabled={respondCounter.isPending}
                    onClick={() => respondCounter.mutate({ id: o.id, action: 'ACCEPTED' }, { onSuccess: () => toast.success('Karşı teklif kabul edildi!') })}
                  >
                    Kabul Et
                  </button>
                  <button
                    className="m-btn m-btn-ghost sm"
                    style={{ height: 32, padding: '0 14px', fontSize: 12 }}
                    disabled={respondCounter.isPending}
                    onClick={() => respondCounter.mutate({ id: o.id, action: 'REJECTED' }, { onSuccess: () => toast.success('Karşı teklif reddedildi') })}
                  >
                    Reddet
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="m-offer-actions">
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
              <Link href={`/mesajlarim`} style={{ fontSize: 12, color: 'var(--good)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                Satıcıya Mesaj Yaz
              </Link>
            )}
            {o.status === 'ACCEPTED' && (
              reviewState[o.id]?.done ? (
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>Yorum yapıldı ✓</span>
              ) : (
                <button
                  style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 0, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700 }}
                  onClick={() => setReviewState(s => ({ ...s, [o.id]: { open: true, done: false } }))}
                >
                  ⭐ Satıcıya Yorum Yap
                </button>
              )
            )}
            {o.status === 'REJECTED' && o.listing?.status === 'ACTIVE' && (
              <Link href={`/ilan/${(o.listing as any)?.slug ?? o.listing?.id}`} style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Plus size={12} /> Yeni Teklif Ver
              </Link>
            )}
          </div>
          {reviewState[o.id]?.open && (
            <ReviewModal
              open
              title="Satıcıya Yorum Yap"
              isPending={createReview.isPending}
              onClose={() => setReviewState(s => ({ ...s, [o.id]: { open: false, done: false } }))}
              onSubmit={(rating, comment) => {
                createReview.mutate(
                  { listingId: o.listing?.id, rating, comment: comment || undefined },
                  {
                    onSuccess: () => {
                      toast.success('Yorumunuz gönderildi!');
                      setReviewState(s => ({ ...s, [o.id]: { open: false, done: true } }));
                    },
                    onError: (e: any) => toast.error(e.response?.data?.message || 'Hata oluştu'),
                  }
                );
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ReceivedOffers() {
  const { data: offers, isLoading } = useReceivedOffers();
  const respond = useRespondOffer();
  const counter = useCounterOffer();
  const createReview = useCreateReview();
  const [reviewState, setReviewState] = useState<Record<string, { open: boolean; done: boolean }>>({});
  const [counterModal, setCounterModal] = useState<{ offerId: string; buyerAmount: number; listingPrice: number } | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  if (isLoading) return <Skeleton />;
  if (!offers?.length) return (
    <Empty icon={<UserCheck size={44} />} title="Henüz teklif almadınız" sub="İlanlarınıza gelen teklifler burada görünecek" />
  );

  const handleCounter = async () => {
    if (!counterModal) return;
    const amt = parseFloat(counterAmount);
    if (!amt || isNaN(amt)) { toast.error('Geçerli bir tutar girin'); return; }
    try {
      await counter.mutateAsync({ id: counterModal.offerId, counterAmount: amt, counterMessage: counterMessage || undefined });
      toast.success('Karşı teklif gönderildi!');
      setCounterModal(null);
      setCounterAmount('');
      setCounterMessage('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Hata oluştu');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {offers.map((o: any) => (
          <div key={o.id} className="m-offer-card" style={{ padding: 16, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)' }}>
            <ListingThumb listing={o.listing} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link href={`/ilan/${(o.listing as any)?.slug ?? o.listing?.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {o.listing?.title}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>{formatPrice(o.amount)} ₺</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', textDecoration: 'line-through' }}>{formatPrice(o.listing?.price)} ₺</span>
              </div>
              {o.counterAmount && (
                <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, marginTop: 4 }}>
                  Karşı teklifiniz: {formatPrice(o.counterAmount)} ₺
                </div>
              )}
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
            <div className="m-offer-actions">
              <StatusBadge status={o.status} />
              {o.status === 'ACCEPTED' && (
                reviewState[o.id]?.done ? (
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>Yorum yapıldı ✓</span>
                ) : (
                  <button
                    style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 0, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700 }}
                    onClick={() => setReviewState(s => ({ ...s, [o.id]: { open: true, done: false } }))}
                  >
                    ⭐ Alıcıya Yorum Yap
                  </button>
                )
              )}
              {o.status === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                  <button
                    style={{ fontSize: 12, color: '#8b5cf6', background: 'none', border: 0, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, textAlign: 'right' }}
                    onClick={() => { setCounterModal({ offerId: o.id, buyerAmount: Number(o.amount), listingPrice: Number(o.listing?.price) }); setCounterAmount(''); setCounterMessage(''); }}
                  >
                    Karşı Teklif Yap
                  </button>
                </div>
              )}
              {o.status === 'COUNTER_OFFERED' && (
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>Alıcının yanıtı bekleniyor…</span>
              )}
            </div>
            {reviewState[o.id]?.open && (
              <ReviewModal
                open
                title="Alıcıya Yorum Yap"
                isPending={createReview.isPending}
                onClose={() => setReviewState(s => ({ ...s, [o.id]: { open: false, done: false } }))}
                onSubmit={(rating, comment) => {
                  createReview.mutate(
                    { listingId: o.listing?.id, rating, comment: comment || undefined, buyerId: o.buyer?.id },
                    {
                      onSuccess: () => {
                        toast.success('Yorumunuz gönderildi!');
                        setReviewState(s => ({ ...s, [o.id]: { open: false, done: true } }));
                      },
                      onError: (e: any) => toast.error(e.response?.data?.message || 'Hata oluştu'),
                    }
                  );
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Counter offer modal */}
      {counterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="m-surface-2" style={{ padding: 24, width: '100%', maxWidth: 420 }}>
            <h3 className="m-display" style={{ fontSize: 20, margin: '0 0 6px' }}>Karşı Teklif Yap</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>
              Alıcı teklifi: <strong>{formatPrice(counterModal.buyerAmount)} ₺</strong> · İlan fiyatı: <strong>{formatPrice(counterModal.listingPrice)} ₺</strong>
            </p>
            <label className="m-label">Karşı teklif tutarı (₺)</label>
            <input
              className="m-field"
              type="number"
              value={counterAmount}
              onChange={e => setCounterAmount(e.target.value)}
              placeholder={`${counterModal.buyerAmount + 1} – ${counterModal.listingPrice - 1}`}
              style={{ marginBottom: 12 }}
            />
            <label className="m-label">Mesaj (opsiyonel)</label>
            <input
              className="m-field"
              value={counterMessage}
              onChange={e => setCounterMessage(e.target.value)}
              placeholder="Bu fiyat altına inemem çünkü…"
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="m-btn m-btn-ghost" style={{ flex: 1 }} onClick={() => setCounterModal(null)}>Vazgeç</button>
              <button className="m-btn m-btn-primary" style={{ flex: 1, background: '#8b5cf6', borderColor: '#8b5cf6' }} disabled={counter.isPending} onClick={handleCounter}>
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  useOfferUpdates();

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
