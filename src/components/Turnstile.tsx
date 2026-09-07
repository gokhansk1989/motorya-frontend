'use client';
import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile widget wrapper.
 * SITE_KEY yoksa hiçbir şey render etmez (dev/preview'de sessiz devre dışı).
 * onVerify callback'i token ile çağrılır; formu göndermeden token'ı DTO'ya ekle.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void; 'error-callback'?: () => void; 'expired-callback'?: () => void; theme?: 'light' | 'dark' | 'auto'; }) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

let scriptLoading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src^="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('turnstile script load failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('turnstile script load failed'));
    document.head.appendChild(s);
  });
  return scriptLoading;
}

export function Turnstile({ onVerify, theme = 'auto' }: { onVerify: (token: string) => void; theme?: 'light' | 'dark' | 'auto' }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          theme,
          callback: (token) => onVerify(token),
          'expired-callback': () => onVerify(''),
          'error-callback': () => onVerify(''),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
  }, [onVerify, theme]);

  if (!SITE_KEY) return null;
  return <div ref={ref} style={{ display: 'flex', justifyContent: 'center', minHeight: 65 }} />;
}
