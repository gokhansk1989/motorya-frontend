import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { AdSlot } from '@/components/ui/AdSlot';
import { CategoryIcon as CatIcon } from '@/components/icons/CategoryIcons';
import { CITIES } from '@/lib/cities';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BASE_URL = 'https://motorya.com.tr';

interface Category {
  id: string; name: string; slug: string; parentId: string | null;
}

interface CategoryData {
  category: Category;
  children: Category[];
  grandchildren: Category[];
}

interface Listing {
  id: string; slug?: string; title: string; price: string | number;
  images?: { url: string }[]; city?: string; condition: string;
}

async function fetchCategoryData(slug: string): Promise<CategoryData | null> {
  try {
    const res = await fetch(`${API_URL}/listings/meta/category/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error(`[kategori/${slug}] category fetch failed: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[kategori/${slug}] category fetch error:`, err);
    return null;
  }
}

async function fetchListings(categoryId: string, city?: string): Promise<{ items: Listing[]; total: number }> {
  try {
    const params = new URLSearchParams({ categoryId, limit: '48', page: '1' });
    if (city) params.set('city', city);
    const res = await fetch(`${API_URL}/listings?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error(`[kategori] listings fetch failed for categoryId=${categoryId}: ${res.status}`);
      return { items: [], total: 0 };
    }
    const data = await res.json();
    return { items: data.items || [], total: data.meta?.total ?? 0 };
  } catch (err) {
    console.error(`[kategori] listings fetch error for categoryId=${categoryId}:`, err);
    return { items: [], total: 0 };
  }
}

