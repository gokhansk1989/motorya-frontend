import { api } from './api';
import { useAuthStore } from '@/store/auth';

let installed = false;

// Bazi 400'ler hata degil, normal kullanici davranisi: yanlis parola girmek
// gibi. Bunlari kaydetmek hata kaydini doldurup gercek sorunlari gizliyordu
// (son 24 saatteki 13 kaydin 4'u bu sinifdandi).
function kullaniciHatasi(url: string | undefined, mesaj: unknown): boolean {
  const u = url ?? '';
  const m = Array.isArray(mesaj) ? mesaj.join(' ') : String(mesaj ?? '');
  if (u.includes('/auth/login') && /şifre|parola|hatalı/i.test(m)) return true;
  return false;
}

/**
 * Bizim kodumuz OLMAYAN, aksiyon alınamaz tarayıcı/webview/eklenti
 * gürültüsü. Hata kaydının %90'ını bunlar dolduruyor ve gerçek sorunları
 * gizliyordu:
 *  - ResizeObserver loop: zararsız tarayıcı uyarısı, hata değil.
 *  - "Script error.": cross-origin (reklam) betiğinden gelen, mesajsız,
 *    teşhis edilemez olay.
 *  - _AutofillCallbackHandler / Java object is gone: uygulama içi tarayıcı
 *    (Instagram/Facebook webview) ve şifre yöneticisi eklentilerinin kendi
 *    enjekte ettiği kod; bizim sayfamızın hatası değil.
 */
const GURULTU = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /_AutofillCallbackHandler/i,
  /Java object is gone/i,
  /Can't find variable: (instgrm|fbq|__fb)/i,
  /Non-Error promise rejection captured/i,
];

function gurultuMu(mesaj: string, url?: string): boolean {
  // Hata kaydı ucunun KENDİSİ hata verince onu tekrar loglamak döngü
  // yaratıyor (API 502: POST /error-logs kayıtları buradan).
  if ((url ?? '').includes('/error-logs')) return true;
  return GURULTU.some((d) => d.test(mesaj));
}

function report(message: string, stack?: string | null, context?: Record<string, unknown>) {
  if (gurultuMu(message, context?.url as string | undefined)) return;
  const userId = useAuthStore.getState().user?.id;
  api
    .post('/error-logs', {
      source: 'web',
      message: message.slice(0, 2000),
      stack: stack?.slice(0, 8000),
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      context: { ...context, userId },
    })
    .catch(() => null);
}

export function installErrorReporter() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    report(event.message || 'window.onerror', event.error?.stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    report(
      reason?.message || String(reason) || 'Unhandled promise rejection',
      reason?.stack,
    );
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err.response?.status;
      const method = err.config?.method?.toUpperCase();
      const url = err.config?.url;

      // /error-logs'a giden isteğin kendi hatasını loglamak döngü yaratır.
      if ((url ?? '').includes('/error-logs')) return Promise.reject(err);

      if (status >= 500) {
        report(
          `API ${status}: ${method} ${url}`,
          err.stack,
          { status, url, body: err.response?.data },
        );
      } else if ((status === 400 || status === 422) && !kullaniciHatasi(url, err.response?.data?.message)) {
        // Validation hataları — sunucu hatası değil ama hangi form alanlarının sorun çıkardığını görmek için logla
        const msg = err.response?.data?.message;
        const msgStr = Array.isArray(msg) ? msg.join('; ') : String(msg ?? '');
        report(
          `Validation ${status}: ${method} ${url} — ${msgStr}`,
          undefined,
          { status, url, validationErrors: msg },
        );
      }

      return Promise.reject(err);
    },
  );
}
