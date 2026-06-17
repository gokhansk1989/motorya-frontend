'use client';
import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuthStore } from '@/store/auth';
import { Bell, X } from 'lucide-react';

const DISMISSED_KEY = 'push_prompt_dismissed';

export function PushPrompt() {
  const { user } = useAuthStore();
  const { permission, subscribe } = usePushNotifications();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (permission !== 'default') return;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, [user, permission]);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  const handleAllow = async () => {
    setLoading(true);
    await subscribe();
    setLoading(false);
    setVisible(false);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 999, width: 'min(480px, calc(100vw - 32px))',
      background: 'var(--bg-1)', border: '1px solid var(--line)',
      borderRadius: 16, padding: '16px 18px',
      boxShadow: '0 8px 32px oklch(0 0 0 / 0.15)',
      display: 'flex', alignItems: 'center', gap: 14,
      animation: 'slideUp .25s ease',
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'color-mix(in oklch, var(--accent) 12%, transparent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Bell size={20} style={{ color: 'var(--accent)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Bildirimleri aç</p>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>
          Teklif, mesaj ve fiyat düşüşlerinden anında haberdar ol
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleAllow}
          disabled={loading}
          className="m-btn m-btn-primary sm"
          style={{ fontSize: 13, height: 34, padding: '0 14px' }}
        >
          {loading ? 'Açılıyor…' : 'Aç'}
        </button>
        <button
          onClick={dismiss}
          style={{ width: 34, height: 34, borderRadius: 8, background: 'none', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--ink-3)', flexShrink: 0 }}
        >
          <X size={15} />
        </button>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(12px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