async function fetchAllL1Categories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/listings/meta/categories`, { next: { revalidate: 300 } });
    if (!res.ok) {
      console.error(`[kategori] categories fetch failed: ${res.status}`);
      return [];
    }
    const all: Category[] = await res.json();
    return all.filter(c => !c.parentId);
  } catch (err) {
    console.error('[kategori] categories fetch error:', err);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchCategoryData(slug);
  if (!data) return { title: 'Kategori Bulunamadı' };

  const { category } = data;
  const title = `İkinci El ${category.name} — Motorya`;
  const description = `İkinci el motosiklet ${category.name.toLowerCase()} al ya da sat. Türkiye genelinde güvenli ödeme, kargo takibi ile. Motorya'da ${category.name} ilanlarını incele.`;
  const canonical = `${BASE_URL}/kategori/${slug}`;

  return {
    title,
    description,
    keywords: [`ikinci el ${category.name}`, `motosiklet ${category.name}`, `${category.name} satış`, `${category.name} fiyatları`],
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

function conditionLabel(c: string) {
  const map: Record<string, string> = {
    NEW: 'Sıfır', LIKE_NEW: 'Sıfır Gibi', GOOD: 'İyi', FAIR: 'Makul', POOR: 'Kullanılmış',
  };
  return map[c] ?? c;
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [catData, l1Categories] = await Promise.all([
    fetchCategoryData(slug),
    fetchAllL1Categories(),
  ]);

  if (!catData) notFound();

  const { items: listings, total } = await fetchListings(catData.category.id);

  const { category, children } = catData;

  // L2 sayfasında parent L1'i bul, ve parent'ın alt kategorilerini getir
  const isL2 = !!category.parentId;
  const parentL1 = isL2 ? l1Categories.find(c => c.id === category.parentId) ?? null : null;
  const activeL1Slug = isL2 ? (parentL1?.slug ?? null) : slug;

  // L2 ise kardeş kategorileri (parent'ın children'ı) getir
  const siblingData = isL2 && parentL1 ? await fetchCategoryData(parentL1.slug) : null;
  const subcategories = isL2 ? (siblingData?.children ?? []) : children;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `İkinci El ${category.name}`,
    description: `İkinci el motosiklet ${category.name.toLowerCase()} al-sat. Motorya Türkiye motosiklet ekipman pazarı.`,
    url: `${BASE_URL}/kategori/${slug}`,
    numberOfItems: total,
    ...(listings.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: listings.slice(0, 10).map((l, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${BASE_URL}/ilan/${l.slug ?? l.id}`,
          name: l.title,
        })),
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="m-wrap" style={{ paddingBottom: 48 }}>

        {/* Breadcrumb */}
        <div style={{ padding: '20px 0 0', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 12.5 }}>
          <Link href="/" style={{ color: 'var(--ink-3)' }}>Keşfet</Link>
          <span style={{ opacity: 0.5 }}>›</span>
          {parentL1 && <>
            <Link href={`/kategori/${parentL1.slug}`} style={{ color: 'var(--ink-3)' }}>{parentL1.name}</Link>
            <span style={{ opacity: 0.5 }}>›</span>
          </>}
          <span style={{ color: 'var(--ink-2)' }}>{category.name}</span>
        </div>

        {/* Header */}
        <div style={{ padding: '16px 0 24px' }}>
          <h1 className="m-display" style={{ fontSize: 28, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <CatIcon slug={slug} size={40} /> İkinci El {category.name}
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14.5, margin: 0 }}>
            {total > 0 ? `${total.toLocaleString('tr-TR')} ilan bulundu` : 'Bu kategoride ilan bekleniyor'}
          </p>
        </div>

        {/* L1 kategori navigasyonu */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: subcategories.length > 0 ? 16 : 28 }}>
          {l1Categories.map(cat => (
            <Link key={cat.slug} href={`/kategori/${cat.slug}`} className="m-chip"
              style={{ height: 34, fontSize: 13, textDecoration: 'none',
                background: cat.slug === activeL1Slug ? 'var(--accent)' : undefined,
                color: cat.slug === activeL1Slug ? '#fff' : undefined }}>
              <CatIcon slug={cat.slug} size={21} /> {cat.name}
            </Link>
          ))}
        </div>

        {/* Alt kategoriler — L1'de children, L2'de kardeşler */}
        {subcategories.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Alt Kategoriler
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {subcategories.map(child => (
                <Link key={child.slug} href={`/kategori/${child.slug}`} className="m-chip"
                  style={{ height: 32, fontSize: 12.5, textDecoration: 'none',
                    border: '1px solid var(--accent)', color: 'var(--accent)',
                    background: child.slug === slug ? 'var(--accent)' : undefined,
                    ...(child.slug === slug ? { color: '#fff' } : {}) }}>
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* İlan grid */}
        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-3)' }}>
            <img src="/icons/empty-listing.png" alt="" width={100} height={100} style={{ objectFit: 'contain', marginBottom: 16, opacity: 0.85, display: 'block', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 18, marginBottom: 8 }}>Bu kategoride henüz ilan yok</p>
            <p style={{ fontSize: 14, marginBottom: 20 }}>İlk ilanı sen ver!</p>
            <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              İlan Ver
            </Link>
          </div>
        ) : (
          <>
            <div className="m-listing-grid" style={{ gap: 14 }}>
              {listings.map((listing, i) => (
                <>
                  <Link key={listing.id} href={`/ilan/${listing.slug ?? listing.id}`} style={{ textDecoration: 'none' }}>
                    <div className="m-surface" style={{ overflow: 'hidden', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                      <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--bg-3)', overflow: 'hidden' }}>
                        {listing.images?.[0] ? (
                          <Image src={listing.images[0].url} alt={listing.title} fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                            style={{ objectFit: 'cover' }} loading="lazy" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                            <CatIcon slug={slug} size={48} />
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
                  {(i + 1) % 8 === 0 && (
                    <div key={`ad-${i}`} style={{ gridColumn: '1/-1' }}>
                      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING ?? ''} format="auto" />
                    </div>
                  )}
                </>
              ))}
            </div>

            {/* Ara bağlantısı */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link href={`/ara?categoryId=${catData.category.id}`} className="m-btn"
                style={{ textDecoration: 'none', display: 'inline-flex' }}>
                Tümünü Gör & Filtrele
              </Link>
            </div>
          </>
        )}

        {/* Şehir linkleri — uzun kuyruk SEO */}
        <div style={{ marginTop: 48, marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 12 }}>
            Şehre Göre {category.name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CITIES.map(([citySlug, cityName]) => (
              <Link key={citySlug} href={`/kategori/${slug}/${citySlug}`} className="m-chip"
                style={{ height: 32, fontSize: 12.5, textDecoration: 'none' }}>
                {cityName}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 32, padding: '24px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--line-soft)', textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 18, margin: '0 0 8px' }}>
            Satmak istediğin {category.name} var mı?
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
