import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { API_URL } from './apiBase';
import { guvenliYol } from './donus';

export { API_URL };

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh flow: 401 gelirse tek seferlik refresh dene, orijinal isteği yeni token ile tekrarla.
// Paralel giren 401'ler tek refresh çağrısını bekler (queue).
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  const deviceId = localStorage.getItem('device_id');
  if (!refreshToken || !deviceId) return null;
  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken, deviceId }, {
      headers: { 'Content-Type': 'application/json' },
    });
    const newAccess = res.data?.accessToken as string | undefined;
    const newRefresh = res.data?.refreshToken as string | undefined;
    if (newAccess) localStorage.setItem('access_token', newAccess);
    if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
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
      refreshInFlight = refreshInFlight ?? performRefresh();
      const newToken = await refreshInFlight;
      refreshInFlight = null;
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
      const oturumVardi =
        !!localStorage.getItem('access_token') || !!localStorage.getItem('refresh_token');

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('device_id');
      localStorage.removeItem('motorya-auth');

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
