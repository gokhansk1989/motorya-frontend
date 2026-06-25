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
import { ALL_CITIES } from '@/lib/cities';

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
  firstName: z.string().min(2, 'En az 2 karakter giriniz'),
  lastName: z.string().min(2, 'En az 2 karakter giriniz'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  tcKimlik: z.union([
    z.string().length(0),
    z.string().length(11, 'TC Kimlik numarası 11 haneli olmalıdır')
      .regex(/^[1-9][0-9]{10}$/, 'TC Kimlik numarası 0 ile başlayamaz')
      .refine(validateTcKimlik, 'Geçersiz TC Kimlik numarası (algoritma hatası)'),
  ]).optional(),
  phone: z.string().regex(/^(05)[0-9]{9}$/, 'Geçerli bir cep telefonu giriniz (05XX 000 00 00)'),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.literal('')),
  city: z.string().optional(),
  district: z.string().optional(),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  passwordConfirm: z.string(),
  acceptedTerms: z.literal(true, { message: "Üyelik Sözleşmesi'ni kabul etmeniz gerekiyor" }),
  acceptedKvkk: z.literal(true, { message: "KVKK Aydınlatma Metni'ni kabul etmeniz gerekiyor" }),
  acceptedMarketing: z.boolean().optional(),
}).refine(d => d.password === d.passwordConfirm, {
  message: 'Şifreler eşleşmiyor',
  path: ['passwordConfirm'],
});

type FormData = z.infer<typeof schema>;

