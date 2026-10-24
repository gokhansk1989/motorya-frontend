/**
 * Kimlik ve hesap sayfalarinin listesi — TEK KAYNAK.
 *
 * Iki yerden okunuyor:
 *  - `UcuncuTarafBetikleri`: reklam ve olcumleme betiklerini bu
 *    yollarda hic yuklemiyor.
 *  - `middleware.ts`: bu yollara nonce'lu, siki bir `script-src`
 *    veriyor.
 *
 * Ikisi ayri listeler tutsaydi biri guncellenip digeri unutulurdu ve
 * sonuc sessiz olurdu: sayfa calismaya devam eder, yalnizca koruma
 * eksik kalirdi. Sessiz bozulmalar en gec fark edilenlerdir.
 */
export const HASSAS_YOLLAR = [
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

/** Onek eslesmesi: `/profilim/ayarlar` da kapsama giriyor. */
export function hassasYolMu(yol: string): boolean {
  return HASSAS_YOLLAR.some((h) => yol === h || yol.startsWith(h + '/'));
}
