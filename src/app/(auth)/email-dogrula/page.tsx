'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EmailDogrulaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('Geçersiz link.'); return; }

    api.get(`/auth/verify-email?token=${token}`)
      .then(res => {
        setAuth(res.data.user, res.data.accessToken);
        setStatus('success');
        setTimeout(() => router.push('/'), 2000);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Doğrulama başarısız.');
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {status === 'loading' && (
          <>
            <Loader2 size={48} style={{ margin: '0 auto 16px', color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--ink-2)' }}>E-posta doğrulanıyor…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={56} style={{ margin: '0 auto 16px', color: 'var(--good)' }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>E-posta doğrulandı!</h2>
            <p style={{ color: 'var(--ink-3)' }}>Hesabın aktifleşti. Yönlendiriliyorsun…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={56} style={{ margin: '0 auto 16px', color: 'var(--bad)' }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Doğrulama Başarısız</h2>
            <p style={{ color: 'var(--ink-3)', marginBottom: 24 }}>{message}</p>
            <Link href="/giris" className="m-btn m-btn-primary" style={{ textDecoration: 'none', height: 44, padding: '0 24px', display: 'inline-flex', alignItems: 'center' }}>
              Giriş Sayfasına Dön
            </Link>
          </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
