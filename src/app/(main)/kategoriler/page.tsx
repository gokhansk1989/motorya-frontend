import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryIcon as CatIcon } from '@/components/icons/CategoryIcons';
import { SSR_API_URL } from '@/lib/apiBase';

const BASE_URL = 'https://motorya.com.tr';

interface Category {
  id: string; name: string; slug: string; parentId: string | null; iconKey?: string | null;
}

/**
 * Istek aninda sunucuda render ediliyor.
 *
 * `revalidate` ile statik uretilince sayfa DERLEME aninda olusuyordu:
 * CI'da backend yok, fetch bos donuyor ve "0 kategori" yazan hali statik
 * dosyaya gomuluyordu. Istek aninda render edilince cagri sunucunun
 * kendi icinden (INTERNAL_API_URL) gidiyor ve gercek veriyi aliyor.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  // Layout basliga "| Motorya" ekliyor; burada tekrar yazmak
  // "Tüm Kategoriler | Motorya | Motorya" uretiyordu.
  title: 'Tüm Kategoriler',
  description:
    'Motosiklet ekipmanı kategorileri: kask, mont, pantolon, eldiven, bot, koruma ekipmanları, çanta, aksesuar, yedek parça ve bakım ürünleri.',
  alternates: { canonical: `${BASE_URL}/kategoriler` },
};

async function kategorileriGetir(): Promise<Category[]> {
  try {
    const res = await fetch(`${SSR_API_URL}/listings/meta/categories`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Tüm kategorilerin dizini.
 *
 * Neden ayrı bir sayfa: 97 kategoriye tek bir yerden bakmanın yolu yoktu.
 * Footer'da 11 üst kategori vardı, alt dallara ancak ilgili kategori
 * sayfasına girerek ulaşılıyordu. Mobilde menüde hiç kategori yoktu.
 *
 * İkinci faydası iç bağlantı: her alt kategoriye giden bağlantılar
 * dağınıktı, bu sayfa hepsini tek bir yerde toplayarak arama motorunun
 * derin kategorileri keşfetmesini kolaylaştırıyor.
 *
 * Akordeon bilerek yok — sayfanın varlık sebebi her şeyi ilk bakışta
 * göstermek. İlan sayısı da bilerek yok: kategorilerin çoğunda henüz ilan
 * yok ve "0 ilan" yazan on kart boş bir pazar izlenimi bırakırdı.
 */
export default async function KategorilerPage() {
  const hepsi = await kategorileriGetir();
  const ustler = hepsi.filter(c => !c.parentId);
  const altSayisi = hepsi.length - ustler.length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Keşfet', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Kategoriler', item: `${BASE_URL}/kategoriler` },
    ],
  };

  return (
    <div className="m-wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <h1 className="m-display" style={{ fontSize: 26, margin: '0 0 6px' }}>Kategoriler</h1>
      <p style={{ color: 'var(--ink-3)', fontSize: 14.5, margin: '0 0 24px' }}>
        {ustler.length} kategori · {altSayisi} alt kategori
      </p>

      {ustler.length === 0 ? (
        <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Kategoriler şu anda yüklenemedi.</p>
      ) : (
        <div className="m-kategori-izgara">
          {ustler.map(ust => {
            const altlar = hepsi.filter(c => c.parentId === ust.id);
            return (
              <div key={ust.id} style={{
                border: '1px solid var(--line)', borderRadius: 12,
                padding: '14px 16px', background: 'var(--bg-1)',
              }}>
                <Link href={`/kategori/${ust.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  textDecoration: 'none', color: 'var(--ink)', marginBottom: altlar.length ? 10 : 0,
                }}>
                  <CatIcon slug={ust.slug} size={26} iconUrl={ust.iconKey} />
                  <span style={{ fontWeight: 700, fontSize: 15.5 }}>{ust.name}</span>
                  {altlar.length > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--ink-3)' }}>
                      {altlar.length}
                    </span>
                  )}
                </Link>

                {altlar.length > 0 && (
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.9 }}>
                    {altlar.map((alt, i) => (
                      <span key={alt.id}>
                        {i > 0 && <span style={{ color: 'var(--ink-3)' }}> · </span>}
                        <Link href={`/kategori/${alt.slug}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                          {alt.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
