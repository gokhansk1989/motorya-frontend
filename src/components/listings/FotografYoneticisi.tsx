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
  /** Hata kodu: aynı dosyayla tekrar denemenin faydası var mı? */
  kod?: string;
  onizleme: string;
};

/**
 * Aynı dosyayla tekrar denemek anlamsız olan hatalar.
 *
 * Biçim desteklenmiyorsa dosya ikinci denemede de desteklenmeyecek;
 * "Tekrar dene" sunmak kullanıcıyı boşuna uğraştırır. Ağ ve sunucu
 * hatalarında ise tekrar denemek gerçekten işe yarar.
 */
const TEKRAR_FAYDASIZ = ['tip', 'bozuk', 'heic', 'boyut'];

/** Kullanıcıya gösterilecek hata metni — iç ayrıntı sızdırmadan. */
function hataMetni(kod: string): string {
  switch (kod) {
    case 'ag':
      return 'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.';
    case 'boyut':
      return 'Dosya çok büyük.';
    case 'limit':
      return 'Çok hızlı denendi. Biraz bekleyip tekrar dene.';
    case 'sunucu':
      return 'Sunucuda bir sorun oldu. Birazdan tekrar dene.';
    case 'tip':
      return 'Bu dosya desteklenmiyor. JPEG, PNG, WebP veya HEIC fotoğraf seç.';
    default:
      return 'Fotoğraf yüklenemedi.';
  }
}

