/**
 * Giris/kayit akisinda "kullanici nereye donecek" bilgisinin TEK kurali.
 *
 * ── NEDEN TEK BIR YER ───────────────────────────────────────────────
 *
 * Uygulamada uc ayri mekanizma vardi ve hicbiri uctan uca calismiyordu:
 *
 *   - "Ilan Ver" dugmeleri `/giris?next=/ilan-ver` uretiyordu.
 *   - Giris sayfasi yalnizca `devam` parametresini okuyordu; `next`
 *     SESSIZCE yok sayiliyordu. Yani ilan vermek icin giris yapan
 *     kullanici forma degil ANA SAYFAYA dusuyordu.
 *   - Giris sayfasindaki "Kayit Ol" baglantisi duz `/kayit` idi; hedef
 *     o adimda tamamen kayboluyordu.
 *   - Kayit -> e-posta dogrulama -> Google geri donusu zincirinde de
 *     hedef hicbir yerde tasinmiyordu.
 *
 * Artik tek parametre var: `devam`. Eski `next` yalnizca OKUNURKEN
 * kabul ediliyor (disarida kalmis baglantilar bozulmasin), uretilen her
 * adres `devam` kullaniyor.
 *
 * ── GUVENLIK ────────────────────────────────────────────────────────
 *
 * Dönüs hedefi kullanicinin elinde: adres cubuguna ne isterse yazabilir.
 * Bu yuzden hedef YALNIZCA bir ic yol olabilir ve hicbir kosulda yetki
 * bilgisi tasimaz - "hangi sayfaya gidilecegi" disinda bir anlami yok.
 * Ilanin gorulebilirligi ve mesaj gonderme yetkisi her zaman sunucuda,
 * oturumdan dogrulaniyor.
 */

/** Dönüs hedefi olarak kabul EDILMEYEN yollar: kendi icine dönen dongu uretirler. */
const DONGU_YOLLARI = [
  '/giris', '/kayit', '/callback', '/email-dogrula', '/email-gonderildi',
  '/onaylar', '/kullanici-adi', '/sifremi-unuttum', '/sifre-sifirla',
];

const EN_UZUN = 512;

/**
 * Ham bir dönüs hedefini guvenli bir ic yola indirger; olmazsa null.
 *
 * Reddedilenler ve nedenleri:
 *   "//kotu.site"        protokol goreli adres - tarayici bunu DIS adres
 *                        sayar, klasik acik yonlendirme acigi
 *   "https://kotu.site"  mutlak dis adres
 *   "/\kotu.site"        bazi tarayicilar ters bolu'yu bolu gibi okur
 *   "%2f%2fkotu.site"    kodlanmis hali; cozup tekrar bakiyoruz
 *   "/giris?..."         kendi icine donen dongu
 *   kontrol karakterleri satir sonu enjeksiyonu
 */
export function guvenliYol(ham: unknown): string | null {
  if (typeof ham !== 'string') return null;
  let y = ham.trim();
  if (!y || y.length > EN_UZUN) return null;

  // Kodlanmis halleri de yakala: bir kez cozmeyi dene, bozuksa reddet.
  let cozulmus = y;
  try {
    cozulmus = decodeURIComponent(y);
  } catch {
    return null; // bozuk yuzde kodlamasi
  }

  for (const aday of [y, cozulmus]) {
    if (/[\u0000-\u001f\u007f]/.test(aday)) return null; // kontrol karakteri
    if (!aday.startsWith('/')) return null;              // mutlak ya da goreli degil
    if (aday.startsWith('//')) return null;              // protokol goreli
    if (aday.startsWith('/\\')) return null;             // ters bolu hilesi
    if (aday.includes('://')) return null;               // gomulu mutlak adres
  }

  // Dongu kontrolu: yalnizca YOL kismina bakiliyor.
  const yolKismi = cozulmus.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (DONGU_YOLLARI.some((d) => yolKismi === d || yolKismi.startsWith(d + '/'))) return null;

  return cozulmus;
}

/**
 * Adres parametrelerinden dönüs hedefini okur.
 * `devam` esas, `next` geriye donuk uyum icin kabul ediliyor.
 */
export function donusOku(params: { get(k: string): string | null }): string | null {
  return guvenliYol(params.get('devam')) ?? guvenliYol(params.get('next'));
}

