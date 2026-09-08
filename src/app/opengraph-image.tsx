import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Motorya — Türkiye\'nin Motosiklet Ekipman Pazarı';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        color: '#fff', padding: '80px',
      }}>
        <div style={{
          width: 140, height: 140, borderRadius: 32,
          background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 40, fontSize: 96, fontWeight: 800,
        }}>M</div>
        <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2, marginBottom: 20 }}>Motorya</div>
        <div style={{ fontSize: 36, opacity: 0.85, textAlign: 'center' }}>
          Türkiye'nin Motosiklet Ekipman Pazarı
        </div>
        <div style={{ marginTop: 40, fontSize: 24, opacity: 0.6 }}>
          Kask · Mont · Eldiven · Bot · Koruyucu
        </div>
      </div>
    ),
    { ...size }
  );
}
