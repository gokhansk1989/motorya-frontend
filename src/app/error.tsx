'use client';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { MarkaLogo } from '@/components/ui/MarkaLogo';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'radial-gradient(50% 50% at 50% 0%, color-mix(in oklch, var(--bad) 8%, transparent), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 480 }}>
        <div style={{ marginBottom: 48 }}>
          <MarkaLogo yukseklik={36} />
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 120, fontWeight: 700, lineHeight: 1, color: 'var(--bg-3)', letterSpacing: '-0.04em', marginBottom: 8 }}>
          500
        </div>

        <h1 className="m-display" style={{ fontSize: 28, marginBottom: 12, color: 'var(--ink)' }}>
          Bir şeyler ters gitti
        </h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.6, marginBottom: 36 }}>
          Sunucu taraflı bir hata oluştu. Lütfen sayfayı yenilemeyi dene.
        </p>

        {error?.digest && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginBottom: 28, opacity: 0.6 }}>
            Hata kodu: {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            className="m-btn m-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 24px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={18} />
            Tekrar Dene
          </button>
          <Link href="/" className="m-btn m-btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 24px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}>
            <ArrowLeft size={18} />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