/** Giris sayfasinin niyete gore baglami. Yalnizca metin secer, yetki vermez. */
export type Niyet = 'mesaj' | 'teklif' | 'favori' | 'ilan-ver';
const NIYETLER: Niyet[] = ['mesaj', 'teklif', 'favori', 'ilan-ver'];
export const niyetOku = (ham: unknown): Niyet | null =>
  typeof ham === 'string' && (NIYETLER as string[]).includes(ham) ? (ham as Niyet) : null;

/**
 * Giris adresi uretir.
 *
 * `ilan` yalnizca ilanin SLUG'i; giris ekraninda herkese acik bir ozet
 * gostermek icin kullaniliyor ve ozet sunucudan ayrica cekiliyor.
 * Mesaj metni, kimlik bilgisi ya da token ASLA adrese girmiyor.
 */
export function girisAdresi(opts: { hedef?: string; niyet?: Niyet; ilan?: string } = {}): string {
  const p = new URLSearchParams();
  /**
   * Mesaj niyetiyle gelindiyse dönüs hedefine `donus=mesaj` isareti
   * ekleniyor. Ilan sayfasi bu isareti gorunce "kimlik dogrulamasindan
   * sonra geri donuldu" olayini uretiyor ve isareti adresten siliyor.
   *
   * Hunideki en gorunmez halka buydu: giris ekraninda mi kaybediyoruz
   * yoksa donus mu kopuyor, olculemiyordu. Isaret yalnizca OLCUM
   * bilgisi; hicbir yetki karari ona bakmiyor.
   */
  let hedef = guvenliYol(opts.hedef);
  // Isaret yalnizca donusu OLCEBILMEK icin; mesaj ve ilan verme
  // akislarinin ikisinde de ayni ise yariyor.
  const ISARETLI: Niyet[] = ['mesaj', 'ilan-ver'];
  if (hedef && opts.niyet && ISARETLI.includes(opts.niyet)) {
    const [yol, parca] = hedef.split('#');
    const ayirac = yol.includes('?') ? '&' : '?';
    hedef = `${yol}${ayirac}donus=${opts.niyet}${parca ? '#' + parca : ''}`;
  }
  if (hedef) p.set('devam', hedef);
  if (opts.niyet) p.set('niyet', opts.niyet);
  if (opts.ilan) p.set('ilan', opts.ilan);
  const qs = p.toString();
  return qs ? `/giris?${qs}` : '/giris';
}

/** Mevcut sayfayi dönüs hedefi olarak kullan (adres cubugundan). */
export function suAnkiYol(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return guvenliYol(window.location.pathname + window.location.search) ?? undefined;
}

/**
 * Google ile giris icin gecici saklama.
 *
 * Google turunde kullanici siteden AYRILIP geri donuyor; adres
 * parametresi bizde kalmiyor. Hedefi `state` ile OAuth saglayicisina
 * tasimak icin sunucu tarafinda degisiklik gerekiyordu; bunun yerine
 * ayni sekmede yasayan sessionStorage kullaniyoruz.
 *
 * Bu bir TAKIP mekanizmasi degil: tek bir yol dizgisi tutuluyor, sekme
 * kapaninca siliniyor, okunur okunmaz temizleniyor ve kimlik bilgisi
 * icermiyor. Olcum tarafindaki "cihazda hicbir sey saklamiyoruz" kurali
 * analitik icin; buradaki kullanim islevsel ve kullanicinin kendi
 * baslattigi akisa ait.
 *
 * SINIR: sessionStorage sekmeye bagli. Google turu BASKA bir sekmede
 * biterse hedef kaybolur ve ana sayfaya dusulur - sessizce yanlis bir
 * yere gondermektense bu tercih edilir.
 */
const SAKLAMA_ANAHTARI = 'motorya-donus';

export function donusSakla(hedef?: string | null) {
  if (typeof window === 'undefined') return;
  const y = guvenliYol(hedef);
  try {
    if (y) sessionStorage.setItem(SAKLAMA_ANAHTARI, y);
    else sessionStorage.removeItem(SAKLAMA_ANAHTARI);
  } catch {
    // Gizli sekmede ya da depolama kapaliysa sessizce vazgec: dönüs
    // hedefi kaybolur, akis calismaya devam eder.
  }
}

export function donusAlVeTemizle(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const y = sessionStorage.getItem(SAKLAMA_ANAHTARI);
    sessionStorage.removeItem(SAKLAMA_ANAHTARI);
    return guvenliYol(y);
  } catch {
    return null;
  }
}
