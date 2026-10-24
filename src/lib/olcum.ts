/**
 * Huni olcumu — istemci tarafi.
 *
 * GA'dan ayri bir sistem, ama ayni olaylari iki yere gondermiyor:
 * lib/analytics.ts Google Ads'in teklif algoritmasini besleyen donusum
 * sinyallerini gonderiyor (uye olma, ilan olusturma, teklif). Buradaki
 * olaylar ise GA'ya hic gitmiyor ve GA'nin cevaplayamadigi sorulara bakiyor:
 * formun hangi adiminda birakildigi, aramanin sonuc uretip uretmedigi, mesaj
 * dugmesine basilip mesaj gonderilmedigi. GA ayrica cerez onayina bagli ve
 * kendi panelimizden sorgulanamiyor; bu yuzden huni olcumu birinci taraf.
 *
 * Cihaz kimligi YOK: cerez, localStorage, sessionStorage ve parmak izi
 * kullanilmiyor. Iliskilendirme ya oturum acmis kullanicinin kimligiyle
 * (sunucu tarafinda, token'dan) ya da yalnizca bellekte yasayan rastgele
 * akis kimligiyle yapiliyor. Bu nedenle olcum yeni bir takip mekanizmasi
 * baslatmiyor ve cerez onayi gerektirmiyor.
 */

import { tokeniAl } from './oturum';
import { API_URL } from './apiBase';
import { kampanyaAlanlari, kampanyayiYakala, bekleyenAcilisiAl, adresiTemizle } from './kampanya';

/** Sozlukteki olay adlari. Backend'deki olay-sozlugu.ts ile ayni olmali. */
export type OlayAdi =
  | 'ilan_sayfasi_acildi'
  | 'ilan_giris_gerekti'
  | 'ilan_girisden_donuldu'
  | 'ilan_kimlik_gerekti'
  | 'ilan_kimlik_tamamlandi'
  | 'ilan_kimlik_hatasi'
  | 'ilan_taslak_soruldu'
  | 'ilan_form_acildi'
  | 'ilan_akis_basladi'
  | 'ilan_adim_tamamlandi'
  | 'ilan_foto_yuklendi'
  | 'ilan_foto_hata'
  | 'ilan_form_hatasi'
  | 'ilan_gonderildi'
  | 'arama_yapildi'
  | 'arama_sonuc_tiklandi'
  | 'ilan_detay_goruntulendi'
  | 'mesaj_butonu_tiklandi'
  // Mesajlasma hunisinin ara adimlari. Sunucudaki olay sozlugu
  // (olay-sozlugu.ts) ile AYNI olmak zorunda: orada tanimli olmayan bir
  // ad sessizce atiliyor, burada tanimli olmayan bir ad derlenmiyor.
  | 'mesaj_giris_gerekti'
  | 'mesaj_girisden_donuldu'
  | 'mesaj_gonderim_denendi'
  | 'mesaj_gonderim_hatasi'
  | 'kampanya_acilisi'
  // Uyelik hunisi. Sunucudaki olay sozluguyle AYNI olmak zorunda.
  | 'uyelik_ekran_goruntulendi'
  | 'uyelik_basladi'
  | 'uyelik_gonderildi'
  | 'uyelik_hatasi';

type Props = Record<string, string | number | boolean | string[] | undefined>;

interface Olay {
  eventId: string;
  name: OlayAdi;
  flowId?: string;
  props?: Props;
}

/** Rastgele kimlik. randomUUID yoksa (eski Safari, http) yedek uretici. */
export function rastgeleKimlik(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const b = crypto.getRandomValues(new Uint8Array(16));
      return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // asagidaki yedege dusuyor
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Bekleyen olaylar. Her tiklamada ayri HTTP istegi atmak yerine kisa bir
 * pencerede toplanip tek istekte cikiyorlar.
 */
let kuyruk: Olay[] = [];
let zamanlayici: ReturnType<typeof setTimeout> | null = null;

const TOPLAMA_MS = 1500;
const EN_FAZLA = 20;

function govde(olaylar: Olay[]): string {
  return JSON.stringify({ olaylar });
}

function gonder(olaylar: Olay[], kapanis = false) {
  if (!olaylar.length) return;
  const url = `${API_URL}/analitik/olay`;
  const veri = govde(olaylar);

  // Sayfa kapanirken fetch iptal edilir; sendBeacon tarayici tarafindan
  // arka planda tamamlanir. Token tasimadigi icin bu istekler anonim
  // sayilir - bilerek: kapanis aninda kimlik tasimaktansa olayi kaybetmemek
  // daha degerli degil, o yuzden kapanista yalnizca kimlik gerektirmeyen
  // olaylar gonderiliyor (bkz. olcumBosalt cagrilari).
  if (kapanis && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(url, new Blob([veri], { type: 'application/json' }));
      return;
    } catch {
      // fetch'e dusuyor
    }
  }

  let token: string | null = null;
  try {
    token = tokeniAl();
  } catch {
    token = null;
  }

  // Olcum arizasi kullanicinin isini durdurmamali: yanit beklenmiyor,
  // hata yutuluyor, hicbir yerde toast gosterilmiyor.
  void fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: veri,
    keepalive: true,
  }).catch(() => {});
}

