import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BASE_URL = 'https://motorya.com.tr';

const CATEGORIES: Record<string, { label: string; description: string; keywords: string[] }> = {
  kask:      { label: 'Kask',          description: 'motosiklet kaskı',    keywords: ['kask', 'full face kask', 'modüler kask', 'jet kask'] },
  mont:      { label: 'Mont & Koruma', description: 'motosiklet montu',    keywords: ['motosiklet montu', 'deri ceket', 'koruyucu giysi'] },
  eldiven:   { label: 'Eldiven',       description: 'motosiklet eldiveni', keywords: ['motosiklet eldiveni', 'yarış eldiveni'] },
  bot:       { label: 'Bot',           description: 'motosiklet botu',     keywords: ['motosiklet botu', 'touring bot', 'motosiklet ayakkabısı'] },
  koruyucu:  { label: 'Koruyucu',      description: 'vücut koruyucu',      keywords: ['sırt zırhı', 'diz koruyucu', 'vücut koruyucu'] },
  egzoz:     { label: 'Egzoz',         description: 'motosiklet egzozu',   keywords: ['motosiklet egzozu', 'performans egzoz', 'akrapovic'] },
  aksesuar:  { label: 'Aksesuar',      description: 'motosiklet aksesuarı',keywords: ['motosiklet aksesuar', 'interkom', 'motosiklet çantası'] },
};

// En büyük 20 şehir
const CITIES: Record<string, string> = {
  istanbul: 'İstanbul', ankara: 'Ankara', izmir: 'İzmir', bursa: 'Bursa',
  antalya: 'Antalya', adana: 'Adana', konya: 'Konya', gaziantep: 'Gaziantep',
  mersin: 'Mersin', kocaeli: 'Kocaeli', diyarbakir: 'Diyarbakır', hatay: 'Hatay',
  manisa: 'Manisa', kayseri: 'Kayseri', samsun: 'Samsun', balikesir: 'Balıkesir',
  tekirdag: 'Tekirdağ', sakarya: 'Sakarya', denizli: 'Denizli', eskisehir: 'Eskişehir',
};

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).flatMap(slug =>
    Object.keys(CITIES).map(sehir => ({ slug, sehir }))
  );
}

export async function generateMetadata({ params }: { params: { slug: string; sehir: string } }): Promise<Metadata> {
  const cat = CATEGORIES[params.slug];
  const city = CITIES[params.sehir];
  if (!cat || !city) return { title: 'Sayfa Bulunamadı' };

  const title = `${city} İkinci El ${cat.label} | Motorya`;
  const description = `${city} ilanlarında ikinci el ${cat.description} al ya da sat. Güvenli ödeme ve kargo ile Motorya'da.`;
  const canonical = `${BASE_URL}/kategori/${params.slug}/${params.sehir}`;

  return {
    title,
    description,
    alternates: { canonical },
    keywords: cat.keywords.map(k => `${city} ${k}`),
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

interface Listing {
  id: string; title: string; price: string | number;
  images?: { url: string }[]; city?: string; condition: string;
}

async function fetchListings(slug: string, city: string): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${API_URL}/listings?categorySlug=${slug}&city=${encodeURIComponent(city)}&limit=24&status=ACTIVE`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch { return []; }
}

export default async function CityListingPage({ params }: { params: { slug: string; sehir: string } }) {
  const cat = CATEGORIES[params.slug];
  const city = CITIES[params.sehir];
  if (!cat || !city) notFound();

  const listings = await fetchListings(params.slug, city);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${city} İkinci El ${cat.label}`,
    description: `${city}'de satılık ikinci el ${cat.description} ilanları`,
    url: `${BASE_URL}/kategori/${params.slug}/${params.sehir}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: cat.label, item: `${BASE_URL}/kategori/${params.slug}` },
        { '@type': 'ListItem', position: 3, name: `${city} ${cat.label}`, item: `${BASE_URL}/kategori/${params.slug}/${params.sehir}` },
      ],
    },
  };

  const CONDITION_MAP: Record<string, string> = {
    NEW: 'Sıfır', LIKE_NEW: 'Sıfır Gibi', GOOD: 'İyi', FAIR: 'Makul', POOR: 'Kullanılmış',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="m-wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>

        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Anasayfa</Link>
          <span>›</span>
          <Link href={`/kategori/${params.slug}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{cat.label}</Link>
          <span>›</span>
          <span style={{ color: 'var(--ink)' }}>{city}</span>
        </nav>

        <h1 className="m-display" style={{ fontSize: 28, marginBottom: 8 }}>
          {city} İkinci El {cat.label}
        </h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 15, marginBottom: 32 }}>
          {city}&apos;de {listings.length > 0 ? `${listings.length}+ ` : ''}ikinci el {cat.description} ilanı. Güvenli al-sat, hızlı kargo.
        </p>

        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
            <p style={{ fontSize: 16, marginBottom: 12 }}>Şu an {city}&apos;de {cat.label} ilanı yok.</p>
            <Link href={`/kategori/${params.slug}`} className="m-btn m-btn-primary" style={{ display: 'inline-flex', height: 44, alignItems: 'center', padding: '0 20px', borderRadius: 10, textDecoration: 'none', fontSize: 14 }}>
              Tüm {cat.label} İlanlarına Bak
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {listings.map(l => (
              <Link key={l.id} href={`/ilan/${l.id}`} style={{ textDecoration: 'none' }}>
                <article className="m-card">
                  <div className="m-card-media">
                    {l.images?.[0] ? (
                      <img src={l.images[0].url} alt={l.title} className="m-card-img" loading="lazy" />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-2)', display: 'grid', placeItems: 'center', color: 'var(--ink-3)', fontSize: 12 }}>Fotoğraf yok</div>
                    )}
                  </div>
                  <div className="m-card-body">
                    <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{CONDITION_MAP[l.condition] ?? l.condition}</p>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{l.title}</h3>
                    <p className="m-price" style={{ fontSize: 16 }}>{Number(l.price).toLocaleString('tr-TR')}<span className="cur">₺</span></p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* İç linkler: diğer şehirler */}
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--ink-2)' }}>
            Diğer şehirlerde {cat.label}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(CITIES).filter(([k]) => k !== params.sehir).map(([slug, name]) => (
              <Link key={slug} href={`/kategori/${params.slug}/${slug}`} className="m-chip" style={{ height: 32, fontSize: 13 }}>
                {name}
              </Link>
            ))}
          </div>
        </section>

        {/* İç linkler: diğer kategoriler */}
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--ink-2)' }}>
            {city}&apos;de Diğer Kategoriler
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(CATEGORIES).filter(([k]) => k !== params.slug).map(([slug, c]) => (
              <Link key={slug} href={`/kategori/${slug}/${params.sehir}`} className="m-chip" style={{ height: 32, fontSize: 13 }}>
                {c.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
