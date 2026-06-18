import Link from 'next/link';
import { Logo } from './Header';
import { Shield, Lock } from 'lucide-react';

export function Footer() {
  const cols: [string, { label: string; href: string }[]][] = [
    ['Motorya', [
      { label: 'Hakkımızda', href: '/sayfa/hakkimizda' },
      { label: 'Nasıl çalışır', href: '/sayfa/nasil-calisir' },
      { label: 'Güvenli alışveriş', href: '/sayfa/guvenli-alisveris' },
      { label: 'Kariyer', href: '/sayfa/kariyer' },
    ]],
    ['Kategoriler', [
      { label: 'Kask', href: '/kategori/kask' },
      { label: 'Mont', href: '/kategori/mont' },
      { label: 'Eldiven', href: '/kategori/eldiven' },
      { label: 'Koruma', href: '/kategori/koruma' },
      { label: 'Bot & Çizme', href: '/kategori/bot-cizme' },
      { label: 'Yedek Parça', href: '/kategori/yedek-parca' },
      { label: 'Aksesuar', href: '/kategori/aksesuar' },
    ]],
    ['Destek', [
      { label: 'Yardım merkezi', href: '/sayfa/yardim-merkezi' },
      { label: 'Kargo & iade', href: '/sayfa/kargo-iade' },
      { label: 'İletişim', href: '/sayfa/iletisim' },
      { label: 'KVKK', href: '/sayfa/gizlilik-politikasi' },
    ]],
  ];

  return (
    <footer style={{ borderTop: '1px solid var(--line-soft)', marginTop: 64, background: 'var(--bg-1)' }}>
      <div className="m-wrap" style={{
        padding: '48px 28px 36px',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        gap: 40,
      }}>
        <div>
          <Logo />
          <p style={{ maxWidth: 280, marginTop: 16, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-3)' }}>
            Motosiklet tayfası için ikinci el ekipman ve parça pazarı. Güvenli öde, kargoyla al ya da yüz yüze buluş.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <span className="m-badge verify" style={{ display: 'inline-flex', gap: 5 }}>
              <Shield size={12} />SSL GÜVENLİ
            </span>
            <span className="m-badge good" style={{ display: 'inline-flex', gap: 5 }}>
              <Lock size={12} />KORUMALI ÖDEME
            </span>
          </div>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <div className="m-kicker" style={{ marginBottom: 14 }}>{h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <Link key={item.href} href={item.href} style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="m-wrap" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 28px', borderTop: '1px solid var(--line-soft)', fontSize: 12.5,
      }}>
        <span className="m-mono" style={{ color: 'var(--ink-3)' }}>© 2026 MOTORYA.COM.TR</span>
        <span style={{ color: 'var(--ink-3)' }}>İstanbul · Türkiye</span>
      </div>
    </footer>
  );
}