/** Kuyrugu hemen bosaltir. Sayfa degisirken/kapanirken cagriliyor. */
export function olcumBosalt(kapanis = false) {
  if (zamanlayici) {
    clearTimeout(zamanlayici);
    zamanlayici = null;
  }
  const cikan = kuyruk;
  kuyruk = [];
  gonder(cikan, kapanis);
}

/**
 * Olay kaydet. Hicbir kosulda hata firlatmaz ve cagiran kodu bekletmez.
 *
 * eventId burada uretiliyor: ag hatasinda ayni olay tekrar gonderilse bile
 * sunucu benzersiz kimlikten taniyip bir kez sayiyor.
 */
export function olc(name: OlayAdi, props?: Props, flowId?: string) {
  if (typeof window === 'undefined') return;
  try {
    // Kampanya alanlari HER olaya kendiliginden ekleniyor: cagiran yerin
    // bunu bilmesi gerekmiyor, ve bir olay eklenirken unutulmasi mumkun
    // olmuyor. Kampanya yoksa bos nesne, yani hicbir alan eklenmiyor.
    kuyruk.push({
      eventId: rastgeleKimlik(),
      name,
      flowId,
      props: { ...kampanyaAlanlari(), ...props },
    });
    if (kuyruk.length >= EN_FAZLA) {
      olcumBosalt();
      return;
    }
    if (!zamanlayici) {
      zamanlayici = setTimeout(() => olcumBosalt(), TOPLAMA_MS);
    }
  } catch {
    // Olcum sessizce vazgecer.
  }
}

if (typeof window !== 'undefined') {
  // pagehide, mobil Safari'de unload'dan guvenilir calisiyor.
  window.addEventListener('pagehide', () => olcumBosalt(true));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') olcumBosalt(true);
  });
}

/** Fotograf yukleme hatasini kaba bir koda indirger. Mesaj metni gonderilmez. */
export function fotoHataKodu(err: unknown): string {
  const e = err as { response?: { status?: number }; code?: string };
  if (e?.code === 'ERR_NETWORK' || e?.code === 'ECONNABORTED') return 'ag';
  const s = e?.response?.status;
  if (s === 413) return 'boyut';
  if (s === 415) return 'tip';
  if (s === 429) return 'limit';
  if (s && s >= 500) return 'sunucu';
  if (s && s >= 400) return 'istek';
  return 'bilinmiyor';
}

/**
 * Sayfa acilisinda kampanyayi yakalar ve acilis olayini uretir.
 *
 * Uygulama kabugundan BIR KEZ cagriliyor. Istemci tarafi gezinmede
 * yeniden cagrilmasi gerekmiyor: kampanya modul degiskeninde yasiyor ve
 * sonraki olaylara kendiliginden ekleniyor.
 */
export function kampanyayiKur() {
  if (typeof window === 'undefined') return;
  try {
    kampanyayiYakala();
  } catch {
    // Olcum arizasi sayfayi bolmemeli.
  }
}

/** Bekleyen acilis olayini gonderir. Effect icinden cagriliyor. */
export function kampanyaAcilisiniOlc() {
  if (typeof window === 'undefined') return;
  try {
    const alanlar = bekleyenAcilisiAl();
    if (alanlar) olc('kampanya_acilisi', alanlar);
    // Adres temizligi hydration'dan SONRA: daha erken yapildiginda Next
    // adresi geri yaziyor ve yenileme acilisi ikinci kez saydiriyor.
    adresiTemizle();
  } catch {
    // Olcum arizasi sayfayi bolmemeli.
  }
}

/**
 * KAYIT GIRISIMI KIMLIGI.
 *
 * Kayit ekrani her GERCEK acilisinda yeni bir kimlik uretiliyor ve akis
 * boyunca ayni kaliyor. Amac tek: ekran goruntuleme, baslangic, gonderim
 * ve sunucudaki hesap olusturma olaylarinin AYNI girisime ait oldugunu
 * bilmek.
 *
 * NE DEGIL: yetki, oturum ya da kimlik dogrulama araci degil. Kalici ya
 * da cihazlar arasi bir takip kimligi degil - modul degiskeninde
 * yasiyor, sekme kapaninca ya da sayfa yenilenince gidiyor. Hicbir
 * yerde saklanmiyor.
 *
 * Sayfa yenilemesi YENI girisim sayiliyor: kullanici gercekten bastan
 * basliyor ve eski girisimin devami oldugunu soyleyebilecek bir
 * isaretimiz yok - uydurmaktansa yeni saymak durust.
 */
let kayitGirisimi: string | null = null;

export function kayitGirisimiBaslat(): string {
  kayitGirisimi =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `g-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return kayitGirisimi;
}

export function kayitGirisimiAl(): string | undefined {
  return kayitGirisimi ?? undefined;
}
