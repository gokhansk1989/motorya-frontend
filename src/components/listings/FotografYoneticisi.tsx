'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, ImagePlus, Star, Crop, Trash2, ChevronLeft, ChevronRight, Check, RotateCcw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { fotoHataKodu } from '@/lib/olcum';
import { KART_ORANI_CSS, type Kadraj } from '@/lib/gorselOran';
import { KirpilmisGorsel } from './KirpilmisGorsel';
import { CoverCropModal } from './CoverCropModal';

/**
 * İlan fotoğraflarının yönetimi — ilan verme ve ilan düzenleme
 * ekranlarının ORTAK bileşeni.
 *
 * İki ekran aynı işi iki ayrı kodla yapıyordu: yeni ilanda kapak
 * seçme, sıralama ve kadraj vardı, düzenleme ekranında yoktu. Ortak
 * bileşen, birinde düzeltilen bir davranışın diğerinde eksik kalmasını
 * engelliyor.
 *
 * ── YÜKLEME KUYRUĞU ───────────────────────────────────────────────
 *
 * Tek bir "yükleniyor" göstergesi yerine her dosyanın kendi durumu
 * var: bekliyor / yükleniyor / tamam / hata. Sebebi şu: beş fotoğraf
 * seçip biri başarısız olunca kullanıcı hangisinin gitmediğini
 * bilemiyor, hepsini silip baştan deniyordu.
 *
 * Başarısız dosya listeye EKLENMİYOR — yalnızca kuyrukta hata olarak
 * duruyor ve "Tekrar dene" yalnızca onu yolluyor; başarılı olanlar
 * yeniden yüklenmiyor.
 *
 * Gerçek ilerleme yüzdesi YOK: axios yükleme ilerlemesi verebiliyor
 * ama sunucu işleme süresi (HEIC çözme, yeniden boyutlandırma) bunun
 * dışında kalıyor, yani yüzde %100'de takılıp bekliyor. Uydurma yüzde
 * göstermektense durumu göstermeyi tercih ediyoruz.
 */

export const EN_FAZLA_FOTO = 8;
/** Vekil sunucu isteğin tamamını 25 MB'da kesiyor; dosya başına tavan. */
export const DOSYA_SINIRI = 8 * 1024 * 1024;
const MB = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;

type KuyrukDurumu = 'bekliyor' | 'yukleniyor' | 'tamam' | 'hata';
type KuyrukOgesi = {
  id: string;
  dosya: File;
  durum: KuyrukDurumu;
  sebep?: string;
  onizleme: string;
};

export type FotografDurumu = {
  urller: string[];
  kadrajlar: Record<string, Kadraj>;
};

interface Props {
  deger: FotografDurumu;
  onDegis: (d: FotografDurumu) => void;
  /** Ölçüm olayı; bileşen hangi akışta olduğunu bilmek zorunda değil. */
  onOlcum?: (ad: 'yuklendi' | 'hata', veri: Record<string, unknown>) => void;
  /** Yükleme sürüyorken üst ekran "Devam"ı kilitleyebilsin. */
  onMesgul?: (mesgul: boolean) => void;
}

