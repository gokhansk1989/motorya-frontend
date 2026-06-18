import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import ListingDetailClient from './ListingDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BASE_URL = 'https://motorya.com.tr';

// CUID pattern: starts with 'c', 25 alphanumeric chars
const CUID_RE = /c[a-z0-9]{24}/;

function extractId(slug: string): string | null {
  // Slug sonunda tam CUID varsa çıkar: "kask-kapali-kask-shoei-istanbul-cl9x3k2m..."
  const match = slug.match(new RegExp(`(${CUID_RE.source})$`));
  return match ? match[1] : null;
}

interface ListingData {
  id: string;
  title: string;
  description: string;
  price: string | number;
  originalPrice?: string | number;
  condition: string;
  status: string;
  city?: string;
  slug?: string;
  images?: { url: string }[];
  category?: { name: string; slug?: string; parentId?: string | null; parent?: { slug: string } | null };
  brand?: { name: string };
  seller?: { displayName: string };
}

async function fetchListing(id: string): Promise<ListingData | null> {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const id = extractId(params.slug);
  if (!id) return { title: 'İlan Bulunamadı' };

  const listing = await fetchListing(id);
  if (!listing) return { title: 'İlan Bulunamadı' };

  const canonicalSlug = listing.slug ?? listing.id;
  const canonical = `${BASE_URL}/ilan/${canonicalSlug}`;
  const price = Number(listing.price).toLocaleString('tr-TR');
  const title = `${listing.title} — ${price} TL | Motorya`;
  const description = listing.description
    ? listing.description.slice(0, 155) + (listing.description.length > 155 ? '…' : '')
    : `${listing.title} ilanı Motorya'da. ${price} TL fiyatıyla satışta.`;

  const keywords = [
    listing.title,
    listing.category?.name,
    listing.brand?.name,
    listing.city,
    'ikinci el', 'motosiklet ekipman',
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: listing.images?.length ? [{ url: listing.images[0].url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ListingDetailPage({ params }: { params: { slug: string } }) {
  const id = extractId(params.slug);

  // Eğer slug sadece bare CUID ise (eski link) → canonical slug'a yönlendir
  if (!id) notFound();

  const listing = await fetchListing(id!);
  if (!listing) notFound();

  // Canonical slug kontrolü: farklıysa 301 redirect
  const canonicalSlug = listing.slug ?? listing.id;
  if (params.slug !== canonicalSlug) {
    redirect(`/ilan/${canonicalSlug}`);
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      image: listing.images?.map(i => i.url) ?? [],
      url: `${BASE_URL}/ilan/${canonicalSlug}`,
      brand: listing.brand ? { '@type': 'Brand', name: listing.brand.name } : undefined,
      category: listing.category?.name,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'TRY',
        price: Number(listing.price),
        availability: listing.status === 'ACTIVE'
          ? 'https://schema.org/InStock'
          : listing.status === 'SOLD'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/OutOfStock',
        itemCondition: listing.condition === 'NEW'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
        seller: listing.seller ? { '@type': 'Person', name: listing.seller.displayName } : undefined,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: BASE_URL },
        ...(listing.category?.parent
          ? [{ '@type': 'ListItem', position: 2, name: listing.category.parent.slug, item: `${BASE_URL}/kategori/${listing.category.parent.slug}` }]
          : []),
        ...(listing.category
          ? [{ '@type': 'ListItem', position: listing.category.parent ? 3 : 2, name: listing.category.name, item: `${BASE_URL}/kategori/${listing.category.slug}` }]
          : []),
        { '@type': 'ListItem', position: listing.category ? (listing.category.parent ? 4 : 3) : 2, name: listing.title, item: `${BASE_URL}/ilan/${canonicalSlug}` },
      ],
    },
  ];

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ListingDetailClient />
    </>
  );
}
