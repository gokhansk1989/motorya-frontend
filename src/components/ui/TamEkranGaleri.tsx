'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

/**
 * İlan fotoğraflarının tam ekran görüntüleyicisi.
 *
 * Neden gerekli: ilan detayındaki görsel 4/3'lük bir kutuya sığdırılıyor.
 * İkinci el bir üründe alıcının bakmak istediği ayrıntı — çizik, aşınma,
 * dikiş — o boyutta seçilmiyor.
 *
 * ── NEDEN PORTAL ──────────────────────────────────────────────────
 *
 * Katman sırası `zIndex: 300` ile çözülmüş görünüyordu ama çözülmüyordu:
 * `.m-main` kuralı `position: relative; z-index: 1` içeriyor ve bu bir
 * YIĞILMA BAĞLAMI yaratıyor. Galerinin 300'ü o bağlamın içinde kalıyor,
 * üst menü ise bağlamın dışında 50'de duruyor — 50 > 1 olduğu için menü
 * galerinin üstüne biniyordu.
 *
 * Somut sonucu şuydu: kapat düğmesinin tam durduğu noktada
 * `elementFromPoint` menüdeki "İlan Ver" bağlantısını döndürüyordu.
 * Kullanıcı kapatmaya basınca ilan verme sayfasına gidiyordu (canlıda
 * 2026-10-22'de doğrulandı).
 *
 * Portal ile galeri `document.body` altına taşınıyor; artık hiçbir
 * yığılma bağlamının içinde değil, üst menünün, mobil alt menünün ve
 * yüzen düğmelerin üstünde açılıyor.
 */
interface Props {
  gorseller: { url: string }[];
  indeks: number;
  onIndeks: (i: number) => void;
  onKapat: () => void;
}

