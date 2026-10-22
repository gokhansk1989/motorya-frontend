/**
 * İlan kartı görsel oranının TEK kaynağı.
 *
 * ── NEDEN TEK BİR YER ─────────────────────────────────────────────
 *
 * Üç ayrı yerde üç ayrı oran vardı ve hiçbiri diğerini tutmuyordu:
 *
 *   - Arama kartı (.m-card-media)  : 4 / 3.4
 *   - Kapak kırpma ekranı          : aspect={1}, yani KARE
 *   - Kırpma ekranındaki açıklama  : "kartlarda kare olarak gösterilecek"
 *
 * Yani satıcı kare bir alan seçiyor, kart onu yatay bir kutuda
 * gösteriyordu: seçtiği kadrajın altı ve üstü kırpılıyordu. Mont ve bot
 * gibi uzun ürünlerde bu, ürünün yarısını kesmek demekti.
 *
 * Oran burada tanımlanıp hem kırpma ekranına (sayı olarak) hem CSS'e
 * (`--kart-orani` değişkeni) veriliyor; ikisi artık ayrışamaz.
 */
export const KART_GENISLIK = 4;
export const KART_YUKSEKLIK = 3.4;

/** react-easy-crop ve benzeri API'ler genişlik/yükseklik bekliyor. */
export const KART_ORANI = KART_GENISLIK / KART_YUKSEKLIK;

/** CSS `aspect-ratio` sözdizimi. */
export const KART_ORANI_CSS = `${KART_GENISLIK} / ${KART_YUKSEKLIK}`;

/**
 * Kırpma ekranında kullanıcıya gösterilecek açıklama.
 *
 * "Kare" demek yanlıştı. Doğrusunu söylemek de yetmiyor: asıl soru
 * "fotoğrafın tamamı mı görünecek, yoksa kırpılacak mı".
 */
export const KADRAJ_ACIKLAMA =
  'Kart görselinin oranı bu. Çerçevenin dışında kalan kısım kartlarda görünmez — ' +
  'ilan detayında fotoğrafın tamamı korunur.';
