'use client';
import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import {
  Star, MapPin, ShoppingBag, Calendar,
  Package, ChevronRight,
  UserPlus, UserMinus, UserX, MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStartConversation } from '@/hooks/useMessages';

function fmtMonthYear(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user: me } = useAuthStore();
  const qc = useQueryClient();
  const [listingTab, setListingTab] = useState<'ACTIVE' | 'SOLD'>('ACTIVE');
  const startConversation = useStartConversation();

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
      <div className="m-wrap" style={{ maxWidth: 760, paddingTop: 36 }}>
        {[120, 100, 220].map((h, i) => (
          <div key={i} style={{ height: h, background: 'var(--bg-1)', borderRadius: 16, border: '1px solid var(--line)', marginBottom: 16, animation: 'pulse 1.5s ease infinite' }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="m-wrap" style={{ maxWidth: 760, paddingTop: 60, textAlign: 'center' }}>
        <img src="/icons/no-results.png" alt="" width={100} height={100} style={{ objectFit: 'contain', marginBottom: 12, opacity: 0.85 }} />
        <h2 className="m-display" style={{ fontSize: 22, marginBottom: 8 }}>Kullanıcı bulunamadı</h2>
        <p style={{ color: 'var(--ink-3)', marginBottom: 24 }}>Bu kullanıcı mevcut değil veya hesabı kapatılmış.</p>
        <Link href="/" className="m-btn m-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', height: 44, padding: '0 24px' }}>
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const activeListings = (user.listings ?? []).filter((l: any) => l.status === 'ACTIVE');
  const soldListings   = (user.listings ?? []).filter((l: any) => l.status === 'SOLD');
  const reviews: any[] = user.reviewsReceived ?? [];
  const badges: any[]  = user.badges ?? [];
  const trustScore: number = user.trustScore ?? 0;
  const displayedListings = listingTab === 'ACTIVE' ? activeListings : soldListings;

  const starCounts = [5, 4, 3, 2, 1].map(s => ({
    rating: s,
    count: reviews.filter((r: any) => r.rating === s).length,
  }));

  const isMe = me?.id === id;

  return (
    <div className="m-wrap" style={{ maxWidth: 760, paddingTop: 20, paddingBottom: 64 }}>

      {/* ── Profil başlığı ── */}
      <div className="m-surface" style={{ padding: '20px 18px', marginBottom: 16 }}>

        {/* Satır 1: Avatar + İsim + Aksiyon butonları */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
            background: 'color-mix(in oklch, var(--accent) 15%, var(--bg-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: 'var(--accent)', overflow: 'hidden',
          }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : user.displayName?.[0]?.toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="m-display" style={{ fontSize: 18, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.displayName}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, color: 'var(--ink-3)' }}>
              {user.city && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <MapPin size={11} />{user.city}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Calendar size={11} />{fmtMonthYear(user.createdAt)} üyesi
              </span>
            </div>
          </div>

          {/* Aksiyon butonları — sadece başka kullanıcının profilinde */}
          {me && !isMe && (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={relation?.isFollowing ? 'm-btn' : 'm-btn m-btn-primary'}
                style={{ height: 34, padding: '0 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
              >
                {relation?.isFollowing ? <><UserMinus size={13} /> Takipte</> : <><UserPlus size={13} /> Takip</>}
              </button>
              <button
                onClick={() => {
                  if (!relation?.isBlocked && !confirm('Bu kullanıcıyı engellemek istediğinizden emin misiniz?')) return;
                  blockMutation.mutate();
                }}
                disabled={blockMutation.isPending}
                title={relation?.isBlocked ? 'Engeli kaldır' : 'Engelle'}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: '1px solid var(--line)',
                  background: relation?.isBlocked ? 'color-mix(in oklch, var(--bad) 15%, transparent)' : 'var(--bg-1)',
                  color: relation?.isBlocked ? 'var(--bad)' : 'var(--ink-3)',
                  cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
                }}
              >
                <UserX size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Satır 2: Stats grid — 3 kart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: badges.length > 0 || user.bio ? 14 : 0 }}>
          <div style={{ background: 'var(--bg-2)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center', marginBottom: 3 }}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)' }}>
                {user.ratingAvg ? Number(user.ratingAvg).toFixed(1) : '—'}
              </span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--ink-3)' }}>{user.ratingCount ?? 0} yorum</p>
          </div>

          <div style={{ background: 'var(--bg-2)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center', marginBottom: 3 }}>
              <ShoppingBag size={13} style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)' }}>{user.salesCount ?? 0}</span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--ink-3)' }}>satış</p>
          </div>

          <div style={{ background: 'var(--bg-2)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ marginBottom: 3 }}>
              <span style={{
                fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)',
                color: trustScore >= 70 ? 'var(--good)' : trustScore >= 40 ? '#f59e0b' : 'var(--ink-3)',
              }}>
                {trustScore > 0 ? trustScore : '—'}
              </span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--ink-3)' }}>güven</p>
            {trustScore > 0 && (
              <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 99, overflow: 'hidden', marginTop: 5, marginLeft: 8, marginRight: 8 }}>
                <div style={{ height: '100%', width: `${trustScore}%`, borderRadius: 99, background: trustScore >= 70 ? 'var(--good)' : '#f59e0b' }} />
              </div>
            )}
          </div>
        </div>

        {/* Mesaj gönder butonu — tam genişlik */}
        {me && !isMe && (
          <button
            onClick={() => startConversation.mutate({ otherUserId: id }, {
              onError: () => toast.error('Mesaj başlatılamadı'),
            })}
            disabled={startConversation.isPending}
            className="m-btn"
            style={{ width: '100%', height: 40, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: badges.length > 0 || user.bio ? 14 : 0 }}
          >
            <MessageCircle size={15} /> Mesaj Gönder
          </button>
        )}

        {/* Rozetler */}
        {badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: user.bio ? 12 : 0 }}>
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

        {/* Bio */}
        {user.bio && (
          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>{user.bio}</p>
        )}
      </div>

      {/* ── İlanlar ── */}
      <div className="m-surface" style={{ padding: '16px 16px', marginBottom: 16 }}>
        {/* Sekme başlıkları */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--line-soft)', paddingBottom: 0 }}>
          {([
            { key: 'ACTIVE', label: 'Aktif', count: activeListings.length, icon: <Package size={13} /> },
            { key: 'SOLD',   label: 'Satıldı', count: soldListings.length,  icon: <ShoppingBag size={13} /> },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setListingTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', background: 'none', cursor: 'pointer',
                border: 'none', borderBottom: `2px solid ${listingTab === t.key ? 'var(--accent)' : 'transparent'}`,
                color: listingTab === t.key ? 'var(--ink)' : 'var(--ink-3)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
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
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink-3)', fontSize: 14 }}>
            {listingTab === 'ACTIVE' ? 'Aktif ilan yok' : 'Henüz satış yapılmamış'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 160px))', gap: 10, justifyContent: 'center' }}>
            {displayedListings.map((l: any) => (
              <Link key={l.id} href={`/ilan/${l.slug ?? l.id}`}
                style={{ textDecoration: 'none', display: 'block', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line-soft)', background: 'var(--bg-1)' }}>
                <div style={{ height: 110, background: 'var(--bg-2)', overflow: 'hidden', position: 'relative' }}>
                  {l.images?.[0]
                    ? <img src={l.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <img src="/icons/empty-listing.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                  }
                  {listingTab === 'SOLD' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'oklch(0 0 0 / 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'oklch(0 0 0 / 0.5)', padding: '2px 8px', borderRadius: 99 }}>SATILDI</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <p style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, lineHeight: 1.4 }}>
                    {l.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{formatPrice(l.price)}</p>
                    {l.city && <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>{l.city}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Değerlendirmeler ── */}
      {reviews.length > 0 && (
        <div className="m-surface" style={{ padding: '16px 16px' }}>
          <h2 className="m-display" style={{ fontSize: 16, marginBottom: 16 }}>
            Değerlendirmeler
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-3)', marginLeft: 8 }}>({reviews.length})</span>
          </h2>

          {/* Özet: büyük puan + yıldız barları */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div className="m-display" style={{ fontSize: 40, lineHeight: 1 }}>{Number(user.ratingAvg).toFixed(1)}</div>
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', margin: '6px 0 4px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13}
                    fill={i < Math.round(user.ratingAvg) ? '#f59e0b' : 'var(--line)'}
                    color={i < Math.round(user.ratingAvg) ? '#f59e0b' : 'var(--line)'} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>{reviews.length} yorum</p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {starCounts.map(({ rating, count }) => {
                const pct = reviews.length === 0 ? 0 : Math.round((count / reviews.length) * 100);
                return (
                  <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)', width: 8 }}>{rating}</span>
                    <Star size={10} fill="#f59e0b" color="#f59e0b" />
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--bg-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#f59e0b', borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--ink-3)', width: 18, textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Yorum listesi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reviews.map((r: any) => (
              <div key={r.id} style={{ padding: '12px 14px', background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 12 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: r.order?.listing ? 10 : 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--ink-3)' }}>
                    {r.author?.avatarUrl
                      ? <img src={r.author.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : r.author?.displayName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.author?.displayName}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11}
                            fill={i < r.rating ? '#f59e0b' : 'var(--line)'}
                            color={i < r.rating ? '#f59e0b' : 'var(--line)'} />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{r.comment}</p>
                    )}
                  </div>
                </div>

                {r.order?.listing && (
                  <Link href={`/ilan/${(r.order.listing as any).slug ?? r.order.listing.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: 'var(--bg-2)', borderRadius: 8, padding: '6px 8px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-3)' }}>
                      {r.order.listing.images?.[0]
                        ? <img src={r.order.listing.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : <img src="/icons/empty-listing.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                      }
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {r.order.listing.title}
                    </p>
                    <ChevronRight size={12} color="var(--ink-3)" style={{ flexShrink: 0 }} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}
