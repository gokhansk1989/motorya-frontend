'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Zap, ArrowLeft, Search } from 'lucide-react';
import { api } from '@/lib/api';

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    api
      .post('/error-logs', {
        source: '404',
        message: `Sayfa bulunamadı: ${pathname}`,
        path: pathname,
      })
      .catch(() => null);
  }, [pathname]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'radial-gradient(50% 50% at 50% 0%, color-mix(in oklch, var(--accent) 10%, transparent), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 480 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 48 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 6px 20px -6px var(--accent)' }}>
            <Zap size={20} fill="currentColor" strokeWidth={0} />
          </span>
          <span className="m-display" style={{ fontSize: 22, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
            MOTOR<span className="m-accent">YA</span>
          </span>
        </Link>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 120, fontWeight: 700, lineHeight: 1, color: 'var(--bg-3)', letterSpacing: '-0.04em', marginBottom: 8 }}>
          404
        </div>

        <h1 className="m-display" style={{ fontSize: 28, marginBottom: 12, color: 'var(--ink)' }}>
          Sayfa bulunamadı
        </h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.6, marginBottom: 36 }}>
          Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="m-btn m-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 24px', borderRadius: 10, textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
            <ArrowLeft size={18} />
            Ana Sayfaya Dön
          </Link>
          <Link href="/?q=" className="m-btn m-btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 24px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}>
            <Search size={18} />
            İlan Ara
          </Link>
        </div>
      </div>
    </div>
  );
}
