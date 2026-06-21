'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Bir hata oluştu, tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Link href="/giris" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', textDecoration: 'none', fontSize: 14, marginBottom: 28 }}>
          <ArrowLeft size={16} />Giriş sayfasına dön
        </Link>

        {!sent ? (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Şifremi Unuttum</h1>
            <p style={{ color: 'var(--ink-3)', marginBottom: 28, fontSize: 14 }}>E-posta adresini gir, sıfırlama linkini gönderelim.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-2)', marginBottom: 6 }}>E-posta</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bg-1)', color: 'var(--ink)', padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={loading} className="m-btn m-btn-primary" style={{ height: 46, fontSize: 15 }}>
                {loading ? 'Gönderiliyor…' : 'Link Gönder'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Mail size={52} style={{ margin: '0 auto 16px', color: 'var(--accent)' }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>E-postanı kontrol et</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Eğer <strong>{email}</strong> sistemde kayıtlıysa, şifre sıfırlama linki gönderildi. Link 1 saat geçerlidir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
