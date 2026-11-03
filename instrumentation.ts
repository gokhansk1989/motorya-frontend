import * as Sentry from '@sentry/nextjs';

/**
 * Sentry server/edge baslatici (Next 15.3+ / Sentry 9+ bicimi).
 *
 * sentry.server.config.ts ve sentry.client.config.ts dosyalari TEK
 * BASLARINA yuklenMIYOR: Next, Sentry'yi yalnizca bu `register` hook'u
 * ve instrumentation-client.ts uzerinden devreye aliyor. Bu dosyalar
 * eksik oldugu icin DSN build'e gomuldugu halde Sentry.init hic
 * calismiyordu.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Sunucu bileseni hatalarini Sentry'ye baglar.
export const onRequestError = Sentry.captureRequestError;
