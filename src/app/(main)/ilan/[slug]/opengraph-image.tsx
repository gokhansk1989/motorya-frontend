import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { SSR_API_URL } from '@/lib/apiBase';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';


const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Sıfır',
  LIKE_NEW: 'Sıfır Gibi',
  GOOD: 'İyi',
  FAIR: 'Makul',
  POOR: 'Kullanılmış',
};

/**
 * Paylasim karti icin ilani getirir.
 *
 * ── UC AYRI HATA BIR ARADAYDI ─────────────────────────────────────
 *
 * Bu kart hicbir zaman ilani gosteremedi; her paylasilan baglanti
 * fotografsiz, fiyatsiz, "Motorya Ilani" yazan bos bir kart
 * uretiyordu. WhatsApp ve Instagram'da paylasilan her ilan boyle
 * gorunuyordu.
 *
 * 1. Route klasoru [slug] ama kod `params.id` okuyordu - her zaman
 *    undefined.
 * 2. Next 16'da `params` bir Promise; `await` edilmeden alan
 *    okunamaz.
 * 3. `/listings/<slug>` ucu yok, 404 doner. Dogrusu
 *    `/listings/by-slug?s=` - sayfanin kendisi zaten bunu kullaniyor.
 *
 * Ucu birden ayni anda sessizce basarisiz oldugu icin kart hic
 * patlamadi, yalnizca bos cikti.
 */
async function fetchListingBySlug(slug: string) {
  try {
    const res = await fetch(`${SSR_API_URL}/listings/by-slug?s=${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Ilan fotografini karta gomulebilir hale getirir.
 *
 * Yukleme hatti her fotografi WebP'ye ceviriyor; next/og'un altindaki
 * satori ise uzak gorselleri kendi cozucusuyle okuyor ve WebP'yi
 * desteklemiyor. Sonuc sessiz: kart uretiliyor ama arka plan bos
 * kaliyor.
 *
 * Bu yuzden gorseli burada sunucu tarafinda JPEG'e cevirip veri
 * adresi olarak gomuyoruz. Kart zaten 1200x630 oldugu icin ayrica
 * kuculuyor - hem satori'nin isi kolaylasiyor hem cikti kucuk kaliyor.
 *
 * Basarisiz olursa `null` donuyor ve kart fotografsiz ciziliyor:
 * paylasim kartinin hic uretilememesi, fotografsiz uretilmesinden
 * cok daha kotu.
 */
async function gorseliGom(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const ham = Buffer.from(await res.arrayBuffer());
    const jpeg = await sharp(ham)
      .resize({ width: size.width, height: size.height, fit: 'cover' })
      .jpeg({ quality: 78 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await fetchListingBySlug(slug);

  const title = listing?.title ?? 'Motorya İlanı';
  // "TL" yaziyoruz: satori'nin varsayilan fontunda ₺ glifi yok ve
  // fiyat "5.000 ▯" diye ciziliyordu. Font gomup kartin agirligini
  // artirmaktansa, Turkce'de zaten dogal olan kisaltma.
  const price = listing ? Number(listing.price).toLocaleString('tr-TR') + ' TL' : '';
  const city = listing?.city;
  const condition = listing ? CONDITION_LABELS[listing.condition] ?? listing.condition : null;
  const photo = listing?.images?.[0]?.url ? await gorseliGom(listing.images[0].url) : null;

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
          /* width/height ACIKCA veriliyor: next/og uzak bir gorselin
             boyutunu kendiliginden cozemiyor ve "Image size cannot be
             determined" ile tum karti dusuruyor. Bu yol daha once hic
             calismadigi icin (ilan zaten yuklenemiyordu) hata hic
             gorulmemisti. */
          <img
            src={photo}
            alt=""
            width={size.width}
            height={size.height}
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
