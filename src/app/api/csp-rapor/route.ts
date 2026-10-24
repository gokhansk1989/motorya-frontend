import { NextRequest, NextResponse } from 'next/server';

/**
 * CSP ihlal raporlarını toplayan uç.
 *
 * ── NEDEN GEREKLİ ─────────────────────────────────────────────────
 *
 * Sitede kapsamlı CSP kuralları `Content-Security-Policy-Report-Only`
 * başlığında duruyor ama başlıkta `report-uri`/`report-to` YOKTU.
 * Yani ihlaller hiçbir yere gönderilmiyordu: yalnızca her kullanıcının
 * kendi tarayıcı konsoluna yazılıyor ve orada kalıyordu.
 *
 * Sonuç: politika "rapor modunda" görünüyor ama bize hiçbir şey
 * raporlamıyordu. Zorlayıcı moda geçmek için hangi kaynakların gerçekten
 * kullanıldığını bilmek gerekiyor; o bilgi hiç toplanmamıştı.
 *
 * ── VERİ AZALTMA ──────────────────────────────────────────────────
 *
 * Rapor gövdesindeki adresler sorgu dizgisi taşıyabilir ve orada
 * jeton ya da kişisel veri bulunabilir (parola sıfırlama bağlantısı,
 * e-posta doğrulama tokenı, arama metni). Bu yüzden her adres
 * BUDANIYOR: yalnızca origin + yol saklanıyor, sorgu ve parça atılıyor.
 *
 * Satır içi ihlallerde tarayıcı `script-sample` gönderebilir; o da
 * sayfa içeriğinden parça taşıyabileceği için hiç alınmıyor.
 */

export const runtime = 'nodejs';
/** Rapor uçları önbelleğe girmemeli. */
export const dynamic = 'force-dynamic';

/** Adresten sorgu ve parçayı atar; bozuksa tamamen düşürür. */
function adresiBuda(ham: unknown): string | null {
  if (typeof ham !== 'string' || !ham) return null;
  // `inline`, `eval` gibi şema olmayan değerler olduğu gibi anlamlı.
  if (!ham.includes('://')) return ham.slice(0, 64);
  try {
    const u = new URL(ham);
    // Sorgu ve parça atılıyor (jeton taşıyabilir). KULLANICI BİLGİSİ de
    // (`https://kullanici:parola@host`) atılıyor: `origin` zaten
    // içermiyor ama açıkça sıfırlamak niyeti belli ediyor.
    u.username = '';
    u.password = '';
    return `${u.origin}${u.pathname}`.slice(0, 256);
  } catch {
    return null;
  }
}

/**
 * Hız sınırı — kaba ama yeterli.
 *
 * Uç kimlik doğrulaması İSTEMİYOR (tarayıcı rapor gönderirken oturum
 * taşımaz) ve bu onu kötüye kullanıma açık bırakır: kayıt deposunu
 * şişirmek için saniyede binlerce sahte rapor gönderilebilir.
 *
 * IP başına pencere içinde sabit sayıda rapor kabul ediliyor; fazlası
 * sessizce düşüyor. Bellekte tutuluyor çünkü amaç kalıcı bir sayaç
 * değil, ani yüklerin kaydı boğmasını engellemek.
 */
const PENCERE_MS = 60_000;
const PENCERE_BASINA = 30;
const sayaclar = new Map<string, { adet: number; sifirla: number }>();

function sinirAsildiMi(ip: string): boolean {
  const simdi = Date.now();
  const k = sayaclar.get(ip);
  if (!k || k.sifirla < simdi) {
    sayaclar.set(ip, { adet: 1, sifirla: simdi + PENCERE_MS });
    // Harita sınırsız büyümesin: pencere dolmuş kayıtlar temizleniyor.
    if (sayaclar.size > 5000) {
      for (const [anahtar, deger] of sayaclar) if (deger.sifirla < simdi) sayaclar.delete(anahtar);
    }
    return false;
  }
  k.adet += 1;
  return k.adet > PENCERE_BASINA;
}

/** Tarayıcıların gönderdiği rapor içerik türleri. */
const GECERLI_TURLER = ['application/csp-report', 'application/reports+json', 'application/json'];

/** Kabul edilen en büyük gövde. Büyüğü hiç okunmuyor. */
const EN_FAZLA_BAYT = 16 * 1024;

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'bilinmiyor';
    if (sinirAsildiMi(ip)) return new NextResponse(null, { status: 204 });

    // İçerik türü doğrulaması: rapor uçları yalnızca bu türleri alır.
    const tur = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!GECERLI_TURLER.includes(tur)) return new NextResponse(null, { status: 204 });

    // Boyut sınırı: önce bildirilen uzunluğa, sonra gerçek metne bakıyoruz
    // (Content-Length yalan söyleyebilir).
    const bildirilen = Number(req.headers.get('content-length') ?? '0');
    if (bildirilen > EN_FAZLA_BAYT) return new NextResponse(null, { status: 204 });
    const metin = await req.text();
    if (metin.length > EN_FAZLA_BAYT) return new NextResponse(null, { status: 204 });

    const govde = JSON.parse(metin);
    // Tarayıcılar iki ayrı biçim gönderiyor: eski `csp-report`,
    // yeni Reporting API dizisi. İkisini de karşılıyoruz.
    // Tek rapor, Reporting API dizisi ya da bozuk bir şey olabilir.
    // Dizi uzunluğu da sınırlı: tek istekte yüzlerce kayıt yazdırmak
    // hız sınırını dolaşmanın yolu olurdu.
    const kayitlar = (Array.isArray(govde) ? govde : [govde]).slice(0, 20);

    for (const k of kayitlar) {
      const r = k?.['csp-report'] ?? k?.body ?? k;
      if (!r) continue;

      const temiz = {
        ihlalEdilen: String(r['violated-directive'] ?? r.effectiveDirective ?? '').slice(0, 64),
        engellenen: adresiBuda(r['blocked-uri'] ?? r.blockedURL),
        sayfa: adresiBuda(r['document-uri'] ?? r.documentURL),
        // `script-sample` BİLEREK alınmıyor: sayfa içeriğinden parça
        // taşıyabilir.
      };
      if (!temiz.ihlalEdilen) continue;

      // Şimdilik sunucu kaydına yazıyoruz. Kalıcı saklama ve panel
      // görünümü gerekirse ayrı bir iş; önce hangi kaynakların
      // gerçekten ihlal ürettiğini görmek istiyoruz.
      console.warn('[csp]', JSON.stringify(temiz));
    }
  } catch {
    // Bozuk rapor sessizce düşüyor: bu uç bir saldırı yüzeyi değil,
    // hata döndürmesinin kimseye faydası yok.
  }

  // 204: tarayıcı yanıt gövdesi beklemiyor.
  return new NextResponse(null, { status: 204 });
}
