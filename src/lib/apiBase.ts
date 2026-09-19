// API adresinin tek kaynağı.
//
// Buradaki değerler üç dosyada ayrı ayrı türetiliyordu ve hepsinin yedeği
// eski sunucunun IP'siydi (98.93.139.51). O IP artık yanıt vermiyor ve bir
// başkasına verilmiş olabilir; env değişkeni unutulduğunda site hata vermek
// yerine sessizce oraya istek atıyordu — üstelik isteklerde oturum jetonu var.
//
// Bu yüzden yedek adres yok: üretimde değişken yoksa build patlar. Sunucu
// taşımasında en kolay unutulan şey env dosyası olduğu için, hatayı canlıda
// sessizce yaşamaktansa build'de yüksek sesle almak istiyoruz.
//
// NEXT_PUBLIC_* build sırasında koda gömülür, yani bu kontrol build zamanında
// çalışır — deploy sırasında fark edilir, kullanıcıya yansımaz.

const fromEnv = process.env.NEXT_PUBLIC_API_URL;

function resolve(): string {
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000';
  throw new Error(
    'NEXT_PUBLIC_API_URL tanımlı değil. Üretim build\'i API adresi olmadan alınamaz. ' +
      'Bu değişken sunucuda .env.local içinde duruyor (.env.production değil) — ' +
      'sunucu taşındıysa o dosyanın kopyalandığından emin olun.',
  );
}

/** Örn: https://motorya.com.tr/api-backend */
export const API_URL = resolve();

/** Socket.io bağlantısı için origin (yol kısmı atılmış hali) */
export const SOCKET_ORIGIN = API_URL.replace(/\/api-backend.*/, '').replace(/\/api.*/, '');

/** nginx altında API /api-backend altındaysa socket yolu da oradan geçer */
export const SOCKET_PATH = API_URL.includes('/api-backend') ? '/api-backend/socket.io' : '/socket.io';

/**
 * Sunucu tarafi (SSR) icin API adresi.
 *
 * Sayfalar sunucuda uretilirken API'ye kendi GENEL adresimiz uzerinden
 * gidiliyordu: istek Hetzner'dan cikip Cloudflare'e donuyordu. Cloudflare'de
 * Turkiye disina dogrulama kurali devreye girince sunucunun kendi istekleri de
 * 403 almaya basladi - yani ilan sayfalari sunucu tarafinda veri cekemez oldu,
 * Google bos bir kabuk gormeye basladi.
 *
 * Dogrusu zaten sunucunun kendi icinden konusmasi: hem CDN'e gidip donmuyor,
 * hem kenar kurallarina bagimli olmuyor, hem de daha hizli.
 * INTERNAL_API_URL sunucuda tanimlidir (orn. http://127.0.0.1:3000);
 * tanimli degilse genel adrese duser, yani gelistirmede bir sey degismez.
 */
export const SSR_API_URL =
  typeof window === 'undefined' ? (process.env.INTERNAL_API_URL || API_URL) : API_URL;
