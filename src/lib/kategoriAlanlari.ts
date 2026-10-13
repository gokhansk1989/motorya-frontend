/**
 * Kategoriye gore ozellik alanlari.
 *
 * Beden alani her kategoride gosteriliyordu: Topcase ilani verirken
 * "S, M, 42, XL…" ornegi cikiyor, kullanici ya bos birakiyor ya da alakasiz
 * bir sey yaziyordu. Alan modelini degistirmek yerine mevcut `sizeLabel`
 * kolonunu kategoriye gore ETIKETLIYORUZ - yeni kolon, migration ve veri
 * tasima gerekmiyor, mevcut kayitlar oldugu gibi kaliyor.
 *
 * Kategori eslesmesi ANA kategori slug'i uzerinden: alt kategoriler ayni
 * olcu turunu paylasiyor (kislik mont da yazlik mont da bedenli).
 */

export type OlcuTuru = 'beden' | 'kapasite' | 'yok';

interface OlcuTanimi {
  tur: OlcuTuru;
  etiket: string;
  ipucu: string;
  /** Arama filtresinde bu kategori icin gosterilecek baslik. */
  filtreEtiketi: string;
}

const BEDEN: OlcuTanimi = {
  tur: 'beden',
  etiket: 'Beden',
  ipucu: 'S, M, L, 42, XL…',
  filtreEtiketi: 'Beden',
};

const KAPASITE: OlcuTanimi = {
  tur: 'kapasite',
  etiket: 'Kapasite / Ölçü',
  ipucu: '35 L, 45×30×25 cm',
  filtreEtiketi: 'Kapasite',
};

const YOK: OlcuTanimi = { tur: 'yok', etiket: '', ipucu: '', filtreEtiketi: '' };

/**
 * Ana kategori slug'i -> olcu turu.
 *
 * Listede olmayan kategori icin alan GOSTERILMEZ. Varsayilanin "gosterme"
 * olmasi bilincli: yeni bir kategori eklendiginde alakasiz bir beden alani
 * kendiliginden ortaya cikmasin, ihtiyac varsa buraya yazilsin.
 */
const OLCU: Record<string, OlcuTanimi> = {
  kask: BEDEN,
  mont: BEDEN,
  pantolon: BEDEN,
  eldiven: BEDEN,
  'bot-cizme': BEDEN,
  koruma: BEDEN,
  // Yagmurluk, termal ic giyim, surucu yelegi gibi giyilen urunler var.
  'surucu-aksesuarlari': BEDEN,
  canta: KAPASITE,
  // Aksesuar, yedek parca ve bakim urunlerinde beden de kapasite de anlamsiz.
  aksesuar: YOK,
  'yedek-parca': YOK,
  bakim: YOK,
};

export function olcuAlani(anaKategoriSlug?: string): OlcuTanimi {
  if (!anaKategoriSlug) return YOK;
  return OLCU[anaKategoriSlug] ?? YOK;
}

/** Cinsiyet alani yalnizca giyilen urunlerde anlamli. */
const CINSIYET_KATEGORILERI = new Set([
  'kask', 'mont', 'pantolon', 'eldiven', 'bot-cizme', 'koruma', 'surucu-aksesuarlari',
]);

export function cinsiyetAlaniGosterilsinMi(anaKategoriSlug?: string): boolean {
  return !!anaKategoriSlug && CINSIYET_KATEGORILERI.has(anaKategoriSlug);
}
