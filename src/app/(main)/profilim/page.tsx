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
  UserMinus, Camera, Bell, BellOff, Settings, Layers, Search, Trash2,
} from 'lucide-react';
import { useSavedSearches, useDeleteSavedSearch } from '@/hooks/useSavedSearches';
import { useMyFavorites } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import Link from 'next/link';
import toast from 'react-hot-toast';

const CITIES = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya','Ardahan','Artvin',
  'Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur',
  'Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan',
  'Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul',
  'İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kilis','Kırıkkale','Kırklareli',
  'Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş',
  'Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Şanlıurfa','Siirt','Sinop',
  'Şırnak','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak',
];

const profileSchema = z.object({
  displayName: z.string().min(2, 'En az 2 karakter'),
  bio: z.string().max(200).optional(),
  city: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifrenizi girin'),
  newPassword: z.string().min(8, 'En az 8 karakter'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Şifreler eşleşmiyor', path: ['confirmPassword'] });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;
type Tab = 'profil' | 'favoriler' | 'sosyal' | 'ayarlar';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profil', label: 'Profil', icon: <User size={15} /> },
  { id: 'favoriler', label: 'Favoriler', icon: <Heart size={15} /> },
  { id: 'sosyal', label: 'Sosyal', icon: <Users size={15} /> },
  { id: 'ayarlar', label: 'Ayarlar', icon: <Settings size={15} /> },
];

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

  return (
    <div className="m-wrap" style={{ maxWidth: 700, paddingTop: 36, paddingBottom: 60 }}>
      {/* Header summary */}
      {profile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-3)', border: '2px solid var(--line)', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{initials}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="m-display" style={{ fontSize: 22, color: 'var(--ink)', margin: 0 }}>{profile.displayName}</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>{profile.email}</p>
            {profile.city && (
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} />{profile.city}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <Star size={13} style={{ color: '#f59e0b' }} />
                <span style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{profile.ratingAvg?.toFixed(1) ?? '—'}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{profile.ratingCount ?? 0} yorum</p>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <ShoppingBag size={13} style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{profile.salesCount ?? 0}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>satış</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--line)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-display)', cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--ink-3)',
              marginBottom: -1, transition: 'color .12s',
            }}
          >
            {t.icon}{t.label}
            {t.id === 'favoriler' && favoritesTotal > 0 && (
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 20, fontWeight: 700 }}>
                {favoritesTotal}
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
                <div>
                  <label style={lbl}>Şehir</label>
                  <div style={{ position: 'relative' }}>
                    <select {...profileForm.register('city')} style={{ ...inp(), paddingRight: 36, appearance: 'none' }}>
                      <option value="">Seçin…</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
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
              <Link href="/" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>İlanlara göz at →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {favorites.map((listing: any) => (
                <ListingCard key={listing.id} listing={{ ...listing, isFavorited: true }} />
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

            {/* Per-type status rows */}
            {['Teklif bildirimleri', 'Mesaj bildirimleri', 'Fiyat düşüşü bildirimleri', 'İlan durumu bildirimleri'].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <p style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{label}</p>
                <span style={{ fontSize: 11.5, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 10px', borderRadius: 20, background: pushIsOn ? 'color-mix(in oklch, var(--good) 12%, transparent)' : 'var(--bg-2)', color: pushIsOn ? 'var(--good)' : 'var(--ink-3)' }}>
                  {pushIsOn ? 'Açık' : 'Kapalı'}
                </span>
              </div>
            ))}

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
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                        {s.lastNotifiedAt ? `Son eşleşme: ${new Date(s.lastNotifiedAt).toLocaleDateString('tr-TR')}` : 'Henüz eşleşme yok'}
                      </p>
                    </div>
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
