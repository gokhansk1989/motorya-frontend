'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

const schema = z.object({
  acceptedTerms: z.literal(true, { message: "Üyelik Sözleşmesi'ni kabul etmeniz gerekiyor" }),
  acceptedKvkk: z.literal(true, { message: "KVKK Aydınlatma Metni'ni kabul etmeniz gerekiyor" }),
  acceptedMarketing: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ConsentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/giris');
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/consents', data);
      router.push('/');
    } catch (e: any) {
      const msg = e.response?.data?.message;
      if (Array.isArray(msg)) toast.error(msg[0]);
      else toast.error(msg || 'Onaylar kaydedilemedi');
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'radial-gradient(60% 60% at 50% -10%, color-mix(in oklch, var(--accent) 15%, transparent), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1, padding: '24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 8px 24px -8px var(--accent)' }}>
              <Zap size={22} fill="currentColor" strokeWidth={0} />
            </span>
            <span className="m-display" style={{ fontSize: 26, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
              MOTOR<span className="m-accent">YA</span>
            </span>
          </Link>
          <p style={{ marginTop: 10, color: 'var(--ink-3)', fontSize: 14 }}>Devam etmeden önce son bir adım kaldı</p>
        </div>

        <div className="m-surface-2" style={{ padding: '32px 32px 28px', borderRadius: 'var(--radius-l)' }}>
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 20, lineHeight: 1.5 }}>
            Google ile giriş yaptın — Motorya'yı kullanabilmen için aşağıdaki onayları vermen gerekiyor.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <input type="checkbox" {...register('acceptedTerms')} style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  <a href="/sayfa/kullanim-sartlari" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>Üyelik Sözleşmesi</a>'ni okudum ve kabul ediyorum.
                </span>
              </div>
              {errors.acceptedTerms && <p style={{ fontSize: 11.5, color: 'var(--bad)', marginLeft: 24, marginTop: 4 }}>{errors.acceptedTerms.message}</p>}
            </div>

            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <input type="checkbox" {...register('acceptedKvkk')} style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  <a href="/sayfa/kvkk-aydinlatma-metni" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>KVKK Aydınlatma Metni</a>'ni okudum; kişisel verilerimin belirtilen amaçlarla işlenmesini onaylıyorum.
                </span>
              </div>
              {errors.acceptedKvkk && <p style={{ fontSize: 11.5, color: 'var(--bad)', marginLeft: 24, marginTop: 4 }}>{errors.acceptedKvkk.message}</p>}
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <input type="checkbox" {...register('acceptedMarketing')} style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                Kampanya, fırsat ve yeniliklerden e-posta/SMS yoluyla haberdar olmak istiyorum. <span style={{ opacity: 0.6 }}>(opsiyonel)</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="m-btn m-btn-primary"
              style={{ height: 48, borderRadius: 10, fontWeight: 700, fontSize: 14.5, marginTop: 6, opacity: isSubmitting ? 0.6 : 1 }}
            >
              {isSubmitting ? 'Kaydediliyor…' : 'Onayla ve devam et'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
