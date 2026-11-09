/**
 * Yüklemeden ÖNCE büyük telefon fotoğraflarını tarayıcıda küçültür.
 *
 * NEDEN: Sunucu zaten her görseli 1920'ye indirip WebP'ye çeviriyor;
 * ama bu, dosyanın tam boyutta yüklenmesinden SONRA oluyor. 12–48 MP
 * telefon fotoğrafları 8–25 MB olabiliyor: yavaş bağlantıda yükleme
 * uzun sürüyor, bazıları istemci sınırında ya da sunucu 10 MB sınırında
 * tamamen reddediliyordu. Kullanıcı tek çözüm olarak fotoğrafı elle
 * küçültmek zorunda kalıyordu. Bunu istemcide yaparsak kullanıcı hiç
 * uğraşmıyor; sunucuya zaten küçülmüş bir dosya gidiyor.
 *
 * SÖZLEŞME: Bu YALNIZCA bir hızlandırma/kolaylaştırma katmanı.
 * Sunucunun dosya türü, gerçek içerik (sharp ile sniff), boyut ve
 * güvenlik doğrulamaları AYNEN korunuyor — istemci sıkıştırmasına
 * güvenilmiyor. Bu fonksiyon başarısız olursa dosya HAM haliyle
 * sunucuya geçiyor ("gecildi"); hiçbir şey "başarılı" gibi
 * gösterilmiyor.
 *
 * EXIF YÖNÜ: Döndürme gerektiren fotoğraflarda (EXIF orientation 3/6/8)
 * tarayıcıların createImageBitmap davranışı tutarsız (kimi otomatik
 * döndürür, kimi döndürmez). Çift/eksik döndürme riskini almak yerine
 * bu dosyaları DOKUNMADAN sunucuya bırakıyoruz: sunucu sharp.rotate()
 * ile güvenilir biçimde düzeltiyor. Yalnızca yönü düz (1/yok) olan
 * fotoğrafları küçültüyoruz — orada döndürme söz konusu değil, yani
 * tarayıcı farkı sonucu etkilemiyor.
 */

/** Uzun kenar hedefi. Sunucu da buraya indiriyor; daha büyüğü göndermek boşa bant. */
const HEDEF_UZUN_KENAR = 1920;
/** WebP/JPEG kalite. Ürün detayını koruyacak kadar yüksek, dosyayı küçültecek kadar düşük. */
const KALITE = 0.85;
/** Bu bayttan küçük VE zaten 1920 altı fotoğrafa dokunmuyoruz (gereksiz yeniden işleme yok). */
const KUCUK_BAYT = 1_000_000;
/** Tarayıcıda açmayı deneyeceğimiz türler. HEIC/HEIF burada YOK — sunucuya bırakılıyor. */
const DECODE_EDILEBILIR = /^image\/(jpeg|png|webp)$/i;

export type HazirSonuc =
  | { durum: 'hazir'; dosya: File; kucultuldu: boolean; oncesi: number; sonrasi: number }
  | { durum: 'gecildi'; dosya: File; neden: 'format' | 'yon' | 'kucuk' | 'desteksiz' }
  | { durum: 'hata'; kod: 'bellek' };

let webpDestegi: boolean | null = null;
function webpVar(): boolean {
  if (webpDestegi !== null) return webpDestegi;
  try {
    const c = document.createElement('canvas');
    c.width = 1; c.height = 1;
    webpDestegi = c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpDestegi = false;
  }
  return webpDestegi;
}

function yeniAd(ad: string, tur: string): string {
  const uzanti = tur === 'image/webp' ? 'webp' : 'jpg';
  return ad.replace(/\.[^.]+$/, '') + '.' + uzanti;
}

/**
 * JPEG başlığından EXIF yönünü ve piksel boyutunu okur — dosyayı
 * decode ETMEDEN. Yalnızca ilk parça yeter. JPEG değilse ya da
 * okunamazsa yon=1 döner (döndürme yok varsayımı güvenli taraftır).
 */
