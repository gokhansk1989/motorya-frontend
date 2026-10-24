import { NextResponse, type NextRequest } from 'next/server';
import { hassasYolMu } from '@/lib/hassas-yollar';

/**
 * Kimlik ve hesap sayfalarina nonce'lu, siki bir `script-src` verir.
 *
 * ── NEDEN YALNIZCA BU SAYFALAR ────────────────────────────────────
 *
 * `script-src` site genelinde hala yalnizca RAPOR modunda, cunku
 * zorlayici moda gecmek nonce gerektiriyor ve nonce bedava degil:
 * nonce her yanitta benzersiz olmak zorunda, yani o rota STATIK
 * URETIMDEN cikip her istekte render edilmeye baslar. Olculdu: 14
 * statik rotanin 9'u zaten bu hassas sayfalar.
 *
 * Bu 9 sayfa icin bedel dusuk -- hepsi kisisellestirilmis, statik HTML
 * orada yalnizca bir kabuk. Buna karsilik korumanin en cok gerektigi
 * yer de burasi: parola, e-posta, mesaj icerigi ve iletisim bilgisi
 * bu sayfalarda. Yani maliyetin dusuk, faydanin yuksek oldugu yerden
 * basliyoruz; ana sayfa ve ilan sayfalari (trafigin buyuk kismi ve
 * statik uretimin asil degerli oldugu yer) dokunulmadan kaliyor.
 *
 * ── NEDEN HASH DEGIL NONCE ────────────────────────────────────────
 *
 * Next'in satir ici betikleri RSC yukunu tasiyor, yani sayfanin
 * ICERIGI gomulu. Hash her sayfada ve her icerik degisikliginde
 * degisir; liste tutmak mumkun degil.
 *
 * ── NEDEN 'strict-dynamic' ────────────────────────────────────────
 *
 * Nonce'lu betigin yukledigi betikler de guvenilir sayiliyor. Buna
 * ihtiyac var: Turnstile'i kendi kodumuz `createElement` ile
 * enjekte ediyor ve ona nonce ekleyemiyoruz. 'strict-dynamic'
 * destekleyen tarayicida 'self' yok sayiliyor, desteklemeyende
 * 'self' geri plan olarak kaliyor.
 */
export function middleware(istek: NextRequest) {
  // Hassas olmayan yollara DOKUNMUYORUZ. Istek basliklarini
  // degistirmek rotayi dinamige cevirir; ana sayfa ve ilan sayfalari
  // statik kalmali.
  if (!hassasYolMu(istek.nextUrl.pathname)) return NextResponse.next();

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  // Yalnizca `script-src` yaziyoruz. Diger yonergeler
  // `next.config.ts`'deki basliktan geliyor ve iki CSP basligi
  // birlikte KESISIM olarak uygulaniyor; burada tekrar etmek, biri
  // guncellenip digeri unutuldugunda sessiz bir gevseme uretirdi.
  const politika = `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; report-uri /api/csp-rapor`;

  // Next, nonce'u ISTEK basligindaki CSP'den okuyup kendi script
  // etiketlerine ekliyor. `x-nonce` de sayfa kodunun okumasi icin.
  const basliklar = new Headers(istek.headers);
  basliklar.set('x-nonce', nonce);
  basliklar.set('Content-Security-Policy', politika);

  const yanit = NextResponse.next({ request: { headers: basliklar } });
  yanit.headers.set('Content-Security-Policy', politika);
  return yanit;
}

export const config = {
  /**
   * Statik dosyalar, resim iyilestirme ve API uclari disarida.
   *
   * Eslesen her istekte middleware calisiyor ama yalnizca hassas
   * yollarda baslik yaziyor; gerisi icin tek yaptigi bir `startsWith`
   * karsilastirmasi.
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
