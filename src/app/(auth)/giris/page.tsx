'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'En az 6 karakter giriniz'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.accessToken);
      toast.success('Hoş geldin!');
      router.push('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Giriş yapılamadı');
    }
  };

  const inputStyle = (hasError: boolean) => ({
    paddingLeft: 44,
    height: 46,
    width: '100%',
    background: 'var(--bg-1)',
    border: `1px solid ${hasError ? 'var(--bad)' : 'var(--line)'}`,
    borderRadius: 'var(--radius-s)',
    color: 'var(--ink)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color .14s ease, box-shadow .14s ease',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'radial-gradient(60% 60% at 50% -10%, color-mix(in oklch, var(--accent) 15%, transparent), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 8px 24px -8px var(--accent)' }}>
              <Zap size={22} fill="currentColor" strokeWidth={0} />
            </span>
            <span className="m-display" style={{ fontSize: 26, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
              MOTOR<span className="m-accent">YA</span>
            </span>
          </Link>
          <p style={{ marginTop: 10, color: 'var(--ink-3)', fontSize: 14 }}>Hesabına giriş yap</p>
        </div>

        <div className="m-surface-2" style={{ padding: '32px 32px 28px', borderRadius: 'var(--radius-l)' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label className="m-label">E-posta</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none', display: 'flex' }}>
                  <Mail size={16} />
                </span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="ornek@mail.com"
                  style={inputStyle(!!errors.email)}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>
              {errors.email && <p style={{ marginTop: 6, fontSize: 12, color: 'var(--bad)', fontFamily: 'var(--font-mono)' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="m-label">Şifre</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none', display: 'flex' }}>
                  <Lock size={16} />
                </span>
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Şifreni gir"
                  style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--ink-3)', display: 'flex', padding: 0 }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ marginTop: 6, fontSize: 12, color: 'var(--bad)', fontFamily: 'var(--font-mono)' }}>{errors.password.message}</p>}
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link href="/sifremi-unuttum" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>Şifremi unuttum</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="m-btn m-btn-primary"
              style={{ width: '100%', height: 50, fontSize: 15, fontWeight: 700, marginTop: 4, borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
            >
              {isSubmitting ? (
                <span style={{ width: 18, height: 18, border: '2px solid var(--accent-ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              ) : (
                <>
                  <Zap size={18} fill="currentColor" strokeWidth={0} />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line-soft)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>
              Hesabın yok mu?{' '}
              <Link href="/kayit" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
