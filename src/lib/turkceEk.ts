// Sehir adlarina bulunma eki (-da/-de/-ta/-te) ekler.
//
// Daha once "Ankara'de satilik..." gibi sabit bir ek kullaniliyordu; bu
// sehirlerin cogunda yanlis. Ek iki kurala gore secilir:
//   1) Buyuk unlu uyumu — son unlu kalin (a, i, o, u) ise -da, ince ise -de.
//   2) Unsuz benzesmesi — son harf sert unsuz (f, s, t, k, c, s, h, p) ise
//      ek sertlesir: -ta / -te.
// Ozel ad oldugu icin ek kesme isaretiyle ayrilir.

const KALIN_UNLULER = 'aıou';
const INCE_UNLULER = 'eiöü';
const SERT_UNSUZLER = 'fstkçşhp';

function sonUnlu(ad: string): string | null {
  const harfler = ad.toLocaleLowerCase('tr-TR');
  for (let i = harfler.length - 1; i >= 0; i--) {
    const h = harfler[i];
    if (KALIN_UNLULER.includes(h) || INCE_UNLULER.includes(h)) return h;
  }
  return null;
}

/** Örn: bulunmaEki('Ankara') → "Ankara'da", bulunmaEki('Tokat') → "Tokat'ta" */
export function bulunmaEki(ad: string): string {
  const temiz = ad.trim();
  if (!temiz) return temiz;

  const unlu = sonUnlu(temiz);
  // Hiç ünlü yoksa (beklenmez) güvenli tarafta kalıp ince ek veriyoruz.
  const kalin = unlu ? KALIN_UNLULER.includes(unlu) : false;

  const sonHarf = temiz[temiz.length - 1].toLocaleLowerCase('tr-TR');
  const sert = SERT_UNSUZLER.includes(sonHarf);

  const ek = sert ? (kalin ? 'ta' : 'te') : (kalin ? 'da' : 'de');
  return `${temiz}'${ek}`;
}
