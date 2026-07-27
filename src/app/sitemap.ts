import { MetadataRoute } from 'next';
import { CITY_MAP } from '@/lib/cities';

const BASE_URL = 'https://motorya.com.tr';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://motorya.com.tr/api-backend';

// Şehir adı ("İstanbul") -> slug ("istanbul"). İlan kayıtları şehri görünen
// adıyla tuttuğu için sitemap'te slug'a çevirmek gerekiyor.
const CITY_SLUG_BY_NAME = new Map(
  Object.entries(CITY_MAP).map(([slug, name]) => [name.toLocaleLowerCase('tr'), slug]),
);

interface SitemapListing {
  id: string;
  slug?: string;
  updatedAt?: string;
  createdAt: string;
  categoryId?: string;
  city?: string;
}

async function fetchAllListings() {
  const items: SitemapListing[] = [];
  let page = 1;
  const limit = 50;
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

  // --- Envanter haritası -------------------------------------------------
  // Sitemap yalnızca gerçekten ilan barındıran sayfaları bildirir. Aksi halde
  // kategori × şehir kombinasyonlarının büyük çoğunluğu "sonuç bulunamadı"
  // gösterir; arama motorları bunu thin content / doorway page olarak
  // değerlendirip site geneline zarar verebilir. İlan eklendikçe ilgili
  // sayfalar sitemap'e kendiliğinden girer.
  const catById = new Map(categories.map(c => [c.id, c]));

  // Bir kategoride ilan varsa üst kategorileri de dolu sayılır.
  const catChain = (id?: string) => {
    const chain: typeof categories = [];
    let cur = id ? catById.get(id) : undefined;
    while (cur) {
      chain.push(cur);
      cur = cur.parentId ? catById.get(cur.parentId) : undefined;
    }
    return chain;
  };

  const populatedCatSlugs = new Set<string>();
  const populatedCityPaths = new Set<string>();

  for (const listing of listings) {
    const chain = catChain(listing.categoryId);
    chain.forEach(c => populatedCatSlugs.add(c.slug));

    const citySlug = listing.city
      ? CITY_SLUG_BY_NAME.get(listing.city.toLocaleLowerCase('tr'))
      : undefined;
    if (!citySlug) continue;
    // Şehir sayfaları yalnızca L1 kategoriler için üretiliyor.
    const l1 = chain.find(c => !c.parentId);
    if (l1) populatedCityPaths.add(`${l1.slug}/${citySlug}`);
  }

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

  // L2 kategori sayfaları — yalnızca ilan barındıranlar
  const l2Pages: MetadataRoute.Sitemap = l2Cats
    .filter(c => populatedCatSlugs.has(c.slug))
    .map(c => ({
      url: `${BASE_URL}/kategori/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.75,
    }));

  // Şehir × L1 kategori sayfaları (en önemli long-tail) — yalnızca ilan barındıranlar
  const cityPages: MetadataRoute.Sitemap = [...populatedCityPaths].map(path => ({
    url: `${BASE_URL}/kategori/${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

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
