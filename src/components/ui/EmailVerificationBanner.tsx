'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function EmailVerificationBanner() {
  const user = useAuthStore(s => s.user);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.emailVerifiedAt) return null;

  const resend = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      setSent(true);
    } catch {
      // sessiz hata
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff8ed',
      borderBottom: '1px solid #f5c97a',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      flexWrap: 'wrap',
      fontSize: 14,
    }}>
      <span style={{ color: '#92400e' }}>
        ⚠️ <strong>E-posta adresiniz doğrulanmamış.</strong> Bazı özellikler kısıtlı olabilir.
      </span>
      {sent ? (
        <span style={{ color: '#166534', fontWeight: 600 }}>✓ Doğrulama e-postası gönderildi!</span>
      ) : (
        <button
          onClick={resend}
          disabled={loading}
          style={{
            backgroundColor: '#f97316',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '5px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Gönderiliyor…' : 'Tekrar Gönder'}
        </button>
      )}
    </div>
  );
}
