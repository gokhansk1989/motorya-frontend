/**
 * JSON-LD'yi <script> etiketinin icine gomerken kullanilir.
 *
 * Neden gerekli: JSON.stringify HTML kacisi yapmaz. Iceride kullanici verisi
 * varsa (ilan basligi, aciklama, satici adi) ve o veri "</script>" iceriyorsa
 * script etiketi orada kapanir, devami HTML olarak calisir. Yani kayitli
 * herhangi bir kullanici, ilan basligina yazdigi metinle o sayfayi ziyaret
 * eden herkesin tarayicisinda kod calistirabilir - localStorage'daki oturum
 * jetonu dahil.
 *
 * "<" karakterini < olarak kacirmak bunu kokunden keser: JSON ayni
 * sekilde ayristirilir (Google structured data'yi dogru okur) ama HTML
 * ayristiricisi artik etiket baslangici gormez. "</script", "<!--" ve
 * "<script" varyantlarinin hepsi ayni anda kapanmis olur.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
