import type { MetadataRoute } from 'next';

/**
 * PWA manifesti — mobil tarayıcıda "Ana Ekrana Ekle" için.
 *
 * Neden gerekli: manifest olmadan Android'de eklenen kısayol sıradan bir
 * yer imi gibi davranıyordu — tarayıcı çubuğuyla açılıyor, adı sayfa
 * başlığından (uzun ve her sayfada değişen) türetiliyor, açılış ekranı
 * olmuyordu. Trafiğin büyük kısmı mobilden geldiği için bu, uygulama
 * hissini kaybettiğimiz en ucuz yerdi.
 *
 * `maskable` ikonlar ayrı: Android ikonun dış kenarlarını cihazın şekline
 * göre (daire, squircle) kırpıyor. Normal ikon kırpılınca M'nin kenarları
 * kesiliyordu; maskable sürümde içerik güvenli alana çekildi.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Motorya — Motosiklet Ekipman Pazarı',
    short_name: 'Motorya',
    description:
      'İkinci el motosiklet kask, mont, eldiven ve ekipman al-sat. Ücretsiz ilan, güvenli mesajlaşma.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fbfaf8',
    theme_color: '#D83E13',
    lang: 'tr',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    // Uygulama simgesine uzun basınca çıkan kısayollar.
    shortcuts: [
      { name: 'İlan Ver', url: '/ilan-ver' },
      { name: 'Mesajlarım', url: '/mesajlarim' },
      { name: 'Favorilerim', url: '/favoriler' },
    ],
  };
}
