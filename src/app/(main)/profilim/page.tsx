'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import {
  User, Lock, Star, MapPin, Eye, EyeOff, ShoppingBag,
  ChevronDown, Palmtree, Heart, ChevronRight, Users, UserX,
  UserMinus, Camera, Bell, BellOff, Settings, Layers, Search, Trash2, ExternalLink,
  Package, BellPlus, PenSquare,
} from 'lucide-react';
import { IL_ILCE, ALL_CITIES } from '@/lib/il-ilce';

function savedSearchToUrl(s: { search?: string; categoryId?: string; city?: string; condition?: string; minPrice?: string; maxPrice?: string }) {
  const p = new URLSearchParams();
  if (s.search) p.set('q', s.search);
  if (s.categoryId) p.set('categoryId', s.categoryId);
  if (s.city) p.set('city', s.city);
  if (s.condition) p.set('condition', s.condition);
  if (s.minPrice) p.set('minPrice', s.minPrice);
  if (s.maxPrice) p.set('maxPrice', s.maxPrice);
  const qs = p.toString();
  return `/ara${qs ? `?${qs}` : ''}`;
}
import { useSavedSearches, useDeleteSavedSearch, useCreateSavedSearch } from '@/hooks/useSavedSearches';
import type { CreateSavedSearchInput } from '@/hooks/useSavedSearches';
import { useMyFavorites } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import Link from 'next/link';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  displayName: z.string().min(2, 'En az 2 karakter'),
  bio: z.string().max(200).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifrenizi girin'),
  newPassword: z.string().min(8, 'En az 8 karakter'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Şifreler eşleşmiyor', path: ['confirmPassword'] });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;
type Tab = 'profil' | 'ilanlarim' | 'favoriler' | 'alarmlar' | 'sosyal' | 'ayarlar';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profil', label: 'Profil', icon: <User size={15} /> },
  { id: 'ilanlarim', label: 'İlanlarım', icon: <Package size={15} /> },
  { id: 'favoriler', label: 'Favoriler', icon: <Heart size={15} /> },
  { id: 'alarmlar', label: 'Fiyat Alarmları', icon: <Bell size={15} /> },
  { id: 'sosyal', label: 'Sosyal', icon: <Users size={15} /> },
  { id: 'ayarlar', label: 'Ayarlar', icon: <Settings size={15} /> },
];

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Sıfır', LIKE_NEW: 'Sıfır Gibi', GOOD: 'İyi', FAIR: 'Makul', POOR: 'Kullanılmış',
};

function alarmToUrl(s: { search?: string; categoryId?: string; city?: string; condition?: string; minPrice?: string; maxPrice?: string }) {
  const p = new URLSearchParams();
  if (s.search) p.set('q', s.search);
  if (s.categoryId) p.set('categoryId', s.categoryId);
  if (s.city) p.set('city', s.city);
  if (s.condition) p.set('condition', s.condition);
  if (s.minPrice) p.set('minPrice', s.minPrice);
  if (s.maxPrice) p.set('maxPrice', s.maxPrice);
  const qs = p.toString();
  return `/ara${qs ? `?${qs}` : ''}`;
}

const card: React.CSSProperties = {
  background: 'var(--bg-1)', border: '1px solid var(--line)',
  borderRadius: 'var(--radius-m)', padding: 24, marginBottom: 16,
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--ink-2)', marginBottom: 7, fontFamily: 'var(--font-display)',
};

