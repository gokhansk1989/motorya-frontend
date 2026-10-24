import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { API_URL } from './apiBase';
import { guvenliYol } from './donus';
import { tokeniAl, tokeniYaz, tokeniSil, yenilemeyiPaylas } from './oturum';

export { API_URL };

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  /**
   * Yenileme çerezinin gidebilmesi için şart.
   *
   * Site API'ye kendi origin'i üzerinden (`motorya.com.tr/api-backend`)
   * konuştuğu için bu aslında same-origin bir istek; yine de axios'un
   * varsayılanı çerez göndermemek, açıkça belirtmek gerekiyor.
   */
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Token BELLEKTEN okunuyor; `localStorage`'da bir kopyası yok.
    const token = tokeniAl();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh flow: 401 gelirse tek seferlik refresh dene, orijinal isteği yeni token ile tekrarla.
// Paralel giren 401'ler tek refresh çağrısını bekler (queue).
/**
 * Erişim tokenını yeniler.
 *
 * GÖVDE BOŞ: yenileme tokenı ve cihaz kimliği `HttpOnly` çerezde,
 * sunucu onları oradan okuyor. İstemcinin bu değerleri bilmesi
 * gerekmiyor — zaten amacı bu.
 *
 * Yeni yenileme tokenı da yanıtta dönmüyor; sunucu çerezi kendisi
 * güncelliyor (rotasyon).
 */
export async function performRefresh(): Promise<string | null> {
  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, {}, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    const newAccess = res.data?.accessToken as string | undefined;
    if (newAccess) tokeniYaz(newAccess);
    return newAccess ?? null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    if (typeof window === 'undefined') return Promise.reject(err);
    const original = err.config as AxiosRequestConfig & { _retried?: boolean };
    const status = err.response?.status;
    // Refresh endpoint'inde 401 gelirse döngü kırılır — direkt logout.
    const url = original?.url ?? '';
    if (status === 401 && !original._retried && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
      original._retried = true;
      /**
       * Eşzamanlı 401'ler TEK yenileme isteğini paylaşıyor.
       *
       * Sunucuda rotasyon ve tekrar kullanım tespiti var: paralel iki
       * yenileme isteğinden ikincisi ESKİ tokenı sunmuş olur ve
       * oturumu kapattırır. Yani koruma kendi kullanıcımızı atardı.
       */
      const newToken = await yenilemeyiPaylas(performRefresh);
      if (newToken) {
        original.headers = { ...(original.headers as any), Authorization: `Bearer ${newToken}` };
        return api.request(original);
      }
      /**
       * Refresh basarisiz. Simdi iki soruyu AYIRMAK zorundayiz:
       * "gercekten bir oturum var miydi" ve "bu istek oturum gerektiriyor
       * muydu".
       *
       * ── BULUNAN HATA ────────────────────────────────────────────────
       * Eski kontrol soyleydi:
       *
       *   oturumVardi = access_token VAR MI || 'motorya-auth' VAR MI
       *
       * 'motorya-auth' zustand persist'in anahtari. `logout()` state'i
       * null'liyor ama persist anahtari SILMIYOR, uzerine
       * {"state":{"user":null,...}} yaziyor - yani anahtar cikis
       * yaptiktan sonra da localStorage'da DURUYOR ve truthy.
       *
       * Sonuc: cikis yapmis bir ziyaretci herkese acik bir ilan sayfasini
       * actiginda, kullaniciya ozel herhangi bir istek (favori listesi
       * gibi) 401 alinca `oturumVardi` true cikiyor ve ziyaretci
       * "Oturumun sona erdi" ekranina atiliyordu. Ayni ilani ikinci kez
       * acinca sorun kayboluyordu, cunku ilk seferde bu kod
       * 'motorya-auth' anahtarini silmis oluyordu. Inceleme raporundaki
       * "ikinci acilista misafir olarak erisilebilir kaldi" gozlemi tam
       * olarak bu.
       *
       * Artik yalnizca GERCEK kimlik bilgisinin varligina bakiliyor.
       */
      /**
       * Oturum VAR MIYDI?
       *
       * Artık tek ölçüt bellekteki token. Eskiden `motorya-auth`
       * anahtarının varlığına da bakılıyordu; zustand `logout()`'ta o
       * anahtarı silmeyip üzerine `{"state":{"user":null}}` yazdığı
       * için çıkış yapmış ziyaretçi de "oturumu doldu" ekranına
       * atılıyordu. Artık anahtarda kimlik bilgisi yok, zaten ölçüt
       * olarak da kullanılmıyor.
       */
      const oturumVardi = !!tokeniAl();

      tokeniSil();
      // Kalıcı kullanıcı nesnesi de düşüyor: oturum bitti.
      try { localStorage.removeItem('motorya-auth'); } catch { /* gizli sekme */ }

      /**
       * Istegi yapan taraf "bu istek misafirde de 401 donebilir, beni
       * giris sayfasina atma" diyebiliyor. Herkese acik sayfalardaki
       * istege bagli kullanici verisi (favori durumu, kendi teklifim)
       * boyle isaretleniyor.
       */
      const sessiz = (original as any)?.misafirdeSessiz === true;

      if (oturumVardi && !sessiz) {
        // Nereden atıldığını taşı ki giriş sonrası kullanıcı aynı yere dönsün.
        const guvenli = guvenliYol(window.location.pathname + window.location.search) ?? '/';
        const hedef = `/giris?oturum=doldu&devam=${encodeURIComponent(guvenli)}`;
        window.location.href = hedef;
      }
    }
    return Promise.reject(err);
  }
);
