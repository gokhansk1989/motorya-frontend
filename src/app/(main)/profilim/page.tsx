'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { User, Lock, Star, MapPin, Eye, EyeOff, ShoppingBag, ChevronDown, Palmtree } from 'lucide-react';

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
import toast from 'react-hot-toast';

const profileSchema = z.object({
  displayName: z.string().min(2, 'En az 2 karakter'),
  bio: z.string().max(200).optional(),
  city: z.string().optional(),
  avatarUrl: z.string().url('Geçerli URL girin').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifrenizi girin'),
  newPassword: z.string().min(8, 'En az 8 karakter'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Şifreler eşleşmiyor', path: ['confirmPassword'] });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

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
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

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
      if (data.vacationMode) {
        toast.success(`Tatil modu açıldı. ${data.pausedCount} ilan pasife çekildi.`);
      } else {
        toast.success(`Tatil modu kapandı. ${data.restoredCount} ilan aktife alındı.`);
      }
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

  return (
    <div className="m-wrap" style={{ maxWidth: 680, paddingTop: 36, paddingBottom: 60 }}>
      <h1 className="m-display" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 28 }}>Profilim</h1>

      {/* Profil kartı */}
      {profile && (
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-3)', border: '2px solid var(--line)', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{initials}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{profile.displayName}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{profile.email}</p>
            {profile.city && (
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} />{profile.city}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <Star size={14} style={{ color: '#f59e0b' }} />
                <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{profile.ratingAvg?.toFixed(1) ?? '—'}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{profile.ratingCount ?? 0} yorum</p>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <ShoppingBag size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{profile.salesCount ?? 0}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>satış</p>
            </div>
          </div>
        </div>
      )}

      {/* Profil güncelle */}
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
            <textarea
              {...profileForm.register('bio')}
              rows={3}
              style={{ ...inp(), height: 'auto', padding: '10px 14px', resize: 'vertical' }}
              placeholder="Kendinizden kısaca bahsedin…"
            />
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
              <label style={lbl}>Profil Fotoğrafı URL</label>
              <input {...profileForm.register('avatarUrl')} style={inp(!!profileForm.formState.errors.avatarUrl)} placeholder="https://…" />
            </div>
          </div>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="m-btn m-btn-primary"
            style={{ height: 46, borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
          >
            {updateProfile.isPending ? <span style={{ width: 16, height: 16, border: '2px solid var(--accent-ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> : 'Kaydet'}
          </button>
        </form>
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
                ? 'Tatil modundasın. Tüm aktif ilanlarına pasife çekildi; alıcılar seni bulamıyor.'
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

      {/* Şifre değiştir */}
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
                <input
                  {...passwordForm.register(field as any)}
                  type={show ? 'text' : 'password'}
                  style={{ ...inp(!!(passwordForm.formState.errors as any)[field]), paddingRight: 44 }}
                />
                <button type="button" onClick={toggle} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--ink-3)', display: 'flex', padding: 0 }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {(passwordForm.formState.errors as any)[field] && (
                <p style={{ marginTop: 5, fontSize: 12, color: 'var(--bad)', fontFamily: 'var(--font-mono)' }}>{(passwordForm.formState.errors as any)[field].message}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="m-btn m-btn-ghost"
            style={{ height: 46, borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
          >
            {changePassword.isPending ? <span style={{ width: 16, height: 16, border: '2px solid var(--ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> : 'Şifreyi Değiştir'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
