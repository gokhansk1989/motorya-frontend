'use client';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function EmailGonderildiContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);

  const resend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Doğrulama maili tekrar gönderildi!');
    } catch {
      toast.error('Bir hata oluştu.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}>
          <Mail size={36} style={{ color: 'var(--accent)' }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>E-postanı Doğrula</h1>
        <p style={{ color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 8 }}>
          <strong>{email}</strong> adresine doğrulama linki gönderdik.
        </p>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 32 }}>
          Linke tıklayarak hesabını aktifleştir. Link <strong>24 saat</strong> geçerlidir.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Mail gelmediyse spam klasörünü kontrol et.</p>
          <button onClick={resend} disabled={resending} className="m-btn m-btn-ghost" style={{ height: 42, padding: '0 20px', fontSize: 14 }}>
            {resending ? 'Gönderiliyor…' : 'Tekrar Gönder'}
          </button>
          <Link href="/giris" style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none' }}>
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EmailGonderildiPage() {
  return (
    <Suspense fallback={null}>
      <EmailGonderildiContent />
    </Suspense>
  );
}
