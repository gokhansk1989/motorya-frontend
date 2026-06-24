'use client';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import {
  Bell, CheckCheck, Package, Tag, MessageCircle,
  Heart, UserPlus, Star, ArrowLeftRight, CheckCircle, XCircle, Search, Sparkles, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

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
  'listing.featured':         { icon: Sparkles,        color: 'var(--accent)' },
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
    case 'listing.featured':        return p.listingSlug ? `/ilan/${p.listingSlug}` : p.listingId ? `/ilan/${p.listingId}` : '/ilanlarim';
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

function PullIndicator({ y, refreshing }: { y: number; refreshing: boolean }) {
  if (y < 8 && !refreshing) return null;
  return (
    <div style={{
      position: 'fixed', top: 58, left: '50%', transform: `translateX(-50%) translateY(${Math.min(y, 48)}px)`,
      zIndex: 100, display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 20,
      padding: '6px 14px', fontSize: 12, color: 'var(--ink-2)', fontWeight: 600,
      boxShadow: '0 4px 16px oklch(0 0 0 / 0.12)', transition: 'transform .15s',
    }}>
      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: refreshing ? 'spin 0.6s linear infinite' : 'none', transform: refreshing ? 'none' : `rotate(${(y / 48) * 270}deg)` }} />
      {refreshing ? 'Yenileniyor…' : y > 40 ? 'Bırak' : 'Yenile'}
    </div>
  );
}

// Bildirimleri "Bugün / Bu Hafta / Daha Önce" başlıkları altında grupla — uzun listede taramayı kolaylaştırır.
function groupByDate(items: Notif[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const groups: { label: string; items: Notif[] }[] = [
    { label: 'Bugün', items: [] },
    { label: 'Bu Hafta', items: [] },
    { label: 'Daha Önce', items: [] },
  ];

  for (const n of items) {
    const d = new Date(n.createdAt);
    if (d >= startOfToday) groups[0].items.push(n);
    else if (d >= startOfWeek) groups[1].items.push(n);
    else groups[2].items.push(n);
  }

  return groups.filter(g => g.items.length > 0);
}

function NotificationRow({ n, onClick }: { n: Notif; onClick: (n: Notif) => void }) {
  const meta = TYPE_META[n.type] ?? { icon: Bell, color: 'var(--ink-3)' };
  const Icon = meta.icon;
  const clickable = !!getNavTarget(n) || !n.isRead;

  return (
    <div
      onClick={() => onClick(n)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
        borderRadius: 12,
        border: n.isRead ? '1px solid var(--line-soft)' : `1px solid color-mix(in oklch, var(--accent) 30%, transparent)`,
        borderLeft: n.isRead ? '1px solid var(--line-soft)' : '3px solid var(--accent)',
        background: n.isRead ? 'var(--bg-0)' : 'color-mix(in oklch, var(--accent) 7%, var(--bg-1))',
        opacity: n.isRead ? 0.65 : 1,
        cursor: clickable ? 'pointer' : 'default',
      }}
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
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => api.get('/users/me/notifications', { params: { page, limit } }).then(r => r.data),
  });

  const markRead = useMutation({
    mutationFn: (ids?: string[]) => api.post('/users/me/notifications/read', ids ? { ids } : { all: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { y, refreshing } = usePullToRefresh(() => { setPage(1); refetch(); });

  // Sayfa 1'den itibaren her "Daha fazla yükle" tıklamasıyla biriken liste.
  const [accumulated, setAccumulated] = useState<Notif[]>([]);
  const allItems: Notif[] = page === 1 ? (data?.items ?? []) : [...accumulated, ...(data?.items ?? [])];

  const handleLoadMore = () => {
    setAccumulated(allItems);
    setPage(p => p + 1);
  };

  const unreadCount = data?.meta?.unreadCount ?? 0;
  const total = data?.meta?.total ?? 0;
  const hasMore = allItems.length < total;

  const visibleItems = useMemo(
    () => tab === 'unread' ? allItems.filter(n => !n.isRead) : allItems,
    [allItems, tab]
  );
  const grouped = useMemo(() => groupByDate(visibleItems), [visibleItems]);

  const handleClick = (n: Notif) => {
    if (!n.isRead) markRead.mutate([n.id]);
    const target = getNavTarget(n);
    if (target) router.push(target);
  };

  return (
    <div className="m-wrap" style={{ maxWidth: 680, paddingTop: 36, paddingBottom: 60 }}>
      <PullIndicator y={y} refreshing={refreshing} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
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

      {/* Filtre sekmeleri */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['all', 'Tümü'], ['unread', 'Okunmamış']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="m-chip"
            style={{
              height: 34, fontSize: 13, border: 0,
              background: tab === key ? 'var(--accent)' : 'var(--bg-1)',
              color: tab === key ? '#fff' : 'var(--ink-2)',
            }}
          >
            {label}{key === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 72, background: 'var(--bg-1)', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--bg-2)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
            <Bell size={28} style={{ color: 'var(--ink-3)', opacity: 0.4 }} />
          </div>
          <p className="m-display" style={{ fontSize: 20, color: 'var(--ink-2)', marginBottom: 8 }}>
            {tab === 'unread' && total > 0 ? 'Okunmamış bildirim yok' : 'Bildirim yok'}
          </p>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 28 }}>
            {tab === 'unread' && total > 0 ? 'Tüm bildirimlerini okumuşsun.' : 'İlan, teklif ve mesaj bildirimleri burada görünecek'}
          </p>
          {total === 0 && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/ara" className="m-btn m-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Search size={16} /> İlanlara Göz At
              </Link>
              <Link href="/ilan-ver" className="m-btn" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                İlan Ver
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {grouped.map(group => (
            <div key={group.label}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                {group.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map(n => <NotificationRow key={n.id} n={n} onClick={handleClick} />)}
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isFetching}
              className="m-btn"
              style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {isFetching ? <Loader2 size={15} className="animate-spin" /> : null}
              Daha fazla yükle
            </button>
          )}
        </div>
      )}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