function jpegBilgi(buf: ArrayBuffer): { yon: number; w: number; h: number } | null {
  const v = new DataView(buf);
  if (v.byteLength < 4 || v.getUint16(0) !== 0xffd8) return null; // SOI yok → JPEG değil
  let yon = 1;
  let w = 0;
  let h = 0;
  let off = 2;
  while (off + 4 <= v.byteLength) {
    if (v.getUint8(off) !== 0xff) break;
    const marker = v.getUint16(off);
    const len = v.getUint16(off + 2);
    if (len < 2) break;
    // APP1 (Exif) → orientation
    if (marker === 0xffe1 && off + 10 <= v.byteLength && v.getUint32(off + 4) === 0x45786966) {
      const tiff = off + 10; // "Exif\0\0" sonrası TIFF başlığı
      if (tiff + 8 <= v.byteLength) {
        const little = v.getUint16(tiff) === 0x4949;
        const u16 = (p: number) => v.getUint16(p, little);
        const u32 = (p: number) => v.getUint32(p, little);
        const ifd0 = tiff + u32(tiff + 4);
        if (ifd0 + 2 <= v.byteLength) {
          const n = u16(ifd0);
          for (let i = 0; i < n; i++) {
            const e = ifd0 + 2 + i * 12;
            if (e + 12 > v.byteLength) break;
            if (u16(e) === 0x0112) {
              const o = u16(e + 8);
              if (o >= 1 && o <= 8) yon = o;
              break;
            }
          }
        }
      }
    }
    // SOF0..SOF15 (DHT/DQT/DAA hariç) → boyut
    const m = marker & 0xff;
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      if (off + 9 <= v.byteLength) {
        h = v.getUint16(off + 5);
        w = v.getUint16(off + 7);
      }
      break; // boyutu bulduk, yön APP1'de SOF'tan önce gelir; yeter
    }
    off += 2 + len;
  }
  return { yon, w, h };
}

/** Bir ImageBitmap'i hedef boyuta çizip blob üretir. */
async function bitmaptenBlob(
  bitmap: ImageBitmap,
  nw: number,
  nh: number,
): Promise<{ blob: Blob; tur: string } | null> {
  const canvas = document.createElement('canvas');
  canvas.width = nw;
  canvas.height = nh;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    canvas.width = 0;
    canvas.height = 0;
    return null;
  }
  ctx.drawImage(bitmap, 0, 0, nw, nh);
  const tur = webpVar() ? 'image/webp' : 'image/jpeg';
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, tur, KALITE));
  // Belleği hemen bırak.
  canvas.width = 0;
  canvas.height = 0;
  return blob ? { blob, tur } : null;
}

/**
 * Yüklemeye hazırlar. ASLA throw etmez — her hatada güvenli bir sonuç
 * döner. Çağıran taraf "hazir" ise yeni dosyayı, "gecildi" ise orijinali
 * yükler; "hata" ise hazırlama aşamasında (bellek) durur.
 */
