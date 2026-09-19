'use client';

import { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * İlan fotoğraflarının tam ekran görüntüleyicisi.
 *
 * Neden gerekli: ilan detayındaki görsel 4/3'lük bir kutuya sığdırılıyor.
 * İkinci el bir üründe alıcının bakmak istediği ayrıntı — çizik, aşınma,
 * dikiş — o boyutta seçilmiyor ve fotoğrafa tıklamak hiçbir şey
 * yapmıyordu. Mobil uygulamada bu ekran var; iki yüzeyin deneyimi
 * ayrışmasın diye web'de de aynısı.
 *
 * Klavye ile de kullanılabilir: Esc kapatır, ok tuşları gezinir. Fare
 * kullanmayan ya da kullanamayan biri için tek erişim yolu bu.
 */
interface Props {
  gorseller: { url: string }[];
  indeks: number;
  onIndeks: (i: number) => void;
  onKapat: () => void;
}

export function TamEkranGaleri({ gorseller, indeks, onIndeks, onKapat }: Props) {
  const dokunusX = useRef(0);

  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onKapat();
      else if (e.key === 'ArrowRight') onIndeks(Math.min(indeks + 1, gorseller.length - 1));
      else if (e.key === 'ArrowLeft') onIndeks(Math.max(indeks - 1, 0));
    };
    window.addEventListener('keydown', tus);

    // Arkadaki sayfa kaymasın: tam ekran bir katmanın altında sayfanın
    // kayması, kapatınca kullanıcıyı başka bir yere bırakır.
    const eskiOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', tus);
      document.body.style.overflow = eskiOverflow;
    };
  }, [indeks, gorseller.length, onIndeks, onKapat]);

  if (!gorseller.length) return null;

  const dugme: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 44, height: 44, borderRadius: '50%',
    background: 'oklch(1 0 0 / 0.16)', border: '1px solid oklch(1 0 0 / 0.2)',
    display: 'grid', placeItems: 'center', color: '#fff', cursor: 'pointer',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fotoğraf görüntüleyici"
      onClick={onKapat}
      onTouchStart={e => { dokunusX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - dokunusX.current;
        if (dx < -50) onIndeks(Math.min(indeks + 1, gorseller.length - 1));
        else if (dx > 50) onIndeks(Math.max(indeks - 1, 0));
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'oklch(0 0 0 / 0.94)',
        display: 'grid', placeItems: 'center',
      }}
    >
      {/* Görsele tıklamak kapatmasın: yanlışlıkla kapanması can sıkıcı. */}
      <img
        src={gorseller[indeks].url}
        alt=""
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '94vw', maxHeight: '88vh', objectFit: 'contain', cursor: 'default' }}
      />

      <button
        onClick={e => { e.stopPropagation(); onKapat(); }}
        aria-label="Kapat"
        style={{ ...dugme, top: 18, right: 18, transform: 'none' }}
      >
        <X size={20} />
      </button>

      {gorseller.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onIndeks(Math.max(0, indeks - 1)); }}
            aria-label="Önceki fotoğraf"
            disabled={indeks === 0}
            style={{ ...dugme, left: 18, opacity: indeks === 0 ? 0.35 : 1 }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onIndeks(Math.min(gorseller.length - 1, indeks + 1)); }}
            aria-label="Sonraki fotoğraf"
            disabled={indeks === gorseller.length - 1}
            style={{ ...dugme, right: 18, opacity: indeks === gorseller.length - 1 ? 0.35 : 1 }}
          >
            <ChevronRight size={22} />
          </button>
          <span style={{
            position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
            padding: '5px 12px', borderRadius: 999, color: '#fff', fontSize: 13,
            background: 'oklch(1 0 0 / 0.16)', border: '1px solid oklch(1 0 0 / 0.2)',
          }}>
            {indeks + 1} / {gorseller.length}
          </span>
        </>
      )}
    </div>
  );
}
