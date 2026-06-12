import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/data/blog';

const BASE_URL = 'https://motorya.com.tr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/ilan-ver`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/giris`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/kayit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

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
