'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, User, Mail, Lock, CreditCard, Phone } from 'lucide-react';
import { useState } from 'react';

function validateTcKimlik(tc: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(tc)) return false;
  const d = tc.split('').map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const digit10 = ((odd * 7) - even) % 10;
  if (digit10 < 0 || digit10 !== d[9]) return false;
  const sum10 = d.slice(0, 10).reduce((a, b) => a + b, 0);
  return sum10 % 10 === d[10];
}

const schema = z.object({
  displayName: z.string().min(2, 'En az 2 karakter giriniz'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  tcKimlik: z
    .string()
    .length(11, 'TC Kimlik numarası 11 haneli olmalıdır')
    .regex(/^[1-9][0-9]{10}$/, 'TC Kimlik numarası 0 ile başlayamaz')
    .refine(validateTcKimlik, 'Geçersiz TC Kimlik numarası (algoritma hatası)'),
  phone: z
    .string()
    .regex(/^(05)[0-9]{9}$/, 'Geçerli bir cep telefonu giriniz (05XX 000 00 00)'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  passwordConfirm: z.string(),
}).refine(d => d.password === d.passwordConfirm, {
  message: 'Şifreler eşleşmiyor',
  path: ['passwordConfirm'],
});

type FormData = z.infer<typeof schema>;

function FieldWrapper({ label, icon, error, children }: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="m-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none', display: 'flex' }}>
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p style={{ marginTop: 6, fontSize: 12, color: 'var(--bad)', fontFamily: 'var(--font-mono)' }}>{error}</p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const tcValue = watch('tcKimlik') || '';

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/register', {
        displayName: data.displayName,
        email: data.email,
        tcKimlik: data.tcKimlik,
        phone: data.phone,
        password: data.password,
      });
      router.push(`/email-gonderildi?email=${encodeURIComponent(data.email)}`);
    } catch (e: any) {
      const msg = e.response?.data?.message;
      if (Array.isArray(msg)) toast.error(msg[0]);
      else toast.error(msg || 'Kayıt yapılamadı');
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
      {/* Background glow */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'radial-gradient(60% 60% at 50% -10%, color-mix(in oklch, var(--accent) 15%, transparent), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 8px 24px -8px var(--accent)' }}>
              <Zap size={22} fill="currentColor" strokeWidth={0} />
            </span>
            <span className="m-display" style={{ fontSize: 26, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
              MOTOR<span className="m-accent">YA</span>
            </span>
          </Link>
          <p style={{ marginTop: 10, color: 'var(--ink-3)', fontSize: 14 }}>Hesap oluştur, alışverişe başla</p>
        </div>

        {/* Card */}
        <div className="m-surface-2" style={{ padding: '32px 32px 28px', borderRadius: 'var(--radius-l)' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <FieldWrapper label="Ad Soyad" icon={<User size={16} />} error={errors.displayName?.message}>
              <input
                {...register('displayName')}
                placeholder="Gökhan Sarıkaya"
                style={inputStyle(!!errors.displayName)}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
            </FieldWrapper>

            <FieldWrapper label="E-posta" icon={<Mail size={16} />} error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                placeholder="ornek@mail.com"
                style={inputStyle(!!errors.email)}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
            </FieldWrapper>

            <FieldWrapper label="TC Kimlik Numarası" icon={<CreditCard size={16} />} error={errors.tcKimlik?.message}>
              <input
                {...register('tcKimlik')}
                type="text"
                inputMode="numeric"
                maxLength={11}
                placeholder="10000000000"
                style={inputStyle(!!errors.tcKimlik)}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
              {tcValue.length > 0 && (
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontFamily: 'var(--font-mono)', color: tcValue.length === 11 && validateTcKimlik(tcValue) ? 'var(--good)' : 'var(--ink-3)' }}>
                  {tcValue.length}/11
                </span>
              )}
            </FieldWrapper>

            <FieldWrapper label="Cep Telefonu" icon={<Phone size={16} />} error={errors.phone?.message}>
              <input
                {...register('phone')}
                type="tel"
                placeholder="05XX 000 00 00"
                maxLength={11}
                style={inputStyle(!!errors.phone)}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
            </FieldWrapper>

            <FieldWrapper label="Şifre" icon={<Lock size={16} />} error={errors.password?.message}>
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="En az 8 karakter"
                style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--ink-3)', display: 'flex', padding: 0 }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </FieldWrapper>

            <FieldWrapper label="Şifre Tekrar" icon={<Lock size={16} />} error={errors.passwordConfirm?.message}>
              <input
                {...register('passwordConfirm')}
                type={showPwd2 ? 'text' : 'password'}
                placeholder="Şifreyi tekrar gir"
                style={{ ...inputStyle(!!errors.passwordConfirm), paddingRight: 44 }}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
              <button type="button" onClick={() => setShowPwd2(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--ink-3)', display: 'flex', padding: 0 }}>
                {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </FieldWrapper>

            {/* KVKK notu */}
            <p style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.5, marginTop: -4 }}>
              Kayıt olarak{' '}
              <a href="#" style={{ color: 'var(--accent)' }}>Kullanım Koşulları</a>'nı ve{' '}
              <a href="#" style={{ color: 'var(--accent)' }}>KVKK Aydınlatma Metni</a>'ni kabul etmiş sayılırsınız.
            </p>

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
                  Hesap Oluştur
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line-soft)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>
              Zaten hesabın var mı?{' '}
              <Link href="/giris" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
