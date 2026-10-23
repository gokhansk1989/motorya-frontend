'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Check, Maximize2, X } from 'lucide-react';
import { KART_ORANI, KART_ORANI_CSS, KADRAJ_ACIKLAMA, type Kadraj } from '@/lib/gorselOran';

/**
 * Kapak kadrajı seçici.
 *
 * ── ESKİDEN NE YAPIYORDU ──────────────────────────────────────────
 *
 * Seçilen alandan yeni bir JPEG üretip onu yüklüyordu. Üç sonucu
 * vardı: orijinal kayboluyordu, kadraj geri alınamıyordu ve aynı
 * fotoğrafı yeniden kadrajlamak isteyen kullanıcı zaten kırpılmış
 * dosyanın üzerinden kırpıyordu — her turda kalite düşüyordu.
 *
 * Artık yalnızca bir DİKDÖRTGEN döndürüyor: oransal (0..1), orijinale
 * göre. Dosya üretilmiyor, orijinal bozulmuyor, kadraj her an
 * kaldırılabiliyor.
 */
interface Props {
  /** Kadrajlanacak görselin adresi (her zaman ORİJİNAL). */
  src: string;
  /** Daha önce seçilmiş kadraj — bilgi amaçlı gösterilir. */
  mevcut?: Kadraj | null;
  onConfirm: (kadraj: Kadraj) => void;
  /** "Fotoğrafın tamamını göster" — kadrajı kaldırır. */
  onSkip: () => void;
  /** Vazgeç: hiçbir şey değişmez. */
  onIptal: () => void;
}

export function CoverCropModal({ src, mevcut, onConfirm, onSkip, onIptal }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [alan, setAlan] = useState<Kadraj | null>(null);
  const kat = useRef<HTMLDivElement>(null);

  /**
   * react-easy-crop iki değer veriyor: yüzdelik alan ve piksel alanı.
   * YÜZDELİĞİ alıyoruz — piksel, görselin o anki çözünürlüğüne bağlı
   * ve farklı ekranlarda farklı sonuç verirdi.
   */
  const onCropComplete = useCallback((yuzde: Area) => {
    setAlan({
      x: Math.max(0, yuzde.x / 100),
      y: Math.max(0, yuzde.y / 100),
      w: Math.min(1, yuzde.width / 100),
      h: Math.min(1, yuzde.height / 100),
    });
  }, []);

  // Escape ile vazgeçmek önceki kadrajı korur.
  useEffect(() => {
    const t = (e: KeyboardEvent) => { if (e.key === 'Escape') onIptal(); };
    window.addEventListener('keydown', t);
    const eski = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    kat.current?.focus();
    return () => { window.removeEventListener('keydown', t); document.body.style.overflow = eski; };
  }, [onIptal]);

  return (
    <div
      ref={kat}
      role="dialog"
      aria-modal="true"
      aria-label="Kapak kadrajını ayarla"
      tabIndex={-1}
      style={{
        position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.65)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{ background: 'var(--bg-1)', borderRadius: 16, width: '100%', maxWidth: 520, overflow: 'hidden', border: '1px solid var(--line)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line-soft)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="m-display" style={{ fontSize: 16, margin: 0 }}>Kapak kadrajını ayarla</p>
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>{KADRAJ_ACIKLAMA}</p>
          </div>
          <button type="button" onClick={onIptal} aria-label="Vazgeç"
            style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer', flexShrink: 0 }}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Önizleme kutusu kartın GERÇEK oranında (4/3.4). */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: KART_ORANI_CSS, maxHeight: '46vh', background: '#000' }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={KART_ORANI}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label htmlFor="kadraj-zoom" style={{ fontSize: 12.5, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>Yakınlaştır</label>
            <input id="kadraj-zoom" type="range" min={1} max={3} step={0.05} value={zoom}
              onChange={e => setZoom(Number(e.target.value))} aria-label="Yakınlaştırma" style={{ flex: 1 }} />
            <button type="button" onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); }}
              className="m-btn m-btn-ghost" style={{ height: 36, padding: '0 10px', fontSize: 12.5 }}>
              Sıfırla
            </button>
          </div>
          {mevcut && (
            <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.45 }}>
              Bu fotoğrafın kayıtlı bir kadrajı var. Yeni seçim her zaman ORİJİNAL fotoğraf
              üzerinden yapılır; kırpılmış dosya üzerinden değil.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '0 20px 20px', flexWrap: 'wrap' }}>
          <button onClick={onSkip} className="m-btn m-btn-ghost" style={{ flex: '1 1 180px', gap: 6, minHeight: 44 }}>
            <Maximize2 size={15} aria-hidden="true" />Fotoğrafın tamamını göster
          </button>
          <button onClick={() => alan && onConfirm(alan)} disabled={!alan}
            className="m-btn m-btn-primary" style={{ flex: '1 1 150px', gap: 6, minHeight: 44 }}>
            <Check size={15} aria-hidden="true" />Kadrajı uygula
          </button>
        </div>
      </div>
    </div>
  );
}
