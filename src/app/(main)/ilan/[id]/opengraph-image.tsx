import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Sıfır',
  LIKE_NEW: 'Sıfır Gibi',
  GOOD: 'İyi',
  FAIR: 'Makul',
  POOR: 'Kullanılmış',
};

async function fetchListing(id: string) {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function OgImage({ params }: { params: { id: string } }) {
  const listing = await fetchListing(params.id);

  const title = listing?.title ?? 'Motorya İlanı';
  const price = listing ? Number(listing.price).toLocaleString('tr-TR') + ' ₺' : '';
  const city = listing?.city;
  const condition = listing ? CONDITION_LABELS[listing.condition] ?? listing.condition : null;
  const photo = listing?.images?.[0]?.url;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#16100c',
          fontFamily: 'sans-serif',
        }}
      >
        {photo && (
          <img
            src={photo}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.55,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(22,16,12,0.25) 0%, rgba(22,16,12,0.55) 55%, rgba(22,16,12,0.96) 100%)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 40, left: 48, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#f5742b', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
            }}
          >
            M
          </div>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Motorya</span>
        </div>

        {/* Condition / city chips */}
        <div style={{ position: 'absolute', top: 44, right: 48, display: 'flex', gap: 10 }}>
          {condition && (
            <div style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 999, padding: '8px 18px', fontSize: 18, fontWeight: 600, color: '#fff',
            }}>
              {condition}
            </div>
          )}
          {city && (
            <div style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 999, padding: '8px 18px', fontSize: 18, fontWeight: 600, color: '#fff',
            }}>
              {city}
            </div>
          )}
        </div>

        {/* Title + price */}
        <div style={{ position: 'absolute', bottom: 48, left: 48, right: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.15,
            display: 'flex', maxWidth: 980,
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {title}
          </div>
          <div style={{ display: 'flex', fontSize: 52, fontWeight: 800, color: '#f5742b' }}>
            {price}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
