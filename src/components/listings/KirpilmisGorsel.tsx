'use client';

import type { CSSProperties } from 'react';
import type { Kadraj } from '@/lib/gorselOran';

/**
 * Kadrajı uygulanmış görsel.
 *
 * ── NEDEN TÜRETİLMİŞ DOSYA YOK ────────────────────────────────────
 *
 * Kırpma eskiden yeni bir JPEG üretip onu yüklüyordu: orijinal
 * kayboluyor, kadraj geri alınamıyor ve aynı fotoğrafı yeniden
 * kadrajlamak isteyen kullanıcı zaten kırpılmış dosyanın üzerinden
 * kırpmak zorunda kalıyordu — her düzenlemede kalite düşüyordu.
 *
 * Artık kadraj yalnızca bir dikdörtgen (oransal, 0..1) ve görsel onu
 * CSS ile gösteriyor. Dosya tek, orijinal bozulmuyor, kadraj her an
 * kaldırılabiliyor.
 *
 * ── MATEMATİK ─────────────────────────────────────────────────────
 *
 * Kadraj dikdörtgenini kutuya tam oturtmak için görseli 1/w ve 1/h
 * oranında büyütüp sola/yukarı kaydırıyoruz. Kadraj kutunun oranına
 * göre seçildiği için görsel ESNEMİYOR: büyütme çarpanları doğal
 * en-boy oranını koruyor.
 */
export function KirpilmisGorsel({
  src,
  alt,
  kadraj,
  className,
  style,
  loading,
}: {
  src: string;
  alt: string;
  kadraj?: Kadraj | null;
  className?: string;
  style?: CSSProperties;
  loading?: 'lazy' | 'eager';
}) {
  if (!kadraj) {
    // Kadraj yok: fotoğrafın tamamı, bugünkü davranışın aynısı.
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
      />
    );
  }

  const { x, y, w, h } = kadraj;
  return (
    // Kırpma kutusu: taşan kısmı kesen tek yer burası.
    <span style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'block' }}>
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        style={{
          position: 'absolute',
          width: `${100 / w}%`,
          height: `${100 / h}%`,
          left: `${(-x / w) * 100}%`,
          top: `${(-y / h) * 100}%`,
          // Ölçüler zaten tam hesaplandığı için ek bir sığdırma yok.
          objectFit: 'fill',
          maxWidth: 'none',
          ...style,
        }}
      />
    </span>
  );
}
