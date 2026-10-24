import type { Metadata } from 'next';

/**
 * Hesap sayfasi: STATIK URETILMIYOR.
 *
 * `middleware.ts` buraya her istekte benzersiz bir nonce veriyor.
 * Onbellekten sunulan onceden uretilmis HTML'de o nonce bulunmaz ve
 * TUM satir ici betikler engellenirdi -- olculdu: statik haldeyken
 * HTML'de hic nonce yoktu. Sayfa zaten kisisellestirilmis, statik
 * HTML burada yalnizca bir kabuktu.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ücretsiz İlan Ver',
  description: 'Kullanmadığın motosiklet kıyafet ve aksesuarlarını Motorya\'da ücretsiz ilan ver, binlerce motosiklet sevdalısına ulaş.',
  alternates: { canonical: 'https://motorya.com.tr/ilan-ver' },
  openGraph: {
    title: 'Ücretsiz İlan Ver',
    description: 'Kullanmadığın motosiklet kıyafet ve aksesuarlarını Motorya\'da ücretsiz ilan ver.',
    url: 'https://motorya.com.tr/ilan-ver',
  },
};

export default function IlanVerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
