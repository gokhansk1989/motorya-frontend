import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { CategoryIcon as CatIcon } from '@/components/icons/CategoryIcons';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://motorya.com.tr/api-backend';

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API}/listings/meta/category/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error(`[kategori/${slug}/marka] category fetch failed: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[kategori/${slug}/marka] category fetch error:`, err);
    return null;
  }
}

async function getBrandsForCategory(categorySlug: string) {
  try {
    const res = await fetch(`${API}/listings/meta/brands-by-category/${categorySlug}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error(`[kategori/${categorySlug}/marka] brands fetch failed: ${res.status}`);
      return [];
    }
    return res.json();
  } catch (err) {
    console.error(`[kategori/${categorySlug}/marka] brands fetch error:`, err);
    return [];
  }
}

async function getListings(categorySlug: string, brandSlug: string) {
  try {
    const [category, brands] = await Promise.all([
      getCategory(categorySlug),
      getBrandsForCategory(categorySlug),
    ]);
    if (!category) return { items: [], total: 0 };
    const brand = (brands as any[]).find((b: any) => b.slug === brandSlug);
    if (!brand) return { items: [], total: 0 };
    const res = await fetch(
      `${API}/listings?categoryId=${category.id}&brandId=${brand.id}&limit=24&sort=newest`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) {
      console.error(`[kategori/${categorySlug}/marka/${brandSlug}] listings fetch failed: ${res.status}`);
      return { items: [], total: 0 };
    }
    return res.json();
  } catch (err) {
    console.error(`[kategori/${categorySlug}/marka/${brandSlug}] listings fetch error:`, err);
    return { items: [], total: 0 };
  }
}

interface Props { params: Promise<{ slug: string; brand: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug, brand: brandSlug } = await params;
  const [category, brands] = await Promise.all([getCategory(slug), getBrandsForCategory(slug)]);
  if (!category?.name) return {};
  const brand = (brands as any[]).find((b: any) => b.slug === brandSlug);
  if (!brand?.name) return {};
  const catName = category.name as string;
  const brandName = brand.name as string;
  const title = `İkinci El ${brandName} ${catName} | Motorya`;
  const description = `Motorya'da ${brandName} ${catName} ilanları. İkinci el ${brandName} ${catName.toLowerCase()} al sat, güvenli ödeme ve kargo ile.`;
  return {
    title,
    description,
    keywords: `${brandName} ${catName} ikinci el, ${brandName} ${catName.toLowerCase()} fiyatları, ikinci el ${brandName}`,
    openGraph: { title, description, url: `https://motorya.com.tr/kategori/${slug}/marka/${brandSlug}` },
  };
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export default async function CategoryBrandPage({ params }: Props) {
  const { slug, brand: brandSlug } = await params;
  const [category, brands] = await Promise.all([getCategory(slug), getBrandsForCategory(slug)]);
  if (!category) notFound();
  const brand = (brands as any[]).find((b: any) => b.slug === brandSlug);
  if (!brand) notFound();

  const data = await getListings(slug, brandSlug);
  const listings: any[] = data.items ?? [];

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: `İkinci El ${brand.name} ${category.name}`,
    description: `Motorya'da ${brand.name} ${category.name} ilanları`,
    url: `https://motorya.com.tr/kategori/${slug}/marka/${brandSlug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="m-wrap" style={{ paddingTop: 28, paddingBottom: 64 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 12.5, marginBottom: 20, flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--ink-3)' }}>Keşfet</Link>
          <ChevronRight size={13} style={{ opacity: 0.5 }} />
          <Link href={`/kategori/${slug}`} style={{ color: 'var(--ink-3)' }}>{category.name}</Link>
          <ChevronRight size={13} style={{ opacity: 0.5 }} />
          <span style={{ color: 'var(--ink-2)' }}>{brand.name}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="m-display" style={{ fontSize: 'clamp(24px, 4vw, 36px)', margin: '0 0 8px' }}>
            <CatIcon slug={slug} size={36} /> İkinci El {brand.name} {category.name}
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14.5 }}>
            {listings.length > 0 ? `${data.total ?? listings.length} ilan bulundu` : 'Bu kombinasyon için ilan bekleniyor'}
          </p>
        </div>

        {/* Diğer markalar */}
        {brands.length > 1 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Diğer Markalar</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(brands as any[]).map((b: any) => (
                <Link key={b.slug} href={`/kategori/${slug}/marka/${b.slug}`}
                  className="m-chip"
                  style={{ height: 32, fontSize: 12.5, textDecoration: 'none',
                    background: b.slug === brandSlug ? 'var(--accent)' : undefined,
                    color: b.slug === brandSlug ? '#fff' : undefined }}>
                  {b.name} <span style={{ opacity: 0.6, fontSize: 11 }}>({b.listingCount})</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* İlan grid */}
        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-3)' }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>Henüz {brand.name} {category.name} ilanı yok</p>
            <p style={{ fontSize: 14, marginBottom: 20 }}>İlk ilanı sen ver!</p>
            <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              İlan Ver
            </Link>
          </div>
        ) : (
          <div className="m-listing-grid">
            {listings.map((listing: any) => {
              const listingSlug = listing.slug ?? `${listing.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${listing.id.slice(-6)}`;
              return (
                <Link key={listing.id} href={`/ilan/${listingSlug}`} style={{ textDecoration: 'none' }}>
                  <div className="m-surface" style={{ overflow: 'hidden', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                    <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--bg-3)', overflow: 'hidden' }}>
                      {listing.images?.[0] ? (
                        <Image src={listing.images[0].url} alt={listing.title} fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                          style={{ objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}><CatIcon slug={slug} size={48} /></div>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, margin: '0 0 6px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {listing.title}
                      </p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--accent)', margin: 0 }}>
                        {Number(listing.price).toLocaleString('tr-TR')} ₺
                      </p>
                      {listing.city && <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4 }}>{listing.city}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
