'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { analytics } from '@/lib/analytics';
import { Zap } from 'lucide-react';
import { MarkaLogo } from '@/components/ui/MarkaLogo';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const refreshToken = params.get('refreshToken') ?? undefined;
    const deviceId = params.get('deviceId') ?? undefined;
    const userParam = params.get('user');
    const needsConsent = params.get('needsConsent') === 'true';
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setAuth(user, token, refreshToken, deviceId);
        // needsConsent yalnızca sözleşmeleri henüz onaylamamış, yani ilk kez
        // giren Google kullanıcıları için true dönüyor — kayıt sinyali olarak
        // güvenilir.
        if (needsConsent) analytics.signUp('google');
        router.replace(needsConsent ? '/onaylar' : '/');
      } catch {
        router.replace('/giris');
      }
    } else {
      router.replace('/giris');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      {/* Google dönüşü beklenirken görünen ekran; marka burada da logo
          olmalı. Bağlantı yok: kullanıcı zaten yönlendiriliyor. */}
      <MarkaLogo yukseklik={40} link={false} />
      <div style={{ width: 32, height: 32, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
