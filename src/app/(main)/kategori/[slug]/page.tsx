import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BASE_URL = 'https://motorya.com.tr';

const CATEGORY_META: Record<string, { label: string; icon: string; description: string; keywords: string[] }> = {
  kask: {
    label: 'Kask',
    icon: '🪖',
    description: 'İkinci el motosiklet kaskı al ya da sat. Full face, modüler, jet ve çocuk kaskları uygun fiyatlarla Motorya\'da.',
    keywords: ['ikinci el kask', 'motosiklet kaskı', 'kask satış', 'full face kask', 'modüler kask'],
  },
  mont: {
    label: 'Mont & Koruma',
    icon: '🧥',
    description: 'İkinci el motosiklet montu, deri ceket ve koruyucu giysi al-sat. CE onaylı güvenli ekipmanlar Motorya\'da.',
    keywords: ['motosiklet montu', 'ikinci el deri ceket', 'motosiklet kıyafeti', 'CE koruma'],
  },
  eldiven: {
    label: 'Eldiven',
    icon: '🧤',
    description: 'İkinci el motosiklet eldiveni satın al ya da ilanını ver. Yaz, kış ve yarış eldivenleri Motorya\'da.',
    keywords: ['motosiklet eldiveni', 'ikinci el eldiven', 'yarış eldiveni', 'yaz eldiveni'],
  },
  bot: {
    label: 'Bot',
    icon: '👢',
    description: 'İkinci el motosiklet botu ve ayakkabısı. Touring, sport ve günlük kullanım botları uygun fiyatla.',
    keywords: ['motosiklet botu', 'ikinci el bot', 'motosiklet ayakkabısı', 'touring bot'],
  },
  koruyucu: {
    label: 'Koruyucu',
    icon: '🛡️',
    description: 'İkinci el vücut koruyucu, sırt zırhı, diz ve dirsek koruyucuları. Güvenli sürüş için Motorya\'da.',
    keywords: ['motosiklet koruyucu', 'sırt zırhı', 'diz koruyucu', 'vücut koruyucu'],
  },
  egzoz: {
    label: 'Egzoz',
    icon: '🔧',
    description: 'Motosiklet egzozu ve egzoz aksesuarı al-sat. Akrapovic, Leovince ve daha fazlası Motorya\'da.',
    keywords: ['motosiklet egzozu', 'ikinci el egzoz', 'egzoz sistemi', 'performans egzoz'],
  },
  aksesuar: {
    label: 'Aksesuar',
    icon: '⚙️',
    description: 'İkinci el motosiklet aksesuarı, çanta, interkom ve daha fazlası. Motosiklet için her şey Motorya\'da.',
    keywords: ['motosiklet aksesuar', 'ikinci el aksesuar', 'motosiklet çantası', 'interkom'],
  },
};

interface Listing {
  id: string;
  title: string;
  price: string | number;
  images?: { url: string }[];
  city?: string;
  condition: string;
  seller?: { displayName: string };
}

async function fetchCategoryListings(slug: string): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${API_URL}/listings?categorySlug=${slug}&limit=48&page=1&status=ACTIVE`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_META).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const meta = CATEGORY_META[params.slug];
  if (!meta) return { title: 'Kategori Bulunamadı' };

  const title = `İkinci El Motosiklet ${meta.label} — Motorya`;
  const canonical = `${BASE_URL}/kategori/${params.slug}`;

  return {
    title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description: meta.description,
      url: canonical,
      type: 'website',
    },
  };
}

function conditionLabel(c: string) {
  const map: Record<string, string> = {
    NEW: 'Sıfır', LIKE_NEW: 'Sıfır Gibi', GOOD: 'İyi', FAIR: 'Makul', POOR: 'Kullanılmış',
  };
  return map[c] ?? c;
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const meta = CATEGORY_META[params.slug];
  if (!meta) notFound();

  const listings = await fetchCategoryListings(params.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `İkinci El Motosiklet ${meta.label}`,
    description: meta.description,
    url: `${BASE_URL}/kategori/${params.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="m-wrap" style={{ paddingBottom: 48 }}>
        {/* Header */}
        <div style={{ padding: '32px 0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)', fontSize: 12.5, marginBottom: 16 }}>
            <Link href="/" style={{ color: 'var(--ink-3)' }}>Keşfet</Link>
            <span style={{ opacity: 0.5 }}>›</span>
            <span style={{ color: 'var(--ink-2)' }}>{meta.label}</span>
          </div>
          <h1 className="m-display" style={{ fontSize: 28, margin: '0 0 8px' }}>
            {meta.icon} İkinci El {meta.label}
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14.5, margin: 0 }}>{meta.description}</p>
        </div>

        {/* Category nav */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {Object.entries(CATEGORY_META).map(([slug, cat]) => (
            <Link
              key={slug}
              href={`/kategori/${slug}`}
              className="m-chip"
              style={{
                height: 34,
                fontSize: 13,
                textDecoration: 'none',
                background: slug === params.slug ? 'var(--accent)' : undefined,
                color: slug === params.slug ? '#fff' : undefined,
              }}
            >
              {cat.icon} {cat.label}
            </Link>
          ))}
        </div>

        {/* Listing grid */}
        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-3)' }}>
            <p style={{ fontSize: 18 }}>Bu kategoride henüz ilan yok</p>
            <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ display: 'inline-flex', marginTop: 16, textDecoration: 'none' }}>
              İlan Ver
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {listings.map(listing => (
              <Link key={listing.id} href={`/ilan/${listing.id}`} style={{ textDecoration: 'none' }}>
                <div className="m-surface" style={{ overflow: 'hidden', borderRadius: 'var(--radius)', transition: 'transform 0.15s', cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '4/3', background: 'var(--bg-3)', overflow: 'hidden' }}>
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink-3)', fontSize: 28 }}>
                        {meta.icon}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, margin: '0 0 6px', lineHeight: 1.3,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {listing.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="m-price" style={{ fontSize: 17 }}>
                        {Number(listing.price).toLocaleString('tr-TR')}<span style={{ fontSize: 12 }}> ₺</span>
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                        {conditionLabel(listing.condition)}
                      </span>
                    </div>
                    {listing.city && (
                      <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '4px 0 0' }}>{listing.city}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 40, padding: '24px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--line-soft)', textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 18, margin: '0 0 8px' }}>
            Satmak istediğin {meta.label} var mı?
          </h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: '0 0 16px' }}>
            Motorya'da ilanını ücretsiz ver, binlerce motosiklet sevdalısına ulaş.
          </p>
          <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Ücretsiz İlan Ver
          </Link>
        </div>
      </div>
    </>
  );
}
