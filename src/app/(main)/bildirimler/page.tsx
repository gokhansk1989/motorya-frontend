'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import {
  Bell, CheckCheck, Package, Tag, MessageCircle,
  Heart, UserPlus, Star, ArrowLeftRight, CheckCircle, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Notif = {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
  payload?: Record<string, string>;
};

const TYPE_META: Record<string, { icon: any; color: string }> = {
  'listing.pending':          { icon: Package,         color: 'var(--warn)' },
  'listing.approved':         { icon: Package,         color: 'var(--good)' },
  'listing.rejected':         { icon: Package,         color: 'var(--bad)' },
  'listing.sold':             { icon: CheckCircle,     color: 'var(--good)' },
  'offer.received':           { icon: Tag,             color: 'var(--accent)' },
  'offer.accepted':           { icon: Tag,             color: 'var(--good)' },
  'offer.rejected':           { icon: Tag,             color: 'var(--bad)' },
  'offer.countered':          { icon: ArrowLeftRight,  color: 'var(--warn)' },
  'offer.counter_accepted':   { icon: CheckCircle,     color: 'var(--good)' },
  'offer.counter_rejected':   { icon: XCircle,         color: 'var(--bad)' },
  'message.new':              { icon: MessageCircle,   color: 'var(--accent-2)' },
  'favorite.price_drop':      { icon: Heart,           color: 'var(--accent)' },
  'favorite.listing_sold':    { icon: Heart,           color: 'var(--ink-3)' },
  'follow.new':               { icon: UserPlus,        color: 'var(--accent-2)' },
  'review.new':               { icon: Star,            color: 'var(--warn)' },
};

function getNavTarget(n: Notif): string | null {
  const p = n.payload ?? {};
  switch (n.type) {
    case 'listing.pending':         return '/ilanlarim';
    case 'listing.approved':        return p.listingSlug ? `/ilan/${p.listingSlug}` : p.listingId ? `/ilan/${p.listingId}` : '/ilanlarim';
    case 'listing.rejected':        return p.listingId ? `/ilanlarim/duzenle/${p.listingId}` : '/ilanlarim';
    case 'listing.sold':            return p.listingSlug ? `/ilan/${p.listingSlug}` : '/ilanlarim';
    case 'offer.received':          return p.listingSlug ? `/ilan/${p.listingSlug}` : p.listingId ? `/ilan/${p.listingId}` : '/tekliflerim?tab=received';
    case 'offer.accepted':          return p.listingSlug ? `/ilan/${p.listingSlug}` : p.listingId ? `/ilan/${p.listingId}` : '/tekliflerim?tab=sent';
    case 'offer.rejected':          return p.listingSlug ? `/ilan/${p.listingSlug}` : p.listingId ? `/ilan/${p.listingId}` : '/tekliflerim?tab=sent';
    case 'offer.countered':         return p.listingSlug ? `/ilan/${p.listingSlug}` : p.listingId ? `/ilan/${p.listingId}` : '/tekliflerim?tab=sent';
    case 'offer.counter_accepted':  return p.listingSlug ? `/ilan/${p.listingSlug}` : '/tekliflerim?tab=received';
    case 'offer.counter_rejected':  return p.listingSlug ? `/ilan/${p.listingSlug}` : '/tekliflerim?tab=received';
    case 'message.new':             return p.conversationId ? `/mesajlarim?conv=${p.conversationId}` : '/mesajlarim';
    case 'favorite.price_drop':     return p.listingSlug ? `/ilan/${p.listingSlug}` : p.listingId ? `/ilan/${p.listingId}` : null;
    case 'favorite.listing_sold':   return '/';
    case 'follow.new':              return p.followerId ? `/kullanici/${p.followerId}` : null;
    case 'review.new':              return '/profilim';
    default:                        return null;
  }
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/users/me/notifications').then(r => r.data),
  });

  const markRead = useMutation({
    mutationFn: (ids?: string[]) => api.post('/users/me/notifications/read', ids ? { ids } : { all: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: Notif[] = data?.items ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  const handleClick = (n: Notif) => {
    if (!n.isRead) markRead.mutate([n.id]);
    const target = getNavTarget(n);
    if (target) router.push(target);
  };

  return (
    <div className="m-wrap" style={{ maxWidth: 680, paddingTop: 36, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 className="m-display" style={{ fontSize: 28, color: 'var(--ink)' }}>
          Bildirimler
          {unreadCount > 0 && (
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 500, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              {unreadCount} yeni
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={() => { markRead.mutate(undefined); toast.success('Tümü okundu'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', background: 'none', border: 0, cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}
          >
            <CheckCheck size={15} /> Tümünü okundu işaretle
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 72, background: 'var(--bg-1)', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Bell size={44} style={{ margin: '0 auto 12px', opacity: 0.2, color: 'var(--ink-3)' }} />
          <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink-2)' }}>Bildirim yok</p>
          <p style={{ fontSize: 13, marginTop: 4, color: 'var(--ink-3)' }}>İlan, teklif ve mesaj bildirimleri burada görünecek</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? { icon: Bell, color: 'var(--ink-3)' };
            const Icon = meta.icon;
            const clickable = !n.isRead || !!getNavTarget(n);
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
                  borderRadius: 12,
                  border: n.isRead ? '1px solid var(--line-soft)' : `1px solid color-mix(in oklch, var(--accent) 30%, transparent)`,
                  borderLeft: n.isRead ? '1px solid var(--line-soft)' : '3px solid var(--accent)',
                  background: n.isRead ? 'var(--bg-0)' : 'color-mix(in oklch, var(--accent) 7%, var(--bg-1))',
                  opacity: n.isRead ? 0.65 : 1,
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'background .15s, opacity .15s, transform .1s',
                }}
                onMouseEnter={e => { if (clickable) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  background: n.isRead ? 'var(--bg-2)' : 'color-mix(in oklch, var(--accent) 14%, transparent)',
                  filter: n.isRead ? 'grayscale(1)' : 'none',
                }}>
                  <Icon size={18} style={{ color: n.isRead ? 'var(--ink-3)' : meta.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: n.isRead ? 400 : 600, color: n.isRead ? 'var(--ink-2)' : 'var(--ink)', lineHeight: 1.4 }}>{n.title}</p>
                  {n.body && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.body}</p>}
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 8, flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