const inp = (err?: boolean): React.CSSProperties => ({
  width: '100%', height: 44, padding: '0 14px',
  background: 'var(--bg-0)', border: `1px solid ${err ? 'var(--bad)' : 'var(--line)'}`,
  borderRadius: 'var(--radius-s)', color: 'var(--ink)', fontSize: 14, outline: 'none',
});

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profil');
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { data: savedSearches } = useSavedSearches();
  const deleteSavedSearch = useDeleteSavedSearch();
  const createAlarm = useCreateSavedSearch();
  const [alarmShowForm, setAlarmShowForm] = useState(false);
  const [alarmForm, setAlarmForm] = useState<{ label: string; search: string; categoryId: string; minPrice: string; maxPrice: string; city: string }>({ label: '', search: '', categoryId: '', minPrice: '', maxPrice: '', city: '' });

  const { data: myListingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['my-listings-tab'],
    queryFn: () => api.get('/listings', { params: { userId: user?.id, limit: 50 } }).then(r => r.data.items ?? r.data),
    enabled: !!user?.id,
  });
  const myListings: any[] = Array.isArray(myListingsData) ? myListingsData : [];

  const { data: categoriesData = [] } = useQuery<{ id: string; name: string; parentId: string | null }[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then(r => r.data),
  });
  const l1Categories = (categoriesData as any[]).filter((c: any) => !c.parentId);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/users/me').then(r => r.data),
  });

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        displayName: profile.displayName ?? '',
        bio: profile.bio ?? '',
        city: profile.city ?? '',
        district: profile.district ?? '',
        avatarUrl: profile.avatarUrl ?? '',
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data: ProfileData) => api.patch('/users/me', data).then(r => r.data),
    onSuccess: (updated) => { setAuth(updated, token!); toast.success('Profil güncellendi'); },
    onError: () => toast.error('Güncellenemedi'),
  });

  const changePassword = useMutation({
    mutationFn: (data: PasswordData) => api.patch('/users/me/password', data),
    onSuccess: () => { toast.success('Şifre değiştirildi'); passwordForm.reset(); },
    onError: () => toast.error('Şifre değiştirilemedi'),
  });

  const qc = useQueryClient();

  const vacationMutation = useMutation({
    mutationFn: (enabled: boolean) => api.patch('/users/me/vacation', { enabled }).then(r => r.data),
    onMutate: (enabled) => {
      qc.setQueryData(['my-profile'], (old: any) => old ? { ...old, vacationMode: enabled } : old);
    },
    onSuccess: (data) => {
      if (data.vacationMode) toast.success(`Tatil modu açıldı. ${data.pausedCount} ilan pasife çekildi.`);
      else toast.success(`Tatil modu kapandı. ${data.restoredCount} ilan aktife alındı.`);
      qc.invalidateQueries({ queryKey: ['my-profile'] });
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: () => {
      toast.error('Tatil modu güncellenemedi');
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });

  const initials = profile?.displayName?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const { data: favoritesData } = useMyFavorites();
  const favorites = (Array.isArray(favoritesData) ? favoritesData : (favoritesData?.items ?? []));
  const favoritesTotal = Array.isArray(favoritesData) ? favoritesData.length : (favoritesData?.total ?? 0);

  const { data: followingData } = useQuery({
    queryKey: ['me-following'],
    queryFn: () => api.get('/users/me/following').then(r => r.data),
  });
  const following: any[] = Array.isArray(followingData) ? followingData : [];

  const { data: blockedData } = useQuery({
    queryKey: ['me-blocked'],
    queryFn: () => api.get('/users/me/blocked').then(r => r.data),
  });
  const blocked: any[] = Array.isArray(blockedData) ? blockedData : [];

  const unfollowMutation = useMutation({
    mutationFn: (id: string) => api.post(`/users/${id}/follow`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me-following'] }); toast.success('Takipten çıkıldı'); },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => api.post(`/users/${id}/block`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me-blocked'] }); qc.invalidateQueries({ queryKey: ['listings'] }); toast.success('Engel kaldırıldı'); },
  });

  const { permission, subscribed, subscribe, unsubscribe } = usePushNotifications();
  const [pushLoading, setPushLoading] = useState(false);

  const handlePushToggle = async () => {
    setPushLoading(true);
    try {
      if (permission === 'granted' && subscribed) {
        await unsubscribe();
        toast.success('Bildirimler kapatıldı');
      } else {
        const ok = await subscribe();
        if (ok) toast.success('Bildirimler açıldı');
        else if (permission === 'denied') toast.error('Tarayıcı bildirimlerine izin verin');
      }
    } finally {
      setPushLoading(false);
    }
  };

  const pushIsOn = permission === 'granted' && subscribed;

  const notificationPrefs = profile?.notificationPrefs ?? { offers: true, messages: true, priceDrops: true, listingStatus: true };

  const updateNotifPrefs = useMutation({
    mutationFn: (patch: Record<string, boolean>) => api.patch('/users/me/notification-prefs', patch).then(r => r.data),
    onMutate: (patch) => {
      qc.setQueryData(['my-profile'], (old: any) => old ? { ...old, notificationPrefs: { ...old.notificationPrefs, ...patch } } : old);
    },
    onError: () => {
      toast.error('Tercih güncellenemedi');
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });

  const NOTIF_CATEGORIES: { key: 'offers' | 'messages' | 'priceDrops' | 'listingStatus'; label: string }[] = [
    { key: 'offers', label: 'Teklif bildirimleri' },
    { key: 'messages', label: 'Mesaj bildirimleri' },
    { key: 'priceDrops', label: 'Fiyat düşüşü bildirimleri' },
    { key: 'listingStatus', label: 'İlan durumu bildirimleri' },
  ];

  return (
    <div className="m-wrap" style={{ maxWidth: 700, paddingTop: 36, paddingBottom: 60 }}>
      {/* Header summary */}
      {profile && (
        <div style={{ marginBottom: 28 }}>
          {/* Top row: avatar + name + public profile link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--bg-3)', border: '2px solid var(--line)', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{initials}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 className="m-display" style={{ fontSize: 20, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.displayName}</h1>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email}</p>
              {profile.city && (
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} />{profile.city}
                </p>
              )}
            </div>
            <Link href={`/kullanici/${profile.id}`} style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 10, border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }} title="Herkese açık profil">
              <Eye size={16} />
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 12, padding: '12px 0', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 4 }}>
                <Star size={13} style={{ color: '#f59e0b' }} />
                <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{profile.ratingAvg?.toFixed(1) ?? '—'}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>{profile.ratingCount ?? 0} yorum</p>
            </div>
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 12, padding: '12px 0', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 4 }}>
                <ShoppingBag size={13} style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{profile.salesCount ?? 0}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>satış</p>
            </div>
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 12, padding: '12px 0', textAlign: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)', color: (profile.trustScore ?? 0) >= 70 ? 'var(--good)' : (profile.trustScore ?? 0) >= 40 ? '#f59e0b' : 'var(--ink-3)' }}>
                {(profile.trustScore ?? 0) > 0 ? profile.trustScore : '—'}
              </span>
              <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>güven</p>
            </div>
          </div>

          {/* Rozetler */}
          {(profile.badges ?? []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {(profile.badges as any[]).map((b: any) => {
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
        </div>
      )}

      {/* Tab bar — horizontal scroll on mobile; overflowY+touchAction yatay eksene kilitler,
          aksi halde dokunmatik kaydırma sırasında sayfa da dikey zıplıyordu */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--line)', overflowX: 'auto', overflowY: 'hidden', touchAction: 'pan-x', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '10px 14px', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-display)', cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--ink-3)',
              marginBottom: -1, transition: 'color .12s', whiteSpace: 'nowrap',
            }}
          >
            {t.icon}{t.label}
            {t.id === 'ilanlarim' && myListings.length > 0 && (
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 20, fontWeight: 700 }}>
                {myListings.length}
              </span>
            )}
            {t.id === 'favoriler' && favoritesTotal > 0 && (
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 20, fontWeight: 700 }}>
                {favoritesTotal}
              </span>
            )}
            {t.id === 'alarmlar' && savedSearches && savedSearches.length > 0 && (
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 20, fontWeight: 700 }}>
                {savedSearches.length}
              </span>
            )}
            {t.id === 'sosyal' && following.length > 0 && (
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 20, fontWeight: 700 }}>
                {following.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: Profil ─────────────────────────────── */}
      {tab === 'profil' && (
        <>
          <div style={card}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 20 }}>
              <User size={16} style={{ color: 'var(--accent)' }} />Profil Bilgileri
            </p>
            <form onSubmit={profileForm.handleSubmit(d => updateProfile.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Ad Soyad</label>
                <input {...profileForm.register('displayName')} style={inp(!!profileForm.formState.errors.displayName)} />
                {profileForm.formState.errors.displayName && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--bad)', fontFamily: 'var(--font-mono)' }}>{profileForm.formState.errors.displayName.message}</p>}
              </div>
              <div>
                <label style={lbl}>Hakkımda <span style={{ fontWeight: 400, opacity: 0.5 }}>opsiyonel</span></label>
                <textarea {...profileForm.register('bio')} rows={3} style={{ ...inp(), height: 'auto', padding: '10px 14px', resize: 'vertical' }} placeholder="Kendinizden kısaca bahsedin…" />
              </div>
              <div className="m-grid-1-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={lbl}>İl</label>
                    <div style={{ position: 'relative' }}>
                      <select {...profileForm.register('city', { onChange: () => profileForm.setValue('district', '') })} style={{ ...inp(), paddingRight: 36, appearance: 'none' }}>
                        <option value="">İl seçiniz</option>
                        {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>İlçe</label>
                    <div style={{ position: 'relative' }}>
                      <select {...profileForm.register('district')} disabled={!profileForm.watch('city')} style={{ ...inp(), paddingRight: 36, appearance: 'none' }}>
                        <option value="">{profileForm.watch('city') ? 'İlçe seçiniz' : 'İl seçiniz'}</option>
                        {(profileForm.watch('city') ? IL_ILCE[profileForm.watch('city') as string] ?? [] : []).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Profil Fotoğrafı</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-2)', border: '1px solid var(--line)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {profileForm.watch('avatarUrl') ? <img src={profileForm.watch('avatarUrl')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <User size={20} style={{ color: 'var(--ink-3)' }} />}
                    </div>
                    <label style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px dashed var(--line)', borderRadius: 'var(--radius-s)', cursor: avatarUploading ? 'not-allowed' : 'pointer', color: 'var(--ink-3)', fontSize: 13, background: 'var(--bg-0)', transition: 'border-color .14s' }}
                      onMouseEnter={e => !avatarUploading && (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}>
                      {avatarUploading ? <><span style={{ width: 14, height: 14, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Yükleniyor…</> : <><Camera size={15} /> Seç</>}
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={avatarUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setAvatarUploading(true);
                          try {
                            const fd = new FormData();
                            fd.append('files', file);
                            const res = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                            profileForm.setValue('avatarUrl', res.data.urls[0], { shouldDirty: true });
                          } catch {
                            toast.error('Fotoğraf yüklenemedi');
                          } finally {
                            setAvatarUploading(false);
                            e.target.value = '';
                          }
                        }} />
                    </label>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={updateProfile.isPending} className="m-btn m-btn-primary" style={{ height: 46, borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                {updateProfile.isPending ? <span style={{ width: 16, height: 16, border: '2px solid var(--accent-ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> : 'Kaydet'}
              </button>
            </form>
          </div>

          <div style={card}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 20 }}>
              <Lock size={16} style={{ color: 'var(--accent)' }} />Şifre Değiştir
            </p>
            <form onSubmit={passwordForm.handleSubmit(d => changePassword.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { field: 'currentPassword', label: 'Mevcut Şifre', show: showPwd, toggle: () => setShowPwd(v => !v) },
                { field: 'newPassword', label: 'Yeni Şifre', show: showNewPwd, toggle: () => setShowNewPwd(v => !v) },
                { field: 'confirmPassword', label: 'Şifre Tekrar', show: showNewPwd, toggle: () => setShowNewPwd(v => !v) },
              ].map(({ field, label: lbTxt, show, toggle }) => (
                <div key={field}>
                  <label style={lbl}>{lbTxt}</label>
                  <div style={{ position: 'relative' }}>
                    <input {...passwordForm.register(field as any)} type={show ? 'text' : 'password'} style={{ ...inp(!!(passwordForm.formState.errors as any)[field]), paddingRight: 44 }} />
                    <button type="button" onClick={toggle} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--ink-3)', display: 'flex', padding: 0 }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {(passwordForm.formState.errors as any)[field] && (
                    <p style={{ marginTop: 5, fontSize: 12, color: 'var(--bad)', fontFamily: 'var(--font-mono)' }}>{(passwordForm.formState.errors as any)[field].message}</p>
                  )}
                </div>
              ))}
              <button type="submit" disabled={changePassword.isPending} className="m-btn m-btn-ghost" style={{ height: 46, borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                {changePassword.isPending ? <span style={{ width: 16, height: 16, border: '2px solid var(--ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> : 'Şifreyi Değiştir'}
              </button>
            </form>
          </div>
        </>
      )}

      {/* ── TAB: İlanlarım ──────────────────────────── */}
      {tab === 'ilanlarim' && (
        <div style={card}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            <Package size={16} style={{ color: 'var(--accent)' }} />İlanlarım
            {myListings.length > 0 && (
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{myListings.length}</span>
            )}
          </p>
          {listingsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: 64, background: 'var(--bg-2)', borderRadius: 10, opacity: 0.6 }} />)}
            </div>
          ) : myListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>
              <Package size={32} style={{ opacity: 0.2, marginBottom: 10 }} />
              <p style={{ fontSize: 14, marginBottom: 16 }}>Henüz ilan vermediniz</p>
              <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <Package size={14} /> İlan Ver
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {myListings.map((listing: any) => {
                const statusColor = listing.status === 'ACTIVE' ? 'var(--good)' : listing.status === 'SOLD' ? 'var(--ink-3)' : '#f59e0b';
                const statusBg = listing.status === 'ACTIVE' ? 'color-mix(in oklch, var(--good) 12%, transparent)' : listing.status === 'SOLD' ? 'var(--bg-3)' : 'color-mix(in oklch, #f59e0b 15%, transparent)';
                const statusLabel = listing.status === 'ACTIVE' ? 'Aktif' : listing.status === 'SOLD' ? 'Satıldı' : 'Beklemede';
                const thumb = listing.images?.[0]?.url ?? listing.imageUrl;
                return (
                  <div key={listing.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-2)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {thumb ? <img src={thumb} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <Package size={16} style={{ color: 'var(--ink-3)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{listing.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{Number(listing.price).toLocaleString('tr-TR')} ₺</span>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 20, background: statusBg, color: statusColor }}>{statusLabel}</span>
                      </div>
                    </div>
                    <Link href={`/ilanlarim/duzenle/${listing.id}`} style={{ flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-0)', color: 'var(--ink-3)', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <PenSquare size={12} /> Düzenle
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Favoriler ──────────────────────────── */}
      {tab === 'favoriler' && (
        <div style={card}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            <Heart size={16} style={{ color: 'var(--accent)' }} />Favorilerim
            {favoritesTotal > 0 && (
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{favoritesTotal}</span>
            )}
          </p>
          {favorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>
              <Heart size={32} style={{ opacity: 0.2, marginBottom: 10 }} />
              <p style={{ fontSize: 14 }}>Henüz favori eklemediniz</p>
              <Link href="/" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>İlanlara göz at</Link>
            </div>
          ) : (
            <>
              <div className="m-listing-grid">
                {favorites.map((listing: any) => (
                  <div key={listing.id} style={{ position: 'relative' }}>
                    <ListingCard listing={{ ...listing, isFavorited: true }} />
                    <button
                      onClick={() => {
                        setAlarmForm(f => ({ ...f, label: listing.title ?? 'İlan Alarmı', search: listing.title ?? '' }));
                        setAlarmShowForm(true);
                        setTab('alarmlar');
                      }}
                      title="Fiyat değişince haber ver"
                      style={{ position: 'absolute', bottom: 10, right: 10, height: 28, padding: '0 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-0)', color: 'var(--ink-3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}
                    >
                      <Bell size={11} /> Fiyat Alarmı Kur
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Fiyat Alarmları ─────────────────────── */}
      {tab === 'alarmlar' && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', margin: 0 }}>
              <Bell size={16} style={{ color: 'var(--accent)' }} />Fiyat Alarmlarım
              {savedSearches && savedSearches.length > 0 && (
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{savedSearches.length}</span>
              )}
            </p>
            <button
              onClick={() => setAlarmShowForm(s => !s)}
              style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid var(--accent)', background: 'color-mix(in oklch, var(--accent) 10%, transparent)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <BellPlus size={14} /> Alarm Kur
            </button>
          </div>

          {/* Alarm form */}
          {alarmShowForm && (
            <div style={{ background: 'var(--bg-0)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Yeni Alarm</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Alarm Adı *</label>
                  <input value={alarmForm.label} onChange={e => setAlarmForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="örn. Shoei kask 2000₺ altı" style={inp()} />
                </div>
                <div>
                  <label style={lbl}>Anahtar Kelime</label>
                  <input value={alarmForm.search} onChange={e => setAlarmForm(f => ({ ...f, search: e.target.value }))}
                    placeholder="Shoei, Alpinestars..." style={inp()} />
                </div>
                <div>
                  <label style={lbl}>Kategori</label>
                  <select value={alarmForm.categoryId} onChange={e => setAlarmForm(f => ({ ...f, categoryId: e.target.value }))} style={{ ...inp(), paddingRight: 14 }}>
                    <option value="">Tüm kategoriler</option>
                    {l1Categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Min Fiyat (₺)</label>
                  <input type="number" value={alarmForm.minPrice} onChange={e => setAlarmForm(f => ({ ...f, minPrice: e.target.value }))}
                    placeholder="0" style={inp()} />
                </div>
                <div>
                  <label style={lbl}>Max Fiyat (₺)</label>
                  <input type="number" value={alarmForm.maxPrice} onChange={e => setAlarmForm(f => ({ ...f, maxPrice: e.target.value }))}
                    placeholder="Üst sınır yok" style={inp()} />
                </div>
                <div>
                  <label style={lbl}>Şehir</label>
                  <input value={alarmForm.city} onChange={e => setAlarmForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="İstanbul, Ankara..." style={inp()} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setAlarmShowForm(false)} style={{ flex: 1, height: 40, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-1)', color: 'var(--ink-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>İptal</button>
                <button
                  onClick={() => {
                    if (!alarmForm.label.trim()) { toast.error('Alarm adı zorunlu'); return; }
                    createAlarm.mutate({
                      label: alarmForm.label,
                      search: alarmForm.search || undefined,
                      categoryId: alarmForm.categoryId || undefined,
                      minPrice: alarmForm.minPrice ? Number(alarmForm.minPrice) : undefined,
                      maxPrice: alarmForm.maxPrice ? Number(alarmForm.maxPrice) : undefined,
                      city: alarmForm.city || undefined,
                    } as CreateSavedSearchInput, {
                      onSuccess: () => {
                        toast.success('Alarm kuruldu!');
                        setAlarmShowForm(false);
                        setAlarmForm({ label: '', search: '', categoryId: '', minPrice: '', maxPrice: '', city: '' });
                      },
                      onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Alarm kurulamadı'),
                    });
                  }}
                  disabled={createAlarm.isPending}
                  style={{ flex: 1, height: 40, borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 13, fontWeight: 700, cursor: createAlarm.isPending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  {createAlarm.isPending ? <span style={{ width: 16, height: 16, border: '2px solid var(--accent-ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> : <><BellPlus size={14} /> Alarm Kur</>}
                </button>
              </div>
            </div>
          )}

          {/* Alarm listesi */}
          {!savedSearches || savedSearches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>
              <Bell size={40} style={{ opacity: 0.18, marginBottom: 12 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>Henüz alarm kurulmamış</p>
              <p style={{ fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Kriterlere uyan ilan yayınlandığında seni haberdar edelim.</p>
              {l1Categories.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>Popüler kategori alarmları:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {l1Categories.slice(0, 6).map((c: any) => (
                      <button key={c.id} onClick={() => {
                        setAlarmForm(f => ({ ...f, label: `${c.name} Alarmı`, categoryId: c.id }));
                        setAlarmShowForm(true);
                      }} style={{ height: 34, padding: '0 14px', borderRadius: 20, border: '1px solid var(--line)', background: 'var(--bg-0)', color: 'var(--ink-2)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                        + {c.name} alarmı
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {savedSearches.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'color-mix(in oklch, var(--accent) 14%, var(--bg-2))', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Bell size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <Link href={alarmToUrl(s)} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      {s.label} <ExternalLink size={11} style={{ opacity: 0.35, flexShrink: 0 }} />
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 3 }}>
                      {s.search && <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: 'var(--bg-2)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }}>🔍 {s.search}</span>}
                      {s.minPrice && <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: 'var(--bg-2)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }}>Min {Number(s.minPrice).toLocaleString('tr-TR')}₺</span>}
                      {s.maxPrice && <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: 'var(--bg-2)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }}>Max {Number(s.maxPrice).toLocaleString('tr-TR')}₺</span>}
                      {s.city && <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: 'var(--bg-2)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }}>📍 {s.city}</span>}
                      {s.condition && <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: 'var(--bg-2)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }}>{CONDITION_LABELS[s.condition] ?? s.condition}</span>}
                    </div>
                    {s.lastNotifiedAt && (
                      <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>Son eşleşme: {new Date(s.lastNotifiedAt).toLocaleDateString('tr-TR')}</p>
                    )}
                  </Link>
                  <button onClick={() => deleteSavedSearch.mutate(s.id)} disabled={deleteSavedSearch.isPending} title="Sil"
                    style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--bg-2)', color: 'var(--ink-3)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Sosyal ─────────────────────────────── */}
      {tab === 'sosyal' && (
        <>
          <div style={card}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 16 }}>
              <Users size={16} style={{ color: 'var(--accent)' }} />Takip Ettiklerim
              {following.length > 0 && <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{following.length}</span>}
            </p>
            {following.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', padding: '16px 0' }}>Henüz kimseyi takip etmiyorsunuz</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {following.map((u: any) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line-soft)' }}>
                    <Link href={`/kullanici/${u.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, textDecoration: 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>
                        {u.avatarUrl ? <img src={u.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : u.displayName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{u.displayName}</p>
                        {u.city && <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>{u.city}</p>}
                      </div>
                    </Link>
                    <button onClick={() => unfollowMutation.mutate(u.id)} disabled={unfollowMutation.isPending} style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-0)', color: 'var(--ink-3)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UserMinus size={12} /> Takipten Çık
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 16 }}>
              <UserX size={16} style={{ color: 'var(--bad)' }} />Engellediklerim
              {blocked.length > 0 && <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--bad) 12%, transparent)', color: 'var(--bad)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{blocked.length}</span>}
            </p>
            {blocked.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', padding: '16px 0' }}>Engellediğiniz kullanıcı yok</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {blocked.map((u: any) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'var(--ink-3)' }}>
                        {u.avatarUrl ? <img src={u.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : u.displayName?.[0]?.toUpperCase()}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>{u.displayName}</p>
                    </div>
                    <button onClick={() => unblockMutation.mutate(u.id)} disabled={unblockMutation.isPending} style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid color-mix(in oklch, var(--bad) 30%, transparent)', background: 'color-mix(in oklch, var(--bad) 8%, transparent)', color: 'var(--bad)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UserX size={12} /> Engeli Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB: Ayarlar ────────────────────────────── */}
      {tab === 'ayarlar' && (
        <>
          {/* Bildirim Ayarları */}
          <div style={card}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 20 }}>
              <Bell size={16} style={{ color: 'var(--accent)' }} />Bildirim Ayarları
            </p>

            {/* Push toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {pushIsOn ? <Bell size={14} style={{ color: 'var(--good)' }} /> : <BellOff size={14} style={{ color: 'var(--ink-3)' }} />}
                  Tarayıcı Bildirimleri
                </p>
                <p style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
                  {permission === 'denied'
                    ? 'Tarayıcı izni engellendi. Tarayıcı site ayarlarından izin verin.'
                    : pushIsOn
                      ? 'Fiyat düşüşü, teklif ve mesaj bildirimleri açık.'
                      : 'Teklif, mesaj ve fiyat düşüşlerinden anında haberdar ol.'}
                </p>
              </div>
              {permission === 'unsupported' ? (
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', flexShrink: 0 }}>Desteklenmiyor</span>
              ) : (
                <button
                  onClick={handlePushToggle}
                  disabled={pushLoading || permission === 'denied'}
                  style={{
                    flexShrink: 0, width: 52, height: 28, borderRadius: 14, border: 'none',
                    cursor: (pushLoading || permission === 'denied') ? 'not-allowed' : 'pointer',
                    background: pushIsOn ? 'var(--accent)' : 'var(--bg-3)',
                    position: 'relative', transition: 'background .2s',
                    opacity: permission === 'denied' ? 0.5 : 1,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: pushIsOn ? 26 : 3,
                    width: 22, height: 22, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 4px oklch(0 0 0 / 0.25)',
                    transition: 'left .2s',
                  }} />
                </button>
              )}
            </div>

            {/* Kategori bazlı push tercihleri — her biri ayrı, sunucuya kaydedilir */}
            {NOTIF_CATEGORIES.map(({ key, label }) => {
              const isOn = notificationPrefs[key] !== false;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <p style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{label}</p>
                  <button
                    disabled={!pushIsOn}
                    onClick={() => updateNotifPrefs.mutate({ [key]: !isOn })}
                    title={!pushIsOn ? 'Önce tarayıcı bildirimlerini açın' : undefined}
                    style={{
                      fontSize: 11.5, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 10px', borderRadius: 20,
                      border: 'none', cursor: pushIsOn ? 'pointer' : 'not-allowed', opacity: pushIsOn ? 1 : 0.5,
                      background: isOn ? 'color-mix(in oklch, var(--good) 12%, transparent)' : 'var(--bg-2)',
                      color: isOn ? 'var(--good)' : 'var(--ink-3)',
                    }}>
                    {isOn ? 'Açık' : 'Kapalı'}
                  </button>
                </div>
              );
            })}

            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 14, lineHeight: 1.6 }}>
              Uygulama içi bildirimler her zaman aktiftir. Tarayıcı bildirimleri yalnızca sitenin açık olmadığı anlarda çalışır.
            </p>
          </div>

          {/* Kayıtlı Aramalar */}
          <div style={card}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 16 }}>
              <Search size={16} style={{ color: 'var(--accent)' }} />Kayıtlı Aramalarım
            </p>
            {!savedSearches || savedSearches.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                Henüz kayıtlı arama yok. Arama sayfasında filtre uygulayıp "Bu aramayı kaydet"e tıkla — kriterlere uyan yeni ilan yayınlanınca haber verelim.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {savedSearches.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
                    <Link href={savedSearchToUrl(s)} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {s.label}
                        <ExternalLink size={11} style={{ opacity: 0.35, flexShrink: 0 }} />
                      </p>
                      <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                        {s.lastNotifiedAt ? `Son eşleşme: ${new Date(s.lastNotifiedAt).toLocaleDateString('tr-TR')}` : 'Henüz eşleşme yok'}
                      </p>
                    </Link>
                    <button
                      onClick={() => deleteSavedSearch.mutate(s.id)}
                      disabled={deleteSavedSearch.isPending}
                      title="Sil"
                      style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--bg-2)', color: 'var(--ink-3)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tatil Modu */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
                  <Palmtree size={16} style={{ color: profile?.vacationMode ? '#f59e0b' : 'var(--accent)' }} />
                  Tatil Modu
                  {profile?.vacationMode && (
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 20, background: 'color-mix(in oklch, #f59e0b 15%, transparent)', color: '#f59e0b' }}>AÇIK</span>
                  )}
                </p>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
                  {profile?.vacationMode
                    ? 'Tatil modundasın. Tüm aktif ilanların pasife çekildi; alıcılar seni bulamıyor.'
                    : 'Kargo gönderemeyeceğin dönemde tatil modunu aç. Tüm aktif ilanların otomatik olarak pasife çekilir, döndüğünde tek tıkla geri açılır.'}
                </p>
              </div>
              <button
                onClick={() => vacationMutation.mutate(!profile?.vacationMode)}
                disabled={vacationMutation.isPending || !profile}
                style={{
                  flexShrink: 0, height: 40, padding: '0 18px', borderRadius: 10, cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', transition: 'all .15s',
                  background: profile?.vacationMode ? 'color-mix(in oklch, var(--good) 15%, transparent)' : 'color-mix(in oklch, #f59e0b 15%, transparent)',
                  color: profile?.vacationMode ? 'var(--good)' : '#b45309',
                  border: profile?.vacationMode ? '1px solid color-mix(in oklch, var(--good) 30%, transparent)' : '1px solid color-mix(in oklch, #f59e0b 30%, transparent)',
                }}
              >
                {vacationMutation.isPending
                  ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  : profile?.vacationMode ? 'Tatilden Dön' : 'Tatile Git'}
              </button>
            </div>
          </div>

          {/* İlanlarım shortcut */}
          <Link href="/ilanlarim" style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              <Layers size={15} style={{ color: 'var(--accent)' }} />İlanlarımı Yönet
            </p>
            <ChevronRight size={16} style={{ color: 'var(--ink-3)' }} />
          </Link>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
