'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { MessageSquareWarning, X } from 'lucide-react';
import { api } from '@/lib/api';

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/feedback', { message: message.trim(), page: pathname, contactEmail: email.trim() || undefined });
      toast.success('Geri bildirimin için teşekkürler!');
      setMessage('');
      setEmail('');
      setOpen(false);
    } catch {
      toast.error('Gönderilemedi, lütfen tekrar dene.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="m-feedback-widget">
      {open ? (
        <div style={{
          width: 300, background: 'var(--bg-1)', border: '1px solid var(--bg-3)', borderRadius: 16,
          boxShadow: '0 12px 40px -8px rgba(0,0,0,0.3)', padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Geri Bildirim</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>
              <X size={16} />
            </button>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bir sorun mu var, yoksa bir önerin mi? Bize anlat…"
            rows={4}
            style={{
              width: '100%', resize: 'none', padding: 10, borderRadius: 10, border: '1px solid var(--bg-3)',
              background: 'var(--bg-0)', color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit', marginBottom: 8,
            }}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta (opsiyonel, yanıt için)"
            style={{
              width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid var(--bg-3)',
              background: 'var(--bg-0)', color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit', marginBottom: 10,
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
            className="m-btn m-btn-primary"
            style={{ width: '100%', height: 40, borderRadius: 10, fontSize: 13, fontWeight: 600, opacity: submitting || !message.trim() ? 0.6 : 1 }}
          >
            {submitting ? 'Gönderiliyor…' : 'Gönder'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Geri bildirim gönder"
          style={{
            width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center',
            background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 20px -6px var(--accent)',
          }}
        >
          <MessageSquareWarning size={20} />
        </button>
      )}
    </div>
  );
}
