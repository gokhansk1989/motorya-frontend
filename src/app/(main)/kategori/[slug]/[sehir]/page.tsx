import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CITY_MAP } from '@/lib/cities';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BASE_URL = 'https://motorya.com.tr';

const CATEGORIES: Record<string, { label: string; description: string; keywords: string[] }> = {
  kask:                 { label: 'Kask',           description: 'motosiklet kaskı',      keywords: ['kask', 'full face kask', 'modüler kask', 'jet kask'] },
  mont:                 { label: 'Mont',            description: 'motosiklet montu',      keywords: ['motosiklet montu', 'deri mont', 'tekstil mont'] },
  eldiven:              { label: 'Eldiven',         description: 'motosiklet eldiveni',   keywords: ['motosiklet eldiveni', 'yarış eldiveni', 'kışlık eldiven'] },
  pantolon:             { label: 'Pantolon',        description: 'motosiklet pantolonu',  keywords: ['motosiklet pantolonu', 'deri pantolon', 'tekstil pantolon'] },
  'bot-cizme':          { label: 'Bot & Çizme',    description: 'motosiklet botu',       keywords: ['motosiklet botu', 'touring bot', 'motosiklet ayakkabısı'] },
  koruma:               { label: 'Koruma',          description: 'vücut koruyucu',        keywords: ['sırt zırhı', 'diz koruyucu', 'vücut koruyucu'] },
  'mx-off-road':        { label: 'MX & Off-Road',  description: 'mx ve off-road ekipmanı', keywords: ['mx kask', 'motocross', 'off-road', 'enduro'] },
  canta:                { label: 'Çanta',           description: 'motosiklet çantası',    keywords: ['motosiklet çantası', 'tank çantası', 'sele çantası'] },
  aksesuar:             { label: 'Aksesuar',        description: 'motosiklet aksesuarı',  keywords: ['motosiklet aksesuar', 'interkom', 'gps'] },
  'yedek-parca':        { label: 'Yedek Parça',    description: 'motosiklet yedek parçası', keywords: ['motosiklet parça', 'egzoz', 'yedek parça'] },
  bakim:                { label: 'Bakım',           description: 'motosiklet bakım ürünü', keywords: ['motosiklet yağı', 'bakım seti', 'motul'] },
  motosiklet:           { label: 'Motosiklet',      description: 'motosiklet',            keywords: ['ikinci el motosiklet', 'sıfır motosiklet', 'motor'] },
  'casual-giyim':       { label: 'Casual Giyim',   description: 'casual motosiklet giyimi', keywords: ['rokker', 'casual ceket', 'moto casual'] },
  'surucu-aksesuarlari':{ label: 'Sürücü Aksesuarları', description: 'sürücü aksesuarı', keywords: ['güvenlik yeleği', 'airbag yelek', 'reflektör'] },
};

const CITIES = CITY_MAP;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; sehir: string }> }): Promise<Metadata> {
  const { slug, sehir } = await params;
  const cat = CATEGORIES[slug];
  const city = CITIES[sehir];
  if (!cat || !city) return { title: 'Sayfa Bulunamadı' };

  const title = `${city} İkinci El ${cat.label} | Motorya`;
  const description = `${city} ilanlarında ikinci el ${cat.description} al ya da sat. Güvenli ödeme ve kargo ile Motorya'da.`;
  const canonical = `${BASE_URL}/kategori/${slug}/${sehir}`;

  return {
    title,
    description,
    alternates: { canonical },
    keywords: cat.keywords.map(k => `${city} ${k}`),
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

interface Listing {
  id: string; slug?: string; title: string; price: string | number;
  images?: { url: string }[]; city?: string; condition: string;
}

async function fetchListings(slug: string, city: string): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${API_URL}/listings?categorySlug=${slug}&city=${encodeURIComponent(city)}&limit=24`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) {
      console.error(`[kategori/${slug}/sehir] listings fetch failed: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.items ?? [];
  } catch (err) {
    console.error(`[kategori/${slug}/sehir] listings fetch error:`, err);
    return [];
  }
}

export default async function CityListingPage({ params }: { params: Promise<{ slug: string; sehir: string }> }) {
  const { slug: catSlug, sehir } = await params;
  const cat = CATEGORIES[catSlug];
  const city = CITIES[sehir];
  if (!cat || !city) notFound();

  const listings = await fetchListings(catSlug, city);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${city} İkinci El ${cat.label}`,
    description: `${city}'de satılık ikinci el ${cat.description} ilanları`,
    url: `${BASE_URL}/kategori/${catSlug}/${sehir}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: cat.label, item: `${BASE_URL}/kategori/${catSlug}` },
        { '@type': 'ListItem', position: 3, name: `${city} ${cat.label}`, item: `${BASE_URL}/kategori/${catSlug}/${sehir}` },
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
          <Link href={`/kategori/${catSlug}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{cat.label}</Link>
          <span>›</span>
          <span style={{ color: 'var(--ink)' }}>{city}</span>
        </nav>

        <h1 className="m-display" style={{ fontSize: 28, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          {city} İkinci El {cat.label}
        </h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 15, marginBottom: 20 }}>
          {city}&apos;de {listings.length > 0 ? `${listings.length}+ ` : ''}ikinci el {cat.description} ilanı. Güvenli al-sat, hızlı kargo.
        </p>

        {/* L1 kategori navigasyonu — şehir bağlamını korur */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {Object.entries(CATEGORIES).map(([cSlug, c]) => (
            <Link key={cSlug} href={`/kategori/${cSlug}/${sehir}`} className="m-chip"
              style={{ height: 34, fontSize: 13, textDecoration: 'none',
                background: cSlug === catSlug ? 'var(--accent)' : undefined,
                color: cSlug === catSlug ? '#fff' : undefined }}>
              {c.label}
            </Link>
          ))}
        </div>

        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
            <p style={{ fontSize: 16, marginBottom: 12 }}>Şu an {city}&apos;de {cat.label} ilanı yok.</p>
            <Link href={`/kategori/${catSlug}`} className="m-btn m-btn-primary" style={{ display: 'inline-flex', height: 44, alignItems: 'center', padding: '0 20px', borderRadius: 10, textDecoration: 'none', fontSize: 14 }}>
              Tüm {cat.label} İlanlarına Bak
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {listings.map(l => (
              <Link key={l.id} href={`/ilan/${(l as any).slug ?? l.id}`} style={{ textDecoration: 'none' }}>
                <article className="m-card">
                  <div className="m-card-media">
                    {l.images?.[0] ? (
                      <Image src={l.images[0].url} alt={l.title} fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                        style={{ objectFit: 'cover' }} loading="lazy" />
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
            {Object.entries(CITIES).filter(([k]) => k !== sehir).map(([slug, name]) => (
              <Link key={slug} href={`/kategori/${catSlug}/${slug}`} className="m-chip" style={{ height: 32, fontSize: 13 }}>
                {name}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
