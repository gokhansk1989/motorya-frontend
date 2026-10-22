'use client';
import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Check, X } from 'lucide-react';
import { getCroppedImageFile } from '@/lib/cropImage';
import { KART_ORANI, KART_ORANI_CSS, KADRAJ_ACIKLAMA } from '@/lib/gorselOran';

interface Props {
  file: File;
  onConfirm: (cropped: File) => void;
  onSkip: () => void;
}

export function CoverCropModal({ file, onConfirm, onSkip }: Props) {
  const [imageSrc] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    setProcessing(true);
    try {
      const cropped = await getCroppedImageFile(imageSrc, croppedArea, file.name.replace(/\.\w+$/, '') + '_cover.jpg');
      onConfirm(cropped);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.6)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ background: 'var(--bg-1)', borderRadius: 16, width: '100%', maxWidth: 480, overflow: 'hidden', border: '1px solid var(--line)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line-soft)' }}>
          <p className="m-display" style={{ fontSize: 16, margin: 0 }}>Kapak fotoğrafını ayarla</p>
          <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4 }}>
            {KADRAJ_ACIKLAMA}
          </p>
        </div>

        {/* Onizleme kutusu, kartin GERCEK oraninda. Sabit 320px yukseklik
            3:2'lik bir kutu uretiyordu; yani onizleme ne karedi ne de
            kartin orani. */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: KART_ORANI_CSS, maxHeight: '46vh', background: '#000' }}>
          <Cropper
            image={imageSrc}
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
            <label htmlFor="kadraj-zoom" style={{ fontSize: 12.5, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
              Yakınlaştır
            </label>
            <input
              id="kadraj-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Yakınlaştırma"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); }}
              className="m-btn m-btn-ghost"
              style={{ height: 32, padding: '0 10px', fontSize: 12.5 }}
            >
              Sıfırla
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '0 20px 20px' }}>
          <button onClick={onSkip} className="m-btn m-btn-ghost" style={{ flex: 1, gap: 6 }}>
            <X size={15} />Fotoğrafın tamamını göster
          </button>
          <button onClick={handleConfirm} disabled={processing || !croppedArea} className="m-btn m-btn-primary" style={{ flex: 1, gap: 6 }}>
            <Check size={15} />{processing ? 'İşleniyor…' : 'Kadrajı uygula'}
          </button>
        </div>
      </div>
    </div>
  );
}
