/**
 * Kampanya (UTM) kaynagi — istemci tarafi.
 *
 * ── NEDEN CIHAZDA HICBIR SEY SAKLAMIYORUZ ────────────────────────────
 *
 * Olcum sistemimizin tamami cerez, localStorage, sessionStorage ve parmak
 * izi kullanmadan calisiyor; bu yuzden cerez onayina bagli degil ve
 * trafigin tamamini goruyor. Kampanya kaynagini sessionStorage'a yazmak
 * bu dengeyi bozardi: cihaz depolamasi olcum amacli kullanildiginda
 * KVKK acisindan onay gerekir, onay kapisinin arkasina gecen veri de
 * reddeden kullanicilari kaybeder.
 *
 * Bunun yerine kampanya MODUL DEGISKENINDE tutuluyor. Next.js istemci
 * tarafi gezinmede sayfayi yeniden yuklemedigi icin degisken ziyaret
 * boyunca yasiyor - flowId icin zaten kullandigimiz desen.
 *
 * BEDELI: sayfa yenilenirse ya da sekme kapanip acilirsa kaynak kaybolur
 * ve "belirlenemedi" olur. Bunu tahminle doldurmuyoruz.
 *
 * ── KURAL ────────────────────────────────────────────────────────────
 *
 * - UTM'li acilis kampanyayi KURAR. Yeni bir UTM'li acilis oncekinin
 *   YERINI ALIR (son temas kazanir).
 * - UTM'siz gezinme mevcut kampanyayi SILMEZ; kampanya baglantisindan
 *   gelip site icinde dolasan kullanici kaynagini kaybetmemeli.
 * - Hic kampanya yoksa ve yonlendiren de taninmiyorsa kaynak
 *   belirlenemedi sayilir - Instagram ya da Facebook SAYILMAZ.
 */

export interface Kampanya {
  utmKaynak: string;
  utmOrtam: string;
  utmKampanya: string;
  utmIcerik: string;
  utmYerlesim: string;
}

let aktif: Kampanya | null = null;
let acilisKaydedildi = false;
/** Acilis olayi icin bekleyen alanlar; effect bunu tuketiyor. */
let bekleyenAcilis: Record<string, string> | null = null;
/** Adresten UTM'lerin silinmesi gerekiyor mu; effect bunu tuketiyor. */
let bekleyenTemizlik = false;

/** Etiket temizligi — sunucudaki kampanya.ts ile ayni kurallar. */
function etiketTemizle(deger: string | null | undefined): string {
  if (!deger) return '';
  const sade = deger
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 40);
  return /^[a-z0-9_-]{1,40}$/.test(sade) ? sade : '';
}

function kaynagiNormalle(deger: string | null): string | null {
  const t = etiketTemizle(deger);
  if (!t) return null;
  if (t === 'instagram' || t === 'ig') return 'instagram';
  if (t === 'facebook' || t === 'fb') return 'facebook';
  return 'diger';
}

function yerlesimCikar(icerik: string, kampanya: string): string {
  // `\b` alt tire ONCESINDE eslesmiyor (alt tire JS'te kelime karakteri):
  // "instagram_stories" eski desende story sayilmiyor, "diger" oluyordu.
  // Meta'nin yerlesim adlari da taninmiyordu: reels, akis/feed, kesfet.
  // Ayiricilari bosluga cevirip tanidik adlari ekliyoruz.
  //
  // NOT: bu siniflandirma olay YAZILIRKEN yapiliyor, raporda degil. Yani
  // gecmis kayitlar yeniden etiketlenmiyor - eski olaylar 'diger' olarak
  // kalmaya devam ediyor, tahminle duzeltilmiyorlar.
  const h = `${icerik} ${kampanya}`.replace(/[_-]/g, ' ');
  if (/\bstor(y|ies)/.test(h)) return 'story';
  if (/\breels?\b|\bakis\b|\bfeed\b|\bgonderi|\bpost\b|\bexplore\b|\bkesfet\b/.test(h)) return 'gonderi';
  if (/\bbio\b|\bprofil|\bsayfa\b/.test(h)) return 'profil';
  return 'diger';
}

/** Yonlendiren alan adindan kaba kaynak. UTM yoksa yardimci sinyal. */
function yonlendirenKaynak(): string | null {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname.toLocaleLowerCase('en');
    if (host === new URL(location.href).hostname) return null; // kendi sayfamiz
    if (/instagram\.com$/.test(host)) return 'instagram';
    if (/facebook\.com$/.test(host)) return 'facebook';
  } catch {
    // referrer okunamazsa sinyal yok
  }
  return null;
}

/** Olaylara iliştirilecek kampanya alanlari. Kampanya yoksa bos nesne. */
export function kampanyaAlanlari(): Partial<Kampanya> {
  return aktif ? { ...aktif } : {};
}

/** Kayit isteginde gonderilecek kampanya. Kampanya yoksa undefined. */
export function kayitKampanyasi(): Record<string, string> | undefined {
  if (!aktif) return undefined;
  return {
    kaynak: aktif.utmKaynak,
    ortam: aktif.utmOrtam,
    kampanya: aktif.utmKampanya,
    icerik: aktif.utmIcerik,
  };
}

