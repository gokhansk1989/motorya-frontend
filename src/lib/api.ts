import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://98.93.139.51/api-backend';

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
      // Refresh başarısız — oturumu temizle ve login'e yönlendir.
      const hadToken = !!localStorage.getItem('access_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('device_id');
      if (hadToken) window.location.href = '/giris';
    }
    return Promise.reject(err);
  }
);