export async function gorselHazirla(dosya: File): Promise<HazirSonuc> {
  // SSR ve eski tarayıcı koruması.
  if (
    typeof document === 'undefined' ||
    typeof createImageBitmap === 'undefined' ||
    typeof HTMLCanvasElement === 'undefined'
  ) {
    return { durum: 'gecildi', dosya, neden: 'desteksiz' };
  }

  // HEIC/HEIF ve tanımadığımız türler: tarayıcı güvenilir açamaz; sunucunun
  // güvenli dönüşümüne bırak. (Başarı gibi gösterme YOK — sunucu doğrular.)
  if (!DECODE_EDILEBILIR.test(dosya.type)) {
    return { durum: 'gecildi', dosya, neden: 'format' };
  }

  const jpeg = /^image\/jpe?g$/i.test(dosya.type);

  // JPEG ise: başlıktan yön+boyut oku (decode etmeden). Döndürme
  // gerekiyorsa sunucuya bırak; büyük piksel boyutunu da buradan bilip
  // decode'u bellek-güvenli yapabiliriz.
  let kaynakW = 0;
  let kaynakH = 0;
  if (jpeg) {
    try {
      const bilgi = jpegBilgi(await dosya.slice(0, 256 * 1024).arrayBuffer());
      if (bilgi) {
        if (bilgi.yon !== 1) return { durum: 'gecildi', dosya, neden: 'yon' };
        kaynakW = bilgi.w;
        kaynakH = bilgi.h;
      }
    } catch {
      // Başlık okunamadı: yine de aşağıda decode denenir.
    }
  }

  // Boyutu baştan biliyorsak (JPEG) ve hedef ölçeği hesaplayabiliyorsak,
  // decode'u doğrudan küçülterek yap — büyük görseller tarayıcıyı
  // kilitlemesin diye tam çözünürlükte RAM'e hiç almıyoruz.
  let bitmap: ImageBitmap;
  let nw = 0;
  let nh = 0;
  try {
    if (kaynakW > 0 && kaynakH > 0) {
      const uzun = Math.max(kaynakW, kaynakH);
      const olcek = uzun > HEDEF_UZUN_KENAR ? HEDEF_UZUN_KENAR / uzun : 1;
      // Zaten küçük (boyut ve bayt): dokunma.
      if (olcek === 1 && dosya.size <= KUCUK_BAYT) {
        return { durum: 'gecildi', dosya, neden: 'kucuk' };
      }
      nw = Math.max(1, Math.round(kaynakW * olcek));
      nh = Math.max(1, Math.round(kaynakH * olcek));
      bitmap =
        olcek < 1
          ? await createImageBitmap(dosya, { resizeWidth: nw, resizeHeight: nh, resizeQuality: 'high' })
          : await createImageBitmap(dosya);
    } else {
      // Boyutu bilmiyoruz (PNG/WebP ya da başlık okunamadı): tam decode.
      bitmap = await createImageBitmap(dosya);
      const uzun = Math.max(bitmap.width, bitmap.height);
      const olcek = uzun > HEDEF_UZUN_KENAR ? HEDEF_UZUN_KENAR / uzun : 1;
      if (olcek === 1 && dosya.size <= KUCUK_BAYT) {
        bitmap.close?.();
        return { durum: 'gecildi', dosya, neden: 'kucuk' };
      }
      nw = Math.max(1, Math.round(bitmap.width * olcek));
      nh = Math.max(1, Math.round(bitmap.height * olcek));
    }
  } catch {
    // Decode başarısız: sunucuya ham gönder, orada doğrulanır/işlenir.
    return { durum: 'gecildi', dosya, neden: 'format' };
  }

  try {
    const sonuc = await bitmaptenBlob(bitmap, nw, nh);
    if (!sonuc) return { durum: 'gecildi', dosya, neden: 'format' };
    const { blob, tur } = sonuc;
    // Sonuç orijinalden küçük değilse (zaten optimize dosyalarda olur) ve
    // boyutça da küçülme yoksa orijinali koru — şişirmeyelim.
    if (blob.size >= dosya.size && nw === (kaynakW || bitmap.width)) {
      return { durum: 'gecildi', dosya, neden: 'kucuk' };
    }
    const yeni = new File([blob], yeniAd(dosya.name, tur), { type: tur, lastModified: Date.now() });
    return {
      durum: 'hazir',
      dosya: yeni,
      kucultuldu: nw < (kaynakW || bitmap.width),
      oncesi: dosya.size,
      sonrasi: yeni.size,
    };
  } catch {
    // Decode geçti ama canvas/encode patladı (aşırı büyük piksel, bellek).
    // Sunucuya ham göndermek yerine net hata ver.
    return { durum: 'hata', kod: 'bellek' };
  } finally {
    bitmap.close?.();
  }
}
