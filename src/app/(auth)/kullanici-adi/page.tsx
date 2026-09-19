'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

// Kullanici adi secme ekrani.
//
// Neden var: bu siteye kayit olan herkesin gercek ad-soyadi, ilan ve mesaj
// ekranlarinda herkese gorunuyordu ve ilan sayfalari arama motorlarinca
// dizine eklendigi icin adlar Google'da aranabilir hale geliyordu. Ilanda
// sehir de bulundugundan "ad + sehir + ne sattigi" birlesip kisiyi
// hedeflenebilir kiliyordu.
//
// Yeni uyeler kayit sirasinda kullanici adi seciyor. Once kayit olmus
// uyelere ise burada soruluyor: giriste (needsUsername) ve ilan vermeden
// once. Secim yapilana kadar gorunen ad degismiyor - otomatik uretilmis
// "uye7k2m9" gibi adlar kotu bir ilk izlenim yaratirdi.
const schema = z.object({
  username: z.string()
    .min(3, 'En az 3 karakter')
    .max(20, 'En fazla 20 karakter')
    .regex(/^[a-z0-9._]+$/, 'Yalnızca küçük harf, rakam, nokta ve alt çizgi kullanılabilir'),
});

type FormData = z.infer<typeof schema>;

export default function KullaniciAdiPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const ad = data.username.trim().toLowerCase();
      const res = await api.patch('/users/me/username', { username: ad });
      if (user) setUser({ ...user, displayName: res.data.displayName ?? ad });
      toast.success('Kullanıcı adın belirlendi');
      router.push('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Kullanıcı adı kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-wrap" style={{ maxWidth: 440, paddingTop: 56, paddingBottom: 80 }}>
      <h1 className="m-display" style={{ fontSize: 24, margin: '0 0 8px' }}>Kullanıcı adını belirle</h1>
      <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
        İlanlarında, mesajlarında ve profilinde bu ad görünür. Ad soyadın
        kimseye gösterilmez; yalnızca fatura ve kimlik doğrulama için saklanır.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-2)', marginBottom: 6 }}>
          Kullanıcı adı
        </label>
        <input
          {...register('username')}
          placeholder="ornek_kullanici"
          autoCapitalize="none"
          autoCorrect="off"
          autoFocus
          style={{
            width: '100%', padding: '11px 13px', borderRadius: 12, fontSize: 15,
            background: 'var(--bg-1)', color: 'var(--ink)',
            border: `1px solid ${errors.username ? 'var(--bad)' : 'var(--line)'}`,
            outline: 'none',
          }}
        />
        {errors.username && (
          <p style={{ fontSize: 12, color: 'var(--bad)', marginTop: 6 }}>{errors.username.message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', marginTop: 18, padding: '12px 0', borderRadius: 12,
            background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 15,
            border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Kaydediliyor…' : 'Devam et'}
        </button>
      </form>
    </div>
  );
}