const ODAKLANABILIR = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function TamEkranGaleri({ gorseller, indeks, onIndeks, onKapat }: Props) {
  const dokunus = useRef<{ x: number; y: number } | null>(null);
  const kat = useRef<HTMLDivElement>(null);
  const acanOge = useRef<HTMLElement | null>(null);
  const [monte, setMonte] = useState(false);

  // Yakınlaştırma: tek seviye (1x / 2,5x). Yakınken parmak/fare sürükleme
  // kaydırıyor, kaydırarak fotoğraf değiştirme devre dışı kalıyor — aksi
  // halde ayrıntıya bakmak isterken fotoğraf atlanıyordu.
  const [olcek, setOlcek] = useState(1);
  const [konum, setKonum] = useState({ x: 0, y: 0 });
  const surukleme = useRef<{ x: number; y: number } | null>(null);

  const sifirla = useCallback(() => { setOlcek(1); setKonum({ x: 0, y: 0 }); }, []);

  const git = useCallback((i: number) => {
    sifirla();
    onIndeks(Math.max(0, Math.min(i, gorseller.length - 1)));
  }, [gorseller.length, onIndeks, sifirla]);

  // Odak diyaloga MONTE OLDUKTAN SONRA veriliyor. Portal ilk render'da
  // henuz yok (monte=false), bu yuzden ayni effect icinde odaklamak
  // sessizce bos geciyordu: klavye kullanicisi galeriyi aciyor ama
  // odagi sayfada kaliyordu.
  useEffect(() => {
    if (monte) kat.current?.focus();
  }, [monte]);

  useEffect(() => {
    setMonte(true);
    // Kapanınca odak, galeriyi açan öğeye dönsün: klavyeyle gezen biri
    // aksi halde sayfanın başına fırlıyor.
    acanOge.current = document.activeElement as HTMLElement | null;
    return () => { acanOge.current?.focus?.(); };
  }, []);

  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onKapat(); return; }
      if (e.key === 'ArrowRight') { git(indeks + 1); return; }
      if (e.key === 'ArrowLeft') { git(indeks - 1); return; }
      // Odak tuzağı: Tab galeriden dışarı çıkmasın. Dışarı çıkarsa
      // kullanıcı göremediği öğelere odaklanır ve nerede olduğunu
      // kaybeder.
      if (e.key === 'Tab' && kat.current) {
        const ogeler = [...kat.current.querySelectorAll<HTMLElement>(ODAKLANABILIR)];
        if (ogeler.length === 0) return;
        const ilk = ogeler[0], son = ogeler[ogeler.length - 1];
        if (e.shiftKey && document.activeElement === ilk) { e.preventDefault(); son.focus(); }
        else if (!e.shiftKey && document.activeElement === son) { e.preventDefault(); ilk.focus(); }
      }
    };
    window.addEventListener('keydown', tus);

    // Arkadaki sayfa kaymasın. Kaydırma çubuğunun genişliği kadar dolgu
    // ekleniyor: `overflow: hidden` tek başına sayfayı yatayda sıçratıyor.
    const eskiOverflow = document.body.style.overflow;
    const eskiPad = document.body.style.paddingRight;
    const fark = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (fark > 0) document.body.style.paddingRight = `${fark}px`;

    return () => {
      window.removeEventListener('keydown', tus);
      document.body.style.overflow = eskiOverflow;
      document.body.style.paddingRight = eskiPad;
    };
  }, [indeks, git, onKapat]);

  if (!gorseller.length || !monte) return null;

  const dugme: React.CSSProperties = {
    position: 'absolute',
    width: 48, height: 48, borderRadius: '50%',
    background: 'oklch(0 0 0 / 0.55)', border: '1px solid oklch(1 0 0 / 0.25)',
    display: 'grid', placeItems: 'center', color: '#fff', cursor: 'pointer',
    backdropFilter: 'blur(6px)',
  };

  const katman = (
    <div
      ref={kat}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotoğraf görüntüleyici, ${indeks + 1} / ${gorseller.length}`}
      tabIndex={-1}
      onClick={onKapat}
      onTouchStart={e => {
        if (olcek > 1) { surukleme.current = { x: e.touches[0].clientX - konum.x, y: e.touches[0].clientY - konum.y }; return; }
        dokunus.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchMove={e => {
        if (olcek > 1 && surukleme.current) {
          setKonum({ x: e.touches[0].clientX - surukleme.current.x, y: e.touches[0].clientY - surukleme.current.y });
        }
      }}
      onTouchEnd={e => {
        if (olcek > 1) { surukleme.current = null; return; }
        if (!dokunus.current) return;
        const dx = e.changedTouches[0].clientX - dokunus.current.x;
        const dy = e.changedTouches[0].clientY - dokunus.current.y;
        dokunus.current = null;
        // Dikey hareket yataydan büyükse bu bir kaydırma denemesi değil:
        // parmağını aşağı kaydıran kullanıcının fotoğrafı atlaması kötü.
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (dx < -50) git(indeks + 1);
        else if (dx > 50) git(indeks - 1);
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'oklch(0 0 0 / 0.94)',
        display: 'grid', placeItems: 'center',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Görsele tıklamak kapatmasın: yanlışlıkla kapanması can sıkıcı.
          Çift tıklama / çift dokunma yakınlaştırıyor. */}
      <img
        src={gorseller[indeks].url}
        alt={`Fotoğraf ${indeks + 1} / ${gorseller.length}`}
        onClick={e => e.stopPropagation()}
        onDoubleClick={e => {
          e.stopPropagation();
          olcek > 1 ? sifirla() : setOlcek(2.5);
        }}
        onMouseDown={e => {
          if (olcek > 1) { e.preventDefault(); surukleme.current = { x: e.clientX - konum.x, y: e.clientY - konum.y }; }
        }}
        onMouseMove={e => {
          if (olcek > 1 && surukleme.current) setKonum({ x: e.clientX - surukleme.current.x, y: e.clientY - surukleme.current.y });
        }}
        onMouseUp={() => { surukleme.current = null; }}
        onMouseLeave={() => { surukleme.current = null; }}
        style={{
          // Uzun ürünler (mont, bot) tam görünsün: `contain` kırpmıyor.
          maxWidth: '94vw',
          maxHeight: gorseller.length > 1 ? '74vh' : '86vh',
          objectFit: 'contain',
          transform: `translate(${konum.x}px, ${konum.y}px) scale(${olcek})`,
          transition: surukleme.current ? 'none' : 'transform 0.18s ease-out',
          cursor: olcek > 1 ? 'grab' : 'zoom-in',
          touchAction: 'none',
        }}
      />

      <button
        onClick={e => { e.stopPropagation(); onKapat(); }}
        aria-label="Görüntüleyiciyi kapat"
        style={{ ...dugme, top: 'max(14px, env(safe-area-inset-top))', right: 14 }}
      >
        <X size={22} aria-hidden="true" />
      </button>

      <button
        onClick={e => { e.stopPropagation(); olcek > 1 ? sifirla() : setOlcek(2.5); }}
        aria-label={olcek > 1 ? 'Uzaklaştır' : 'Yakınlaştır'}
        style={{ ...dugme, top: 'max(14px, env(safe-area-inset-top))', right: 72 }}
      >
        {olcek > 1 ? <ZoomOut size={20} aria-hidden="true" /> : <ZoomIn size={20} aria-hidden="true" />}
      </button>

      {gorseller.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); git(indeks - 1); }}
            aria-label="Önceki fotoğraf"
            disabled={indeks === 0}
            style={{ ...dugme, left: 14, top: '50%', transform: 'translateY(-50%)', opacity: indeks === 0 ? 0.3 : 1 }}
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); git(indeks + 1); }}
            aria-label="Sonraki fotoğraf"
            disabled={indeks === gorseller.length - 1}
            style={{ ...dugme, right: 14, top: '50%', transform: 'translateY(-50%)', opacity: indeks === gorseller.length - 1 ? 0.3 : 1 }}
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>

          {/* Küçük resimler + sayaç. Sayaç yalnız başına "kaç tane var"
              diyor; küçük resimler "hangisi nerede" diyor. İkisi aynı
              indekse bağlı, yani her zaman eşzamanlı. */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 'max(12px, env(safe-area-inset-bottom))',
              left: 0, right: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 10, padding: '0 12px',
            }}
          >
            <span style={{
              padding: '5px 12px', borderRadius: 999, color: '#fff', fontSize: 13,
              background: 'oklch(0 0 0 / 0.55)', border: '1px solid oklch(1 0 0 / 0.2)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {indeks + 1} / {gorseller.length}
            </span>
            <div
              role="tablist"
              aria-label="Fotoğraflar"
              style={{ display: 'flex', gap: 8, overflowX: 'auto', maxWidth: '100%', padding: '2px 4px' }}
            >
              {gorseller.map((g, i) => (
                <button
                  key={g.url + i}
                  role="tab"
                  aria-selected={i === indeks}
                  aria-label={`Fotoğraf ${i + 1}`}
                  onClick={e => { e.stopPropagation(); git(i); }}
                  style={{
                    width: 54, height: 54, flexShrink: 0, borderRadius: 10,
                    padding: 0, overflow: 'hidden', cursor: 'pointer',
                    // Seçili olan YALNIZCA renkle değil, kalınlık ve
                    // saydamlıkla da ayrışıyor.
                    border: i === indeks ? '2px solid #fff' : '1px solid oklch(1 0 0 / 0.25)',
                    opacity: i === indeks ? 1 : 0.55,
                    background: 'oklch(0 0 0 / 0.4)',
                  }}
                >
                  <img src={g.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Portal: `.m-main` yığılma bağlamından çıkıyoruz (yukarıdaki açıklama).
  return createPortal(katman, document.body);
}
