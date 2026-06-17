import { MetadataRoute } from 'next';

const BASE_URL = 'https://motorya.com.tr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const CATEGORY_SLUGS = ['kask', 'mont', 'eldiven', 'bot', 'koruyucu', 'egzoz', 'aksesuar'];
  const CITY_SLUGS = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana', 'konya', 'gaziantep', 'mersin', 'kocaeli', 'diyarbakir', 'hatay', 'manisa', 'kayseri', 'samsun', 'balikesir', 'tekirdag', 'sakarya', 'denizli', 'eskisehir'];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/ilan-ver`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/giris`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/kayit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ...CATEGORY_SLUGS.map(slug => ({
      url: `${BASE_URL}/kategori/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
    // Şehir × kategori sayfaları (20 şehir × 7 kategori = 140 sayfa)
    ...CATEGORY_SLUGS.flatMap(slug =>
      CITY_SLUGS.map(sehir => ({
        url: `${BASE_URL}/kategori/${slug}/${sehir}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.75,
      }))
    ),
  ];

  // Blog posts from API
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://motorya.com.tr/api-backend';
    const res = await fetch(`${API}/blog?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      blogPages = (data.items || []).map((p: { slug: string; publishedAt?: string; createdAt: string }) => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.publishedAt || p.createdAt),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
    }
  } catch {}

  // Listings from API (best effort)
  let listingPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/listings?limit=200&page=1`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      listingPages = (data.items || []).map((l: { id: string; updatedAt?: string; createdAt: string }) => ({
        url: `${BASE_URL}/ilan/${l.id}`,
        lastModified: new Date(l.updatedAt || l.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {}

  return [...staticPages, ...blogPages, ...listingPages];
}
