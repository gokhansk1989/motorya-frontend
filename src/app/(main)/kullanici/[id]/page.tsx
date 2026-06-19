'use client';
import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import {
  Star, MapPin, ShoppingBag, Calendar, BadgeCheck,
  Phone, Mail, ShieldCheck, Package, ChevronRight,
  UserPlus, UserMinus, UserX, Users, Zap, Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

function fmtMonthYear(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
}

function daysSince(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

function monthsSince(d: string) {
  const start = new Date(d);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
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
  const { user: me } = useAuthStore();
  const qc = useQueryClient();
  const [listingTab, setListingTab] = useState<'ACTIVE' | 'SOLD'>('ACTIVE');

  const { data: relation } = useQuery({
    queryKey: ['user-relation', id],
    queryFn: () => api.get(`/users/${id}/relation`).then(r => r.data),
    enabled: !!me && me.id !== id,
  });

  const followMutation = useMutation({
    mutationFn: () => api.post(`/users/${id}/follow`).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['user-relation', id] });
      toast.success(data.following ? 'Takip edildi' : 'Takipten çıkıldı');
    },
  });

  const blockMutation = useMutation({
    mutationFn: () => api.post(`/users/${id}/block`).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['user-relation', id] });
      qc.invalidateQueries({ queryKey: ['listings'] });
      toast.success(data.blocked ? 'Kullanıcı engellendi' : 'Engel kaldırıldı');
    },
  });

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

  // Backend'den gelen rozetler
  const badges: { key: string; label: string; icon: string; tier: 'gold' | 'silver' | 'blue' }[] = user.badges ?? [];
  const trustScore: number = user.trustScore ?? 0;
  const months = monthsSince(user.createdAt);

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

            {/* Rozetler */}
            {badges.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {badges.map((b: any) => {
                  const colors = b.tier === 'gold'
                    ? { color: '#b45309', bg: 'color-mix(in oklch, #f59e0b 12%, transparent)', border: 'color-mix(in oklch, #f59e0b 30%, transparent)' }
                    : b.tier === 'silver'
                    ? { color: 'var(--good)', bg: 'color-mix(in oklch, var(--good) 10%, transparent)', border: 'color-mix(in oklch, var(--good) 25%, transparent)' }
                    : { color: 'var(--accent)', bg: 'color-mix(in oklch, var(--accent) 10%, transparent)', border: 'color-mix(in oklch, var(--accent) 25%, transparent)' };
                  return (
                    <span key={b.key} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 700, color: colors.color,
                      background: colors.bg, border: `1px solid ${colors.border}`,
                      borderRadius: 99, padding: '3px 9px',
                    }}>
                      {b.icon} {b.label}
                    </span>
                  );
                })}
              </div>
            )}

            {user.bio && (
              <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6, marginTop: 4 }}>{user.bio}</p>
            )}
          </div>

          {/* Puan özeti + aksiyonlar */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-2)', borderRadius: 14, padding: '14px 20px', minWidth: 120, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 2 }}>
                <Star size={22} fill="var(--accent)" color="var(--accent)" />
                <span className="m-display" style={{ fontSize: 30, lineHeight: 1 }}>
                  {user.ratingAvg ? Number(user.ratingAvg).toFixed(1) : '—'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, marginBottom: 12 }}>{user.ratingCount ?? 0} değerlendirme</p>
              {/* Güven Skoru */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Güven Skoru</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: trustScore >= 70 ? 'var(--good)' : trustScore >= 40 ? '#f59e0b' : 'var(--ink-3)' }}>{trustScore}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99, transition: 'width .6s ease',
                    width: `${trustScore}%`,
                    background: trustScore >= 70 ? 'var(--good)' : trustScore >= 40 ? '#f59e0b' : 'var(--bad)',
                  }} />
                </div>
              </div>
            </div>

            {me && me.id !== id && (
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  style={{
                    flex: 1, height: 36, borderRadius: 8, border: '1px solid var(--line)',
                    background: relation?.isFollowing ? 'var(--bg-2)' : 'var(--accent)',
                    color: relation?.isFollowing ? 'var(--ink-2)' : '#fff',
                    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  {relation?.isFollowing ? <><UserMinus size={13} /> Takipten Çık</> : <><UserPlus size={13} /> Takip Et</>}
                </button>
                <button
                  onClick={() => {
                    if (!relation?.isBlocked && !confirm('Bu kullanıcıyı engellemek istediğinizden emin misiniz?')) return;
                    blockMutation.mutate();
                  }}
                  disabled={blockMutation.isPending}
                  title={relation?.isBlocked ? 'Engeli kaldır' : 'Engelle'}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: '1px solid var(--line)',
                    background: relation?.isBlocked ? 'color-mix(in oklch, var(--bad) 15%, transparent)' : 'var(--bg-1)',
                    color: relation?.isBlocked ? 'var(--bad)' : 'var(--ink-3)',
                    cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}
                >
                  <UserX size={15} />
                </button>
              </div>
            )}
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
                <Link key={l.id} href={`/ilan/${l.slug ?? l.id}`}
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
                    <Link href={`/ilan/${(r.order.listing as any).slug ?? r.order.listing.id}`}
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
