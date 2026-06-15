'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useListing } from '@/hooks/useListings';
import { useCreateOrder } from '@/hooks/useOrders';
import { useCreateOffer, useListingOffers, useRespondOffer } from '@/hooks/useOffers';
import { useAuthStore } from '@/store/auth';
import { formatPrice, timeAgo } from '@/lib/utils';
import { MapPin, Eye, Heart, Star, ChevronLeft, ChevronRight, Shield, Truck, Users, Share2, Flag, Zap, MessageCircle } from 'lucide-react';
import { useStartConversation } from '@/hooks/useMessages';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

export default function ListingDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: listing, isLoading } = useListing(id);
  const { data: offers } = useListingOffers(id);
  const createOrder = useCreateOrder();
  const createOffer = useCreateOffer();
  const respondOffer = useRespondOffer();
  const startConversation = useStartConversation();

  const [imgIdx, setImgIdx] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [meetingNote, setMeetingNote] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'ship' | 'meet'>('ship');
  const [favd, setFavd] = useState(false);

  if (isLoading) return (
    <div className="m-wrap" style={{ paddingTop: 32, paddingBottom: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: 36 }}>
        <div className="m-surface-2" style={{ aspectRatio: '4/3' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 24, background: 'var(--bg-3)', borderRadius: 8, width: '60%' }} />
          <div style={{ height: 36, background: 'var(--bg-3)', borderRadius: 8, width: '40%' }} />
        </div>
      </div>
    </div>
  );
  if (!listing) return (
    <div style={{ textAlign: 'center', padding: '96px 0', color: 'var(--ink-3)' }}>
      <p className="m-display" style={{ fontSize: 20 }}>İlan bulunamadı</p>
    </div>
  );

  const isMine = user?.id === listing.seller.id;
  const images = listing.images || [];
  const discountPct = listing.originalPrice
    ? Math.round((1 - Number(listing.price) / Number(listing.originalPrice)) * 100)
    : null;

  const handleBuyNow = async () => {
    if (!user) { toast.error('Satın almak için giriş yapmalısın'); router.push('/giris'); return; }
    try {
      const order = await createOrder.mutateAsync({ listingId: listing.id, paymentMethod: 'CASH' });
      toast.success('Sipariş oluşturuldu!');
      router.push(`/siparislerim/${order.id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleOffer = async () => {
    if (!user) { toast.error('Teklif vermek için giriş yapmalısın'); router.push('/giris'); return; }
    try {
      await createOffer.mutateAsync({ listingId: listing.id, amount: parseFloat(offerAmount), message: offerMsg });
      toast.success('Teklifiniz gönderildi!');
      setShowOfferModal(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const specs = [
    listing.brand && ['Marka', listing.brand.name],
    listing.category && ['Kategori', listing.category.name],
    listing.sizeLabel && ['Beden', listing.sizeLabel],
    listing.city && ['Konum', listing.city],
    ['İlan no', '#MTR-' + listing.id.slice(-6).toUpperCase()],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="m-wrap" style={{ paddingBottom: 40 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)', fontSize: 12.5, padding: '20px 0 4px', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'var(--ink-3)' }}>Keşfet</Link>
        <ChevronRight size={13} style={{ opacity: 0.5 }} />
        {listing.category && <Link href="/" style={{ color: 'var(--ink-3)' }}>{listing.category.name}</Link>}
        {listing.category && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
        <span style={{ color: 'var(--ink-2)' }}>{listing.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: 36, alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          {/* Gallery */}
          <div className="m-surface-2" style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', borderRadius: 'var(--radius)' }}>
            {images.length > 0 ? (
              <img src={images[imgIdx].url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'repeating-linear-gradient(45deg, var(--bg-2) 0 12px, var(--bg-3) 12px 24px)',
                display: 'grid', placeItems: 'center', color: 'var(--ink-3)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', background: 'oklch(0 0 0 / 0.45)', padding: '5px 10px', borderRadius: 6 }}>Fotoğraf yok</span>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'oklch(0 0 0 / 0.5)', border: '1px solid oklch(1 0 0 / 0.12)', display: 'grid', placeItems: 'center', color: '#fff', backdropFilter: 'blur(6px)' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'oklch(0 0 0 / 0.5)', border: '1px solid oklch(1 0 0 / 0.12)', display: 'grid', placeItems: 'center', color: '#fff', backdropFilter: 'blur(6px)' }}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
            <button style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 8, background: 'oklch(0 0 0 / 0.5)', border: '1px solid oklch(1 0 0 / 0.12)', display: 'grid', placeItems: 'center', color: '#fff', backdropFilter: 'blur(6px)' }}>
              <Share2 size={18} />
            </button>
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
              {images.map((img: { url: string }, i: number) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ width: 76, height: 62, borderRadius: 8, overflow: 'hidden', border: '2px solid ' + (i === imgIdx ? 'var(--accent)' : 'transparent'), padding: 0, flexShrink: 0, cursor: 'pointer' }}>
                  <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="m-surface" style={{ padding: '22px 24px', marginTop: 24 }}>
            <h3 className="m-display" style={{ fontSize: 18, margin: '0 0 12px' }}>Açıklama</h3>
            <p style={{ lineHeight: 1.65, fontSize: 14.5, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' }}>{listing.description}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {[listing.brand?.name, listing.sizeLabel, listing.category?.name, listing.city].filter(Boolean).map(t => (
                <span key={t} className="m-chip" style={{ height: 30, fontSize: 12.5 }}>#{t}</span>
              ))}
            </div>
          </div>

          {/* Specs */}
          <div className="m-surface" style={{ padding: '22px 24px', marginTop: 20 }}>
            <h3 className="m-display" style={{ fontSize: 18, margin: '0 0 8px' }}>Teknik özellikler</h3>
            {specs.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <span style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{k}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — buy box (sticky) */}
        <div style={{ position: 'sticky', top: 88 }}>
          <div className="m-surface-2" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <ConditionPill condition={listing.condition} />
              <button
                onClick={() => setFavd(f => !f)}
                style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg-1)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: favd ? 'var(--accent)' : 'var(--ink-2)' }}
              >
                <Heart size={18} fill={favd ? 'currentColor' : 'none'} />
              </button>
            </div>

            <h1 className="m-display" style={{ fontSize: 24, margin: '0 0 14px', lineHeight: 1.2 }}>{listing.title}</h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <span className="m-price" style={{ fontSize: 34 }}>
                {formatPrice(listing.price)}<span className="cur" style={{ fontSize: 18 }}>₺</span>
              </span>
              {listing.originalPrice && (
                <span className="m-price-old" style={{ fontSize: 16 }}>{formatPrice(listing.originalPrice)}</span>
              )}
              {discountPct && discountPct > 0 && (
                <span className="m-badge new">%{discountPct} İNDİRİM</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 16, color: 'var(--ink-3)', fontSize: 12.5, marginTop: 6 }}>
              <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}><Eye size={14} />{listing.viewCount} görüntülenme</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', alignSelf: 'center', opacity: 0.6 }} />
              <span>{timeAgo(listing.createdAt)}</span>
            </div>

            {/* Delivery */}
            <div className="m-label" style={{ marginTop: 22 }}>Teslimat yöntemi</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['ship', 'meet'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setDeliveryMode(mode as 'ship' | 'meet')}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    background: deliveryMode === mode ? 'color-mix(in oklch, var(--accent) 12%, var(--bg-1))' : 'var(--bg-1)',
                    border: '1.5px solid ' + (deliveryMode === mode ? 'var(--accent)' : 'var(--line)'),
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {mode === 'ship' ? <Truck size={17} style={{ color: deliveryMode === mode ? 'var(--accent)' : 'var(--ink-2)' }} /> : <Users size={17} style={{ color: deliveryMode === mode ? 'var(--accent)' : 'var(--ink-2)' }} />}
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{mode === 'ship' ? 'Kargo' : 'Yüz yüze'}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{mode === 'ship' ? '2-3 iş günü' : 'Güvenli nokta'}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            {!isMine && listing.status === 'ACTIVE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                <button
                  className="m-btn m-btn-primary lg block"
                  onClick={() => {
                    if (!user) { toast.error('Satın almak için giriş yapmalısın'); router.push('/giris'); return; }
                    setShowOrderModal(true);
                  }}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}
                >
                  <Zap size={18} fill="currentColor" strokeWidth={0} />
                  Hemen Al · {formatPrice(listing.price)} ₺
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="m-btn m-btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => {
                      if (!user) { toast.error('Teklif vermek için giriş yapmalısın'); router.push('/giris'); return; }
                      setShowOfferModal(true);
                    }}
                  >
                    Teklif Ver
                  </button>
                  <button
                    className="m-btn m-btn-ghost"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={async () => {
                      if (!user) { toast.error('Mesaj göndermek için giriş yapmalısın'); router.push('/giris'); return; }
                      try {
                        const conv = await startConversation.mutateAsync({ otherUserId: listing.seller.id, listingId: listing.id });
                        router.push(`/mesajlarim?conv=${conv.id}`);
                      } catch { toast.error('Mesaj başlatılamadı'); }
                    }}
                  >
                    <MessageCircle size={15} />
                    Mesaj
                  </button>
                </div>
                {!user && (
                  <p style={{ fontSize: 12, textAlign: 'center', color: 'var(--ink-3)' }}>
                    Satıcıyla iletişim kurmak için{' '}
                    <Link href="/giris" style={{ color: 'var(--accent)', fontWeight: 600 }}>giriş yap</Link>
                    {' '}veya{' '}
                    <Link href="/kayit" style={{ color: 'var(--accent)', fontWeight: 600 }}>üye ol</Link>
                  </p>
                )}
              </div>
            )}
            {isMine && (
              <div style={{ marginTop: 20 }}>
                <Link href={`/ilanlarim/${listing.id}/duzenle`} className="m-btn m-btn-ghost block" style={{ width: '100%', display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
                  İlanı Düzenle
                </Link>
              </div>
            )}

            {/* Trust */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 18, padding: 14, background: 'var(--bg-1)', borderRadius: 10, border: '1px solid var(--line-soft)' }}>
              <Shield size={20} style={{ color: 'var(--accent-2)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Alıcı koruması aktif</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Ürün eline geçene kadar ödemen güvende tutulur.</div>
              </div>
            </div>
          </div>

          {/* Seller card */}
          <Link href={`/kullanici/${listing.seller.id}`} className="m-surface" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', marginTop: 16, textDecoration: 'none', cursor: 'pointer' }}>
            {listing.seller.avatarUrl ? (
              <img src={listing.seller.avatarUrl} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} alt="" />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-3)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--accent)', flexShrink: 0 }}>
                {listing.seller.displayName[0]}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="m-display" style={{ fontSize: 16, fontWeight: 600 }}>{listing.seller.displayName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 12.5 }}>
                <Star size={12} fill="var(--accent)" stroke="none" style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{listing.seller.ratingAvg?.toFixed(1)}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }} />
                <span>{listing.seller.ratingCount ?? 0} değerlendirme</span>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--ink-3)' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 12, fontSize: 12, color: 'var(--ink-3)' }}>
            <Flag size={13} />
            <button style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', fontSize: 12 }}>Bu ilanı bildir</button>
          </div>
        </div>
      </div>

      {/* Seller's incoming offers */}
      {isMine && offers?.length > 0 && (
        <div className="m-surface" style={{ marginTop: 32, padding: '22px 24px' }}>
          <h2 className="m-display" style={{ fontSize: 18, margin: '0 0 16px' }}>Teklifler ({offers.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {offers.map((o: any) => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--line-soft)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{o.buyer.displayName}</span>
                    <span className={'m-badge ' + (o.status === 'PENDING' ? 'warn' : o.status === 'ACCEPTED' ? 'good' : 'bad')}>
                      {o.status === 'PENDING' ? 'Bekliyor' : o.status === 'ACCEPTED' ? 'Kabul' : 'Reddedildi'}
                    </span>
                  </div>
                  <span className="m-accent" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{formatPrice(o.amount)} ₺</span>
                  {o.message && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{o.message}</p>}
                </div>
                {o.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="m-btn sm m-btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13 }} onClick={() => respondOffer.mutate({ id: o.id, action: 'ACCEPTED' })}>Kabul</button>
                    <button className="m-btn sm m-btn-ghost" style={{ height: 36, padding: '0 14px', fontSize: 13 }} onClick={() => respondOffer.mutate({ id: o.id, action: 'REJECTED' })}>Reddet</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="m-surface-2" style={{ padding: 24, width: '100%', maxWidth: 440 }}>
            <h3 className="m-display" style={{ fontSize: 20, margin: '0 0 20px' }}>Teklif Ver</h3>
            <label className="m-label">Teklif tutarı (₺)</label>
            <input className="m-field" type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} placeholder={`Max: ${formatPrice(listing.price)}`} style={{ marginBottom: 12 }} />
            <label className="m-label">Mesaj (isteğe bağlı)</label>
            <textarea className="m-field" rows={3} value={offerMsg} onChange={e => setOfferMsg(e.target.value)} placeholder="Açıklama..." />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="m-btn m-btn-ghost" style={{ flex: 1 }} onClick={() => setShowOfferModal(false)}>Vazgeç</button>
              <button className="m-btn m-btn-primary" style={{ flex: 1 }} disabled={createOffer.isPending} onClick={handleOffer}>Teklif Gönder</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="m-surface-2" style={{ padding: 24, width: '100%', maxWidth: 440 }}>
            <h3 className="m-display" style={{ fontSize: 20, margin: '0 0 8px' }}>Satın Al</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 18 }}>Satıcı ile buluşarak nakit veya EFT ile ödeme yapacaksın.</p>
            <div style={{ background: 'color-mix(in oklch, var(--accent) 10%, var(--bg-1))', borderRadius: 10, padding: 16, marginBottom: 18, border: '1px solid color-mix(in oklch, var(--accent) 30%, transparent)' }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{listing.title}</p>
              <p className="m-price m-accent" style={{ fontSize: 22, marginTop: 4 }}>{formatPrice(listing.price)} ₺</p>
            </div>
            <label className="m-label">Buluşma notu (opsiyonel)</label>
            <input className="m-field" value={meetingNote} onChange={e => setMeetingNote(e.target.value)} placeholder="İstanbul / Pazar 15:00 gibi…" />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="m-btn m-btn-ghost" style={{ flex: 1 }} onClick={() => setShowOrderModal(false)}>Vazgeç</button>
              <button className="m-btn m-btn-primary" style={{ flex: 1 }} disabled={createOrder.isPending} onClick={handleBuyNow}>Siparişi Oluştur</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
