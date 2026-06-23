import { MetadataRoute } from 'next';
import { CITY_MAP } from '@/lib/cities';

const BASE_URL = 'https://motorya.com.tr';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://motorya.com.tr/api-backend';

const CITY_SLUGS = Object.keys(CITY_MAP);

async function fetchAllListings() {
  const items: { id: string; slug?: string; updatedAt?: string; createdAt: string }[] = [];
  let page = 1;
  const limit = 500;
  try {
    while (true) {
      const res = await fetch(`${API}/listings?limit=${limit}&page=${page}`, {
        next: { revalidate: 1800 },
      });
      if (!res.ok) {
        console.error(`[sitemap] listings fetch failed: ${res.status}`);
        break;
      }
      const data = await res.json();
      const batch = data.items ?? [];
      items.push(...batch);
      if (batch.length < limit || items.length >= (data.meta?.total ?? 0)) break;
      page++;
    }
  } catch (err) {
    console.error('[sitemap] listings fetch error:', err);
  }
  return items;
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API}/listings/meta/categories`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const cats: { id: string; slug: string; parentId: string | null }[] = await res.json();
    return cats;
  } catch (err) {
    console.error('[sitemap] categories fetch error:', err);
    return [];
  }
}

async function fetchBlogPosts() {
  try {
    const res = await fetch(`${API}/blog?limit=500`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []) as { slug: string; publishedAt?: string; createdAt: string }[];
  } catch (err) {
    console.error('[sitemap] blog posts fetch error:', err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, categories, blogPosts] = await Promise.all([
    fetchAllListings(),
    fetchCategories(),
    fetchBlogPosts(),
  ]);

  const l1Cats = categories.filter(c => !c.parentId);
  const l2Cats = categories.filter(c => c.parentId);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                   lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/ara`,          lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.95 },
    { url: `${BASE_URL}/blog`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.85 },
    { url: `${BASE_URL}/ilan-ver`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/fiyat-alarm`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/giris`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/kayit`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // L1 kategori sayfaları (API'den, hardcoded değil)
  const l1Pages: MetadataRoute.Sitemap = l1Cats.map(c => ({
    url: `${BASE_URL}/kategori/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // L2 kategori sayfaları
  const l2Pages: MetadataRoute.Sitemap = l2Cats.map(c => ({
    url: `${BASE_URL}/kategori/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.75,
  }));

  // Şehir × L1 kategori sayfaları (en önemli long-tail)
  const cityPages: MetadataRoute.Sitemap = l1Cats.flatMap(c =>
    CITY_SLUGS.map(sehir => ({
      url: `${BASE_URL}/kategori/${c.slug}/${sehir}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  );

  // Blog yazıları
  const blogPages: MetadataRoute.Sitemap = blogPosts.map(p => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt || p.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // İlan sayfaları (slug ile, yeni ilanlar her 30dk güncellenir)
  const listingPages: MetadataRoute.Sitemap = listings.map(l => ({
    url: `${BASE_URL}/ilan/${l.slug ?? l.id}`,
    lastModified: new Date(l.updatedAt || l.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }));

  return [
    ...staticPages,
    ...l1Pages,
    ...l2Pages,
    ...cityPages,
    ...blogPages,
    ...listingPages,
  ];
}