export type FotografDurumu = {
  urller: string[];
  kadrajlar: Record<string, Kadraj>;
  /**
   * Kapak olarak secilen fotografin ADRESI.
   *
   * Onceden kapak "dizinin ilk ogesi" idi; ikinci fotografi kapak
   * yapmak onu basa tasiyor, yani saticinin kurdugu sirayi bozuyordu.
   * Artik kapak secmek sirayi, sira degistirmek de kapagi etkilemiyor.
   */
  kapak: string | null;
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
  // Secili kapak listede yoksa (silinmisse) ilk fotograf kapak sayilir.
  const kapak = deger.kapak && urller.includes(deger.kapak) ? deger.kapak : (urller[0] ?? null);
  const [kuyruk, setKuyruk] = useState<KuyrukOgesi[]>([]);
  const [surukleniyor, setSurukleniyor] = useState(false);
  const [kadrajHedefi, setKadrajHedefi] = useState<string | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);
  const kameraRef = useRef<HTMLInputElement>(null);
  /** Aynı dosya için eşzamanlı ikinci yükleme başlamasın. */
  const calisan = useRef<Set<string>>(new Set());

  const mesgul = kuyruk.some(k => k.durum === 'yukleniyor' || k.durum === 'bekliyor');

  const guncelle = useCallback((y: Partial<FotografDurumu>) => {
    onDegis({ urller, kadrajlar, kapak, ...y });
  }, [urller, kadrajlar, kapak, onDegis]);

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
        setKuyruk(k => k.map(x => (x.id === oge.id
          ? { ...x, durum: 'hata', kod: h?.kod, sebep: h?.mesaj ?? hataMetni(h?.kod ?? '') }
          : x)));
        return;
      }

      onOlcum?.('yuklendi', { adet: gelen.length });
      setKuyruk(k => k.map(x => (x.id === oge.id ? { ...x, durum: 'tamam' } : x)));
      // Başarılı dosya listeye şimdi giriyor: hatalı bir dosyanın
      // yüklenmiş gibi ilana eklenmesi mümkün değil.
      const yeniUrller = [...urller, ...gelen].slice(0, EN_FAZLA_FOTO);
      // Ilk fotograf yuklendiginde kapak kendiliginden o oluyor.
      onDegis({ urller: yeniUrller, kadrajlar, kapak: kapak ?? yeniUrller[0] ?? null });

      // Tamamlananı kısa süre sonra kuyruktan düşür; liste zaten
      // fotoğrafı gösteriyor, iki yerde durmasının anlamı yok.
      setTimeout(() => setKuyruk(k => k.filter(x => x.id !== oge.id)), 1200);
    } catch (err) {
      const kod = fotoHataKodu(err);
      onOlcum?.('hata', { hataKodu: kod });
      // Sunucu metni varsa onu gosteriyoruz (zaten kullanici dilinde);
      // yoksa koda gore hazir metin. Ic hata ayrintisi (yigin izi,
      // kod adi) asla kullaniciya gitmiyor.
      const m = (err as any)?.response?.data?.message;
      setKuyruk(k => k.map(x => (x.id === oge.id
        ? { ...x, durum: 'hata', kod, sebep: typeof m === 'string' && m ? m : hataMetni(kod) }
        : x)));
    } finally {
      calisan.current.delete(oge.id);
      onMesgul?.(false);
    }
  }, [urller, kadrajlar, kapak, onDegis, onOlcum, onMesgul]);

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

  /**
   * Kapak yap.
   *
   * Yalnizca isaret degisiyor; fotograf YERINDEN OYNAMIYOR. Eskiden
   * secilen fotograf basa tasiniyordu ve satici her kapak degisiminde
   * kurdugu sirayi kaybediyordu.
   */
  const kapakYap = (url: string) => {
    if (url === kapak) return;
    guncelle({ kapak: url });
    toast.success('Kapak değiştirildi');
  };

  /** Siralama. Kapak ADRESE bagli oldugu icin bu islem kapagi
   *  degistirmiyor - fotograf nereye giderse gitsin kapak odur. */
  const tasi = (i: number, yon: -1 | 1) => {
    const j = i + yon;
    if (j < 0 || j >= urller.length) return;
    const y = urller.slice();
    [y[i], y[j]] = [y[j], y[i]];
    guncelle({ urller: y });
  };

  const kaldir = (i: number) => {
    const silinen = urller[i];
    const kapaktiMi = silinen === kapak;
    const y = urller.filter((_, j) => j !== i);
    const k = { ...kadrajlar };
    delete k[silinen];                 // kadrajı da bırakma
    const yeniKapak = kapaktiMi ? (y[0] ?? null) : kapak;
    guncelle({ urller: y, kadrajlar: k, kapak: yeniKapak });
    if (kapaktiMi && y.length > 0) {
      toast('Kapak kaldırıldı — listedeki ilk fotoğraf kapak oldu', { icon: 'ℹ️' });
    }
  };

  const kadrajiUygula = (kadraj: Kadraj | null) => {
    const hedef = kadrajHedefi;
    setKadrajHedefi(null);
    // Odak, pencereyi acan "Kadraj" dugmesine donuyor: klavyeyle
    // gezen kullanici aksi halde sayfanin basina dusuyordu.
    if (hedef) setTimeout(() => kadrajDugmeleri.current[hedef]?.focus(), 0);
    if (!hedef) return;
    const k = { ...kadrajlar };
    if (kadraj) k[hedef] = kadraj;
    else delete k[hedef];              // "tamamını göster" → orijinale dön
    guncelle({ kadrajlar: k });
    toast.success(kadraj ? 'Kadraj kaydedildi' : 'Fotoğrafın tamamı gösterilecek');
  };

  /** Ikon + kisa yazi. Dokunma hedefi 44px'in altina dusmuyor. */
  const islemDugmesi = (pasif: boolean): React.CSSProperties => ({
    // Her satirda IKI dugme. `1 0 auto` ile etiket uzunluguna gore
    // sariyordu: "Kapak yap" genis oldugu icin bir kartta 3, digerinde
    // 2 satir olusuyor ve ayni izgaradaki kartlar farkli yukseklige
    // geliyordu.
    flex: '1 1 calc(50% - 1px)', minHeight: 44, minWidth: 44,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    padding: '0 8px', fontSize: 11.5, lineHeight: 1.1, whiteSpace: 'nowrap',
    background: 'transparent', border: 0, borderRight: '1px solid var(--line-soft)',
    color: pasif ? 'var(--ink-3)' : 'var(--ink-2)',
    cursor: pasif ? 'default' : 'pointer', opacity: pasif ? 0.4 : 1,
  });

  /** Kadraj penceresi kapaninca odagin donecegi dugmeler. */
  const kadrajDugmeleri = useRef<Record<string, HTMLButtonElement | null>>({});

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
          Kapak, kartlarda ve paylaşımlarda görünen fotoğraftır — sıradan bağımsızdır.
          Ürünün tamamının göründüğü, aydınlık bir fotoğrafı kapak seç.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {urller.map((url, i) => {
          const buKapak = url === kapak;
          return (
          <div key={url} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--bg-2)', border: buKapak ? '2px solid var(--accent)' : '1px solid var(--line)' }}>
            {/* Önizleme KART ORANINDA ve KADRAJLI: satıcı kartta ne
                göreceğini burada görüyor. */}
            <div style={{ position: 'relative', aspectRatio: KART_ORANI_CSS, background: 'var(--bg-2)' }}>
              <KirpilmisGorsel src={url} alt={`Fotoğraf ${i + 1}`} kadraj={kadrajlar[url] ?? null} />
              {buKapak && (
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

            {/* Islemler YAZIYLA.
                Onceden yalnizca ikon vardi; erisilebilir adlar
                doluydu ama ekranda goren kullanici ne oldugunu ancak
                uzerine gelerek anlayabiliyordu - mobilde bu hic
                mumkun degil. */}
            <div style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid var(--line-soft)' }}>
              <button type="button" onClick={() => kapakYap(url)} disabled={buKapak}
                aria-label={buKapak ? `${i + 1}. fotoğraf zaten kapak` : `${i + 1}. fotoğrafı kapak yap`}
                style={islemDugmesi(buKapak)}>
                <Star size={14} fill={buKapak ? 'currentColor' : 'none'} aria-hidden="true" />
                <span>{buKapak ? 'Kapak' : 'Kapak yap'}</span>
              </button>
              <button type="button" onClick={() => setKadrajHedefi(url)}
                aria-label={`${i + 1}. fotoğrafın kadrajını düzenle`} style={islemDugmesi(false)}
                ref={el => { kadrajDugmeleri.current[url] = el; }}>
                <Crop size={14} aria-hidden="true" /><span>Kadraj</span>
              </button>
              <button type="button" onClick={() => tasi(i, -1)} disabled={i === 0}
                aria-label={`${i + 1}. fotoğrafı öne al`} style={islemDugmesi(i === 0)}>
                <ChevronLeft size={14} aria-hidden="true" /><span>Öne</span>
              </button>
              <button type="button" onClick={() => tasi(i, 1)} disabled={i === urller.length - 1}
                aria-label={`${i + 1}. fotoğrafı geri al`} style={islemDugmesi(i === urller.length - 1)}>
                <ChevronRight size={14} aria-hidden="true" /><span>Geri</span>
              </button>
              {/* Silme digerlerinden AYRI: tam genislikte, kirmizi ve
                  ustte ince bir ayracla. Geri alinamayan tek islem. */}
              <button type="button" onClick={() => kaldir(i)}
                aria-label={`${i + 1}. fotoğrafı kaldır`}
                style={{ ...islemDugmesi(false), flex: '1 0 100%', borderRight: 0, borderTop: '1px solid var(--line-soft)', color: 'var(--bad)' }}>
                <Trash2 size={14} aria-hidden="true" /><span>Kaldır</span>
              </button>
            </div>
          </div>
          );
        })}

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
                {/* Hangi dosyanın başarısız olduğu yazıyor: beş dosya
                    seçildiğinde "bir tanesi olmadı" demek yetmiyor. */}
                <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', margin: '0 0 3px', wordBreak: 'break-all' }}>
                  {k.dosya.name}
                </p>
                <p style={{ fontSize: 11.5, color: 'var(--bad)', margin: '0 0 8px', lineHeight: 1.45 }}>{k.sebep}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {TEKRAR_FAYDASIZ.includes(k.kod ?? '') ? (
                    // Biçim/boyut hatasında aynı dosyayı tekrar yollamak
                    // aynı sonucu verir; kullanıcıyı doğru eyleme
                    // yönlendiriyoruz.
                    <button type="button"
                      onClick={() => { setKuyruk(q => q.filter(x => x.id !== k.id)); dosyaRef.current?.click(); }}
                      className="m-btn" style={{ flex: 1, minHeight: 36, gap: 6, fontSize: 12.5 }}>
                      <ImagePlus size={13} aria-hidden="true" />Başka dosya seç
                    </button>
                  ) : (
                    <button type="button" onClick={() => void ogeyiYukle(k)}
                      aria-label={`${k.dosya.name} dosyasını tekrar yüklemeyi dene`}
                      className="m-btn" style={{ flex: 1, minHeight: 36, gap: 6, fontSize: 12.5 }}>
                      <RotateCcw size={13} aria-hidden="true" />Tekrar dene
                    </button>
                  )}
                  <button type="button" onClick={() => setKuyruk(q => q.filter(x => x.id !== k.id))}
                    aria-label={`${k.dosya.name} dosyasından vazgeç`}
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
          onIptal={() => {
            const hedef = kadrajHedefi;
            setKadrajHedefi(null);
            // Vazgecince de odak geri donuyor ve HICBIR SEY degismiyor.
            setTimeout(() => kadrajDugmeleri.current[hedef]?.focus(), 0);
          }}
        />
      )}
    </div>
  );
}
