'use client';
import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import {
  Star, MapPin, ShoppingBag, Calendar, BadgeCheck,
  Phone, Mail, ShieldCheck, Package, ChevronRight,
} from 'lucide-react';

function fmtMonthYear(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
}

function daysSince(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

function StarBar({ rating, count }: { rating: number; count: number }) {
  const pct = count === 0 ? 0 : Math.round((count / count) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--ink-3)', width: 8 }}>{rating}</span>
      <Star size={11} fill="var(--accent)" color="var(--accent)" />
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--ink-3)', width: 20, textAlign: 'right' }}>{count}</span>
    </div>
  );
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [listingTab, setListingTab] = useState<'ACTIVE' | 'SOLD'>('ACTIVE');

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['public-user', id],
    queryFn: () => api.get(`/users/${id}`).then(r => r.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="m-wrap" style={{ maxWidth: 900, paddingTop: 36 }}>
        {[140, 80, 200].map((h, i) => (
          <div key={i} style={{ height: h, background: 'var(--bg-1)', borderRadius: 16, border: '1px solid var(--line)', marginBottom: 16, animation: 'pulse 1.5s ease infinite' }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="m-wrap" style={{ maxWidth: 900, paddingTop: 60, textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
        <h2 className="m-display" style={{ fontSize: 22, marginBottom: 8 }}>Kullanıcı bulunamadı</h2>
        <p style={{ color: 'var(--ink-3)', marginBottom: 24 }}>Bu kullanıcı mevcut değil veya hesabı kapatılmış olabilir.</p>
        <Link href="/" className="m-btn m-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', height: 44, padding: '0 24px' }}>
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const activeListings = (user.listings ?? []).filter((l: any) => l.status === 'ACTIVE');
  const soldListings = (user.listings ?? []).filter((l: any) => l.status === 'SOLD');
  const reviews: any[] = user.reviewsReceived ?? [];

  // Yıldız dağılımı
  const starCounts = [5, 4, 3, 2, 1].map(s => ({
    rating: s,
    count: reviews.filter((r: any) => r.rating === s).length,
  }));

  // Doğrulama rozetleri
  const badges = [
    { label: 'E-posta Doğrulı', icon: <Mail size={12} />, active: !!user.emailVerifiedAt },
    { label: 'Telefon Doğrulı', icon: <Phone size={12} />, active: !!user.phoneVerifiedAt },
    { label: 'Kimlik Doğrulı', icon: <ShieldCheck size={12} />, active: !!user.identityVerifiedAt },
    { label: 'Kurucu Üye', icon: <BadgeCheck size={12} />, active: !!user.isFounder },
  ].filter(b => b.active);

  const displayedListings = listingTab === 'ACTIVE' ? activeListings : soldListings;

  return (
    <div className="m-wrap" style={{ maxWidth: 900, paddingTop: 28, paddingBottom: 56 }}>

      {/* ── Profil başlığı ── */}
      <div className="m-surface" style={{ padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
            background: 'color-mix(in oklch, var(--accent) 15%, var(--bg-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, fontWeight: 700, color: 'var(--accent)', overflow: 'hidden',
          }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : user.displayName?.[0]?.toUpperCase()}
          </div>

          {/* Bilgiler */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="m-display" style={{ fontSize: 24, margin: '0 0 6px' }}>{user.displayName}</h1>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: 'var(--ink-3)', fontSize: 13, marginBottom: 10 }}>
              {user.city && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> {user.city}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShoppingBag size={13} /> {user.salesCount ?? 0} satış
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} /> {fmtMonthYear(user.createdAt)} üyesi · {daysSince(user.createdAt)} gündür aktif
              </span>
            </div>

            {/* Doğrulama rozetleri */}
            {badges.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {badges.map(b => (
                  <span key={b.label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 600, color: 'var(--good)',
                    background: 'color-mix(in oklch, var(--good) 10%, transparent)',
                    border: '1px solid color-mix(in oklch, var(--good) 25%, transparent)',
                    borderRadius: 99, padding: '3px 9px',
                  }}>
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            )}

            {user.bio && (
              <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6, marginTop: 4 }}>{user.bio}</p>
            )}
          </div>

          {/* Puan özeti */}
          <div style={{
            flexShrink: 0, textAlign: 'center',
            background: 'var(--bg-2)', borderRadius: 14, padding: '14px 20px',
            minWidth: 110,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 2 }}>
              <Star size={22} fill="var(--accent)" color="var(--accent)" />
              <span className="m-display" style={{ fontSize: 30, lineHeight: 1 }}>
                {user.ratingAvg ? Number(user.ratingAvg).toFixed(1) : '—'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{user.ratingCount ?? 0} değerlendirme</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

        {/* ── İlanlar ── */}
        <section>
          {/* Sekme başlıkları */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid var(--line-soft)', paddingBottom: 0 }}>
            {([
              { key: 'ACTIVE', label: 'Aktif İlanlar', count: activeListings.length, icon: <Package size={14} /> },
              { key: 'SOLD',   label: 'Satıldı',        count: soldListings.length,  icon: <ShoppingBag size={14} /> },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setListingTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', background: 'none', cursor: 'pointer',
                  border: 'none', borderBottom: `2px solid ${listingTab === t.key ? 'var(--accent)' : 'transparent'}`,
                  color: listingTab === t.key ? 'var(--ink)' : 'var(--ink-3)',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                  marginBottom: -1, transition: 'color 0.15s',
                }}>
                {t.icon}
                {t.label}
                <span style={{
                  fontSize: 11, fontWeight: 700, minWidth: 18, height: 18,
                  background: listingTab === t.key ? 'var(--accent)' : 'var(--bg-2)',
                  color: listingTab === t.key ? 'var(--accent-ink)' : 'var(--ink-3)',
                  borderRadius: 99, display: 'grid', placeItems: 'center', padding: '0 5px',
                }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {displayedListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)', fontSize: 14 }}>
              {listingTab === 'ACTIVE' ? 'Aktif ilan yok' : 'Henüz satış yapılmamış'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12 }}>
              {displayedListings.map((l: any) => (
                <Link key={l.id} href={`/ilan/${l.id}`}
                  style={{ textDecoration: 'none', display: 'block', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--bg-1)' }}>
                  <div style={{ height: 130, background: 'var(--bg-2)', overflow: 'hidden', position: 'relative' }}>
                    {l.images?.[0]
                      ? <img src={l.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>
                    }
                    {listingTab === 'SOLD' && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '3px 10px', borderRadius: 99 }}>SATILDI</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{
                      fontSize: 12, color: 'var(--ink-2)', marginBottom: 5,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                      lineHeight: 1.4,
                    }}>
                      {l.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{formatPrice(l.price)}</p>
                      {l.city && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{l.city}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Değerlendirmeler ── */}
        {reviews.length > 0 && (
          <section>
            <h2 className="m-display" style={{ fontSize: 17, marginBottom: 16 }}>
              Değerlendirmeler
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, marginBottom: 20, alignItems: 'center' }}>
              {/* Büyük puan */}
              <div style={{ textAlign: 'center' }}>
                <div className="m-display" style={{ fontSize: 48, lineHeight: 1 }}>
                  {Number(user.ratingAvg).toFixed(1)}
                </div>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', margin: '6px 0 4px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14}
                      fill={i < Math.round(user.ratingAvg) ? 'var(--accent)' : 'var(--line)'}
                      color={i < Math.round(user.ratingAvg) ? 'var(--accent)' : 'var(--line)'} />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>{reviews.length} değerlendirme</p>
              </div>

              {/* Bar grafik */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                {starCounts.map(({ rating, count }) => {
                  const pct = reviews.length === 0 ? 0 : Math.round((count / reviews.length) * 100);
                  return (
                    <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-3)', width: 8 }}>{rating}</span>
                      <Star size={11} fill="var(--accent)" color="var(--accent)" />
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-2)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)', width: 20, textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Yorum listesi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map((r: any) => (
                <div key={r.id} className="m-surface" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    {/* Yazar avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                      background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'var(--ink-3)',
                    }}>
                      {r.author?.avatarUrl
                        ? <img src={r.author.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : r.author?.displayName?.[0]?.toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.author?.displayName}</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12}
                              fill={i < r.rating ? 'var(--accent)' : 'var(--line)'}
                              color={i < r.rating ? 'var(--accent)' : 'var(--line)'} />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{r.comment}</p>
                      )}
                    </div>
                  </div>

                  {/* İlan thumbnail */}
                  {r.order?.listing && (
                    <Link href={`/ilan/${r.order.listing.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                        background: 'var(--bg-2)', borderRadius: 8, padding: '6px 10px',
                        marginTop: 4,
                      }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-3)' }}>
                        {r.order.listing.images?.[0]
                          ? <img src={r.order.listing.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
                        }
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--ink-3)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {r.order.listing.title}
                      </p>
                      <ChevronRight size={13} color="var(--ink-3)" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
