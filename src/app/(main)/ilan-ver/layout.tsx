import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ücretsiz İlan Ver — Motorya',
  description: 'Kullanmadığın motosiklet kıyafet ve aksesuarlarını Motorya\'da ücretsiz ilan ver, binlerce motosiklet sevdalısına ulaş.',
  alternates: { canonical: 'https://motorya.com.tr/ilan-ver' },
  openGraph: {
    title: 'Ücretsiz İlan Ver — Motorya',
    description: 'Kullanmadığın motosiklet kıyafet ve aksesuarlarını Motorya\'da ücretsiz ilan ver.',
    url: 'https://motorya.com.tr/ilan-ver',
  },
};

export default function IlanVerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
