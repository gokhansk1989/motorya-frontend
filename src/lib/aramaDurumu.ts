// Arama sayfasinin adres <-> filtre durumu. Bilerek bagimsiz ve saf:
// adres cubugu, filtre paneli, etiketler ve sorgu ayni kaynaktan turuyor,
// `node --test` ile dogrudan sinanabiliyor.

export interface AramaFiltreleri {
  q: string;
  categoryId: string;
  brandId: string;
  condition: string;
  gender: string;
  city: string;
  sizeLabel: string;
  minPrice?: number;
  maxPrice?: number;
  sort: string;
  page: number;
}

export type AramaDegisikligi = Partial<Record<keyof AramaFiltreleri, string | number | undefined>>;

/** Kendi secimi disarida tutularak sayilan filtreler. */
export type FacetAlani = 'sizeLabel' | 'city';

export const VARSAYILAN_SIRALAMA = 'newest';
export const SAYFA_BOYU = 20;

// Sunucu fiyat icin pozitif sayi istiyor; "0", "abc" ya da negatif deger
// adresten gelirse istegi 400'e dusurmek yerine filtreyi yok sayiyoruz.
function pozitifSayi(ham: string | null): number | undefined {
  if (ham === null || ham.trim() === '') return undefined;
  const n = Number(ham);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function adrestenOku(sp: { get(anahtar: string): string | null }): AramaFiltreleri {
  const sayfa = Number(sp.get('page') ?? 1);
  return {
    q: sp.get('q') ?? '',
    categoryId: sp.get('categoryId') ?? '',
    brandId: sp.get('brandId') ?? '',
    condition: sp.get('condition') ?? '',
    gender: sp.get('gender') ?? '',
    city: sp.get('city') ?? '',
    sizeLabel: sp.get('sizeLabel') ?? '',
    minPrice: pozitifSayi(sp.get('minPrice')),
    maxPrice: pozitifSayi(sp.get('maxPrice')),
    sort: sp.get('sort') ?? VARSAYILAN_SIRALAMA,
    page: Number.isInteger(sayfa) && sayfa >= 1 ? sayfa : 1,
  };
}

const ADRES_SIRASI: (keyof AramaFiltreleri)[] = [
  'q', 'categoryId', 'brandId', 'condition', 'gender', 'city', 'sizeLabel',
  'minPrice', 'maxPrice', 'sort', 'page',
];

/**
 * Yeni adres. Verilmeyen filtreler KORUNUR; sayfa, acikca verilmedikce
 * 1'e doner (filtre degisince eski sayfa numarasi anlamsizlasir).
 */
export function aramaAdresi(mevcut: AramaFiltreleri, degisiklik: AramaDegisikligi = {}): string {
  const birlesik: Record<string, string | number | undefined> = { ...mevcut, page: 1, ...degisiklik };
  const params = new URLSearchParams();
  for (const anahtar of ADRES_SIRASI) {
    const v = birlesik[anahtar];
    if (v === undefined || v === '') continue;
    if (anahtar === 'page' && Number(v) === 1) continue;
    if (anahtar === 'sort' && v === VARSAYILAN_SIRALAMA) continue;
    params.set(anahtar, String(v));
  }
  const sorgu = params.toString();
  return sorgu ? `/ara?${sorgu}` : '/ara';
}

/** "Tumunu temizle": arama metni ve siralama kalir, filtreler gider. */
export function temizAdres(mevcut: AramaFiltreleri): string {
  return aramaAdresi(
    { ...mevcut, categoryId: '', brandId: '', condition: '', gender: '', city: '', sizeLabel: '', minPrice: undefined, maxPrice: undefined },
  );
}

export function aramaSorgusu(f: AramaFiltreleri) {
  return {
    q: f.q || undefined,
    categoryId: f.categoryId || undefined,
    brandId: f.brandId || undefined,
    condition: f.condition || undefined,
    city: f.city || undefined,
    sizeLabel: f.sizeLabel || undefined,
    gender: f.gender || undefined,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
    sort: f.sort,
    page: f.page,
    limit: SAYFA_BOYU,
  };
}

/**
 * Bir filtrenin SECENEKLERINI sayan sorgu: diger butun filtreler aynen
 * uygulanir, yalnizca o filtrenin kendi secimi cikarilir. Boylece "L"
 * seciliyken beden listesi "XL (2)" gostermeye devam eder ve sayi "bunu
 * secersem kac sonuc gorurum" anlamina gelir. Ilan gerekmedigi icin tek
 * kayit istenir; sayilar sunucunun dagilimindan gelir, sayfadan degil.
 */
export function facetSorgusu(f: AramaFiltreleri, alan: FacetAlani) {
  return { ...aramaSorgusu({ ...f, [alan]: '' }), page: 1, limit: 1 };
}

export interface FacetSecenegi { value: string; count: number; }

/**
 * Dagilimi acilir liste seceneklerine cevirir. Secili deger dagilimda
 * yoksa (diger filtreler onu sifira dusurduyse) 0 sayisiyla listede KALIR;
 * yoksa kullanici kendi secimini goremez ve geri alamaz.
 */
export function facetSecenekleri(dagilim: Record<string, number> | undefined, secili: string): FacetSecenegi[] {
  const liste = Object.entries(dagilim ?? {})
    .map(([value, count]) => ({ value, count: Number(count) }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'tr'));
  if (secili && !liste.some((o) => ayniDeger(o.value, secili))) {
    liste.unshift({ value: secili, count: 0 });
  }
  return liste;
}

// Bedenler indekste buyuk harfle duruyor; adres "l" ile de gelebilir.
export function ayniDeger(a: string, b: string): boolean {
  return a.trim().toLocaleUpperCase('tr') === b.trim().toLocaleUpperCase('tr');
}

const tl = (n: number) => `${n.toLocaleString('tr-TR')} ₺`;

export function fiyatEtiketi(min?: number, max?: number): string | null {
  if (min !== undefined && max !== undefined) return `Fiyat: ${min.toLocaleString('tr-TR')}–${tl(max)}`;
  if (min !== undefined) return `Fiyat: ${tl(min)} ve üzeri`;
  if (max !== undefined) return `Fiyat: en çok ${tl(max)}`;
  return null;
}

export interface AktifEtiket {
  anahtar: string;
  etiket: string;
  /** Yalnizca bu filtreyi kaldiran degisiklik; digerleri korunur. */
  kaldir: AramaDegisikligi;
}

export interface EtiketAdlari {
  kategori?: string;
  marka?: string;
  durum?: string;
  cinsiyet?: string;
}

/**
 * Sonuclarin ustunde gosterilen etiketler. Adresteki HER aktif filtre
 * burada karsilik bulur; ad henuz cozulmediyse (kategori/marka listesi
 * yuklenmedi) o etiket atlanir, ham kimlik gosterilmez.
 */
export function aktifEtiketler(f: AramaFiltreleri, adlar: EtiketAdlari): AktifEtiket[] {
  const liste: AktifEtiket[] = [];
  if (f.categoryId && adlar.kategori) liste.push({ anahtar: 'categoryId', etiket: adlar.kategori, kaldir: { categoryId: '' } });
  if (f.brandId && adlar.marka) liste.push({ anahtar: 'brandId', etiket: `Marka: ${adlar.marka}`, kaldir: { brandId: '' } });
  if (f.sizeLabel) liste.push({ anahtar: 'sizeLabel', etiket: `Beden: ${f.sizeLabel}`, kaldir: { sizeLabel: '' } });
  const fiyat = fiyatEtiketi(f.minPrice, f.maxPrice);
  if (fiyat) liste.push({ anahtar: 'fiyat', etiket: fiyat, kaldir: { minPrice: undefined, maxPrice: undefined } });
  if (f.condition && adlar.durum) liste.push({ anahtar: 'condition', etiket: `Durum: ${adlar.durum}`, kaldir: { condition: '' } });
  if (f.gender && adlar.cinsiyet) liste.push({ anahtar: 'gender', etiket: adlar.cinsiyet, kaldir: { gender: '' } });
  if (f.city) liste.push({ anahtar: 'city', etiket: `Şehir: ${f.city}`, kaldir: { city: '' } });
  return liste;
}

export function filtreVarMi(f: AramaFiltreleri): boolean {
  return !!(f.categoryId || f.brandId || f.condition || f.gender || f.city || f.sizeLabel
    || f.minPrice !== undefined || f.maxPrice !== undefined);
}
