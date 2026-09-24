import type { Metadata } from 'next';

/**
 * İlan barındırmayan liste sayfaları için robots etiketi.
 *
 * Neden gerekli: kategori × şehir × marka kombinasyonları yüzlerce sayfa
 * üretiyor ve bunların ezici çoğunluğunda tek bir ilan yok. Hepsi HTTP 200 +
 * "index, follow" ile yanıt verdiği için Google bunları indeksledi: Search
 * Console'da 10 ilana karşılık 1.644 indekslenmiş sayfa görünüyordu ve 111'i
 * için "tarandı, şu anda dizine eklenmiş değil" diyordu - yani Google bu
 * sayfaları gördü ve değersiz buldu. Bu tekil bir sayfa kararı değil: boş
 * sayfa oranı yüksek olan siteler doorway/thin content muamelesi görüyor ve
 * bu site geneline yayılıyor. Dolu sayfaların da sıralanamamasının sebebi bu.
 *
 * "follow" kasıtlı: sayfa indekslenmesin ama üzerindeki kategori ve ilan
 * bağlantıları taranmaya devam etsin. İlk ilan girdiği anda sayfa
 * kendiliğinden yeniden indekslenebilir hale dönüyor - kalıcı bir dışlama
 * değil, envantere bağlı bir anahtar.
 *
 * Aynı ilke sitemap'te zaten uygulanıyordu ("yalnızca gerçekten ilan
 * barındıran sayfaları bildir"); eksik olan, sayfanın kendisinin de aynı
 * şeyi söylemesiydi.
 */
export const BOS_SAYFA_ROBOTS: Metadata['robots'] = { index: false, follow: true };

/** İlan sayısı sıfırsa noindex döndürür, doluysa varsayılanı (undefined) bırakır. */
export function robotsIcinIlanSayisi(ilanSayisi: number): Metadata['robots'] | undefined {
  return ilanSayisi > 0 ? undefined : BOS_SAYFA_ROBOTS;
}
