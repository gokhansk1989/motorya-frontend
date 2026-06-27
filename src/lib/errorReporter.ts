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
      if (err.response?.status >= 500) {
        report(
          `API ${err.response.status}: ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
          err.stack,
          { status: err.response.status, url: err.config?.url },
        );
      }
      return Promise.reject(err);
    },
  );
}
