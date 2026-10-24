'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window { dataLayer: unknown[] }
}
import { usePathname } from 'next/navigation';

/**
 * Reklam ve olcumleme betiklerinin kapisi.
 *
 * ── NEDEN ─────────────────────────────────────────────────────────
 *
 * AdSense ve GA KOK layout'ta duruyordu, yani giris, kayit, parola
 * sifirlama ve hesap sayfalari dahil HER sayfada calisiyorlardi.
 *
 * Bu betikler bizim origin'imizde, bizim sayfamizin DOM'una tam
 * erisimle calisiyor. Giris formunun yaninda calisan ucuncu taraf bir
 * betik, o formdaki e-posta ve parolayi okuyabilecek konumdadir.
 * Google'in bunu yaptigini soylemiyoruz; mesele su ki ele gecirilmis
 * ya da degistirilmis bir reklam betigi (tedarik zinciri saldirisinin
 * en bilinen bicimi) bunu yapabilecek YETKIYE sahipti ve o yetkinin
 * orada hicbir isi yoktu. Kimlik sayfalarinda reklam envanteri de yok,
 * yani kaybedilen gelir sifira yakin.
 *
 * Hesap sayfalari da listede: orada form yok ama mesaj icerigi,
 * teklifler ve iletisim bilgileri var.
 *
 * ── SINIRI ────────────────────────────────────────────────────────
 *
 * Bu bir XSS savunmasi DEGIL. Saldirgan zaten sayfada kod
 * calistirabiliyorsa bu kapi onu durdurmaz. Yaptigi sey, normal
 * calismada ucuncu taraf kodun ulasabilecegi yuzeyi daraltmak.
 *
 * ── TEK BASINA YETMEYEN KISIM ─────────────────────────────────────
 *
 * Betigi render etmemek, ONCEDEN YUKLENMIS bir betigi durdurmuyor.
 * Olculdu: ana sayfadan "Giris yap" baglantisina tiklandiginda Next
 * istemci tarafinda geziniyor, belge degismiyor ve AdSense parola
 * alaninin yaninda calismaya devam ediyor. Yani kapi yalnizca
 * dogrudan acilislarda ise yariyordu.
 *
 * Bu yuzden hassas yollara gecis TAM SAYFA YUKLEMEYE zorlaniyor:
 * once baglanti tiklamalari yakalanip gercek gezinmeye cevriliyor
 * (ekranda sicrama olmuyor), kod icinden yapilan yonlendirmeler icin
 * de bir emniyet agi olarak sayfa bir kez yeniden yukleniyor. Yeniden
 * yukleme sonrasi betik DOM'da olmadigi icin dongu olusmuyor.
 */

/**
 * Betiklerin YUKLENMEYECEGI yollar.
 *
 * Onek esleşmesi: `/profilim/ayarlar` da kapsama giriyor. Liste
 * ACIK tutuluyor — yeni bir hesap sayfasi eklendiginde buraya da
 * eklenmesi gerekiyor ve bu, sessizce unutulmaktansa gorunur bir
 * bakim yuku.
 */
const GA_ID = 'G-S0BXZLVQ26';

const HASSAS_YOLLAR = [
  // Kimlik akisi — (auth) grubunun tamami
  '/giris',
  '/kayit',
  '/sifremi-unuttum',
  '/sifre-sifirla',
  '/email-dogrula',
  '/email-gonderildi',
  '/kullanici-adi',
  '/onaylar',
  '/callback',
  // Hesap sayfalari
  '/profilim',
  '/mesajlarim',
  '/ilanlarim',
  '/tekliflerim',
  '/bildirimler',
  '/favoriler',
  '/alarmlarim',
  '/ilan-ver',
];

export function hassasYolMu(yol: string): boolean {
  return HASSAS_YOLLAR.some((h) => yol === h || yol.startsWith(h + '/'));
}

/** Reklam/olcumleme betiklerinden biri belgede duruyor mu? */
function betikYuklenmisMi(): boolean {
  return !!document.querySelector(
    'script[src*="googlesyndication"], script[src*="googletagmanager"]',
  );
}

export default function UcuncuTarafBetikleri() {
  const yol = usePathname();
  const hassas = !!yol && hassasYolMu(yol);

  // Baglanti tiklamalarini yakala: hassas bir yola gidiliyorsa ve
  // betikler zaten yuklenmisse, istemci tarafi gezinme yerine gercek
  // bir gezinme yap. Yakalama evresinde dinleniyor ki Next'in kendi
  // isleyicisinden once calissin.
  useEffect(() => {
    if (hassas) return; // zaten hassas sayfadayiz, gidecek yer yok
    function tiklama(e: MouseEvent) {
      // Yeni sekme/pencere niyetine dokunma.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const hedef = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!hedef || hedef.target === '_blank') return;
      const href = hedef.getAttribute('href');
      if (!href || !href.startsWith('/')) return;
      if (!hassasYolMu(new URL(href, location.origin).pathname)) return;
      if (!betikYuklenmisMi()) return;
      e.preventDefault();
      window.location.assign(href);
    }
    document.addEventListener('click', tiklama, true);
    return () => document.removeEventListener('click', tiklama, true);
  }, [hassas]);

  // Emniyet agi: koddan yapilan yonlendirmeler (ornegin oturum yoksa
  // /giris'e atmak) baglanti tiklamasi uretmiyor. Hassas bir sayfaya
  // boyle gelindiyse ve betik hala duruyorsa sayfa bir kez yenileniyor.
  useEffect(() => {
    if (hassas && betikYuklenmisMi()) window.location.reload();
  }, [hassas, yol]);

  // GA'yi next/script yerine ELLE yukluyoruz.
  //
  // `lazyOnload` window load olayina bagli. Kok layout'tayken bu
  // sorunsuzdu: bilesen belge ilk render edilirken baglaniyordu. Artik
  // kosullu oldugu icin, kullanici giris sayfasindan geri dondugunde
  // bilesen load olayindan SONRA baglaniyor ve betik hic yuklenmiyordu
  // -- olculdu: dataLayer yalnizca onay varsayilanini iceriyordu, yani
  // giristen gecen oturumlar olcume hic girmiyordu.
  //
  // Elle yuklemek ayni performans ozelligini koruyor (kritik yolda
  // degil, bos ana is parcaciginda) ama yeniden baglanmada da calisiyor.
  useEffect(() => {
    if (hassas) return;
    if (document.querySelector('script[src*="googletagmanager"]')) return;

    let iptal = false;
    const yukle = () => {
      if (iptal || document.querySelector('script[src*="googletagmanager"]')) return;
      const el = document.createElement('script');
      el.async = true;
      el.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(el);
      window.dataLayer = window.dataLayer || [];
      function gtag(...a: unknown[]) { window.dataLayer.push(a); }
      gtag('js', new Date());
      gtag('config', GA_ID);
    };

    // Bos kalana kadar bekle; sayfa yuklenmediyse once onu bekle.
    const planla = () =>
      'requestIdleCallback' in window
        ? (window as any).requestIdleCallback(yukle, { timeout: 4000 })
        : setTimeout(yukle, 1200);

    if (document.readyState === 'complete') planla();
    else window.addEventListener('load', planla, { once: true });

    return () => { iptal = true; };
  }, [hassas]);

  if (hassas) return null;

  return (
    <>
      {/* AdSense. React bu etiketi head'e tasiyor; Google'in dogrulama
          taramasi ana sayfa ve ilan sayfalarindan geciyor, orada
          degismedi. */}
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4400330012095219"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
