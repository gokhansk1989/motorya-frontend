'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import { Zap } from 'lucide-react';
import { MarkaLogo } from '@/components/ui/MarkaLogo';
import { donusAlVeTemizle } from '@/lib/donus';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    /**
     * Google turunun donusu.
     *
     * Sunucu artik jetonlari ADRESTE gondermiyor; tek kullanimlik,
     * 60 saniyelik bir kod birakiyor. Onu POST ile takas edip
     * jetonlari yanit GOVDESINDE aliyoruz.
     *
     * Eski bicim (?token=...) bilerek desteklenmiyor: amac zaten
     * jetonu adresten cikarmakti, geriye donuk kabul etmek acigi
     * acik birakirdi. Dagitim sirasinda eski istemciyle yeni sunucu
     * karsilasirsa kullanici "giris tamamlanamadi" gorup tekrar
     * dener - jeton sizmaktansa bir kez daha giris yapmak iyidir.
     */
    const code = params.get('code');
    if (!code) { router.replace('/giris'); return; }

    // Kod adres cubugundan HEMEN siliniyor: takas edildikten sonra
    // olu ama tarayici gecmisinde durmasinin da gereği yok.
    try {
      window.history.replaceState(null, '', '/callback');
    } catch {}

    let iptal = false;
    (async () => {
      try {
        const { data } = await api.post('/auth/google/exchange', { code });
        if (iptal) return;
        const { accessToken, refreshToken, deviceId, user, needsConsent } = data;
        if (!accessToken || !user) { router.replace('/giris'); return; }
        setAuth(user, accessToken, refreshToken, deviceId);
        // needsConsent yalnızca sözleşmeleri henüz onaylamamış, yani ilk kez
        // giren Google kullanıcıları için true dönüyor — kayıt sinyali olarak
        // güvenilir.
        if (needsConsent) analytics.signUp('google');
        /**
         * Onay gerekiyorsa once /onaylar'a gidiliyor ve hedef SAKLI
         * KALIYOR; onay ekrani isini bitirince ayni hedefe goturuyor.
         */
        if (needsConsent) router.replace('/onaylar');
        else router.replace(donusAlVeTemizle() ?? '/');
      } catch {
        if (!iptal) router.replace('/giris?hata=google');
      }
    })();
    return () => { iptal = true; };
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
