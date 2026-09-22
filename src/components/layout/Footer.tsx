import Link from 'next/link';
import { Logo } from './Header';

export function Footer() {
  const cols: [string, { label: string; href: string }[]][] = [
    ['Motorya', [
      { label: 'Hakkımızda', href: '/sayfa/hakkimizda' },
      { label: 'Nasıl çalışır', href: '/sayfa/nasil-calisir' },
      { label: 'Blog', href: '/blog' },
      { label: 'Kariyer', href: '/sayfa/kariyer' },
    ]],
    // 11 üst kategorinin tamamı. Dördü (Pantolon, Motosiklet Çantaları,
    // Sürücü Aksesuarları, Bakım Ürünleri) eksikti; hem kullanıcı için
    // eksik bir liste, hem de her sayfadan o kategorilere giden bir iç
    // bağlantı kaybı. Etiketler kısa tutuldu, slug'lar API'dekilerle
    // birebir doğrulandı.
    ['Kategoriler', [
      { label: 'Kask', href: '/kategori/kask' },
      { label: 'Mont', href: '/kategori/mont' },
      { label: 'Pantolon', href: '/kategori/pantolon' },
      { label: 'Eldiven', href: '/kategori/eldiven' },
      { label: 'Bot & Çizme', href: '/kategori/bot-cizme' },
      { label: 'Koruma', href: '/kategori/koruma' },
      { label: 'Çanta', href: '/kategori/canta' },
      { label: 'Aksesuar', href: '/kategori/aksesuar' },
      { label: 'Sürücü Aksesuarları', href: '/kategori/surucu-aksesuarlari' },
      { label: 'Yedek Parça', href: '/kategori/yedek-parca' },
      { label: 'Bakım Ürünleri', href: '/kategori/bakim' },
    ]],
    ['Destek', [
      { label: 'Sıkça sorulan sorular', href: '/sss' },
      { label: 'Güvenli alışveriş', href: '/sayfa/guvenli-alisveris' },
      { label: 'İletişim', href: '/sayfa/iletisim' },
      { label: 'KVKK', href: '/sayfa/gizlilik-politikasi' },
    ]],
  ];

  return (
    <footer className="m-footer" style={{ borderTop: '1px solid var(--line-soft)', marginTop: 64, background: 'var(--bg-1)' }}>
      <div className="m-wrap m-footer-grid" style={{
        padding: '40px 28px 28px',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        gap: 40,
      }}>
        <div>
          <Logo />
          <p style={{ maxWidth: 280, marginTop: 16, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-3)' }}>
            Motosiklet tayfası için ikinci el ekipman ve parça pazarı. Güvenli öde, kargoyla al ya da yüz yüze buluş.
          </p>
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
