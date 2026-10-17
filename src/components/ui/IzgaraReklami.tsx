'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Izgara icine yerlesen reklam.
 *
 * ESKI DAVRANIS VE NEDEN BOZUKTU
 * Arama sonuclarinda her 6 kartta bir `gridColumn: 1/-1` bir reklam
 * konuyordu. Sutun sayisi ekrana gore degisiyor (auto-fit), masaustunde
 * 5 oluyor. 6 sabit sayisi 5'in kati olmadigi icin reklam satirin
 * ORTASINDA bir satir sonu zorluyordu: 2. satirda tek kart kalip saginda
 * dort bos hucre olusuyordu. Reklam dolmadiginda da yerinde bir bosluk
 * kaliyordu.
 *
 * YENI DAVRANIS
 * - Yerlesim noktasini cagiran taraf, ekranin GERCEK sutun sayisindan
 *   hesapliyor; reklam her zaman tamamlanmis bir satirin ardina geliyor.
 * - Bu bilesen dolum durumunu ayri ayri ele aliyor:
 *     bekliyor  -> yer ayrilmis, iskelet yok (sicrama olmasin diye
 *                  minimum yukseklik ayrilir)
 *     doldu     -> "Reklam" etiketi gosterilir
 *     bos/hata  -> kapsayici TAMAMEN kaldirilir (height 0, margin 0)
 * - Kapandiktan sonra GERI ACILMIYOR. Gec gelen bir reklam sayfayi
 *   yeniden acip kapatirsa kullanici okudugu yeri kaybediyor.
 *
 * Reklamin kendi icerigi OKUNMUYOR: iframe'e dokunulmuyor, yalnizca
 * AdSense'in `<ins>` uzerine yazdigi `data-ad-status` ozniteligi
 * izleniyor - saglayicinin kendi sagladigi yontem bu.
 */

type Durum = 'bekliyor' | 'doldu' | 'bos';

export function IzgaraReklami({ slot }: { slot: string }) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [durum, setDurum] = useState<Durum>('bekliyor');
  // Bir kez 'bos' olduysa bir daha degismesin.
  const kilitli = useRef(false);

  useEffect(() => {
    if (!slot) { setDurum('bos'); return; }
    if (pushed.current) return;

    const el = insRef.current;
    if (!el) return;

    // AdSense'e genisligi SIFIR olan bir kapsayici verilirse
    // "No slot size for availableWidth=0" hatasi atip slotu olu
    // birakiyor. Izgara hucresi ilk boyamada henuz olculmemis
    // olabiliyor, bu yuzden genislik olusana kadar bekliyoruz.
    const basla = () => {
      if (pushed.current) return;
      if (el.getBoundingClientRect().width < 1) return;
      pushed.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        setDurum('bos');
        kilitli.current = true;
      }
    };

    const genislikGozlemci = new ResizeObserver(() => {
      basla();
      if (pushed.current) genislikGozlemci.disconnect();
    });
    genislikGozlemci.observe(el);
    basla();

    const degerlendir = () => {
      if (kilitli.current) return;
      const s = el.getAttribute('data-ad-status');
      if (s === 'filled') { setDurum('doldu'); kilitli.current = true; }
      else if (s === 'unfilled') { setDurum('bos'); kilitli.current = true; }
    };

    const gozlemci = new MutationObserver(degerlendir);
    gozlemci.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });
    degerlendir();

    // Saglayici hic yanit vermezse (script engellenmis, ag kesik) oznitelik
    // hic yazilmaz ve kapsayici sonsuza kadar yer tutardi. Tek seferlik bir
    // zaman asimi bunu kapatiyor; sure dolduktan SONRA gelen reklam da
    // yerlesimi tekrar bozmasin diye kilit ayni anda duşuyor.
    const zamanAsimi = setTimeout(() => {
      if (kilitli.current) return;
      const s = el.getAttribute('data-ad-status');
      if (s !== 'filled') { setDurum('bos'); kilitli.current = true; }
    }, 4000);

    return () => { gozlemci.disconnect(); genislikGozlemci.disconnect(); clearTimeout(zamanAsimi); };
  }, [slot]);

  if (durum === 'bos') {
    // Tamamen kaldiriliyor: grid'de hucre birakmiyor.
    return null;
  }

  return (
    <div
      style={{
        gridColumn: '1 / -1',
        // Dolan reklama yer ayirmak sicramayi azaltiyor; bekleme
        // durumunda da ayni yuksekligi tutuyoruz ki reklam gelince
        // sayfa zıplamasin.
        minHeight: durum === 'doldu' ? undefined : 90,
        margin: '4px 0',
      }}
    >
      {durum === 'doldu' && (
        <div
          style={{
            fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--ink-3)', marginBottom: 4, fontFamily: 'var(--font-mono)',
          }}
        >
          Reklam
        </div>
      )}
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
