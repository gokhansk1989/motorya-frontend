import type { Metadata } from 'next';
import ListingDetailClient from './ListingDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BASE_URL = 'https://motorya.com.tr';

interface ListingData {
  id: string;
  title: string;
  description: string;
  price: string | number;
  originalPrice?: string | number;
  condition: string;
  status: string;
  city?: string;
  images?: { url: string }[];
  category?: { name: string; slug?: string };
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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await fetchListing(params.id);
  if (!listing) return { title: 'İlan Bulunamadı' };

  const price = Number(listing.price).toLocaleString('tr-TR');
  const title = `${listing.title} — ${price} TL`;
  const description = listing.description
    ? listing.description.slice(0, 155) + (listing.description.length > 155 ? '…' : '')
    : `${listing.title} ilanı Motorya'da. ${price} TL fiyatıyla satışta.`;
  const canonical = `${BASE_URL}/ilan/${listing.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await fetchListing(params.id);

  const jsonLd = listing ? [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      image: listing.images?.map(i => i.url) ?? [],
      url: `${BASE_URL}/ilan/${listing.id}`,
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
        ...(listing.category ? [{ '@type': 'ListItem', position: 2, name: listing.category.name, item: `${BASE_URL}/kategori/${listing.category.slug}` }] : []),
        { '@type': 'ListItem', position: listing.category ? 3 : 2, name: listing.title, item: `${BASE_URL}/ilan/${listing.id}` },
      ],
    },
  ] : null;

  return (
    <>
      {jsonLd && jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ListingDetailClient />
    </>
  );
}
