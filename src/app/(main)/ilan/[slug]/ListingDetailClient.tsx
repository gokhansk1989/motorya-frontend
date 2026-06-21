'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useListingBySlug, useToggleFavorite, useSimilarListings, useListingsByIds, useMarkSold, useReserveListing, useUnreserveListing, usePriceGuide } from '@/hooks/useListings';
import { useCreateOffer, useListingOffers, useRespondOffer, useCounterOffer } from '@/hooks/useOffers';
import { useAuthStore } from '@/store/auth';
import { formatPrice, timeAgo } from '@/lib/utils';
import { MapPin, Eye, Heart, Star, ChevronLeft, ChevronRight, Shield, Truck, Users, Share2, Flag, MessageCircle, BellPlus } from 'lucide-react';
import { useStartConversation } from '@/hooks/useMessages';
import { trackListingView, useRecentlyViewedIds } from '@/hooks/useRecentlyViewed';
import { ListingCard } from '@/components/listings/ListingCard';
import { AdSlot } from '@/components/ui/AdSlot';
import { useCreateSavedSearch } from '@/hooks/useSavedSearches';
import toast from 'react-hot-toast';
import Link from 'next/link';

function ListingRow({ title, listings }: { title: string; listings: any[] }) {
  if (!listings || listings.length === 0) return null;
  return (
    <div style={{ marginTop: 32 }}>
      <h2 className="m-display" style={{ fontSize: 18, marginBottom: 14 }}>{title}</h2>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6, alignItems: 'flex-start' }}>
        {listings.map((l) => (
          <div key={l.id} style={{ width: 220, minWidth: 220, maxWidth: 220, flexShrink: 0 }}>
            <ListingCard listing={l} />
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: listing, isLoading } = useListingBySlug(slug);
  const id = listing?.id ?? '';
  const { data: offers } = useListingOffers(id);
  const { data: similarListings } = useSimilarListings(id);
  const createAlarm = useCreateSavedSearch();
  const recentIds = useRecentlyViewedIds(id);
  const { data: recentlyViewed } = useListingsByIds(recentIds);
  const { data: priceGuide } = usePriceGuide(listing?.categoryId, listing?.brandId ?? undefined);
  const markSold = useMarkSold();
  const reserveListing = useReserveListing();
  const unreserveListing = useUnreserveListing();
  const createOffer = useCreateOffer();
  const respondOffer = useRespondOffer();
  const counterOffer = useCounterOffer();
  const startConversation = useStartConversation();
  const [counterModal, setCounterModal] = useState<{ offerId: string; buyerAmount: number } | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  useEffect(() => {
    if (listing?.id) trackListingView(listing.id);
  }, [listing?.id]);

  const [imgIdx, setImgIdx] = useState(0);
  const galleryTouchX = useRef(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const toggleFavorite = useToggleFavorite();
  const favd = listing?.isFavorited ?? false;

  if (isLoading) return (
    <div className="m-wrap" style={{ paddingTop: 32, paddingBottom: 40 }}>
      <div className="m-detail-grid">
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

  const handleMarkSold = async () => {
    try {
      await markSold.mutateAsync(listing.id);
      toast.success('İlan satıldı olarak işaretlendi!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleReserve = async () => {
    try {
      await reserveListing.mutateAsync(listing.id);
      toast.success('İlan 48 saat rezerve edildi!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleUnreserve = async () => {
    try {
      await unreserveListing.mutateAsync(listing.id);
      toast.success('Rezervasyon kaldırıldı!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleOffer = async () => {
    if (!user) { toast.error('Teklif vermek için giriş yapmalısın'); router.push('/giris'); return; }
    try {
      await createOffer.mutateAsync({ listingId: listing.id, amount: parseFloat(offerAmount) });
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
    <div className={`m-wrap has-mobile-bar`} style={{ paddingBottom: 40 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)', fontSize: 12.5, padding: '20px 0 4px', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'var(--ink-3)' }}>Keşfet</Link>
        <ChevronRight size={13} style={{ opacity: 0.5 }} />
        {listing.category && <Link href={`/kategori/${listing.category.slug ?? listing.category.name.toLowerCase()}`} style={{ color: 'var(--ink-3)' }}>{listing.category.name}</Link>}
        {listing.category && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
        <span style={{ color: 'var(--ink-2)' }}>{listing.title}</span>
      </div>

      <div className="m-detail-grid">
        {/* LEFT — galeri + açıklama */}
        <div className="m-detail-left">
          {/* Gallery */}
          <div
            className="m-surface-2"
            style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', borderRadius: 'var(--radius)' }}
            onTouchStart={e => { galleryTouchX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              const dx = e.changedTouches[0].clientX - galleryTouchX.current;
              if (dx < -50) setImgIdx(i => Math.min(i + 1, images.length - 1));
              else if (dx > 50) setImgIdx(i => Math.max(i - 1, 0));
            }}
          >
            {images.length > 0 ? (
              <img src={images[imgIdx].url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
            <button
              onClick={async () => {
                const url = `${window.location.origin}/ilan/${id}`;
                const shareText = `${listing.title} — ${formatPrice(listing.price)} ₺`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: shareText, url });
                  } catch {
                    /* kullanıcı paylaşımı iptal etti */
                  }
                } else {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`, '_blank');
                }
              }}
              style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 8, background: 'oklch(0 0 0 / 0.5)', border: '1px solid oklch(1 0 0 / 0.12)', display: 'grid', placeItems: 'center', color: '#fff', backdropFilter: 'blur(6px)', cursor: 'pointer' }}>
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
              {listing.brand && (
                <Link href={`/ara?brandId=${listing.brand.id}`} className="m-chip" style={{ height: 30, fontSize: 12.5, textDecoration: 'none' }}>#{listing.brand.name}</Link>
              )}
              {listing.category && (
                <Link href={`/ara?categoryId=${listing.category.id}`} className="m-chip" style={{ height: 30, fontSize: 12.5, textDecoration: 'none' }}>#{listing.category.name}</Link>
              )}
              {listing.sizeLabel && (
                <Link href={`/ara?q=${encodeURIComponent(listing.sizeLabel)}`} className="m-chip" style={{ height: 30, fontSize: 12.5, textDecoration: 'none' }}>#{listing.sizeLabel}</Link>
              )}
              {listing.city && (
                <Link href={`/ara?city=${encodeURIComponent(listing.city)}`} className="m-chip" style={{ height: 30, fontSize: 12.5, textDecoration: 'none' }}>#{listing.city}</Link>
              )}
              {(listing.tags ?? []).map((tag: string) => (
                <Link key={tag} href={`/ara?q=${encodeURIComponent(tag)}`} className="m-chip" style={{ height: 30, fontSize: 12.5, textDecoration: 'none' }}>#{tag}</Link>
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
        <div className="m-detail-sticky m-detail-right" style={{ position: 'sticky', top: 88 }}>
          <div className="m-surface-2" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <ConditionPill condition={listing.condition} />
              <div>
                <button
                  onClick={() => user && toggleFavorite.mutate(id)}
                  style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg-1)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: favd ? 'var(--accent)' : 'var(--ink-2)' }}
                >
                  <Heart size={18} fill={favd ? 'currentColor' : 'none'} />
                </button>
                {!favd && user && (
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', marginTop: 4 }}>
                    Favorile → fiyat düşünce bildir
                  </p>
                )}
              </div>
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

            {/* Piyasa fiyatı */}
            {priceGuide && priceGuide.totalCount >= 3 && (priceGuide.sold?.avg || priceGuide.active?.avg) && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--bg-1)', border: '1px solid var(--line-soft)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>📊 Piyasa</span>
                {priceGuide.sold?.avg && (
                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                    Satış ort. <strong style={{ color: 'var(--good)' }}>{Math.round(priceGuide.sold.avg).toLocaleString('tr-TR')} ₺</strong>
                  </span>
                )}
                {priceGuide.active?.avg && (
                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                    Aktif ort. <strong>{Math.round(priceGuide.active.avg).toLocaleString('tr-TR')} ₺</strong>
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{priceGuide.totalCount} ilan</span>
              </div>
            )}

            {/* Delivery info */}
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-1)', border: '1.5px solid var(--line)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Truck size={17} style={{ color: 'var(--ink-2)' }} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Kargo</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Satıcıyla anlaşın</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-1)', border: '1.5px solid var(--line)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Users size={17} style={{ color: 'var(--ink-2)' }} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Yüz yüze</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Güvenli buluşma</span>
              </div>
            </div>

            {/* Actions */}
            {!isMine && listing.status === 'ACTIVE' && (
              <div className="m-buy-desktop-actions" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
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
            {!isMine && listing.status === 'RESERVED' && (
              <div style={{ marginTop: 18, padding: '14px 18px', borderRadius: 12, background: 'color-mix(in oklch, var(--accent) 8%, var(--bg-1))', border: '1.5px solid color-mix(in oklch, var(--accent) 30%, transparent)', fontSize: 14, fontWeight: 600, textAlign: 'center', color: 'var(--accent)' }}>
                🔒 Bu ilan geçici olarak rezerve edildi
              </div>
            )}
            {!isMine && listing.status === 'SOLD' && (
              <div style={{ marginTop: 18, padding: '14px 18px', borderRadius: 12, background: 'var(--bg-2)', border: '1.5px solid var(--line)', fontSize: 14, fontWeight: 600, textAlign: 'center', color: 'var(--ink-3)' }}>
                Bu ilan satılmıştır
              </div>
            )}
            {isMine && (
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {listing.status === 'ACTIVE' && (
                  <>
                    <button
                      className="m-btn m-btn-primary"
                      style={{ width: '100%' }}
                      disabled={markSold.isPending}
                      onClick={handleMarkSold}
                    >
                      Satıldı İşaretle
                    </button>
                    <button
                      className="m-btn m-btn-ghost"
                      style={{ width: '100%' }}
                      disabled={reserveListing.isPending}
                      onClick={handleReserve}
                    >
                      Rezerve Et (48 saat)
                    </button>
                  </>
                )}
                {listing.status === 'RESERVED' && (
                  <>
                    <button
                      className="m-btn m-btn-primary"
                      style={{ width: '100%' }}
                      disabled={markSold.isPending}
                      onClick={handleMarkSold}
                    >
                      Satıldı İşaretle
                    </button>
                    <button
                      className="m-btn m-btn-ghost"
                      style={{ width: '100%' }}
                      disabled={unreserveListing.isPending}
                      onClick={handleUnreserve}
                    >
                      Rezervasyonu Kaldır
                    </button>
                  </>
                )}
                {listing.status === 'SOLD' && (
                  <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-2)', fontSize: 14, fontWeight: 600, textAlign: 'center', color: 'var(--ink-3)' }}>
                    Bu ilan satıldı
                  </div>
                )}
                <Link href={`/ilanlarim/duzenle/${listing.id}`} className="m-btn m-btn-ghost block" style={{ width: '100%', display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
                  İlanı Düzenle
                </Link>
              </div>
            )}

            {/* Trust */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 18, padding: 14, background: 'var(--bg-1)', borderRadius: 10, border: '1px solid var(--line-soft)' }}>
              <Shield size={20} style={{ color: 'var(--accent-2)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Güvenli alışveriş</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
                  Satıcıyla mesajlaşarak buluşma yeri ve ödeme şeklini belirleyin. Ödemeyi teslimatta yapın — önceden yabancılara para göndermeyin.
                </div>
                <Link href="/sss" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
                  Sıkça sorulan sorular →
                </Link>
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

          {!isMine && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 12, fontSize: 12, color: 'var(--ink-3)' }}>
              <Flag size={13} />
              <button
                onClick={() => { if (!user) { toast.error('Şikayet etmek için giriş yapmalısın'); return; } setShowReportModal(true); }}
                style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', fontSize: 12 }}>
                Bu ilanı şikayet et
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fiyat Alarmı */}
      {!isMine && listing.category && (
        <div style={{ margin: '16px 0', padding: '14px 18px', background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <BellPlus size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 13.5, margin: '0 0 2px' }}>Bu kategoride benzer ilan çıkınca haber ver</p>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>{listing.category.name} kategorisinde yeni ilan yayınlandığında bildirim al.</p>
          </div>
          <button
            onClick={() => {
              if (!user) { toast.error('Alarm kurmak için giriş yapmalısın'); return; }
              createAlarm.mutate(
                { label: `${listing.category.name} Alarmı`, categoryId: listing.category.id },
                {
                  onSuccess: () => toast.success('Alarm kuruldu!'),
                  onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Alarm kurulamadı'),
                }
              );
            }}
            disabled={createAlarm.isPending}
            className="m-btn m-btn-primary"
            style={{ fontSize: 13, padding: '0 14px', height: 36, flexShrink: 0 }}>
            Alarm Kur
          </button>
        </div>
      )}

      <AdSlot
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DETAIL ?? ''}
        format="horizontal"
        style={{ margin: '16px 0' }}
      />

      <ListingRow title="Benzer ilanlar" listings={similarListings ?? []} />
      <ListingRow title="Son baktıkların" listings={recentlyViewed ?? []} />

      {/* Mobile bottom action bar */}
      {!isMine && listing.status === 'ACTIVE' && (
        <div className="m-mobile-bar">
          <button
            className="m-btn m-btn-ghost lg"
            style={{ flex: 1 }}
            onClick={() => {
              if (!user) { toast.error('Teklif vermek için giriş yapmalısın'); router.push('/giris'); return; }
              setShowOfferModal(true);
            }}
          >
            Teklif Ver
          </button>
          <button
            className="m-btn m-btn-primary lg"
            style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: 6 }}
            onClick={async () => {
              if (!user) { toast.error('Mesaj göndermek için giriş yapmalısın'); router.push('/giris'); return; }
              try {
                const conv = await startConversation.mutateAsync({ otherUserId: listing.seller.id, listingId: listing.id });
                router.push(`/mesajlarim?conv=${conv.id}`);
              } catch { toast.error('Mesaj başlatılamadı'); }
            }}
          >
            <MessageCircle size={15} />
            Mesaj Gönder
          </button>
        </div>
      )}

      {/* Seller's incoming offers */}
      {isMine && offers?.length > 0 && (
        <div className="m-surface" style={{ marginTop: 32, padding: '22px 24px' }}>
          <h2 className="m-display" style={{ fontSize: 18, margin: '0 0 16px' }}>Teklifler ({offers.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {offers.map((o: any) => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--line-soft)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{o.buyer.displayName}</span>
                    <span className={'m-badge ' + (o.status === 'PENDING' ? 'warn' : o.status === 'COUNTER_OFFERED' ? '' : o.status === 'ACCEPTED' ? 'good' : 'bad')}
                      style={o.status === 'COUNTER_OFFERED' ? { background: 'color-mix(in oklch, #8b5cf6 14%, transparent)', color: '#8b5cf6' } : {}}>
                      {o.status === 'PENDING' ? 'Bekliyor' : o.status === 'COUNTER_OFFERED' ? 'Karşı Teklif' : o.status === 'ACCEPTED' ? 'Kabul' : 'Reddedildi'}
                    </span>
                  </div>
                  <span className="m-accent" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{formatPrice(o.amount)} ₺</span>
                  {o.counterAmount && (
                    <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, marginTop: 2 }}>Karşı teklifiniz: {formatPrice(o.counterAmount)} ₺</div>
                  )}
                  {o.message && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{o.message}</p>}
                </div>
                {o.status === 'PENDING' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="m-btn sm m-btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13 }} onClick={() => respondOffer.mutate({ id: o.id, action: 'ACCEPTED' })}>Kabul</button>
                      <button className="m-btn sm m-btn-ghost" style={{ height: 36, padding: '0 14px', fontSize: 13 }} onClick={() => respondOffer.mutate({ id: o.id, action: 'REJECTED' })}>Reddet</button>
                    </div>
                    <button
                      style={{ fontSize: 12, color: '#8b5cf6', background: 'none', border: 0, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700 }}
                      onClick={() => { setCounterModal({ offerId: o.id, buyerAmount: Number(o.amount) }); setCounterAmount(''); setCounterMessage(''); }}
                    >
                      Karşı Teklif Yap
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="m-modal-wrap">
          <div className="m-surface-2 m-modal-sheet" style={{ padding: 24, width: '100%', maxWidth: 440 }}>
            <h3 className="m-display" style={{ fontSize: 20, margin: '0 0 20px' }}>Teklif Ver</h3>
            <label className="m-label">Teklif tutarı (₺)</label>
            <input className="m-field" type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} placeholder={`Max: ${formatPrice(listing.price)}`} style={{ marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="m-btn m-btn-ghost" style={{ flex: 1 }} onClick={() => setShowOfferModal(false)}>Vazgeç</button>
              <button className="m-btn m-btn-primary" style={{ flex: 1 }} disabled={createOffer.isPending} onClick={handleOffer}>Teklif Gönder</button>
            </div>
          </div>
        </div>
      )}


      {/* Counter Offer Modal */}
      {counterModal && (
        <div className="m-modal-wrap">
          <div className="m-surface-2 m-modal-sheet" style={{ padding: 24, width: '100%', maxWidth: 420 }}>
            <h3 className="m-display" style={{ fontSize: 20, margin: '0 0 6px' }}>Karşı Teklif Yap</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>
              Alıcı teklifi: <strong>{formatPrice(counterModal.buyerAmount)} ₺</strong> · İlan fiyatı: <strong>{formatPrice(listing.price)} ₺</strong>
            </p>
            <label className="m-label">Karşı teklif tutarı (₺)</label>
            <input
              className="m-field"
              type="number"
              value={counterAmount}
              onChange={e => setCounterAmount(e.target.value)}
              placeholder={`${counterModal.buyerAmount + 1} – ${Number(listing.price) - 1}`}
              style={{ marginBottom: 12 }}
            />
            <label className="m-label">Mesaj (opsiyonel)</label>
            <input className="m-field" value={counterMessage} onChange={e => setCounterMessage(e.target.value)} placeholder="Bu fiyat altına inemem çünkü…" />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="m-btn m-btn-ghost" style={{ flex: 1 }} onClick={() => setCounterModal(null)}>Vazgeç</button>
              <button
                className="m-btn m-btn-primary"
                style={{ flex: 1, background: '#8b5cf6', borderColor: '#8b5cf6' }}
                disabled={counterOffer.isPending}
                onClick={async () => {
                  const amt = parseFloat(counterAmount);
                  if (!amt || isNaN(amt)) { toast.error('Geçerli bir tutar girin'); return; }
                  try {
                    await counterOffer.mutateAsync({ id: counterModal.offerId, counterAmount: amt, counterMessage: counterMessage || undefined });
                    toast.success('Karşı teklif gönderildi!');
                    setCounterModal(null);
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Hata oluştu');
                  }
                }}
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="m-modal-wrap">
          <div className="m-surface-2 m-modal-sheet" style={{ padding: 24, width: '100%', maxWidth: 440 }}>
            {reportSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'color-mix(in oklch, var(--good) 12%, transparent)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                  <Flag size={24} style={{ color: 'var(--good)' }} />
                </div>
                <h3 className="m-display" style={{ fontSize: 18, margin: '0 0 8px' }}>Şikayet Alındı</h3>
                <p style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>Ekibimiz en kısa sürede inceleyecek. Katkın için teşekkürler.</p>
                <button className="m-btn m-btn-ghost" style={{ marginTop: 20, width: '100%' }} onClick={() => { setShowReportModal(false); setReportSent(false); setReportReason(''); setReportDesc(''); }}>Kapat</button>
              </div>
            ) : (
              <>
                <h3 className="m-display" style={{ fontSize: 20, margin: '0 0 6px' }}>İlanı Şikayet Et</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>Şikayet nedeninizi seçin, ekibimiz inceleyecek.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {[
                    'Sahte veya yanıltıcı ilan',
                    'Yasadışı ürün/hizmet',
                    'Kural ihlali (fiyat, kategori)',
                    'Dolandırıcılık şüphesi',
                    'Müstehcen içerik',
                    'Diğer',
                  ].map(r => (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1px solid ${reportReason === r ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 8, cursor: 'pointer', background: reportReason === r ? 'color-mix(in oklch, var(--accent) 7%, var(--bg-0))' : 'var(--bg-0)', transition: 'all .12s', fontSize: 13.5, color: 'var(--ink)' }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${reportReason === r ? 'var(--accent)' : 'var(--line)'}`, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                        {reportReason === r && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                      </span>
                      <input type="radio" name="reportReason" value={r} checked={reportReason === r} onChange={() => setReportReason(r)} style={{ display: 'none' }} />
                      {r}
                    </label>
                  ))}
                </div>
                <textarea
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                  rows={3}
                  placeholder="Açıklama ekleyin (opsiyonel)…"
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-0)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink)', fontSize: 13.5, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button className="m-btn m-btn-ghost" style={{ flex: 1 }} onClick={() => setShowReportModal(false)}>Vazgeç</button>
                  <button
                    className="m-btn m-btn-primary"
                    style={{ flex: 1 }}
                    disabled={!reportReason || reportLoading}
                    onClick={async () => {
                      if (!reportReason) return;
                      setReportLoading(true);
                      try {
                        const { api } = await import('@/lib/api');
                        const res = await api.post(`/listings/${id}/report`, { reason: reportReason, description: reportDesc || undefined });
                        if (res.data?.alreadyReported) {
                          toast.error('Bu ilanı daha önce şikayet ettiniz');
                          setShowReportModal(false);
                        } else {
                          setReportSent(true);
                        }
                      } catch {
                        toast.error('Şikayet gönderilemedi');
                      } finally {
                        setReportLoading(false);
                      }
                    }}
                  >
                    {reportLoading ? 'Gönderiliyor…' : 'Şikayet Gönder'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