export function FotografYoneticisi({ deger, onDegis, onOlcum, onMesgul }: Props) {
  const { urller, kadrajlar } = deger;
  const [kuyruk, setKuyruk] = useState<KuyrukOgesi[]>([]);
  const [surukleniyor, setSurukleniyor] = useState(false);
  const [kadrajHedefi, setKadrajHedefi] = useState<string | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);
  const kameraRef = useRef<HTMLInputElement>(null);
  /** Aynı dosya için eşzamanlı ikinci yükleme başlamasın. */
  const calisan = useRef<Set<string>>(new Set());

  const mesgul = kuyruk.some(k => k.durum === 'yukleniyor' || k.durum === 'bekliyor');

  const guncelle = useCallback((y: Partial<FotografDurumu>) => {
    onDegis({ urller, kadrajlar, ...y });
  }, [urller, kadrajlar, onDegis]);

  /** Tek bir kuyruk öğesini yükler. Kuyruktaki durumu kendisi günceller. */
  const ogeyiYukle = useCallback(async (oge: KuyrukOgesi) => {
    if (calisan.current.has(oge.id)) return;        // çift tıklama koruması
    calisan.current.add(oge.id);
    setKuyruk(k => k.map(x => (x.id === oge.id ? { ...x, durum: 'yukleniyor', sebep: undefined } : x)));
    onMesgul?.(true);

    try {
      const form = new FormData();
      form.append('files', oge.dosya);
      const res = await api.post('/upload/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const gelen: string[] = res.data.urls ?? [];
      const hatalar: { kod: string; mesaj: string }[] = res.data.hatalar ?? [];

      if (gelen.length === 0) {
        const h = hatalar[0];
        onOlcum?.('hata', { hataKodu: h?.kod ?? 'bilinmiyor' });
        setKuyruk(k => k.map(x => (x.id === oge.id ? { ...x, durum: 'hata', sebep: h?.mesaj ?? 'Yüklenemedi' } : x)));
        return;
      }

      onOlcum?.('yuklendi', { adet: gelen.length });
      setKuyruk(k => k.map(x => (x.id === oge.id ? { ...x, durum: 'tamam' } : x)));
      // Başarılı dosya listeye şimdi giriyor: hatalı bir dosyanın
      // yüklenmiş gibi ilana eklenmesi mümkün değil.
      onDegis({ urller: [...urller, ...gelen].slice(0, EN_FAZLA_FOTO), kadrajlar });

      // Tamamlananı kısa süre sonra kuyruktan düşür; liste zaten
      // fotoğrafı gösteriyor, iki yerde durmasının anlamı yok.
      setTimeout(() => setKuyruk(k => k.filter(x => x.id !== oge.id)), 1200);
    } catch (err) {
      const kod = fotoHataKodu(err);
      onOlcum?.('hata', { hataKodu: kod });
      const m = (err as any)?.response?.data?.message;
      setKuyruk(k => k.map(x => (x.id === oge.id
        ? { ...x, durum: 'hata', sebep: typeof m === 'string' && m ? m : 'Bağlantı kurulamadı' }
        : x)));
    } finally {
      calisan.current.delete(oge.id);
      onMesgul?.(false);
    }
  }, [urller, kadrajlar, onDegis, onOlcum, onMesgul]);

  /** Seçilen dosyaları kuyruğa alır ve sırayla yükler. */
  const dosyalariAl = useCallback(async (secilen: FileList | File[] | null) => {
    if (!secilen) return;
    const hepsi = Array.from(secilen);
    if (hepsi.length === 0) return;

    // Sınır, KUYRUKLA BİRLİKTE hesaplanıyor: yüklenmeyi bekleyen
    // dosyalar sayılmazsa 8 sınırı aşılabiliyordu.
    const bekleyen = kuyruk.filter(k => k.durum !== 'hata').length;
    const kalan = EN_FAZLA_FOTO - urller.length - bekleyen;
    if (kalan <= 0) {
      toast.error(`En fazla ${EN_FAZLA_FOTO} fotoğraf ekleyebilirsin.`);
      return;
    }

    const buyuk = hepsi.filter(f => f.size > DOSYA_SINIRI);
    if (buyuk.length > 0) {
      onOlcum?.('hata', { hataKodu: 'boyut' });
      toast.error(
        buyuk.length === 1
          ? `Fotoğraf ${MB(buyuk[0].size)} — en fazla ${MB(DOSYA_SINIRI)} olabilir.`
          : `${buyuk.length} fotoğraf ${MB(DOSYA_SINIRI)} sınırını aşıyor.`,
      );
    }
    const uygun = hepsi.filter(f => f.size <= DOSYA_SINIRI).slice(0, kalan);
    if (uygun.length === 0) return;

    const yeniler: KuyrukOgesi[] = uygun.map((f, i) => ({
      id: `${Date.now()}-${i}-${f.name}-${f.size}`,
      dosya: f,
      durum: 'bekliyor',
      onizleme: URL.createObjectURL(f),
    }));
    setKuyruk(k => [...k, ...yeniler]);

    // Sırayla: paralel yükleme vekil sunucunun istek sınırına takılıyor
    // ve hangi dosyanın neden düştüğü anlaşılmıyordu.
    for (const y of yeniler) await ogeyiYukle(y);
  }, [kuyruk, urller.length, ogeyiYukle, onOlcum]);

  // ── Kapak / sıra / kaldırma ──────────────────────────────────────

  const kapakYap = (i: number) => {
    if (i === 0) return;
    const y = urller.slice();
    const [secilen] = y.splice(i, 1);
    // Kadrajlar ADRESE bağlı olduğu için sıra değişince taşınmıyor:
    // kapak değiştirmek bir fotoğrafın kadrajını diğerine vermiyor.
    guncelle({ urller: [secilen, ...y] });
    toast.success('Kapak değiştirildi');
  };

  const tasi = (i: number, yon: -1 | 1) => {
    const j = i + yon;
    if (j < 0 || j >= urller.length) return;
    const y = urller.slice();
    [y[i], y[j]] = [y[j], y[i]];
    guncelle({ urller: y });
  };

  const kaldir = (i: number) => {
    const kapaktiMi = i === 0;
    const silinen = urller[i];
    const y = urller.filter((_, j) => j !== i);
    const k = { ...kadrajlar };
    delete k[silinen];                 // kadrajı da bırakma
    guncelle({ urller: y, kadrajlar: k });
    if (kapaktiMi && y.length > 0) {
      toast('Kapak kaldırıldı — sıradaki fotoğraf kapak oldu', { icon: 'ℹ️' });
    }
  };

  const kadrajiUygula = (kadraj: Kadraj | null) => {
    const hedef = kadrajHedefi;
    setKadrajHedefi(null);
    if (!hedef) return;
    const k = { ...kadrajlar };
    if (kadraj) k[hedef] = kadraj;
    else delete k[hedef];              // "tamamını göster" → orijinale dön
    guncelle({ kadrajlar: k });
    toast.success(kadraj ? 'Kadraj kaydedildi' : 'Fotoğrafın tamamı gösterilecek');
  };

  const islemDugmesi = (pasif: boolean): React.CSSProperties => ({
    flex: '1 0 44px', height: 44, minWidth: 44, display: 'grid', placeItems: 'center',
    background: 'transparent', border: 0, borderRight: '1px solid var(--line-soft)',
    color: pasif ? 'var(--ink-3)' : 'var(--ink-2)',
    cursor: pasif ? 'default' : 'pointer', opacity: pasif ? 0.4 : 1,
  });

  const doluluk = urller.length + kuyruk.filter(k => k.durum !== 'hata').length;

  return (
    <div
      onDragOver={e => { e.preventDefault(); setSurukleniyor(true); }}
      onDragLeave={e => { if (e.currentTarget === e.target) setSurukleniyor(false); }}
      onDrop={e => { e.preventDefault(); setSurukleniyor(false); void dosyalariAl(e.dataTransfer.files); }}
      style={{
        outline: surukleniyor ? '2px dashed var(--accent)' : undefined,
        outlineOffset: surukleniyor ? -6 : undefined,
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', margin: 0, fontFamily: 'var(--font-display)' }}>
          Fotoğraflar
        </p>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: doluluk >= EN_FAZLA_FOTO ? 'var(--bad)' : 'var(--ink-3)' }}>
          {doluluk}/{EN_FAZLA_FOTO}
        </span>
      </div>

      {/* Sınırlar SEÇİMDEN ÖNCE. Öncesinde bunları öğrenmenin tek yolu
          dosyayı seçip reddedilmesini beklemekti. */}
      <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '0 0 14px', lineHeight: 1.55 }}>
        JPEG, PNG, WebP, HEIC · dosya başına en fazla {MB(DOSYA_SINIRI)} · en fazla {EN_FAZLA_FOTO} fotoğraf
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => dosyaRef.current?.click()} disabled={doluluk >= EN_FAZLA_FOTO}
          className="m-btn" style={{ flex: '1 1 150px', gap: 8, justifyContent: 'center', minHeight: 44 }}>
          <ImagePlus size={17} aria-hidden="true" /><span>Galeriden Seç</span>
        </button>
        <button type="button" onClick={() => kameraRef.current?.click()} disabled={doluluk >= EN_FAZLA_FOTO}
          className="m-btn" style={{ flex: '1 1 150px', gap: 8, justifyContent: 'center', minHeight: 44 }}>
          <Camera size={17} aria-hidden="true" /><span>Fotoğraf Çek</span>
        </button>
      </div>

      {urller.length > 0 && (
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '0 0 10px', lineHeight: 1.5 }}>
          İlk fotoğraf kapak olur. Ürünün tamamının göründüğü, aydınlık bir fotoğrafı kapak seç.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {urller.map((url, i) => (
          <div key={url} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--bg-2)', border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--line)' }}>
            {/* Önizleme KART ORANINDA ve KADRAJLI: satıcı kartta ne
                göreceğini burada görüyor. */}
            <div style={{ position: 'relative', aspectRatio: KART_ORANI_CSS, background: 'var(--bg-2)' }}>
              <KirpilmisGorsel src={url} alt={`Fotoğraf ${i + 1}`} kadraj={kadrajlar[url] ?? null} />
              {i === 0 && (
                <span style={{
                  position: 'absolute', top: 6, left: 6, fontSize: 10, fontWeight: 700,
                  fontFamily: 'var(--font-mono)', background: 'var(--accent)', color: 'var(--accent-ink)',
                  borderRadius: 5, padding: '3px 7px', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <Check size={11} aria-hidden="true" />KAPAK
                </span>
              )}
              {kadrajlar[url] && (
                <span style={{
                  position: 'absolute', bottom: 6, right: 6, fontSize: 10,
                  background: 'oklch(0 0 0 / 0.6)', color: '#fff', borderRadius: 5, padding: '3px 6px',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <Crop size={10} aria-hidden="true" />kadrajlı
                </span>
              )}
            </div>

            {/* İşlemler görselin ALTINDA; üstüne binen küçük düğmeler hem
                fotoğrafı örtüyor hem 44px dokunma hedefinin altında
                kalıyordu. Satır dar kartta sarıyor. */}
            <div style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid var(--line-soft)' }}>
              <button type="button" onClick={() => kapakYap(i)} disabled={i === 0}
                aria-label={i === 0 ? `${i + 1}. fotoğraf zaten kapak` : `${i + 1}. fotoğrafı kapak yap`}
                title={i === 0 ? 'Bu zaten kapak' : 'Kapak yap'} style={islemDugmesi(i === 0)}>
                <Star size={15} fill={i === 0 ? 'currentColor' : 'none'} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setKadrajHedefi(url)}
                aria-label={`${i + 1}. fotoğrafın kadrajını düzenle`} title="Kadrajı düzenle" style={islemDugmesi(false)}>
                <Crop size={15} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => tasi(i, -1)} disabled={i === 0}
                aria-label={`${i + 1}. fotoğrafı öne al`} title="Öne al" style={islemDugmesi(i === 0)}>
                <ChevronLeft size={15} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => tasi(i, 1)} disabled={i === urller.length - 1}
                aria-label={`${i + 1}. fotoğrafı geri al`} title="Geri al" style={islemDugmesi(i === urller.length - 1)}>
                <ChevronRight size={15} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => kaldir(i)}
                aria-label={`${i + 1}. fotoğrafı kaldır`} title="Kaldır"
                style={{ ...islemDugmesi(false), color: 'var(--bad)' }}>
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}

        {/* Kuyruktaki dosyalar: her biri kendi durumunu gösteriyor. */}
        {kuyruk.map(k => (
          <div key={k.id} style={{
            borderRadius: 12, overflow: 'hidden', background: 'var(--bg-2)',
            border: k.durum === 'hata' ? '1px solid var(--bad)' : '1px dashed var(--line)',
          }}>
            <div style={{ position: 'relative', aspectRatio: KART_ORANI_CSS, background: 'var(--bg-2)' }}>
              <img src={k.onizleme} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: k.durum === 'hata' ? 0.35 : 0.6 }} />
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                background: 'oklch(0 0 0 / 0.35)', color: '#fff', fontSize: 12, textAlign: 'center', padding: 8,
              }}>
                {/* Durum yalnızca RENKLE değil, simge ve yazıyla da
                    anlatılıyor. */}
                {k.durum === 'bekliyor' && <span>⏳ Sırada</span>}
                {k.durum === 'yukleniyor' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Yükleniyor
                  </span>
                )}
                {k.durum === 'tamam' && <span><Check size={14} aria-hidden="true" /> Tamamlandı</span>}
                {k.durum === 'hata' && <span><X size={14} aria-hidden="true" /> Yüklenemedi</span>}
              </div>
            </div>
            {k.durum === 'hata' && (
              <div style={{ padding: '8px 10px' }}>
                <p style={{ fontSize: 11.5, color: 'var(--bad)', margin: '0 0 8px', lineHeight: 1.45 }}>{k.sebep}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => void ogeyiYukle(k)}
                    aria-label="Bu fotoğrafı tekrar yüklemeyi dene"
                    className="m-btn" style={{ flex: 1, minHeight: 36, gap: 6, fontSize: 12.5 }}>
                    <RotateCcw size={13} aria-hidden="true" />Tekrar dene
                  </button>
                  <button type="button" onClick={() => setKuyruk(q => q.filter(x => x.id !== k.id))}
                    aria-label="Bu dosyadan vazgeç"
                    className="m-btn m-btn-ghost" style={{ minHeight: 36, fontSize: 12.5, padding: '0 10px' }}>
                    Vazgeç
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {kuyruk.some(k => k.durum === 'hata') && urller.length > 0 && (
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>
          Yüklenen fotoğraflar listende duruyor. Başarısız olanları tekrar deneyebilir ya da
          vazgeçip devam edebilirsin.
        </p>
      )}

      <input ref={dosyaRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { void dosyalariAl(e.target.files); e.target.value = ''; }} />
      <input ref={kameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={e => { void dosyalariAl(e.target.files); e.target.value = ''; }} />

      {kadrajHedefi && (
        <CoverCropModal
          src={kadrajHedefi}
          mevcut={kadrajlar[kadrajHedefi] ?? null}
          onConfirm={kadrajiUygula}
          onSkip={() => kadrajiUygula(null)}
          onIptal={() => setKadrajHedefi(null)}
        />
      )}
    </div>
  );
}
