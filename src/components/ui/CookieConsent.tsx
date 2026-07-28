'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { updateConsent } from '@/lib/analytics';

const STORAGE_KEY = 'motorya_cookie_consent';

/**
 * KVKK: zorunlu olmayan çerezler için açık rıza gerekiyor. Google Analytics
 * çerez yazıp cihaz/IP verisi işlediği için onay alınmadan çalıştırılamaz.
 *
 * Consent Mode v2 kullanıyoruz: GA varsayılan olarak 'denied' ile yükleniyor
 * (çerezsiz, kimliksiz), onay verilince tam moda geçiyor. Böylece reddeden
 * kullanıcılar da modellenmiş veriye katkı verirken hiçbir çerez yazılmıyor.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'granted') {
        updateConsent(true);
      } else if (saved !== 'denied') {
        setVisible(true);
      }
    } catch {
      // localStorage engelliyse (gizli sekme vb.) bandı göster, kalıcılık olmasın
      setVisible(true);
    }
  }, []);

  const decide = (granted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied');
    } catch {
      // yazılamazsa da oturum boyunca karara uy
    }
    updateConsent(granted);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Çerez tercihleri"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 200,
        maxWidth: 560, margin: '0 auto',
        background: 'var(--bg-1)', border: '1px solid var(--line)',
        borderRadius: 16, padding: '16px 18px',
        boxShadow: '0 8px 32px -12px rgba(0,0,0,.28)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Cookie size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
          Siteyi geliştirmek için ziyaret istatistiklerini ölçmek istiyoruz.
          Bunun için çerez kullanılıyor. Reddederseniz site tüm özellikleriyle
          çalışmaya devam eder.{' '}
          <Link href="/sayfa/cerez-politikasi" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            Çerez politikası
          </Link>
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => decide(false)}
          className="m-btn m-btn-ghost"
          style={{ flex: 1, height: 40, fontSize: 13.5, fontWeight: 600 }}
        >
          Reddet
        </button>
        <button
          onClick={() => decide(true)}
          className="m-btn m-btn-primary"
          style={{ flex: 1, height: 40, fontSize: 13.5, fontWeight: 600 }}
        >
          Kabul Et
        </button>
      </div>
    </div>
  );
}