/**
 * Adres cubugundaki UTM etiketlerini okur, kampanyayi kurar ve acilis
 * olayini uretir.
 *
 * Etiketler okunduktan sonra adresten TEMIZLENIYOR. Iki sebep: sayfa
 * yenilendiginde ayni acilisin ikinci kez sayilmamasi, ve kullanicinin
 * baglantiyi paylastiginda baskasinin ziyaretinin yanlis kampanyaya
 * yazilmamasi. Digeri parametreler (ornegin ?q=kask) KORUNUYOR.
 *
 * @returns acilis olayi uretildiyse olayin alanlari, yoksa null
 */
export function kampanyayiYakala(): { alanlar: Record<string, string> } | null {
  if (typeof window === 'undefined') return null;

  let p: URLSearchParams;
  try {
    p = new URLSearchParams(window.location.search);
  } catch {
    return null;
  }

  const kaynak = kaynagiNormalle(p.get('utm_source'));

  if (!kaynak) {
    // UTM yok. Mevcut kampanyayi SILMIYORUZ - site ici gezinme kaynagi
    // kaybettirmemeli. Yalnizca ziyaretin EN BASINDA, hic kampanya
    // yokken yonlendirene bakiyoruz.
    if (!aktif && !acilisKaydedildi) {
      const y = yonlendirenKaynak();
      if (y) {
        aktif = {
          utmKaynak: y, utmOrtam: 'yonlendiren',
          utmKampanya: 'yonlendiren', utmIcerik: 'yonlendiren',
          utmYerlesim: 'diger',
        };
        acilisKaydedildi = true;
        bekleyenAcilis = { ...aktif, yonlendiren: y, yol: yolEtiketi() };
        return { alanlar: bekleyenAcilis };
      }
    }
    return null;
  }

  const kampanya = etiketTemizle(p.get('utm_campaign')) || 'adsiz';
  const icerik = etiketTemizle(p.get('utm_content')) || 'adsiz';
  // Son temas kazanir: yeni kampanya oncekinin yerini aliyor.
  aktif = {
    utmKaynak: kaynak,
    utmOrtam: etiketTemizle(p.get('utm_medium')) || 'adsiz',
    utmKampanya: kampanya,
    utmIcerik: icerik,
    utmYerlesim: yerlesimCikar(icerik, kampanya),
  };
  acilisKaydedildi = true;

  // Adres temizligi BURADA yapilmiyor: bu fonksiyon React render'i
  // sirasinda calisiyor ve Next.js App Router hydration'i tamamlarken
  // adresi kendi durumundan geri yaziyor - olculdu, UTM parametreleri
  // adreste kaliyor ve sayfa yenilendiginde acilis IKINCI kez sayiliyordu.
  // Temizlik effect'e tasindi (adresiTemizle).
  bekleyenAcilis = { ...aktif, yol: yolEtiketi() };
  bekleyenTemizlik = true;
  return { alanlar: bekleyenAcilis };
}

/** Hangi sayfaya inildi — ham yol degil, kaba bir etiket. */
function yolEtiketi(): string {
  const yol = window.location.pathname;
  if (yol === '/') return 'anasayfa';
  const ilk = yol.split('/').filter(Boolean)[0] ?? 'anasayfa';
  return etiketTemizle(ilk) || 'diger';
}

/**
 * UTM parametrelerini adresten siler, digerlerini korur.
 *
 * replaceState kullaniliyor: gecmise yeni kayit eklemiyor, geri tusu
 * kullanicinin geldigi yere donmeye devam ediyor.
 */
function temizleAdres(p: URLSearchParams) {
  try {
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      p.delete(k);
    }
    const sorgu = p.toString();
    // Baglanti parcasi (#bolum) korunuyor.
    const yeni = window.location.pathname + (sorgu ? `?${sorgu}` : '') + window.location.hash;
    window.history.replaceState(window.history.state, '', yeni);
  } catch {
    // Adres temizlenemezse olcum yine calisir; yalnizca yenilemede
    // acilis bir kez daha sayilabilir.
  }
}

/**
 * Bekleyen acilis olayini alir ve kuyrugu bosaltir.
 *
 * Yakalama ile olay uretimi AYRILDI. Yakalama React render'i sirasinda,
 * yani sayfanin kendi effect'lerinden ONCE calismali - yoksa ilan detay
 * goruntuleme olayi kampanyasiz gider. Olay uretimi ise effect'te olmali,
 * cunku render sirasinda yan etki uretmek React kurallarina aykiri ve
 * StrictMode'da iki kez calisir.
 */
export function bekleyenAcilisiAl(): Record<string, string> | null {
  const b = bekleyenAcilis;
  bekleyenAcilis = null;
  return b;
}

/**
 * Adresten UTM etiketlerini siler. Effect icinden, hydration bittikten
 * SONRA cagriliyor - render sirasinda cagrildiginda Next.js adresi geri
 * yaziyordu ve sayfa yenilemesi acilisi ikinci kez saydiriyordu.
 */
export function adresiTemizle() {
  if (!bekleyenTemizlik || typeof window === 'undefined') return;
  bekleyenTemizlik = false;
  try {
    const p = new URLSearchParams(window.location.search);
    temizleAdres(p);
  } catch {
    // Temizlenemezse olcum calismaya devam eder.
  }
}
