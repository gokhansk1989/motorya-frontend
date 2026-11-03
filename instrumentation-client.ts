import * as Sentry from '@sentry/nextjs';

/**
 * Tarayici (client) Sentry baslatici — Next 15.3+ bu dosyayi otomatik
 * yukluyor. Eski sentry.client.config.ts tek basina calismiyordu.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // Admin paneldeki ErrorLog GURULTU filtresinin aynisi: reklam/IAB,
    // webview, eklenti enjeksiyonlari ve zararsiz tarayici uyarilari
    // Sentry'yi de doldurmasin.
    ignoreErrors: [
      /ResizeObserver loop/,
      /^Script error\.?$/,
      /_AutofillCallbackHandler/,
      /Java object is gone/,
      /window\._META|_META\.IAB/,
      'Non-Error promise rejection captured',
    ],
  });
}

// Istemci tarafi yonlendirme izleme (performans).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
