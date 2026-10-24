/**
 * Erişim tokenının TEK sahibi: bellek.
 *
 * ── NEDEN localStorage DEĞİL ──────────────────────────────────────
 *
 * Erişim ve yenileme tokenı `localStorage`'da duruyordu. Aynı
 * origin'de çalışan bir XSS ya da ele geçirilmiş üçüncü taraf betiği
 * ikisini de okuyup dışarı gönderebilirdi; yenileme tokenıyla oturum
 * süresiz devralınabilirdi.
 *
 * Artık:
 *  - Yenileme tokenı sunucuda `HttpOnly` çerezde — JavaScript okuyamaz.
 *  - Erişim tokenı yalnızca BURADA, bir modül değişkeninde. Sekme
 *    kapanınca gidiyor; diske hiç yazılmıyor.
 *
 * Bunun maliyeti: sayfa yenilenince token kayboluyor ve bir kez
 * `/auth/refresh` çağırmak gerekiyor. Oturum yine de sürüyor, çünkü
 * çerez tarayıcıda duruyor.
 *
 * `HttpOnly` XSS'i çözmez — saldırgan hâlâ kullanıcının sekmesinde
 * istek atabilir. Ama tokenı çalıp başka bir makineden, günlerce
 * kullanmasını engeller.
 */

let erisimTokeni: string | null = null;

/** Yenileme turu sürerken bekleyenlerin paylaştığı tek söz. */
let yenilemeSozu: Promise<string | null> | null = null;

export function tokeniAl(): string | null {
  return erisimTokeni;
}

export function tokeniYaz(token: string | null) {
  erisimTokeni = token;
}

export function tokeniSil() {
  erisimTokeni = null;
}

/**
 * Eşzamanlı yenilemeyi tek çağrıya indirger.
 *
 * Sayfa açılışında beş istek birden 401 alabiliyor. Beşi de ayrı
 * yenileme isteği atsaydı, sunucudaki rotasyon yüzünden ilki
 * dışındakiler ESKİ tokenı sunmuş olurdu — ve tekrar kullanım
 * tespiti devreye girip oturumu kapatırdı. Yani koruma, kendi
 * kullanıcımızı atardı.
 *
 * Söz tamamlanana kadar herkes aynı sonucu bekliyor.
 */
export function yenilemeyiPaylas(uret: () => Promise<string | null>): Promise<string | null> {
  if (!yenilemeSozu) {
    yenilemeSozu = uret().finally(() => {
      // Bir sonraki 401'de yeniden denenebilsin diye sıfırlanıyor.
      yenilemeSozu = null;
    });
  }
  return yenilemeSozu;
}

/**
 * Eski sürümden kalan tokenları temizler.
 *
 * Geçiş: `localStorage`'da token tutan bir sürümü kullanmış
 * tarayıcılarda bu anahtarlar duruyor olabilir. Bırakılırlarsa
 * düzeltmenin amacı boşa çıkar — saldırganın okuyabileceği bir kopya
 * diskte kalmaya devam eder.
 *
 * Bir kez, uygulama açılışında çağrılıyor. Eski oturum bu noktada
 * geçersiz sayılıyor; kullanıcı yeniden giriş yapıyor. Sessizce
 * taşımak mümkün değildi: eski yenileme tokenını çereze yazmak için
 * onu okumak gerekirdi ve o da JavaScript'ten okunabilir bir yerde
 * olurdu.
 */
export function eskiDepoyuTemizle() {
  if (typeof window === 'undefined') return;
  for (const anahtar of ['access_token', 'refresh_token', 'device_id', 'admin_token', 'admin_refresh_token', 'admin_device_id']) {
    try { localStorage.removeItem(anahtar); } catch { /* gizli sekme */ }
  }
}
