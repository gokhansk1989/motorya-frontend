'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function SifreSifirlaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Şifreler eşleşmiyor'); return; }
    if (password.length < 8) { toast.error('Şifre en az 8 karakter olmalı'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: searchParams.get('token'), password });
      setDone(true);
      setTimeout(() => router.push('/giris'), 2500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {!done ? (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Yeni Şifre Belirle</h1>
            <p style={{ color: 'var(--ink-3)', marginBottom: 28, fontSize: 14 }}>En az 8 karakter uzunluğunda bir şifre seç.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-2)', marginBottom: 6 }}>Yeni Şifre</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bg-1)', color: 'var(--ink)', padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-2)', marginBottom: 6 }}>Şifre Tekrar</label>
                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                  style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bg-1)', color: 'var(--ink)', padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={loading} className="m-btn m-btn-primary" style={{ height: 46, fontSize: 15 }}>
                {loading ? 'Kaydediliyor…' : 'Şifremi Güncelle'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={52} style={{ margin: '0 auto 16px', color: 'var(--good)' }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Şifre Güncellendi!</h2>
            <p style={{ color: 'var(--ink-3)' }}>Giriş sayfasına yönlendiriliyorsun…</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SifreSifirlaPage() {
  return (
    <Suspense fallback={null}>
      <SifreSifirlaContent />
    </Suspense>
  );
}
