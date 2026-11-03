import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // Admin paneldeki hata kaydina uyguladigimiz GURULTU filtresinin ayni
    // -- Sentry de ucuncu taraf/tarayici gurultusuyle dolmasin: reklam,
    // webview, eklenti enjeksiyonlari ve zararsiz tarayici uyarilari.
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
