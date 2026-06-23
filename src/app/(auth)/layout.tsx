import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş & Üyelik — Motorya',
  description: 'Motorya hesabınıza giriş yapın veya ücretsiz üye olun. İkinci el motosiklet kıyafet ve aksesuar al-sat dünyasına katılın.',
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
