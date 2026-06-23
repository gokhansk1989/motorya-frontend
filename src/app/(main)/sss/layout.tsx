import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular — Motorya',
  description: 'Motorya\'da güvenli alışveriş, ödeme, ilan verme ve kargo hakkında sıkça sorulan sorular ve cevapları.',
  alternates: { canonical: 'https://motorya.com.tr/sss' },
  openGraph: {
    title: 'Sıkça Sorulan Sorular — Motorya',
    description: 'Motorya\'da güvenli alışveriş, ödeme, ilan verme ve kargo hakkında sıkça sorulan sorular.',
    url: 'https://motorya.com.tr/sss',
  },
};

export default function SssLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