function FieldWrapper({ label, icon, error, hint, children }: { label: string; icon?: React.ReactNode; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="m-label">{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none', display: 'flex' }}>
            {icon}
          </span>
        )}
        {children}
      </div>
      {hint && !error && <p style={{ marginTop: 6, fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.4 }}>{hint}</p>}
      {error && <p style={{ marginTop: 6, fontSize: 12, color: 'var(--bad)', fontFamily: 'var(--font-mono)' }}>{error}</p>}
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
        displayName: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: data.email,
        tcKimlik: data.tcKimlik || undefined,
        phone: data.phone,
        birthDate: data.birthDate || undefined,
        gender: data.gender || undefined,
        city: data.city || undefined,
        district: data.district || undefined,
        password: data.password,
        acceptedTerms: data.acceptedTerms,
        acceptedKvkk: data.acceptedKvkk,
        acceptedMarketing: !!data.acceptedMarketing,
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

  const plainInputStyle = (hasError: boolean) => ({
    height: 46,
    width: '100%',
    background: 'var(--bg-1)',
    border: `1px solid ${hasError ? 'var(--bad)' : 'var(--line)'}`,
    borderRadius: 'var(--radius-s)',
    color: 'var(--ink)',
    fontSize: 14,
    outline: 'none',
    padding: '0 14px',
    transition: 'border-color .14s ease, box-shadow .14s ease',
  });

  const focusGlow = (e: React.FocusEvent<HTMLElement>) => (e.target as HTMLElement).style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)';
  const blurGlow = (e: React.FocusEvent<HTMLElement>) => (e.target as HTMLElement).style.boxShadow = 'none';

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'radial-gradient(60% 60% at 50% -10%, color-mix(in oklch, var(--accent) 15%, transparent), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1, padding: '24px 0' }}>
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

        <div className="m-surface-2" style={{ padding: '32px 32px 28px', borderRadius: 'var(--radius-l)' }}>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              height: 48, borderRadius: 10, border: '1px solid var(--line)',
              background: 'var(--bg-0)', color: 'var(--ink)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', transition: 'background .14s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-0)')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Google ile devam et
          </a>

          <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
            <span style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>veya aşağıdaki formu doldur</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FieldWrapper label="Ad" icon={<User size={16} />} error={errors.firstName?.message}>
                <input {...register('firstName')} placeholder="Gökhan" style={inputStyle(!!errors.firstName)} onFocus={focusGlow} onBlur={blurGlow} />
              </FieldWrapper>
              <FieldWrapper label="Soyad" error={errors.lastName?.message}>
                <input {...register('lastName')} placeholder="Sarıkaya" style={plainInputStyle(!!errors.lastName)} onFocus={focusGlow} onBlur={blurGlow} />
              </FieldWrapper>
            </div>

            <FieldWrapper label="E-posta" icon={<Mail size={16} />} error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="ornek@mail.com" style={inputStyle(!!errors.email)} onFocus={focusGlow} onBlur={blurGlow} />
            </FieldWrapper>

            <FieldWrapper
              label="T.C. Kimlik No (opsiyonel)"
              icon={<CreditCard size={16} />}
              error={errors.tcKimlik?.message}
              hint="Şimdilik isteğe bağlı. İlan vermek istediğinde doldurman istenecek."
            >
              <input
                {...register('tcKimlik')}
                type="text"
                inputMode="numeric"
                maxLength={11}
                placeholder="10000000000"
                style={inputStyle(!!errors.tcKimlik)}
                onFocus={focusGlow}
                onBlur={blurGlow}
              />
              {tcValue.length > 0 && (
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontFamily: 'var(--font-mono)', color: tcValue.length === 11 && validateTcKimlik(tcValue) ? 'var(--good)' : 'var(--ink-3)' }}>
                  {tcValue.length}/11
                </span>
              )}
            </FieldWrapper>

            <FieldWrapper label="Cep Telefonu" icon={<Phone size={16} />} error={errors.phone?.message}>
              <input {...register('phone')} type="tel" placeholder="05XX 000 00 00" maxLength={11} style={inputStyle(!!errors.phone)} onFocus={focusGlow} onBlur={blurGlow} />
            </FieldWrapper>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FieldWrapper label="Doğum Tarihi (opsiyonel)" error={errors.birthDate?.message}>
                <input {...register('birthDate')} type="date" style={plainInputStyle(!!errors.birthDate)} onFocus={focusGlow} onBlur={blurGlow} />
              </FieldWrapper>
              <FieldWrapper label="Cinsiyet (opsiyonel)" error={errors.gender?.message}>
                <select {...register('gender')} style={{ ...plainInputStyle(!!errors.gender), appearance: 'none' }} onFocus={focusGlow} onBlur={blurGlow}>
                  <option value="">Seçiniz</option>
                  <option value="MALE">Erkek</option>
                  <option value="FEMALE">Kadın</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </FieldWrapper>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FieldWrapper label="İl (opsiyonel)" error={errors.city?.message}>
                <select {...register('city')} style={{ ...plainInputStyle(!!errors.city), appearance: 'none' }} onFocus={focusGlow} onBlur={blurGlow}>
                  <option value="">Seçiniz</option>
                  {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FieldWrapper>
              <FieldWrapper label="İlçe (opsiyonel)" error={errors.district?.message}>
                <input {...register('district')} placeholder="İlçe" style={plainInputStyle(!!errors.district)} onFocus={focusGlow} onBlur={blurGlow} />
              </FieldWrapper>
            </div>

            <FieldWrapper label="Şifre" icon={<Lock size={16} />} error={errors.password?.message}>
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="En az 8 karakter"
                style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                onFocus={focusGlow}
                onBlur={blurGlow}
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
                onFocus={focusGlow}
                onBlur={blurGlow}
              />
              <button type="button" onClick={() => setShowPwd2(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--ink-3)', display: 'flex', padding: 0 }}>
                {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </FieldWrapper>

            {/* Onaylar — gerçek checkbox'lar, kabul edilenler DB'ye değişmez kayıt olarak yazılır */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: -2 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, cursor: 'pointer' }}>
                <input type="checkbox" {...register('acceptedTerms')} style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--accent)', flexShrink: 0 }} />
                <span>
                  <a href="/sayfa/kullanim-sartlari" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>Üyelik Sözleşmesi</a>'ni okudum ve kabul ediyorum.
                </span>
              </label>
              {errors.acceptedTerms && <p style={{ fontSize: 11.5, color: 'var(--bad)', marginLeft: 24 }}>{errors.acceptedTerms.message}</p>}

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, cursor: 'pointer' }}>
                <input type="checkbox" {...register('acceptedKvkk')} style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--accent)', flexShrink: 0 }} />
                <span>
                  <a href="/sayfa/kvkk-aydinlatma-metni" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>KVKK Aydınlatma Metni</a>'ni okudum; kişisel verilerimin belirtilen amaçlarla işlenmesini onaylıyorum.
                </span>
              </label>
              {errors.acceptedKvkk && <p style={{ fontSize: 11.5, color: 'var(--bad)', marginLeft: 24 }}>{errors.acceptedKvkk.message}</p>}

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, cursor: 'pointer' }}>
                <input type="checkbox" {...register('acceptedMarketing')} style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--accent)', flexShrink: 0 }} />
                <span>
                  Kampanya, fırsat ve yeniliklerden <b>e-posta ve SMS ile</b> haberdar olmak istiyorum. (İsteğe bağlı, istediğin zaman kapatabilirsin)
                </span>
              </label>
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
