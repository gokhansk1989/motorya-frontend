import { api } from './api';
import { useAuthStore } from '@/store/auth';

let installed = false;

function report(message: string, stack?: string | null, context?: Record<string, unknown>) {
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

      if (status >= 500) {
        report(
          `API ${status}: ${method} ${url}`,
          err.stack,
          { status, url, body: err.response?.data },
        );
      } else if (status === 400 || status === 422) {
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
