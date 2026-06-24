import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CITY_MAP, CITIES } from '@/lib/cities';
import { CategoryIcon as CatIcon } from '@/components/icons/CategoryIcons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BASE_URL = 'https://motorya.com.tr';

interface Category {
  id: string; name: string; slug: string; parentId: string | null; iconKey?: string | null;
}

interface CategoryData {
  category: Category;
  children: Category[];
}

interface Listing {
  id: string; slug?: string; title: string; price: string | number;
  images?: { url: string }[]; city?: string; condition: string;
}

async function fetchCategoryData(slug: string): Promise<CategoryData | null> {
  try {
    const res = await fetch(`${API_URL}/listings/meta/category/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error(`[kategori/${slug}/sehir] category fetch failed: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[kategori/${slug}/sehir] category fetch error:`, err);
    return null;
  }
}

async function fetchAllL1Categories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/listings/meta/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const all: Category[] = await res.json();
    return all.filter(c => !c.parentId);
  } catch (err) {
    console.error('[kategori/sehir] categories fetch error:', err);
    return [];
  }
}

async function fetchListings(categoryId: string, city: string): Promise<Listing[]> {
  try {
    const params = new URLSearchParams({ categoryId, city, limit: '24' });
    const res = await fetch(`${API_URL}/listings?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error(`[kategori/sehir] listings fetch failed: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.items ?? [];
  } catch (err) {
    console.error('[kategori/sehir] listings fetch error:', err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; sehir: string }> }): Promise<Metadata> {
  const { slug, sehir } = await params;
  const [data, city] = [await fetchCategoryData(slug), CITY_MAP[sehir]];
  if (!data || !city) return { title: 'Sayfa Bulunamadı' };

  const { category } = data;
  const title = `${city} İkinci El ${category.name} | Motorya`;
  const description = `${city} ilanlarında ikinci el motosiklet ${category.name.toLowerCase()} al ya da sat. Güvenli ödeme ve kargo ile Motorya'da.`;
  const canonical = `${BASE_URL}/kategori/${slug}/${sehir}`;

  return {
    title,
    description,
    alternates: { canonical },
    keywords: [`${city} ${category.name}`, `${city} ikinci el ${category.name}`],
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

export const dynamic = 'force-dynamic';

function conditionLabel(c: string) {
  const map: Record<string, string> = {
    NEW: 'Sıfır', LIKE_NEW: 'Sıfır Gibi', GOOD: 'İyi', FAIR: 'Makul', POOR: 'Kullanılmış',
  };
  return map[c] ?? c;
}

export default async function CityListingPage({ params }: { params: Promise<{ slug: string; sehir: string }> }) {
  const { slug: catSlug, sehir } = await params;
  const city = CITY_MAP[sehir];
  if (!city) notFound();

  const [catData, l1Categories] = await Promise.all([
    fetchCategoryData(catSlug),
    fetchAllL1Categories(),
  ]);
  if (!catData) notFound();

  const { category } = catData;
  const listings = await fetchListings(category.id, city);

  const isL2 = !!category.parentId;
  const parentL1 = isL2 ? l1Categories.find(c => c.id === category.parentId) ?? null : null;
  const activeL1Slug = isL2 ? (parentL1?.slug ?? null) : catSlug;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${city} İkinci El ${category.name}`,
    description: `${city}'de satılık ikinci el ${category.name.toLowerCase()} ilanları`,
    url: `${BASE_URL}/kategori/${catSlug}/${sehir}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: category.name, item: `${BASE_URL}/kategori/${catSlug}` },
        { '@type': 'ListItem', position: 3, name: `${city} ${category.name}`, item: `${BASE_URL}/kategori/${catSlug}/${sehir}` },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="m-wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>

        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Anasayfa</Link>
          <span>›</span>
          {parentL1 && <>
            <Link href={`/kategori/${parentL1.slug}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{parentL1.name}</Link>
            <span>›</span>
          </>}
          <Link href={`/kategori/${catSlug}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{category.name}</Link>
          <span>›</span>
          <span style={{ color: 'var(--ink)' }}>{city}</span>
        </nav>

        <h1 className="m-display" style={{ fontSize: 28, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <CatIcon slug={catSlug} size={32} iconUrl={category.iconKey} /> {city} İkinci El {category.name}
        </h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 15, marginBottom: 20 }}>
          {city}&apos;de {listings.length > 0 ? `${listings.length}+ ` : ''}ikinci el motosiklet {category.name.toLowerCase()} ilanı. Güvenli al-sat, hızlı kargo.
        </p>

        {/* L1 kategori navigasyonu — şehir bağlamını korur */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {l1Categories.map(cat => (
            <Link key={cat.slug} href={`/kategori/${cat.slug}/${sehir}`} className="m-chip"
              style={{ height: 34, fontSize: 13, textDecoration: 'none',
                background: cat.slug === activeL1Slug ? 'var(--accent)' : undefined,
                color: cat.slug === activeL1Slug ? '#fff' : undefined }}>
              <CatIcon slug={cat.slug} size={21} iconUrl={cat.iconKey} /> {cat.name}
            </Link>
          ))}
        </div>

        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-3)' }}>
            <img src="/icons/empty-listing.png" alt="" width={100} height={100} style={{ objectFit: 'contain', opacity: 0.85, display: 'block', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 18, marginBottom: 8 }}>Şu an {city}&apos;de {category.name.toLowerCase()} ilanı yok</p>
            <p style={{ fontSize: 14, marginBottom: 20 }}>İlk ilanı sen ver!</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                İlan Ver
              </Link>
              <Link href={`/kategori/${catSlug}`} className="m-btn" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Tüm {category.name} İlanlarına Bak
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {listings.map(l => (
              <Link key={l.id} href={`/ilan/${l.slug ?? l.id}`} style={{ textDecoration: 'none' }}>
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
                    <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{conditionLabel(l.condition)}</p>
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
            Diğer şehirlerde {category.name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CITIES.filter(([k]) => k !== sehir).map(([citySlug, cityName]) => (
              <Link key={citySlug} href={`/kategori/${catSlug}/${citySlug}`} className="m-chip" style={{ height: 32, fontSize: 13 }}>
                {cityName}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
