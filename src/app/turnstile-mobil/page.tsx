'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mobil uygulama için Turnstile köprüsü.
 *
 * Neden böyle bir sayfa var: /auth/register Turnstile jetonu zorunlu
 * tutuyor ama Turnstile bir TARAYICI doğrulaması - native tarafta karşılığı
 * yok. Uygulama hiç jeton göndermediği için mobil kayıt "Bot doğrulaması
 * başarısız" ile tamamen kırıktı.
 *
 * Çözüm: widget'ı uygulamanın içindeki bir WebView'de göster. Cloudflare
 * widget'ın çalıştığı alan adını doğruladığı için sayfanın kendi alan
 * adımızdan (motorya.com.tr) servis edilmesi şart; `data:` URL ya da
 * about:blank ile "invalid domain" hatası alınır. Bu yüzden jenerik bir
 * HTML dosyası değil, bir uygulama rotası.
 *
 * Jeton `window.ReactNativeWebView.postMessage` ile uygulamaya geçer.
 * Tarayıcıda açılırsa (arama motoru, meraklı kullanıcı) hiçbir şey
 * göndermez, yalnızca kısa bir açıklama gösterir - sayfa robots'ta da
 * dizine kapalı.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

function uygulamayaGonder(mesaj: { tip: 'jeton'; jeton: string } | { tip: 'hata' }) {
  try {
    window.ReactNativeWebView?.postMessage(JSON.stringify(mesaj));
  } catch {
    // WebView dışında açıldıysa yapacak bir şey yok.
  }
}

export default function TurnstileMobilPage() {
  const kutu = useRef<HTMLDivElement>(null);
  const [durum, setDurum] = useState<'yukleniyor' | 'hazir' | 'hata'>('yukleniyor');

  useEffect(() => {
    if (!SITE_KEY) {
      // Anahtar yoksa sunucu tarafı da doğrulamayı atlıyor (turnstile.ts:
      // secret yoksa true döner). Uygulamayı bekletmemek için boş jeton.
      uygulamayaGonder({ tip: 'jeton', jeton: '' });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      const ts = (window as any).turnstile;
      if (!ts || !kutu.current) { setDurum('hata'); uygulamayaGonder({ tip: 'hata' }); return; }
      setDurum('hazir');
      ts.render(kutu.current, {
        sitekey: SITE_KEY,
        callback: (jeton: string) => uygulamayaGonder({ tip: 'jeton', jeton }),
        'error-callback': () => { setDurum('hata'); uygulamayaGonder({ tip: 'hata' }); },
        'expired-callback': () => uygulamayaGonder({ tip: 'hata' }),
        theme: 'light',
      });
    };
    script.onerror = () => { setDurum('hata'); uygulamayaGonder({ tip: 'hata' }); };
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return (
    <div style={{
      minHeight: 120, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 10,
      fontFamily: 'system-ui, sans-serif', background: 'transparent',
    }}>
      <div ref={kutu} />
      {durum === 'yukleniyor' && (
        <p style={{ fontSize: 13, color: '#767c89', margin: 0 }}>Güvenlik doğrulaması yükleniyor…</p>
      )}
      {durum === 'hata' && (
        <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>Doğrulama yüklenemedi.</p>
      )}
    </div>
  );
}
